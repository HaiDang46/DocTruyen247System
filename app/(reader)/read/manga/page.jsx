"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import {
  stories as mockStories,
  chapters as mockChapters,
} from "@/lib/mock-data";
import {
  isDbConnected,
  getStoriesDb,
  getChaptersDb,
  saveReadingHistoryDb,
  getCommentsDb,
  createCommentDb,
  deleteCommentDb,
} from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

function MangaReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get("storyId");
  const chapterId = searchParams.get("chapterId");

  const { user } = useAuth();

  const [stories, setStories] = useState(mockStories);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [imageSize, setImageSize] = useState("Vừa màn");
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      setShowBottomNav(isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user && storyId && currentChapter?.id) {
      isDbConnected().then((connected) => {
        if (connected) {
          saveReadingHistoryDb(user.id, storyId, currentChapter.id);
        }
      });
    }
  }, [user, storyId, currentChapter?.id]);

  useEffect(() => {
    isDbConnected().then((connected) => {
      if (connected) {
        getStoriesDb().then((res) => {
          if (res.success && res.data) {
            setStories(res.data);
          }
        });
      } else {
        const saved = localStorage.getItem("doc_truyen_stories");
        if (saved) {
          try {
            setStories(JSON.parse(saved));
          } catch (e) {}
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!storyId) return;
    isDbConnected().then((connected) => {
      if (connected) {
        getChaptersDb(storyId).then((res) => {
          if (res.success && res.data) {
            setChapters(res.data);
          }
        });
      } else {
        const saved = localStorage.getItem("doc_truyen_chapters");
        if (saved) {
          try {
            const allChaps = JSON.parse(saved);
            setChapters(allChaps.filter((c) => c.storyId === storyId));
          } catch (e) {}
        } else {
          setChapters(
            mockChapters
              .map((c) => ({ ...c, storyId: "story-1" }))
              .filter((c) => c.storyId === storyId),
          );
        }
      }
    });
  }, [storyId]);

  useEffect(() => {
    if (chapters.length > 0) {
      const active = chapterId
        ? chapters.find((c) => c.id === chapterId)
        : chapters.sort((a, b) => a.number - b.number)[0];
      setCurrentChapter(active);
    }
  }, [chapters, chapterId]);

  useEffect(() => {
    if (!storyId || !currentChapter?.id) return;
    isDbConnected().then((connected) => {
      if (connected) {
        getCommentsDb(storyId, currentChapter.id).then((res) => {
          if (res.success && res.data) {
            setComments(res.data);
          }
        });
      }
    });
  }, [storyId, currentChapter?.id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentInput.trim() || !user || !currentChapter) return;
    const res = await createCommentDb(storyId, user.id, commentInput.trim(), currentChapter.id);
    if (res.success && res.data) {
      setComments((prev) => [res.data, ...prev]);
      setCommentInput("");
    } else {
      alert("Lỗi đăng bình luận: " + res.error);
    }
  }

  async function handleDeleteComment(commentId) {
    const res = await deleteCommentDb(commentId, user.id);
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else {
      alert("Lỗi xóa bình luận: " + res.error);
    }
  }

  const scrollToComments = () => {
    const el = document.getElementById("comments-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const images = currentChapter?.imageUrls || [];
  const story = stories.find((s) => s.id === storyId);

  if (!story || !currentChapter) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-subtle">Đang tải manga...</p>
      </div>
    );
  }

  const sortedChaps = [...chapters].sort((a, b) => a.number - b.number);
  const currentIndex = sortedChaps.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? sortedChaps[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < sortedChaps.length - 1
      ? sortedChaps[currentIndex + 1]
      : null;

  const navigateToChapter = (id) => {
    router.push(`/read/manga?storyId=${storyId}&chapterId=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerMaxWidth = 
    imageSize === "Vừa màn" ? "max-w-2xl" :
    imageSize === "Rộng" ? "max-w-5xl" :
    "max-w-[100%] px-0"; // Phóng to

  return (
    <div className="pb-4">
      <ReaderToolbar mode="manga" imageSize={imageSize} setImageSize={setImageSize} />

      <section className="mx-auto w-full px-0 py-5 sm:px-4">
        <div className="mx-auto mb-8 max-w-5xl border-b border-line pb-8 px-4 sm:px-0">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-subtle">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang Chủ
            </Link>
            <span>›</span>
            <Link href="/stories" className="hover:text-primary transition-colors">
              Truyện Tranh
            </Link>
            <span>›</span>
            <Link href={`/stories/${story.slug}`} className="hover:text-primary transition-colors">
              {story.title}
            </Link>
            <span>›</span>
            <span className="text-ink">Chapter {currentChapter.number}</span>
          </div>

          <h1 className="mb-8 text-2xl font-black uppercase text-ink md:text-3xl">
            {story.title} - CHAPTER {currentChapter.number}
          </h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left Col: Details */}
            <div className="flex flex-col gap-3 text-base text-ink md:col-span-5">
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Tác giả:</span> 
                <span className="text-primary">{story.author || "Đang cập nhật"}</span>
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Tổng số Chap:</span> 
                {chapters.length}
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Số trang:</span> 
                {images.length}
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Định dạng:</span> 
                Truyện Tranh
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Tình trạng:</span> 
                {story.status === "Ongoing" ? "Đang cập nhật..." : "Đã hoàn thành"}
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Lượt đọc:</span> 
                {story.views || "0"}
              </p>
              <p>
                <span className="inline-block w-32 font-bold text-subtle">Cập nhật lúc:</span> 
                Vừa xong
              </p>
              <button 
                onClick={scrollToComments}
                className="mt-4 flex w-fit items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Bình Luận ({comments.length})
              </button>
            </div>

            {/* Middle Col: Genres */}
            <div className="md:col-span-4">
              <h3 className="mb-4 text-base font-bold uppercase text-ink">Thể loại</h3>
              <div className="flex flex-wrap gap-2">
                {story.tags && story.tags.map((tag, i) => {
                  const bgColors = [
                    "bg-blue-600", "bg-emerald-600", "bg-rose-600", 
                    "bg-purple-600", "bg-teal-700", "bg-amber-700"
                  ];
                  const bgColor = bgColors[i % bgColors.length];
                  return (
                    <span 
                      key={tag} 
                      className={`rounded px-3 py-1.5 text-xs font-bold text-white shadow-sm ${bgColor}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Cover Image */}
            <div className="flex md:col-span-3 md:justify-end">
              <div className={`relative h-72 w-52 overflow-hidden rounded-md shadow-lg ${story.coverUrl ? "bg-slate-200" : story.coverClass}`}>
                {story.coverUrl ? (
                  <img src={story.coverUrl} alt={story.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/10 p-4 text-center backdrop-blur-sm">
                    <span className="text-xl font-black text-white/80 drop-shadow-md">{story.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chap trước / Chap sau Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
              className="flex items-center gap-2 rounded-md bg-slate-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-600 disabled:opacity-40"
            >
              ← Chapter Trước
            </button>
            <button
              disabled={!nextChapter}
              onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              Chapter Sau →
            </button>
          </div>
        </div>

        {/* Vertical scrolling list of manga images */}
        <div className={`mx-auto flex flex-col items-center gap-1 select-none ${containerMaxWidth}`}>
          {images.length > 0 ? (
            images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Trang ${index + 1}`}
                className={`h-auto object-contain ${imageSize === "Phóng to" ? "w-screen" : "w-full"}`}
                loading="lazy"
              />
            ))
          ) : (
            <div className="py-20 text-center text-slate-400">
              <p className="text-sm">Chương này chưa có hình ảnh.</p>
            </div>
          )}
        </div>

        {/* Removed inline next/prev chapter buttons because floating nav is used instead */}
      </section>

      {/* Comments Section */}
      <section id="comments-section" className="mx-auto mb-10 w-full max-w-4xl px-4 sm:px-0">
        <div className="rounded-lg border border-line bg-surface p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold text-ink">Bình luận chapter {currentChapter.number} ({comments.length})</h2>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                placeholder="Chia sẻ cảm nghĩ của bạn về chapter này..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (commentInput.trim()) {
                      handleCommentSubmit(e);
                    }
                  }
                }}
                className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <button className="rounded-md bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/95 transition" type="submit">
                  Gửi bình luận
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-muted/30 p-6 text-center">
              <p className="text-sm text-subtle">Bạn cần đăng nhập để tham gia thảo luận.</p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/95 transition"
                type="button"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
          
          <div className="mt-6 space-y-4 divide-y divide-line">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="pt-4 flex gap-3 items-start group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primarySoft text-xs font-black text-primary uppercase flex-shrink-0">
                    {(comment.userName || comment.user?.name || "U").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-ink">{comment.userName || comment.user?.name || "Người dùng ẩn danh"}</span>
                        <span className="text-[10px] text-subtle ml-2">
                          {new Date(comment.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {user && user.id === comment.user?.id && (
                        <button
                          onClick={() => setCommentToDelete(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-rose-600 hover:underline transition"
                          type="button"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-subtle whitespace-pre-line leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-xs text-subtle text-center">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
            )}
          </div>
        </div>
      </section>

      {/* Floating navigation bar */}
      <nav className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur transition-transform duration-300 ${showBottomNav ? "translate-y-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]" : "translate-y-full"}`}>
        <div className="mx-auto grid max-w-3xl grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-subtle disabled:opacity-40"
          >
            Chapter trước
          </button>
          <button
            onClick={() => router.push(`/stories/${story.slug}`)}
            className="rounded-lg border border-line px-3 py-3 text-sm font-bold text-ink"
          >
            Chi tiết
          </button>
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
            className="rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Chapter sau
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center justify-center rounded-lg border border-line bg-muted px-4 py-3 text-ink transition-colors hover:bg-muted/80"
            title="Lên đầu trang"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Delete Comment Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-ink mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-subtle mb-6">Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-ink bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-lg shadow-rose-600/20"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MangaReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm font-bold text-subtle">Đang tải...</p>
        </div>
      }
    >
      <MangaReaderContent />
    </Suspense>
  );
}
