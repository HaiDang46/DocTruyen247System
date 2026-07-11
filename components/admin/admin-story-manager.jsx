"use client";

import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { ChapterListItem } from "@/components/chapter/chapter-list-item";
import { ProgressBar } from "@/components/progress-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { TagBadge } from "@/components/tag-badge";
import { formatStoryStatus, formatStoryType } from "@/lib/display";
import { chapters, stories as mockStories } from "@/lib/mock-data";
import {
  parseSingleTxt,
  parseEpubStory,
  parseZipStory,
  convertHtmlToText,
  extractChapterNumber,
} from "@/lib/story-importer";
import {
  isDbConnected,
  getStoriesDb,
  getChaptersDb,
  createStoryDb,
  updateStoryDb,
  deleteStoryDb,
  createChapterDb,
  updateChapterDb,
  deleteChapterDb,
  scrapeChapterFromUrl,
} from "@/lib/actions";

const emptyStoryForm = {
  title: "",
  author: "",
  type: "NOVEL",
  status: "Ongoing",
  tags: "",
  sourceUrl: "",
  coverUrl: "",
  description: "",
};

const emptyChapterForm = {
  number: "",
  title: "",
  isPremium: false,
  content: "",
  imageUrls: [],
  imageNames: [],
  uploadNote: "",
};

const supportedMangaImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function getMimeType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

async function fileToBase64WithMime(file, filename) {
  const mimeType = getMimeType(filename);
  const imageBlob = new Blob([file], { type: mimeType });
  return fileToBase64(imageBlob);
}

function isSupportedMangaImageName(name) {
  return /\.(jpe?g|png|webp)$/i.test(name);
}

const menu = ["Truyện", "Chương", "Tải lên", "Người dùng", "Thống kê"];
const coverClasses = [
  "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500",
  "bg-gradient-to-br from-fuchsia-700 via-slate-950 to-cyan-500",
  "bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900",
  "bg-gradient-to-br from-rose-700 via-orange-600 to-slate-950",
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createStoryFromForm(form, index) {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: `story-local-${Date.now()}`,
    title: form.title.trim(),
    slug: slugify(form.title) || `truyen-moi-${Date.now()}`,
    type: form.type,
    status: form.status,
    author: form.author.trim() || "Chưa cập nhật",
    rating: 0,
    views: "0",
    latestChapter: form.type === "NOVEL" ? "Chưa có chương" : "Chưa có tập",
    tags,
    sourceUrl: form.sourceUrl.trim() || undefined,
    coverUrl: form.coverUrl || undefined,
    description: form.description.trim(),
    coverClass: coverClasses[index % coverClasses.length],
  };
}

function toStoryForm(story) {
  return {
    title: story.title,
    author: story.author,
    type: story.type,
    status: story.status,
    tags: story.tags.join(", "),
    sourceUrl: story.sourceUrl ?? "",
    coverUrl: story.coverUrl ?? "",
    description: story.description,
  };
}

