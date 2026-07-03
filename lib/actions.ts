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

    const allRatings = await prisma.rating.findMany();
    
    return {
      success: true,
      data: stories.map(s => {
        const storyRatings = allRatings.filter(r => r.storyId === s.id);
        const rating = storyRatings.length > 0
          ? Number((storyRatings.reduce((sum, r) => sum + r.rating, 0) / storyRatings.length).toFixed(1))
          : 4.8;

        return {
          id: s.id,
          title: s.title,
          slug: s.slug,
          type: s.contentType.toUpperCase() as "NOVEL" | "MANGA",
          status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as any,
          author: s.author.name,
          rating,
          views: String(s.views),
          latestChapter: "Chương mới", // Will be resolved dynamically on client
          tags: s.categories.map(c => c.category.name),
          description: s.description || "",
          coverClass: "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500",
          coverUrl: s.coverImage || undefined,
        };
      })
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
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { storyId } }),
      prisma.rating.deleteMany({ where: { storyId } }),
      prisma.favorite.deleteMany({ where: { storyId } }),
      prisma.follow.deleteMany({ where: { storyId } }),
      prisma.readingHistory.deleteMany({ where: { storyId } }),
      prisma.readingProgress.deleteMany({ where: { storyId } }),
      prisma.storyCategory.deleteMany({ where: { storyId } }),
      prisma.chapter.deleteMany({ where: { storyId } }),
      prisma.story.delete({ where: { id: storyId } }),
    ]);
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
  imageUrlsJson?: string;
  imageNames?: string[];
}) {
  try {
    let imageUrls: string[] = [];
    if (data.imageUrlsJson) {
      try {
        imageUrls = JSON.parse(data.imageUrlsJson);
      } catch (e) {}
    }

    let imageManifest: string | null = null;
    if (imageUrls.length > 0 || data.imageNames) {
      imageManifest = JSON.stringify({
        imageUrls,
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
  imageUrlsJson?: string;
  imageNames?: string[];
}) {
  try {
    let imageUrls: string[] = [];
    if (data.imageUrlsJson) {
      try {
        imageUrls = JSON.parse(data.imageUrlsJson);
      } catch (e) {}
    }

    let imageManifest: string | null = null;
    if (imageUrls.length > 0 || data.imageNames) {
      imageManifest = JSON.stringify({
        imageUrls,
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

// 10. Authentication Actions
export async function loginUserDb(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return { success: false, error: "Email không tồn tại." };
    }
    if (user.passwordHash !== password) {
      return { success: false, error: "Mật khẩu không chính xác." };
    }
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerUserDb(name: string, email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    if (existing) {
      return { success: false, error: "Email đã được sử dụng." };
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: password,
        role: "user"
      }
    });
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 11. Comment Actions
export async function getCommentsDb(storyId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { storyId, deletedAt: null },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return {
      success: true,
      data: comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        userName: c.user.name,
        userAvatar: c.user.avatar,
        userId: c.userId
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCommentDb(storyId: string, userId: string, content: string) {
  try {
    const comment = await prisma.comment.create({
      data: {
        storyId,
        userId,
        content
      },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    });
    return {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        userName: comment.user.name,
        userAvatar: comment.user.avatar,
        userId: comment.userId
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCommentDb(commentId: string, userId: string) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    if (!comment) {
      return { success: false, error: "Bình luận không tồn tại." };
    }
    if (comment.userId !== userId) {
      return { success: false, error: "Bạn không có quyền xóa bình luận này." };
    }
    await prisma.comment.delete({
      where: { id: commentId }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 12. Rating Actions
export async function getUserRatingDb(storyId: string, userId: string) {
  try {
    const r = await prisma.rating.findUnique({
      where: {
        userId_storyId: { userId, storyId }
      }
    });
    return { success: true, data: r ? r.rating : 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitRatingDb(storyId: string, userId: string, ratingValue: number) {
  try {
    await prisma.rating.upsert({
      where: {
        userId_storyId: { userId, storyId }
      },
      update: {
        rating: ratingValue
      },
      create: {
        userId,
        storyId,
        rating: ratingValue
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 13. Reading History Actions
export async function saveReadingHistoryDb(userId: string, storyId: string, chapterId: string) {
  try {
    await prisma.readingHistory.create({
      data: {
        userId,
        storyId,
        chapterId
      }
    });
    
    await prisma.readingProgress.upsert({
      where: {
        userId_storyId: { userId, storyId }
      },
      update: {
        chapterId,
        updatedAt: new Date()
      },
      create: {
        userId,
        storyId,
        chapterId
      }
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReadingHistoryDb(userId: string) {
  try {
    const history = await prisma.readingHistory.findMany({
      where: { userId },
      include: {
        story: {
          include: {
            author: true,
            categories: { include: { category: true } }
          }
        },
        chapter: true
      },
      orderBy: { readAt: "desc" }
    });

    const seenStories = new Set<string>();
    const result = [];
    
    for (const h of history) {
      if (seenStories.has(h.storyId)) continue;
      seenStories.add(h.storyId);
      
      result.push({
        story: {
          id: h.story.id,
          title: h.story.title,
          slug: h.story.slug,
          type: h.story.contentType.toUpperCase() as "NOVEL" | "MANGA",
          status: (h.story.status.charAt(0).toUpperCase() + h.story.status.slice(1)) as any,
          author: h.story.author.name,
          rating: 4.8, 
          views: String(h.story.views),
          tags: h.story.categories.map(c => c.category.name),
          description: h.story.description || "",
          coverClass: "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500",
          coverUrl: h.story.coverImage || undefined,
        },
        chapter: h.chapter.chapterNumber ? `Chương ${h.chapter.chapterNumber} - ${h.chapter.title}` : h.chapter.title,
        progress: 100 
      });
    }

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
