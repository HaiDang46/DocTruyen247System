"use server";

import { prisma } from "@/lib/prisma";
import { stories as mockStories, chapters as mockChapters } from "@/lib/mock-data";

export async function isDbConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  try {
    // Timeout of 2 seconds to not freeze the UI if connection is slow
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
    ]);
    return true;
  } catch (e) {
    console.warn("Database connection failed. Falling back to local storage.", e);
    return false;
  }
}

async function seedMockData() {
  try {
    for (const mockStory of mockStories) {
      let author = await prisma.author.findFirst({
        where: { name: mockStory.author }
      });
      if (!author) {
        author = await prisma.author.create({
          data: { name: mockStory.author }
        });
      }

      const story = await prisma.story.create({
        data: {
          id: mockStory.id,
          title: mockStory.title,
          slug: mockStory.slug,
          description: mockStory.description,
          contentType: mockStory.type.toLowerCase(),
          status: mockStory.status.toLowerCase(),
          authorId: author.id,
        }
      });

      for (const tag of mockStory.tags) {
        let category = await prisma.category.findUnique({
          where: { name: tag }
        });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: tag,
              slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }
          });
        }
        await prisma.storyCategory.create({
          data: {
            storyId: story.id,
            categoryId: category.id
          }
        });
      }

      if (mockStory.id === "story-1") {
        for (const chap of mockChapters) {
          const c = chap as any;
          await prisma.chapter.create({
            data: {
              storyId: story.id,
              chapterNumber: c.number,
              title: c.title,
              isPremium: c.isPremium || false,
              content: c.content,
              imageManifest: c.imageUrls ? JSON.stringify({ imageUrls: c.imageUrls, imageNames: c.imageNames || [] }) : null
            }
          });
        }
      }
    }
    console.log("Auto-seeding database completed successfully!");
  } catch (e) {
    console.error("Auto-seeding failed:", e);
  }
}