export function AdminStoryManager() {
  const [stories, setStories] = useState(mockStories);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyForm, setStoryForm] = useState(emptyStoryForm);
  const [chapterForm, setChapterForm] = useState(emptyChapterForm);
  const [managedChapters, setManagedChapters] = useState([]);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [bulkStatus, setBulkStatus] = useState("Idle");

  const [scraping, setScraping] = useState(false);

  async function handleScrapeClick() {
    if (!scrapeUrl.trim()) {
      alert("Vui lòng nhập đường dẫn URL!");
      return;
    }
    setScraping(true);
    try {
      const res = await scrapeChapterFromUrl(scrapeUrl.trim());
      if (res.success && res.content) {
        setChapterForm((form) => ({
          ...form,
          title: form.title || res.title || "",
          number: form.number || String(res.number) || "",
          content: res.content || "",
        }));
        setScrapeUrl("");
        alert("Cào nội dung chương thành công!");
      } else {
        alert(`Lỗi cào dữ liệu: ${res.error || "Không lấy được nội dung"}`);
      }
    } catch (e) {
      alert(`Lỗi kết nối server: ${e.message}`);
    } finally {
      setScraping(false);
    }
  }

  async function loadFromDb() {
    const storiesRes = await getStoriesDb();
    if (storiesRes.success && storiesRes.data) {
      setStories(storiesRes.data);
      if (storiesRes.data.length > 0) {
        setSelectedStoryId(storiesRes.data[0].id);
        loadChaptersForStory(storiesRes.data[0].id);
      }
    }
  }

  async function loadChaptersForStory(storyId) {
    const chaptersRes = await getChaptersDb(storyId);
    if (chaptersRes.success && chaptersRes.data) {
      setManagedChapters((prev) => {
        const filtered = prev.filter((c) => c.storyId !== storyId);
        return [...filtered, ...chaptersRes.data];
      });
    }
  }

  // Load initial data on mount
  useEffect(() => {
    setIsMounted(true);
    isDbConnected().then((connected) => {
      setDbConnected(connected);
      if (connected) {
        loadFromDb();
      } else {
        const savedStories = localStorage.getItem("doc_truyen_stories");
        if (savedStories) {
          try {
            const parsedStories = JSON.parse(savedStories);
            setStories(parsedStories);
            if (parsedStories.length > 0) {
              setSelectedStoryId(parsedStories[0].id);
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          if (mockStories.length > 0) {
            setSelectedStoryId(mockStories[0].id);
          }
        }

        const savedChapters = localStorage.getItem("doc_truyen_chapters");
        if (savedChapters) {
          try {
            setManagedChapters(JSON.parse(savedChapters));
          } catch (e) {
            console.error(e);
          }
        } else {
          setManagedChapters(
            chapters.map((chapter) => ({
              ...chapter,
              storyId: mockStories[0]?.id ?? "",
            })),
          );
        }
      }
    });
  }, []);

  // Load chapters when selected story changes (if DB connected)
  useEffect(() => {
    if (dbConnected && selectedStoryId) {
      loadChaptersForStory(selectedStoryId);
    }
  }, [selectedStoryId, dbConnected]);

  // Save to localStorage when state changes (only if DB is offline)
  useEffect(() => {
    if (isMounted && !dbConnected) {
      localStorage.setItem("doc_truyen_stories", JSON.stringify(stories));
    }
  }, [stories, isMounted, dbConnected]);

  useEffect(() => {
    if (isMounted && !dbConnected) {
      localStorage.setItem(
        "doc_truyen_chapters",
        JSON.stringify(managedChapters),
      );
    }
  }, [managedChapters, isMounted, dbConnected]);

  const [activeMenu, setActiveMenu] = useState("Truyện");
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importSuccess, setImportSuccess] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories;
    const query = searchQuery.toLowerCase().trim();
    return stories.filter(
      (story) =>
        story.title.toLowerCase().includes(query) ||
        story.author.toLowerCase().includes(query),
    );
  }, [stories, searchQuery]);

  const selectedStory = useMemo(
    () =>
      filteredStories.find((story) => story.id === selectedStoryId) ??
      stories.find((story) => story.id === selectedStoryId) ??
      stories[0],
    [selectedStoryId, stories, filteredStories],
  );

  const selectedChapters = useMemo(
    () =>
      selectedStory
        ? managedChapters
            .filter((chapter) => chapter.storyId === selectedStory.id)
            .sort((a, b) => b.number - a.number)
        : [],
    [managedChapters, selectedStory],
  );

  const stats = useMemo(
    () => [
      { label: "Tổng truyện", value: String(stories.length) },
      {
        label: "Truyện chữ",
        value: String(stories.filter((story) => story.type === "NOVEL").length),
      },
      {
        label: "Manga",
        value: String(stories.filter((story) => story.type === "MANGA").length),
      },
      {
        label: "Đang ra",
        value: String(
          stories.filter((story) => story.status === "Ongoing").length,
        ),
      },
    ],
    [stories],
  );

  async function handleStorySubmit(event) {
    event.preventDefault();

    if (!storyForm.title.trim()) {
      return;
    }

    const tagsArray = storyForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const nextStory = {
      id: editingStoryId || `story-local-${Date.now()}`,
      title: storyForm.title.trim(),
      slug: slugify(storyForm.title) || `truyen-${Date.now()}`,
      author: storyForm.author.trim() || "Vô danh",
      type: storyForm.type,
      status: storyForm.status,
      rating: 4.8,
      views: "0",
      latestChapter: editingStoryId
        ? stories.find((s) => s.id === editingStoryId)?.latestChapter ||
          "Chưa có"
        : storyForm.type === "NOVEL"
          ? "Chương 0"
          : "Tập 0",
      tags: tagsArray,
      sourceUrl: storyForm.sourceUrl.trim() || undefined,
      coverUrl: storyForm.coverUrl || undefined,
      description: storyForm.description.trim(),
      coverClass:
        "bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900",
    };

    if (dbConnected) {
      setImportLoading(true);
      setImportMessage("Đang lưu truyện vào cơ sở dữ liệu...");
      if (editingStoryId) {
        const res = await updateStoryDb(editingStoryId, {
          title: nextStory.title,
          author: nextStory.author,
          type: nextStory.type,
          status: nextStory.status,
          tags: nextStory.tags,
          coverImage: nextStory.coverUrl,
          description: nextStory.description,
        });
        setImportLoading(false);
        if (res.success) {
          setStories((prev) =>
            prev.map((s) => (s.id === editingStoryId ? nextStory : s)),
          );
          setEditingStoryId(null);
          setStoryForm(emptyStoryForm);
        } else {
          alert("Lỗi lưu database: " + res.error);
        }
      } else {
        const res = await createStoryDb({
          title: nextStory.title,
          author: nextStory.author,
          type: nextStory.type,
          status: nextStory.status,
          tags: nextStory.tags,
          coverImage: nextStory.coverUrl,
          description: nextStory.description,
        });
        setImportLoading(false);
        if (res.success && res.data) {
          const dbStory = {
            ...nextStory,
            id: res.data.id,
            slug: res.data.slug,
          };
          setStories((prev) => [dbStory, ...prev]);
          setSelectedStoryId(dbStory.id);
          setStoryForm(emptyStoryForm);
        } else {
          alert("Lỗi lưu database: " + res.error);
        }
      }
    } else {
      if (editingStoryId) {
        setStories((prev) =>
          prev.map((s) => (s.id === editingStoryId ? nextStory : s)),
        );
        setEditingStoryId(null);
      } else {
        setStories((prev) => [nextStory, ...prev]);
        setSelectedStoryId(nextStory.id);
      }
      setStoryForm(emptyStoryForm);
    }
  }

  function handleEditStory(story) {
    setEditingStoryId(story.id);
    setSelectedStoryId(story.id);
    setStoryForm(toStoryForm(story));
  }

  async function handleDeleteStory(storyId) {
    const story = stories.find((item) => item.id === storyId);
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá truyện "${story?.title ?? "này"}" cùng tất cả chương truyện không?`,
    );

    if (!confirmed) {
      return;
    }

    if (dbConnected) {
      setImportLoading(true);
      setImportMessage("Đang xóa truyện khỏi cơ sở dữ liệu...");
      const res = await deleteStoryDb(storyId);
      setImportLoading(false);
      if (res.success) {
        setStories((currentStories) => {
          const nextStories = currentStories.filter(
            (item) => item.id !== storyId,
          );
          if (selectedStoryId === storyId) {
            setSelectedStoryId(nextStories[0]?.id ?? "");
          }
          return nextStories;
        });
        setManagedChapters((currentChapters) =>
          currentChapters.filter((chapter) => chapter.storyId !== storyId),
        );
      } else {
        alert("Lỗi xóa database: " + res.error);
      }
    } else {
      setStories((currentStories) => {
        const nextStories = currentStories.filter(
          (item) => item.id !== storyId,
        );
        if (selectedStoryId === storyId) {
          setSelectedStoryId(nextStories[0]?.id ?? "");
        }
        return nextStories;
      });
      setManagedChapters((currentChapters) =>
        currentChapters.filter((chapter) => chapter.storyId !== storyId),
      );
    }

    if (editingStoryId === storyId) {
      setEditingStoryId(null);
      setStoryForm(emptyStoryForm);
    }
  }

  async function handleChapterSubmit(event) {
    event.preventDefault();

    if (!selectedStory) {
      return;
    }

    const chapterNumber =
      Number(chapterForm.number) ||
      (selectedChapters.length > 0 ? Math.max(0, ...selectedChapters.map((chapter) => chapter.number)) + 1 : 1);

    const chapterTitle = chapterForm.title.trim() || (selectedStory.type === "NOVEL" ? `Chương ${chapterNumber}` : `Tập ${chapterNumber}`);

    if (dbConnected) {
      setImportLoading(true);
      setImportMessage("Đang lưu chương vào cơ sở dữ liệu...");
      if (editingChapterId) {
        const res = await updateChapterDb(editingChapterId, {
          number: chapterNumber,
          title: chapterTitle,
          isPremium: chapterForm.isPremium,
          content:
            selectedStory.type === "NOVEL"
              ? chapterForm.content.trim()
              : undefined,
          imageUrlsJson:
            selectedStory.type === "MANGA"
              ? JSON.stringify(chapterForm.imageUrls)
              : undefined,
          imageNames:
            selectedStory.type === "MANGA" ? chapterForm.imageNames : undefined,
        });
        setImportLoading(false);
        if (res.success) {
          setManagedChapters((currentChapters) =>
            currentChapters.map((chapter) =>
              chapter.id === editingChapterId
                ? {
                    ...chapter,
                    number: chapterNumber,
                    title: chapterTitle,
                    isPremium: chapterForm.isPremium,
                    content:
                      selectedStory.type === "NOVEL"
                        ? chapterForm.content.trim()
                        : undefined,
                    imageUrls:
                      selectedStory.type === "MANGA"
                        ? chapterForm.imageUrls
                        : undefined,
                    imageNames:
                      selectedStory.type === "MANGA"
                        ? chapterForm.imageNames
                        : undefined,
                  }
                : chapter,
            ),
          );
          setEditingChapterId(null);
        } else {
          alert("Lỗi sửa chương database: " + res.error);
        }
      } else {
        const res = await createChapterDb({
          storyId: selectedStory.id,
          number: chapterNumber,
          title: chapterTitle,
          isPremium: chapterForm.isPremium,
          content:
            selectedStory.type === "NOVEL"
              ? chapterForm.content.trim()
              : undefined,
          imageUrlsJson:
            selectedStory.type === "MANGA"
              ? JSON.stringify(chapterForm.imageUrls)
              : undefined,
          imageNames:
            selectedStory.type === "MANGA" ? chapterForm.imageNames : undefined,
        });
        setImportLoading(false);
        if (res.success && res.data) {
          const nextChapter = {
            id: res.data.id,
            storyId: selectedStory.id,
            number: chapterNumber,
            title: chapterTitle,
            isPremium: chapterForm.isPremium,
            content:
              selectedStory.type === "NOVEL"
                ? chapterForm.content.trim()
                : undefined,
            imageUrls:
              selectedStory.type === "MANGA"
                ? chapterForm.imageUrls
                : undefined,
            imageNames:
              selectedStory.type === "MANGA"
                ? chapterForm.imageNames
                : undefined,
          };
          setManagedChapters((currentChapters) => [
            nextChapter,
            ...currentChapters,
          ]);
          setStories((currentStories) =>
            currentStories.map((story) =>
              story.id === selectedStory.id
                ? {
                    ...story,
                    latestChapter:
                      story.type === "NOVEL"
                        ? `Chương ${chapterNumber}`
                        : `Tập ${chapterNumber}`,
                  }
                : story,
            ),
          );
        } else {
          alert("Lỗi thêm chương database: " + res.error);
        }
      }
    } else {
      if (editingChapterId) {
        setManagedChapters((currentChapters) =>
          currentChapters.map((chapter) =>
            chapter.id === editingChapterId
              ? {
                  ...chapter,
                  number: chapterNumber,
                  title: chapterTitle,
                  isPremium: chapterForm.isPremium,
                  content:
                    selectedStory.type === "NOVEL" && chapterForm.content.trim()
                      ? chapterForm.content.trim()
                      : undefined,
                  imageUrls:
                    selectedStory.type === "MANGA" &&
                    chapterForm.imageUrls.length > 0
                      ? chapterForm.imageUrls
                      : undefined,
                  imageNames:
                    selectedStory.type === "MANGA" &&
                    chapterForm.imageNames.length > 0
                      ? chapterForm.imageNames
                      : undefined,
                }
              : chapter,
          ),
        );
        setEditingChapterId(null);
      } else {
        const nextChapter = {
          id: `chapter-local-${Date.now()}`,
          storyId: selectedStory.id,
          number: chapterNumber,
          title: chapterTitle,
          isPremium: chapterForm.isPremium,
          content:
            selectedStory.type === "NOVEL" && chapterForm.content.trim()
              ? chapterForm.content.trim()
              : undefined,
          imageUrls:
            selectedStory.type === "MANGA" && chapterForm.imageUrls.length > 0
              ? chapterForm.imageUrls
              : undefined,
          imageNames:
            selectedStory.type === "MANGA" && chapterForm.imageNames.length > 0
              ? chapterForm.imageNames
              : undefined,
        };

        setManagedChapters((currentChapters) => [
          nextChapter,
          ...currentChapters,
        ]);
        setStories((currentStories) =>
          currentStories.map((story) =>
            story.id === selectedStory.id
              ? {
                  ...story,
                  latestChapter:
                    story.type === "NOVEL"
                      ? `Chương ${chapterNumber}`
                      : `Tập ${chapterNumber}`,
                }
              : story,
          ),
        );
      }
    }
    if (editingChapterId) {
      setChapterForm(emptyChapterForm);
    } else {
      const nextNumber = chapterNumber + 1;
      setChapterForm({
        number: String(nextNumber),
        title:
          selectedStory.type === "NOVEL"
            ? `Chương ${nextNumber}`
            : `Tập ${nextNumber}`,
        isPremium: false,
        content: "",
        imageUrls: [],
        imageNames: [],
        uploadNote: "",
      });
    }
  }

  function handleEditChapter(chapter) {
    setEditingChapterId(chapter.id);
    setChapterForm({
      number: String(chapter.number),
      title: chapter.title,
      isPremium: chapter.isPremium,
      content: chapter.content ?? "",
      imageUrls: chapter.imageUrls ?? [],
      imageNames: chapter.imageNames ?? [],
      uploadNote: chapter.imageUrls?.length
        ? `Đã nạp ${chapter.imageUrls.length} ảnh.`
        : "",
    });
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64WithMime(file, file.name);
      setStoryForm((form) => ({
        ...form,
        coverUrl: base64,
      }));
    } catch (err) {
      alert("Lỗi tải ảnh bìa: " + err);
    } finally {
      event.target.value = "";
    }
  }

  async function handleTextFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let content = "";
      const extension = file.name.split(".").pop()?.toLowerCase();

      const imageExtensions = new Set([
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
        "avif",
      ]);
      if (imageExtensions.has(extension ?? "")) {
        throw new Error(
          `Tệp tin "${file.name}" là tệp tin hình ảnh. Vui lòng tải các file văn bản chữ (.txt, .html, .epub, .zip) cho Truyện chữ.`,
        );
      }

      if (extension === "epub") {
        const imported = await parseEpubStory(file);
        content = imported.chapters
          .map((c) => `${c.title}\n\n${c.content}`)
          .join("\n\n---\n\n");
      } else if (extension === "zip" || extension === "cbz") {
        const imported = await parseZipStory(file);
        content = imported.chapters
          .map((c) => `${c.title}\n\n${c.content}`)
          .join("\n\n---\n\n");
      } else {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(new Error("Lỗi đọc file"));
          reader.readAsText(file, "utf-8");
        });

        const isHtml =
          file.name.endsWith(".html") ||
          file.name.endsWith(".htm") ||
          file.name.endsWith(".xhtml") ||
          file.name.endsWith(".xml") ||
          file.type === "text/html" ||
          content.trim().startsWith("<");
        if (isHtml) {
          content = convertHtmlToText(content);
        }
      }

      let parsedNum = extractChapterNumber(file.name, 1);
      let parsedTitle = file.name.replace(/\.[^.]+$/, "");

      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0];
        const chapterRegex =
          /^\s*(chương|chapter|tập|quyển|chuong|tap|quyen|part)\s+(\d+)/i;
        if (chapterRegex.test(firstLine)) {
          parsedTitle = firstLine;
          parsedNum = extractChapterNumber(firstLine, parsedNum);
          const firstLineIndex = content.indexOf(firstLine);
          if (firstLineIndex !== -1) {
            content = content
              .substring(firstLineIndex + firstLine.length)
              .trim();
          }
        }
      }

      setChapterForm((form) => ({
        ...form,
        number: String(parsedNum),
        title: parsedTitle,
        content: content,
      }));
    } catch (error) {
      alert("Lỗi đọc file: " + (error.message || error));
    } finally {
      event.target.value = "";
    }
  }

  async function handleMangaImagesUpload(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    try {
      const firstFile = files[0];
      const extension = firstFile.name.split(".").pop()?.toLowerCase();
      if (files.length === 1 && (extension === "zip" || extension === "cbz")) {
        setChapterForm((form) => ({
          ...form,
          uploadNote: "Đang giải nén và chuyển đổi hình ảnh...",
        }));
        const zip = await JSZip.loadAsync(firstFile);
        const imageEntries = Object.values(zip.files)
          .filter(
            (entry) => !entry.dir && isSupportedMangaImageName(entry.name),
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name, "vi", { numeric: true }),
          );

        const images = await Promise.all(
          imageEntries.map(async (entry) => {
            const blob = await entry.async("blob");
            const base64 = await fileToBase64WithMime(blob, entry.name);
            return {
              name: entry.name.split("/").pop() ?? entry.name,
              url: base64,
            };
          }),
        );

        setChapterForm((form) => ({
          ...form,
          title: form.title || firstFile.name.replace(/\.[^.]+$/, ""),
          imageUrls: images.map((image) => image.url),
          imageNames: images.map((image) => image.name),
          uploadNote:
            images.length > 0
              ? `Đã nạp ${images.length} ảnh từ file ${extension.toUpperCase()}.`
              : `Không tìm thấy ảnh hợp lệ trong file ${extension.toUpperCase()}.`,
        }));
      } else {
        const imageFiles = files.filter(
          (file) =>
            supportedMangaImageTypes.has(file.type) ||
            isSupportedMangaImageName(file.name),
        );

        imageFiles.sort((a, b) =>
          a.name.localeCompare(b.name, "vi", { numeric: true }),
        );

        setChapterForm((form) => ({
          ...form,
          uploadNote: "Đang xử lý hình ảnh...",
        }));

        const images = await Promise.all(
          imageFiles.map(async (file) => {
            const base64 = await fileToBase64WithMime(file, file.name);
            return {
              name: file.name,
              url: base64,
            };
          }),
        );

        setChapterForm((form) => ({
          ...form,
          imageUrls: images.map((img) => img.url),
          imageNames: images.map((img) => img.name),
          uploadNote:
            images.length > 0
              ? `Đã chọn ${images.length} ảnh.`
              : "Chưa chọn ảnh hợp lệ.",
        }));
      }
    } catch (err) {
      alert("Lỗi đọc file: " + (err.message || err));
    } finally {
      event.target.value = "";
    }
  }

  async function handleDeleteChapter(chapterId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa chương này khỏi hệ thống?",
    );
    if (!confirmed) return;

    if (dbConnected) {
      setImportLoading(true);
      setImportMessage("Đang xóa chương khỏi cơ sở dữ liệu...");
      const res = await deleteChapterDb(chapterId);
      setImportLoading(false);
      if (res.success) {
        setManagedChapters((currentChapters) =>
          currentChapters.filter((chapter) => chapter.id !== chapterId),
        );
      } else {
        alert("Lỗi xóa chương database: " + res.error);
      }
    } else {
      setManagedChapters((currentChapters) =>
        currentChapters.filter((chapter) => chapter.id !== chapterId),
      );
    }
  }

  async function handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportSuccess(null);
    setImportMessage("Đang chuẩn bị đọc tệp...");

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let imported = null;

      const imageExtensions = new Set([
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
        "avif",
      ]);
      if (imageExtensions.has(extension ?? "")) {
        throw new Error(
          `Tệp tin "${file.name}" là tệp tin hình ảnh. Vui lòng tải tệp tin văn bản chữ (.txt, .epub, .zip) hoặc tệp nén truyện tranh (.zip chứa ảnh, .cbz).`,
        );
      }

      const textExtensions = new Set([
        "txt",
        "html",
        "htm",
        "xhtml",
        "xml",
        "md",
        "json",
        "jsonl",
      ]);
      if (textExtensions.has(extension ?? "")) {
        setImportMessage(
          `Đang đọc và phân tích file ${extension?.toUpperCase()}...`,
        );
        let text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () =>
            reject(new Error(`Lỗi đọc file ${extension?.toUpperCase()}`));
          reader.readAsText(file, "utf-8");
        });
        if (
          extension === "html" ||
          extension === "htm" ||
          extension === "xhtml" ||
          extension === "xml"
        ) {
          text = convertHtmlToText(text);
        }
        imported = parseSingleTxt(text, file.name);
      } else if (extension === "epub") {
        setImportMessage("Đang giải nén và phân tích cấu trúc EPUB...");
        imported = await parseEpubStory(file);
      } else if (extension === "zip" || extension === "cbz") {
        setImportMessage("Đang phân tích file ZIP/CBZ (Novel / Manga)...");
        imported = await parseZipStory(file);
      } else {
        setImportMessage("Thử đọc tệp tin dưới dạng văn bản...");
        try {
          const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error("Lỗi đọc file"));
            reader.readAsText(file, "utf-8");
          });
          imported = parseSingleTxt(text, file.name);
        } catch {
          throw new Error(
            `Không hỗ trợ định dạng file .${extension}. Vui lòng sử dụng các định dạng văn bản hoặc file nén zip/epub/cbz.`,
          );
        }
      }

      if (!imported || imported.chapters.length === 0) {
        throw new Error("Không thể tìm thấy nội dung chương hợp lệ trong tệp.");
      }

      if (dbConnected) {
        setImportMessage("Đang lưu truyện nhập vào database...");
        const storyRes = await createStoryDb({
          title: imported.title,
          author: imported.author || "Vô danh",
          type: imported.type,
          status: "Ongoing",
          tags:
            imported.type === "NOVEL"
              ? ["Kỳ ảo", "Bí ẩn"]
              : ["Hành động", "Phiêu lưu"],
          description: imported.description || "",
        });

        if (storyRes.success && storyRes.data) {
          const dbStoryId = storyRes.data.id;
          setImportMessage(
            `Đang lưu ${imported.chapters.length} chương vào database...`,
          );
          for (let i = 0; i < imported.chapters.length; i++) {
            const chap = imported.chapters[i];
            await createChapterDb({
              storyId: dbStoryId,
              number: chap.number || i + 1,
              title:
                chap.title ||
                (imported.type === "NOVEL"
                  ? `Chương ${i + 1}`
                  : `Tập ${i + 1}`),
              isPremium: false,
              content: chap.content,
              imageUrlsJson: chap.imageUrls
                ? JSON.stringify(chap.imageUrls)
                : undefined,
              imageNames: chap.imageNames,
            });
          }

          // Reload data from database
          await loadFromDb();
          await loadChaptersForStory(dbStoryId);
          setSelectedStoryId(dbStoryId);

          setImportSuccess({
            title: imported.title,
            type: imported.type,
            chaptersCount: imported.chapters.length,
          });
        } else {
          throw new Error("Lỗi lưu import vào database: " + storyRes.error);
        }
      } else {
        const newStoryId = `story-local-${Date.now()}`;
        const newStorySlug =
          slugify(imported.title) || `truyen-nhap-${Date.now()}`;

        // Create new story
        const nextStory = {
          id: newStoryId,
          title: imported.title,
          slug: newStorySlug,
          type: imported.type,
          status: "Ongoing",
          author: imported.author,
          rating: 4.8,
          views: "0",
          latestChapter:
            imported.type === "NOVEL"
              ? `Chương ${imported.chapters.length}`
              : `Tập ${imported.chapters.length}`,
          tags:
            imported.type === "NOVEL"
              ? ["Kỳ ảo", "Bí ẩn"]
              : ["Hành động", "Phiêu lưu"],
          description: imported.description,
          coverClass: coverClasses[stories.length % coverClasses.length],
        };

        // Create chapters
        const nextChapters = imported.chapters.map((chap, idx) => ({
          id: `chapter-local-${Date.now()}-${idx}`,
          storyId: newStoryId,
          number: chap.number || idx + 1,
          title:
            chap.title ||
            (imported.type === "NOVEL"
              ? `Chương ${idx + 1}`
              : `Tập ${idx + 1}`),
          isPremium: false,
          content: chap.content,
          imageUrls: chap.imageUrls,
          imageNames: chap.imageNames,
        }));

        // Update State
        setStories((curr) => [nextStory, ...curr]);
        setManagedChapters((curr) => [...nextChapters, ...curr]);
        setSelectedStoryId(newStoryId);
        setImportSuccess({
          title: imported.title,
          type: imported.type,
          chaptersCount: imported.chapters.length,
        });
      }
    } catch (error) {
      alert(error.message || "Đã xảy ra lỗi trong quá trình nhập file.");
    } finally {
      setImportLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Admin Sub-Navigation */}
      <div className="surface-panel p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary">
            ⚙️
          </span>
          <span className="text-sm font-black uppercase text-ink tracking-wider">
            Hệ thống quản trị
          </span>
        </div>
        <nav className="flex flex-wrap gap-1 w-full md:w-auto">
          {menu.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setActiveMenu(item);
                setImportSuccess(null);
              }}
              className={`flex-1 md:flex-none rounded-lg px-4 py-2 text-center text-xs font-black uppercase tracking-wider transition ${
                activeMenu === item
                  ? "bg-primary text-white shadow-soft"
                  : "text-subtle hover:bg-muted hover:text-ink"
              }`}
            >
              {item === "Tải lên" ? "Nhập từ file" : item}
            </button>
          ))}
        </nav>
      </div>

      <main className="space-y-6">
        {/* Statistics section - displayed on all tabs for quick dashboard summary */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="surface-panel p-4">
              <p className="text-xs font-bold uppercase text-subtle">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-black text-ink">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Tab 1: Stories management */}
        {activeMenu === "Truyện" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="surface-panel p-4 min-w-0">
              <SectionHeader
                title="Danh sách truyện"
                action={`${filteredStories.length} truyện`}
              />

              <div className="mt-4 mb-3">
                <input
                  type="text"
                  placeholder="🔍 Tìm nhanh truyện theo tên hoặc tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="soft-control w-full px-3.5 py-2.5 text-xs outline-none border border-line rounded-lg bg-canvas text-ink"
                />
              </div>

              <div className="mt-3 overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-subtle">
                    <tr className="border-b border-line">
                      <th className="py-3 px-4">Tên truyện</th>
                      <th className="py-3 pr-4">Loại</th>
                      <th className="py-3 pr-4">Trạng thái</th>
                      <th className="py-3 pr-4">Lượt xem</th>
                      <th className="py-3 pr-4">Tiến độ</th>
                      <th className="py-3 pr-4 text-right px-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredStories.map((story) => (
                      <tr
                        key={story.id}
                        className={`transition hover:bg-muted/60 ${
                          selectedStory?.id === story.id
                            ? "bg-primarySoft/40"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedStoryId(story.id)}
                            className="text-left font-bold text-ink hover:text-primary transition"
                          >
                            {story.title}
                          </button>
                          <p className="mt-1 text-xs text-subtle">
                            {story.author}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-subtle">
                          {formatStoryType(story.type)}
                        </td>
                        <td className="py-3 pr-4">
                          <TagBadge>{formatStoryStatus(story.status)}</TagBadge>
                        </td>
                        <td className="py-3 pr-4 text-subtle">{story.views}</td>
                        <td className="w-36 py-3 pr-4">
                          <ProgressBar
                            value={story.type === "NOVEL" ? 78 : 64}
                          />
                        </td>
                        <td className="py-3 pr-4 px-4">
                          <div className="flex justify-end gap-1.5">
                            {story.sourceUrl ? (
                              <a
                                href={story.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink transition hover:border-primary hover:text-primary"
                              >
                                Link
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleEditStory(story)}
                              className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink transition hover:border-primary hover:text-primary"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStory(story.id)}
                              className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel p-4">
                <SectionHeader
                  title={editingStoryId ? "Sửa truyện" : "Thêm truyện"}
                  action={editingStoryId ? "Đang sửa" : "Bản nháp"}
                />

                <form className="mt-4 space-y-3" onSubmit={handleStorySubmit}>
                  <input
                    className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Tên truyện"
                    value={storyForm.title}
                    onChange={(event) =>
                      setStoryForm((form) => ({
                        ...form,
                        title: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Tác giả"
                    value={storyForm.author}
                    onChange={(event) =>
                      setStoryForm((form) => ({
                        ...form,
                        author: event.target.value,
                      }))
                    }
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                      value={storyForm.type}
                      onChange={(event) =>
                        setStoryForm((form) => ({
                          ...form,
                          type: event.target.value,
                        }))
                      }
                    >
                      <option value="NOVEL">Truyện chữ</option>
                      <option value="MANGA">Manga</option>
                    </select>
                    <select
                      className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                      value={storyForm.status}
                      onChange={(event) =>
                        setStoryForm((form) => ({
                          ...form,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="Ongoing">Đang ra</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Hiatus">Tạm ngưng</option>
                    </select>
                  </div>
                  <input
                    className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Thể loại, cách nhau bằng dấu phẩy"
                    value={storyForm.tags}
                    onChange={(event) =>
                      setStoryForm((form) => ({
                        ...form,
                        tags: event.target.value,
                      }))
                    }
                  />

                  <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-3">
                    <label className="block text-xs font-bold text-ink">
                      Ảnh bìa truyện (Tải ảnh lên)
                    </label>
                    <input
                      className="w-full text-xs text-subtle"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                    />

                    {storyForm.coverUrl ? (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="relative h-20 w-14 overflow-hidden rounded border border-line bg-muted">
                          <img
                            src={storyForm.coverUrl}
                            alt="Ảnh bìa"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setStoryForm((form) => ({ ...form, coverUrl: "" }))
                          }
                          className="rounded border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
                        >
                          Xóa ảnh bìa
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-subtle">
                        Chưa chọn ảnh bìa. Sẽ sử dụng màu nền mặc định.
                      </p>
                    )}
                  </div>
                  <textarea
                    className="soft-control min-h-24 w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Mô tả ngắn"
                    value={storyForm.description}
                    onChange={(event) =>
                      setStoryForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      className="button-primary text-xs py-2.5"
                      type="submit"
                    >
                      {editingStoryId ? "Cập nhật" : "Thêm truyện"}
                    </button>
                    <button
                      className="button-ghost text-xs py-2.5"
                      type="button"
                      onClick={() => {
                        setEditingStoryId(null);
                        setStoryForm(emptyStoryForm);
                      }}
                    >
                      Làm mới
                    </button>
                  </div>
                </form>
              </div>

              <div className="surface-panel p-4">
                <SectionHeader title="Truyện đang chọn" action="Xem nhanh" />
                {selectedStory ? (
                  <div className="mt-4 grid grid-cols-[80px_1fr] gap-3">
                    <StoryCover story={selectedStory} compact />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">
                        {selectedStory.title}
                      </p>
                      <p className="mt-1 text-xs text-subtle">
                        {formatStoryType(selectedStory.type)} ·{" "}
                        {formatStoryStatus(selectedStory.status)}
                      </p>
                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-subtle">
                        {selectedStory.description || "Chưa có mô tả."}
                      </p>
                      {selectedStory.sourceUrl ? (
                        <a
                          href={selectedStory.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-primary transition hover:border-primary"
                        >
                          Mở link nguồn
                        </a>
                      ) : (
                        <p className="mt-3 text-xs text-subtle">
                          Chưa có link nguồn.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-subtle">
                    Chưa có truyện nào.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Chapters management */}
        {activeMenu === "Chương" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="surface-panel p-4">
              <SectionHeader
                title="Quản lý chương"
                action={selectedStory ? selectedStory.title : "Chọn truyện"}
              />

              <div className="mt-4 divide-y divide-line">
                {selectedChapters.length > 0 ? (
                  selectedChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <ChapterListItem chapter={chapter} />
                        {chapter.content ? (
                          <p className="pb-1 text-xs font-semibold text-subtle">
                            Đã nhập{" "}
                            {chapter.content.length.toLocaleString("vi-VN")} ký
                            tự nội dung
                          </p>
                        ) : null}
                        {chapter.imageUrls?.length ? (
                          <div className="grid max-w-xs grid-cols-4 gap-1.5 pb-1">
                            {chapter.imageUrls
                              .slice(0, 4)
                              .map((imageUrl, index) => (
                                <div
                                  key={imageUrl}
                                  className="aspect-[3/4] overflow-hidden rounded-md border border-line bg-muted"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={
                                      chapter.imageNames?.[index] ??
                                      `Trang ${index + 1}`
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            {chapter.imageUrls.length > 4 ? (
                              <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-line bg-muted text-[10px] font-black text-subtle">
                                +{chapter.imageUrls.length - 4}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditChapter(chapter)}
                          className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink transition hover:border-primary hover:text-primary"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-subtle">
                    Truyện này chưa có chương nào.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel p-4">
                <SectionHeader title="Thêm chương" action="Nhập thủ công" />
                <form className="mt-4 space-y-3" onSubmit={handleChapterSubmit}>
                  <input
                    className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Số chương / tập"
                    value={chapterForm.number}
                    onChange={(event) =>
                      setChapterForm((form) => ({
                        ...form,
                        number: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="soft-control w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="Tiêu đề chương"
                    value={chapterForm.title}
                    onChange={(event) =>
                      setChapterForm((form) => ({
                        ...form,
                        title: event.target.value,
                      }))
                    }
                  />

                  {selectedStory?.type === "NOVEL" ? (
                    <div className="space-y-3 rounded-lg border border-line bg-canvas p-3">
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1.5">
                          Tải file truyện chữ (Tất cả định dạng)
                        </label>
                        <input
                          className="w-full text-xs text-subtle"
                          type="file"
                          onChange={handleTextFileUpload}
                        />
                      </div>

                      <div className="border-t border-line pt-2.5">
                        <label className="block text-xs font-bold text-ink mb-1.5">
                          Hoặc cào nội dung từ Link (URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            className="soft-control flex-1 px-3 py-2 text-xs outline-none"
                            placeholder="Dán link chương (ví dụ: truyenfull...)"
                            value={scrapeUrl}
                            onChange={(e) => setScrapeUrl(e.target.value)}
                          />

                          <button
                            type="button"
                            onClick={handleScrapeClick}
                            disabled={scraping}
                            className="button-primary text-xs px-3 py-2 shrink-0"
                          >
                            {scraping ? "Đang lấy..." : "Lấy chữ"}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-line pt-2.5">
                        <label className="block text-xs font-bold text-ink mb-1.5">
                          Nội dung chương
                        </label>
                        <textarea
                          className="soft-control min-h-32 w-full px-3 py-2 text-xs outline-none"
                          placeholder="Hoặc dán nội dung chương vào đây"
                          value={chapterForm.content}
                          onChange={(event) =>
                            setChapterForm((form) => ({
                              ...form,
                              content: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-line bg-canvas p-3">
                      <label className="block text-xs font-bold text-ink">
                        Tải ảnh manga (Ảnh lẻ hoặc file ZIP/CBZ)
                      </label>
                      <input
                        className="w-full text-xs text-subtle"
                        type="file"
                        multiple
                        onChange={handleMangaImagesUpload}
                      />

                      {chapterForm.uploadNote ? (
                        <p className="text-[10px] font-bold text-primary">
                          {chapterForm.uploadNote}
                        </p>
                      ) : null}
                      {chapterForm.imageUrls.length > 0 ? (
                        <div className="max-h-[500px] overflow-y-auto space-y-4 rounded-lg border border-line bg-muted/20 p-2.5">
                          {chapterForm.imageUrls.map((imageUrl, index) => (
                            <div
                              key={imageUrl}
                              className="relative overflow-hidden rounded-md border border-line bg-surface p-1.5 shadow-sm flex flex-col items-center gap-1.5"
                            >
                              <div className="flex w-full justify-between items-center px-1 text-[10px] text-subtle font-bold border-b border-line pb-1">
                                <span>Trang {index + 1}</span>
                                <span
                                  className="truncate max-w-[200px]"
                                  title={chapterForm.imageNames[index]}
                                >
                                  {chapterForm.imageNames[index] ??
                                    "Đang tải..."}
                                </span>
                              </div>
                              <img
                                src={imageUrl}
                                alt={
                                  chapterForm.imageNames[index] ??
                                  `Trang ${index + 1}`
                                }
                                className="max-w-full h-auto max-h-[400px] object-contain rounded"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-subtle">
                          Chọn nhiều ảnh theo đúng thứ tự đọc của chương.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      className="button-primary text-xs py-2.5"
                      type="submit"
                    >
                      {editingChapterId ? "Cập nhật" : "Thêm chương"}
                    </button>
                    {editingChapterId && (
                      <button
                        className="button-ghost text-xs py-2.5"
                        type="button"
                        onClick={() => {
                          setEditingChapterId(null);
                          setChapterForm(emptyChapterForm);
                        }}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: File Import / Upload */}
        {activeMenu === "Tải lên" && (
          <div className="surface-panel p-6 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-3 py-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary text-3xl">
                📥
              </div>
              <h2 className="text-xl font-black text-ink">
                Nhập Truyện Tự Động Từ File
              </h2>
              <p className="text-xs text-subtle leading-relaxed">
                Hệ thống tự động phân tích và tạo truyện cùng đầy đủ các chương
                bên trong hoàn toàn ở phía client. Hỗ trợ cả truyện chữ (.txt,
                .epub) và truyện tranh (.zip).
              </p>
            </div>

            {importSuccess ? (
              <div className="max-w-xl mx-auto rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-950 dark:bg-emerald-950/20 p-5 space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                      Nhập truyện thành công!
                    </h3>
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-500">
                      Đã tạo truyện <strong>{importSuccess.title}</strong> (
                      {importSuccess.type === "NOVEL" ? "Truyện chữ" : "Manga"})
                      với{" "}
                      <strong>{importSuccess.chaptersCount} chương/tập</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveMenu("Truyện");
                      setImportSuccess(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    Quản lý truyện
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu("Chương");
                      setImportSuccess(null);
                    }}
                    className="rounded-lg border border-emerald-200 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 transition hover:bg-emerald-50 dark:hover:bg-slate-800"
                  >
                    Xem danh sách chương
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                {importLoading ? (
                  <div className="rounded-lg border border-line bg-canvas p-8 text-center space-y-4">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-bold text-ink">
                      {importMessage}
                    </p>
                    <p className="text-xs text-subtle">
                      Vui lòng không đóng trình duyệt...
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-canvas p-10 cursor-pointer hover:border-primary transition group text-center">
                    <span className="text-4xl group-hover:scale-110 transition duration-200">
                      📂
                    </span>
                    <p className="mt-4 text-sm font-black text-ink">
                      Chọn tệp tin để nhập truyện
                    </p>
                    <p className="mt-1 text-xs text-subtle">
                      Hỗ trợ mọi định dạng tệp tin văn bản hoặc lưu trữ nén
                      (.txt, .html, .epub, .zip, .cbz,...)
                    </p>
                    <input
                      type="file"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Formatting Help Card */}
            <div className="max-w-2xl mx-auto rounded-lg border border-line bg-muted/40 p-4 space-y-3">
              <h3 className="text-xs font-black uppercase text-subtle tracking-wider">
                Hướng dẫn chuẩn bị file nhập
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-subtle">
                <div className="space-y-1">
                  <p className="font-bold text-ink text-xs">
                    📝 Tệp văn bản đơn lẻ
                  </p>
                  <p>
                    Hỗ trợ .txt, .html, .htm, .md, .json,... Các chương bắt đầu
                    bằng dòng riêng như <strong>Chương [Số]</strong>. Tệp
                    HTML/XML sẽ được tự động lọc sạch thẻ tag khi nhập.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-ink text-xs">
                    📘 Sách điện tử .EPUB
                  </p>
                  <p>
                    Định dạng chuẩn nhất cho truyện chữ Novel. Hệ thống tự giải
                    nén để lấy ảnh bìa, tên truyện, tác giả, mô tả giới thiệu và
                    toàn bộ cấu trúc mục lục chương một cách chính xác.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-ink text-xs">📦 File nén .ZIP</p>
                  <p>
                    <strong>Manga:</strong> ZIP chứa các thư mục tương ứng với
                    từng chương (ví dụ: <code>Chương 1</code>,{" "}
                    <code>Chương 2</code>), bên trong chứa các file ảnh (.jpg,
                    .png, .webp).
                    <br />
                    <strong>Novel:</strong> ZIP chứa nhiều file text{" "}
                    <code>.txt</code> tương ứng với từng chương.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Mock Users management */}
        {activeMenu === "Người dùng" && (
          <div className="surface-panel p-6 text-center space-y-4">
            <div className="text-3xl">👥</div>
            <h2 className="text-lg font-black text-ink">Quản Lý Người Dùng</h2>
            <p className="text-xs text-subtle max-w-sm mx-auto">
              Khu vực quản lý danh sách thành viên, phân quyền độc giả, người
              dịch và kiểm duyệt viên trên hệ thống.
            </p>
            <div className="rounded-lg border border-line bg-canvas p-4 text-xs font-bold text-subtle">
              Hệ thống đang đồng bộ cơ sở dữ liệu... chức năng này sẽ sớm hoạt
              động.
            </div>
          </div>
        )}

        {/* Tab 5: Mock statistics dashboard */}
        {activeMenu === "Thống kê" && (
          <div className="surface-panel p-6 text-center space-y-4">
            <div className="text-3xl">📊</div>
            <h2 className="text-lg font-black text-ink">
              Thống Kê Doanh Thu & Lượt Đọc
            </h2>
            <p className="text-xs text-subtle max-w-sm mx-auto">
              Báo cáo tổng quan về doanh thu bán chương VIP, lượt xem truyện, xu
              hướng đọc và tương tác của thành viên.
            </p>
            <div className="rounded-lg border border-line bg-canvas p-4 text-xs font-bold text-subtle">
              Tính năng biểu đồ thống kê thời gian thực đang được cập nhật.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