// 1. Get stories
export async function getStoriesDb() {
  try {
    let stories = await prisma.story.findMany({
      where: { deletedAt: null },
      include: {
        author: true,
        categories: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (stories.length === 0) {
      await seedMockData();
      stories = await prisma.story.findMany({
        where: { deletedAt: null },
        include: {
          author: true,
          categories: {
            include: { category: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    }
    
    return {
      success: true,
      data: stories.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        type: s.contentType.toUpperCase() as "NOVEL" | "MANGA",
        status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as any,
        author: s.author.name,
        rating: 4.8, // Mocked rating
        views: String(s.views),
        latestChapter: "Chương mới", // Will be resolved dynamically on client
        tags: s.categories.map(c => c.category.name),
        description: s.description || "",
        coverClass: "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500",
        coverUrl: s.coverImage || undefined,
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Create Story
export async function createStoryDb(data: {
  title: string;
  author: string;
  type: "NOVEL" | "MANGA";
  status: string;
  tags: string[];
  coverImage?: string;
  description: string;
}) {
  try {
    // Find or create Author
    let author = await prisma.author.findFirst({
      where: { name: data.author, deletedAt: null }
    });
    if (!author) {
      author = await prisma.author.create({
        data: { name: data.author }
      });
    }

    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const story = await prisma.story.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        contentType: data.type.toLowerCase(),
        status: data.status.toLowerCase(),
        authorId: author.id,
        coverImage: data.coverImage || null,
      }
    });

    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        let category = await prisma.category.findUnique({
          where: { name: tagName }
        });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }
          });
        }
        await prisma.storyCategory.create({
          data: {
            storyId: story.id,
            categoryId: category.id
          }
        });
      }
    }

    return { success: true, data: { id: story.id, slug: story.slug } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Update Story
export async function updateStoryDb(storyId: string, data: {
  title: string;
  author: string;
  type: "NOVEL" | "MANGA";
  status: string;
  tags: string[];
  coverImage?: string;
  description: string;
}) {
  try {
    let author = await prisma.author.findFirst({
      where: { name: data.author, deletedAt: null }
    });
    if (!author) {
      author = await prisma.author.create({
        data: { name: data.author }
      });
    }

    await prisma.story.update({
      where: { id: storyId },
      data: {
        title: data.title,
        description: data.description,
        contentType: data.type.toLowerCase(),
        status: data.status.toLowerCase(),
        authorId: author.id,
        coverImage: data.coverImage || null,
      }
    });

    await prisma.storyCategory.deleteMany({
      where: { storyId }
    });

    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        let category = await prisma.category.findUnique({
          where: { name: tagName }
        });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }
          });
        }
        await prisma.storyCategory.create({
          data: {
            storyId,
            categoryId: category.id
          }
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Delete Story
export async function deleteStoryDb(storyId: string) {
  try {
    await prisma.story.delete({
      where: { id: storyId }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. Get Chapters
export async function getChaptersDb(storyId: string) {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { storyId, deletedAt: null },
      orderBy: { chapterNumber: "asc" }
    });
    return {
      success: true,
      data: chapters.map(c => {
        let imageUrls: string[] = [];
        let imageNames: string[] = [];
        if (c.imageManifest) {
          try {
            const manifest = JSON.parse(c.imageManifest);
            imageUrls = manifest.imageUrls || [];
            imageNames = manifest.imageNames || [];
          } catch (e) {
            console.error(e);
          }
        }
        return {
          id: c.id,
          storyId: c.storyId,
          number: c.chapterNumber,
          title: c.title,
          isPremium: c.isPremium,
          content: c.content || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          imageNames: imageNames.length > 0 ? imageNames : undefined,
        };
      })
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Create Chapter
export async function createChapterDb(data: {
  storyId: string;
  number: number;
  title: string;
  isPremium: boolean;
  content?: string;
  imageUrls?: string[];
  imageNames?: string[];
}) {
  try {
    let imageManifest: string | null = null;
    if (data.imageUrls || data.imageNames) {
      imageManifest = JSON.stringify({
        imageUrls: data.imageUrls || [],
        imageNames: data.imageNames || []
      });
    }

    const chapter = await prisma.chapter.create({
      data: {
        storyId: data.storyId,
        chapterNumber: data.number,
        title: data.title,
        isPremium: data.isPremium,
        content: data.content,
        imageManifest,
      }
    });
    return { success: true, data: { id: chapter.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. Update Chapter
export async function updateChapterDb(chapterId: string, data: {
  number: number;
  title: string;
  isPremium: boolean;
  content?: string;
  imageUrls?: string[];
  imageNames?: string[];
}) {
  try {
    let imageManifest: string | null = null;
    if (data.imageUrls || data.imageNames) {
      imageManifest = JSON.stringify({
        imageUrls: data.imageUrls || [],
        imageNames: data.imageNames || []
      });
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        chapterNumber: data.number,
        title: data.title,
        isPremium: data.isPremium,
        content: data.content,
        imageManifest,
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 8. Delete Chapter
export async function deleteChapterDb(chapterId: string) {
  try {
    await prisma.chapter.delete({
      where: { id: chapterId }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 9. Scrape Chapter From Url
export async function scrapeChapterFromUrl(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (!res.ok) {
      return { success: false, error: `Không thể tải trang (Mã lỗi: ${res.status})` };
    }
    const html = await res.text();
    
    // Extract Title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    let title = "";
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/-\s*TruyệnFull.*$/i, "")
        .replace(/-\s*SSTruyen.*$/i, "")
        .replace(/-\s*TruyệnYY.*$/i, "")
        .trim();
    }

    // Try to extract from common heading tags
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      const h1Text = h1Match[1].trim();
      if (h1Text.toLowerCase().includes("chương") || h1Text.toLowerCase().includes("chapter")) {
        title = h1Text;
      }
    }

    // Extract Content Paragraphs
    let content = "";
    
    const contentContainers = [
      /class=["']chapter-c["'][^>]*>([\s\S]*?)<\/div>/i,
      /id=["']chapter-content["'][^>]*>([\s\S]*?)<\/div>/i,
      /class=["']content-chap["'][^>]*>([\s\S]*?)<\/div>/i,
      /class=["']chapter-content["'][^>]*>([\s\S]*?)<\/div>/i,
      /class=["']box-chap["'][^>]*>([\s\S]*?)<\/div>/i,
    ];

    let foundContentHtml = "";
    for (const regex of contentContainers) {
      const match = html.match(regex);
      if (match) {
        foundContentHtml = match[1];
        break;
      }
    }

    if (!foundContentHtml) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        foundContentHtml = bodyMatch[1];
      }
    }

    if (foundContentHtml) {
      foundContentHtml = foundContentHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
      content = foundContentHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join("\n\n");
    }

    if (!content || content.length < 100) {
      content = "Không thể tự động trích xuất nội dung từ trang web này. Bạn vui lòng sao chép thủ công.";
    }

    let chapNumber = 1;
    const numMatch = title.match(/(?:chương|chapter|c|tập|ch)[\s_.-]*(\d+)/i);
    if (numMatch) {
      chapNumber = parseInt(numMatch[1], 10);
    }

    return {
      success: true,
      title: title || `Chương ${chapNumber}`,
      number: chapNumber,
      content
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
