"use server";

import { getDbConnection, sql } from "./db";
import { stories as mockStories, chapters as mockChapters } from "@/lib/mock-data";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import path from "path";

function formatViews(views) {
  const v = parseInt(views) || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  return v.toString();
}

function saveBase64Image(base64Str, folderPath) {
  if (!base64Str || !base64Str.startsWith('data:image/')) return base64Str;
  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const filename = `${Date.now()}-${Math.round(Math.random()*1E9)}.${ext}`;
    const fullPath = path.join(process.cwd(), 'public', folderPath);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    fs.writeFileSync(path.join(fullPath, filename), buffer);
    return `/${folderPath}/${filename}`;
  } catch (e) {
    console.error("Lỗi lưu ảnh:", e);
    return base64Str;
  }
}


function isUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function isDbConnected() {
  try {
    const pool = await getDbConnection();
    await pool.request().query("SELECT 1 as val");
    return true;
  } catch (e) {
    console.warn("Database connection failed. Falling back to local storage.", e);
    return false;
  }
}

export async function getStoriesDb() {
  noStore();
  try {
    const pool = await getDbConnection();
    const res = await pool.request().query(`
      SELECT 
        s.id, s.title, s.slug, s.description, s.cover_image, s.status, s.content_type, s.views, s.created_at,
        a.name as author_name,
        (
          SELECT STRING_AGG(c.name, ',')
          FROM story_categories sc
          JOIN categories c ON sc.category_id = c.id
          WHERE sc.story_id = s.id
        ) as tags,
        (
          SELECT ISNULL(AVG(CAST(r.rating as FLOAT)), 5.0) 
          FROM ratings r 
          WHERE r.story_id = s.id
        ) as average_rating
      FROM stories s
      LEFT JOIN authors a ON s.author_id = a.id
      WHERE s.deleted_at IS NULL
      ORDER BY s.created_at DESC
    `);
    
    let stories = res.recordset.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      coverImage: row.cover_image,
      coverUrl: row.cover_image,
      status: row.status,
      type: row.content_type ? row.content_type.toUpperCase() : "MANGA",
      views: formatViews(row.views),
      createdAt: row.created_at,
      author: row.author_name || "Khuyết danh",
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [], 
      rating: parseFloat(row.average_rating) || 5
    }));
    

    
    return { success: true, data: stories };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function createStoryDb(data) {
  try {
    const pool = await getDbConnection();
    let authorRes = await pool.request()
      .input('name', sql.NVarChar, data.author)
      .query('SELECT id FROM authors WHERE name = @name');
      
    let authorId;
    if (authorRes.recordset.length > 0) {
      authorId = authorRes.recordset[0].id;
    } else {
      const insRes = await pool.request()
        .input('name', sql.NVarChar, data.author)
        .query('INSERT INTO authors (name) OUTPUT INSERTED.id VALUES (@name)');
      authorId = insRes.recordset[0].id;
    }

    const uniqueSlug = (data.slug || data.title.toLowerCase().replace(/\s+/g, '-')) + '-' + Date.now().toString(36);
    const finalCover = saveBase64Image(data.coverImage || '', 'uploads/covers');
    
    const storyRes = await pool.request()
      .input('title', sql.NVarChar, data.title)
      .input('slug', sql.NVarChar, uniqueSlug)
      .input('description', sql.NVarChar, data.description || '')
      .input('cover', sql.NVarChar(sql.MAX), finalCover)
      .input('type', sql.NVarChar, data.contentType || 'manga')
      .input('status', sql.NVarChar, data.status || 'draft')
      .input('authorId', sql.UniqueIdentifier, authorId)
      .query(`
        INSERT INTO stories (title, slug, description, cover_image, content_type, status, author_id)
        OUTPUT INSERTED.id
        VALUES (@title, @slug, @description, @cover, @type, @status, @authorId)
      `);
    const newStoryId = storyRes.recordset[0].id;
    
    // Process tags
    if (data.tags) {
      const tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tag of tags) {
        let catRes = await pool.request()
          .input('name', sql.NVarChar, tag)
          .query('SELECT id FROM categories WHERE name = @name');
        let categoryId;
        if (catRes.recordset.length > 0) {
          categoryId = catRes.recordset[0].id;
        } else {
          const catSlug = tag.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(7);
          const insRes = await pool.request()
            .input('name', sql.NVarChar, tag)
            .input('slug', sql.NVarChar, catSlug)
            .query('INSERT INTO categories (name, slug) OUTPUT INSERTED.id VALUES (@name, @slug)');
          categoryId = insRes.recordset[0].id;
        }
        await pool.request()
          .input('storyId', sql.UniqueIdentifier, newStoryId)
          .input('categoryId', sql.UniqueIdentifier, categoryId)
          .query('INSERT INTO story_categories (story_id, category_id) VALUES (@storyId, @categoryId)');
      }
    }
    
    revalidatePath('/', 'layout');
    return { success: true, data: { id: newStoryId } };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function updateStoryDb(storyId, data) {
  if (!isUUID(storyId)) return { success: false, error: "Không thể thay đổi dữ liệu mẫu (Mock Data)." };
  try {
    const pool = await getDbConnection();
    const finalCover = saveBase64Image(data.coverImage || '', 'uploads/covers');
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, storyId)
      .input('title', sql.NVarChar, data.title)
      .input('desc', sql.NVarChar, data.description)
      .input('status', sql.NVarChar, data.status)
      .input('type', sql.NVarChar, data.type)
      .input('cover', sql.NVarChar(sql.MAX), finalCover)
      .query(`
        UPDATE stories 
        SET title = @title, 
            description = @desc, 
            status = @status,
            content_type = @type,
            cover_image = @cover
        WHERE id = @id
      `);

    // Process tags
    if (data.tags !== undefined) {
      // First remove old tags
      await pool.request()
        .input('storyId', sql.UniqueIdentifier, storyId)
        .query('DELETE FROM story_categories WHERE story_id = @storyId');
        
      const tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tag of tags) {
        let catRes = await pool.request()
          .input('name', sql.NVarChar, tag)
          .query('SELECT id FROM categories WHERE name = @name');
        let categoryId;
        if (catRes.recordset.length > 0) {
          categoryId = catRes.recordset[0].id;
        } else {
          const catSlug = tag.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(7);
          const insRes = await pool.request()
            .input('name', sql.NVarChar, tag)
            .input('slug', sql.NVarChar, catSlug)
            .query('INSERT INTO categories (name, slug) OUTPUT INSERTED.id VALUES (@name, @slug)');
          categoryId = insRes.recordset[0].id;
        }
        await pool.request()
          .input('storyId', sql.UniqueIdentifier, storyId)
          .input('categoryId', sql.UniqueIdentifier, categoryId)
          .query('INSERT INTO story_categories (story_id, category_id) VALUES (@storyId, @categoryId)');
      }
    }
    
    revalidatePath('/', 'layout'); return { success: true };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function deleteStoryDb(id) {
  try {
    const pool = await getDbConnection();
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('UPDATE stories SET deleted_at = SYSUTCDATETIME() WHERE id = @id');
      
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function incrementStoryViewsDb(storyId) {
  try {
    const pool = await getDbConnection();
    await pool.request()
      .input('id', sql.UniqueIdentifier, storyId)
      .query('UPDATE stories SET views = views + 1 WHERE id = @id');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getChaptersDb(storyId) {
  noStore();
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT * FROM chapters WHERE story_id = @storyId AND deleted_at IS NULL ORDER BY chapter_number ASC');
      
    let chapters = res.recordset.map(row => {
      let parsedImages = undefined;
      if (row.image_manifest) {
        try { parsedImages = JSON.parse(row.image_manifest); } catch(e) {}
      }
      return {
        id: row.id,
        storyId: row.story_id,
        number: row.chapter_number,
        title: row.title,
        isPremium: row.is_premium,
        content: row.content,
        imageManifest: row.image_manifest,
        imageUrls: parsedImages,
        views: formatViews(row.views),
        publishedAt: row.published_at,
      };
    });
    

    
    fs.writeFileSync('C:/Users/HAI DANG/OneDrive/Documents/DocTruyen247/doctruyen247/debug_chapters.json', JSON.stringify({ success: true, data: chapters }));
    return { success: true, data: chapters };
  } catch (error) {
    console.error(error);
    fs.writeFileSync('C:/Users/HAI DANG/OneDrive/Documents/DocTruyen247/doctruyen247/debug_chapters.json', JSON.stringify({ success: false, error: error.message }));
    return { success: false, error: error.message };
  }
}

export async function createChapterDb(data) {
  try {
    const pool = await getDbConnection();
    let finalImagesJson = data.imageManifest || data.imageUrlsJson || null;
    if (finalImagesJson) {
      try {
        let urls = JSON.parse(finalImagesJson);
        urls = urls.map(url => saveBase64Image(url, `uploads/chapters/${data.storyId}`));
        finalImagesJson = JSON.stringify(urls);
      } catch (e) {
        console.error("Error processing images:", e);
      }
    }

    const res = await pool.request()
      .input('storyId', sql.UniqueIdentifier, data.storyId)
      .input('number', sql.Int, data.chapterNumber || data.number)
      .input('title', sql.NVarChar, data.title)
      .input('content', sql.NVarChar(sql.MAX), data.content || '')
      .input('images', sql.NVarChar(sql.MAX), finalImagesJson)
      .input('premium', sql.Bit, data.isPremium ? 1 : 0)
      .query(`
        INSERT INTO chapters (story_id, chapter_number, title, content, image_manifest, is_premium)
        OUTPUT INSERTED.id
        VALUES (@storyId, @number, @title, @content, @images, @premium)
      `);
    revalidatePath('/', 'layout');
    return { success: true, data: { id: res.recordset[0].id } };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function updateChapterDb(chapterId, data) {
  if (!isUUID(chapterId)) return { success: false, error: "Không thể thay đổi dữ liệu mẫu (Mock Data)." };
  try {
    const pool = await getDbConnection();
    let finalImagesJson = data.imageManifest || data.imageUrlsJson || null;
    if (finalImagesJson) {
      try {
        let urls = JSON.parse(finalImagesJson);
        const storyIdRes = await pool.request().input('id', sql.UniqueIdentifier, chapterId).query('SELECT story_id FROM chapters WHERE id = @id');
        const storyId = storyIdRes.recordset[0]?.story_id || 'unknown';
        urls = urls.map(url => saveBase64Image(url, `uploads/chapters/${storyId}`));
        finalImagesJson = JSON.stringify(urls);
      } catch (e) {
        console.error("Error processing images:", e);
      }
    }

    await pool.request()
      .input('id', sql.UniqueIdentifier, chapterId)
      .input('title', sql.NVarChar, data.title)
      .input('content', sql.NVarChar(sql.MAX), data.content || '')
      .input('images', sql.NVarChar(sql.MAX), finalImagesJson)
      .input('premium', sql.Bit, data.isPremium ? 1 : 0)
      .query('UPDATE chapters SET title = @title, content = @content, image_manifest = @images, is_premium = @premium WHERE id = @id');
    revalidatePath('/', 'layout'); return { success: true };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function deleteChapterDb(chapterId) {
  if (!isUUID(chapterId)) return { success: false, error: "Không thể xóa dữ liệu mẫu (Mock Data)." };
  try {
    const pool = await getDbConnection();
    await pool.request().input('id', sql.UniqueIdentifier, chapterId).query('UPDATE chapters SET deleted_at = SYSUTCDATETIME() WHERE id = @id');
    revalidatePath('/', 'layout'); return { success: true };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function scrapeChapterFromUrl(url) {
  return { success: true, data: { title: "Scraped Chapter", content: "Mô phỏng nội dung cào từ: " + url } };
}

export async function loginUserDb(email, password) {
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email AND deleted_at IS NULL');
      
    if (res.recordset.length === 0) return { success: false, error: "Sai thông tin đăng nhập" };
    
    const user = res.recordset[0];
    if (user.password_hash !== password) return { success: false, error: "Sai thông tin đăng nhập" };
    
    return { success: true, data: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function registerUserDb(name, email, password) {
  try {
    const pool = await getDbConnection();
    const existing = await pool.request().input('email', sql.NVarChar, email).query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0) return { success: false, error: "Email đã được sử dụng." };
    
    const res = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('pass', sql.NVarChar, password)
      .query(`
        INSERT INTO users (name, email, password_hash, role)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @pass, 0)
      `);
    
    const user = res.recordset[0];
    return { success: true, data: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function getCommentsDb(storyId, chapterId = null) {
  try {
    const pool = await getDbConnection();
    let q = pool.request();
    let sqlStr = `
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.deleted_at IS NULL
    `;
    
    if (chapterId) {
      q = q.input('chapterId', sql.UniqueIdentifier, chapterId);
      sqlStr += ' AND c.chapter_id = @chapterId ';
    } else {
      q = q.input('storyId', sql.UniqueIdentifier, storyId);
      sqlStr += ' AND c.story_id = @storyId ';
    }
    
    sqlStr += ' ORDER BY c.created_at DESC';
    const res = await q.query(sqlStr);
    
    const comments = res.recordset.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      user: { id: row.user_id, name: row.user_name, avatar: row.user_avatar }
    }));
    return { success: true, data: comments };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function createCommentDb(storyId, userId, content, chapterId = null) {
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId || null)
      .input('chapterId', sql.UniqueIdentifier, chapterId || null)
      .input('content', sql.NVarChar, content)
      .query(`
        INSERT INTO comments (user_id, story_id, chapter_id, content)
        OUTPUT INSERTED.*
        VALUES (@userId, @storyId, @chapterId, @content)
      `);
      
    const userRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT name, avatar FROM users WHERE id = @userId');
    const user = userRes.recordset[0] || { name: 'Người dùng', avatar: null };
    
    return { 
      success: true, 
      data: {
        id: res.recordset[0].id,
        content: content,
        createdAt: new Date().toISOString(),
        user: { id: userId, name: user.name, avatar: user.avatar }
      }
    };
  } catch (error) {
    console.error(error); return { success: false, error: error.message };
  }
}

export async function deleteCommentDb(commentId, userId) {
  try {
    const pool = await getDbConnection();
    await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('UPDATE comments SET deleted_at = SYSUTCDATETIME() WHERE id = @commentId AND user_id = @userId');
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error) {
    console.error(error); 
    return { success: false, error: error.message };
  }
}
export async function getUserRatingDb(storyId, userId) {
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('storyId', sql.UniqueIdentifier, storyId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT rating FROM ratings WHERE story_id = @storyId AND user_id = @userId');
    return { success: true, data: res.recordset.length > 0 ? res.recordset[0].rating : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitRatingDb(storyId, userId, ratingValue) {
  try {
    const pool = await getDbConnection();
    const checkRes = await pool.request()
      .input('storyId', sql.UniqueIdentifier, storyId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT 1 FROM ratings WHERE story_id = @storyId AND user_id = @userId');
      
    if (checkRes.recordset.length > 0) {
      await pool.request()
        .input('storyId', sql.UniqueIdentifier, storyId)
        .input('userId', sql.UniqueIdentifier, userId)
        .input('rating', sql.Int, ratingValue)
        .query('UPDATE ratings SET rating = @rating, updated_at = SYSUTCDATETIME() WHERE story_id = @storyId AND user_id = @userId');
    } else {
      await pool.request()
        .input('storyId', sql.UniqueIdentifier, storyId)
        .input('userId', sql.UniqueIdentifier, userId)
        .input('rating', sql.Int, ratingValue)
        .query('INSERT INTO ratings (user_id, story_id, rating) VALUES (@userId, @storyId, @rating)');
    }
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveReadingHistoryDb(userId, storyId, chapterId) {
  try {
    const pool = await getDbConnection();
    
    // Insert into reading_history
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .input('chapterId', sql.UniqueIdentifier, chapterId)
      .query('INSERT INTO reading_history (user_id, story_id, chapter_id) VALUES (@userId, @storyId, @chapterId)');

    // Upsert reading_progress
    const checkRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT 1 FROM reading_progress WHERE user_id = @userId AND story_id = @storyId');
      
    if (checkRes.recordset.length > 0) {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .input('chapterId', sql.UniqueIdentifier, chapterId)
        .query('UPDATE reading_progress SET chapter_id = @chapterId, updated_at = SYSUTCDATETIME() WHERE user_id = @userId AND story_id = @storyId');
    } else {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .input('chapterId', sql.UniqueIdentifier, chapterId)
        .query('INSERT INTO reading_progress (user_id, story_id, chapter_id) VALUES (@userId, @storyId, @chapterId)');
    }
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getReadingHistoryDb(userId) {
  noStore();
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          rp.updated_at as last_read_time,
          rp.scroll_position,
          s.id as story_id, s.title as story_title, s.slug, s.description, s.cover_image, s.status, s.content_type, s.views as story_views, s.created_at as story_created_at,
          a.name as author_name,
          (
            SELECT STRING_AGG(cat.name, ',')
            FROM story_categories sc
            JOIN categories cat ON sc.category_id = cat.id
            WHERE sc.story_id = s.id
          ) as tags,
          (SELECT COUNT(*) FROM chapters WHERE story_id = s.id) as total_chapters,
          c.id as chapter_id, c.title as chapter_title, c.chapter_number
        FROM reading_progress rp
        JOIN stories s ON rp.story_id = s.id
        JOIN chapters c ON rp.chapter_id = c.id
        LEFT JOIN authors a ON s.author_id = a.id
        WHERE rp.user_id = @userId AND s.deleted_at IS NULL
        ORDER BY rp.updated_at DESC
      `);
      
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " năm trước";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " tháng trước";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " ngày trước";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " giờ trước";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " phút trước";
      return "Vừa xong";
    };

    let items = res.recordset.map(row => ({
      story: {
        id: row.story_id,
        title: row.story_title,
        slug: row.slug,
        description: row.description,
        coverImage: row.cover_image,
        coverUrl: row.cover_image,
        status: row.status === 'COMPLETED' ? 'Full' : 'Đang ra',
        type: row.content_type,
        views: formatViews(row.story_views),
        rating: 5,
        createdAt: row.story_created_at,
        author: row.author_name || 'Đang cập nhật',
        tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      },
      chapter: row.chapter_title || `Chương ${row.chapter_number}`,
      progress: Math.min(100, Math.max(0, Math.round((row.chapter_number / Math.max(1, row.total_chapters)) * 100))),
      lastRead: formatTimeAgo(new Date(row.last_read_time)),
    }));
    return { success: true, data: items };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function checkStoryUserStatusDb(userId, storyId) {
  try {
    const pool = await getDbConnection();
    const favRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT 1 FROM favorites WHERE user_id = @userId AND story_id = @storyId');
    const followRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT 1 FROM follows WHERE user_id = @userId AND story_id = @storyId');
      
    return { 
      success: true, 
      data: { 
        isFavorited: favRes.recordset.length > 0, 
        isFollowing: followRes.recordset.length > 0 
      } 
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function toggleFavoriteDb(userId, storyId) {
  try {
    const pool = await getDbConnection();
    const checkRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT 1 FROM favorites WHERE user_id = @userId AND story_id = @storyId');
      
    if (checkRes.recordset.length > 0) {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .query('DELETE FROM favorites WHERE user_id = @userId AND story_id = @storyId');
      return { success: true, data: { isFavorited: false } };
    } else {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .query('INSERT INTO favorites (user_id, story_id) VALUES (@userId, @storyId)');
      return { success: true, data: { isFavorited: true } };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getFavoritesDb(userId) {
  noStore();
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          s.id, s.title, s.slug, s.description, s.cover_image, s.status, s.content_type, s.views, s.created_at,
          a.name as author_name,
          (
            SELECT STRING_AGG(c.name, ',')
            FROM story_categories sc
            JOIN categories c ON sc.category_id = c.id
            WHERE sc.story_id = s.id
          ) as tags
        FROM stories s
        JOIN favorites f ON s.id = f.story_id
        LEFT JOIN authors a ON s.author_id = a.id
        WHERE s.deleted_at IS NULL AND f.user_id = @userId
        ORDER BY f.created_at DESC
      `);
      
    let stories = res.recordset.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      coverImage: row.cover_image,
      coverUrl: row.cover_image,
      status: row.status === 'COMPLETED' ? 'Full' : 'Đang ra',
      type: row.content_type,
      views: formatViews(row.views),
      rating: 5,
      createdAt: row.created_at,
      author: row.author_name || 'Đang cập nhật',
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
    }));
    return { success: true, data: stories };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function toggleFollowDb(userId, storyId) {
  try {
    const pool = await getDbConnection();
    const checkRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('storyId', sql.UniqueIdentifier, storyId)
      .query('SELECT 1 FROM follows WHERE user_id = @userId AND story_id = @storyId');
      
    if (checkRes.recordset.length > 0) {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .query('DELETE FROM follows WHERE user_id = @userId AND story_id = @storyId');
      return { success: true, data: { isFollowing: false } };
    } else {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('storyId', sql.UniqueIdentifier, storyId)
        .query('INSERT INTO follows (user_id, story_id) VALUES (@userId, @storyId)');
      return { success: true, data: { isFollowing: true } };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getFollowsDb(userId) {
  noStore();
  try {
    const pool = await getDbConnection();
    const res = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          s.id, s.title, s.slug, s.description, s.cover_image, s.status, s.content_type, s.views, s.created_at,
          a.name as author_name,
          (
            SELECT STRING_AGG(c.name, ',')
            FROM story_categories sc
            JOIN categories c ON sc.category_id = c.id
            WHERE sc.story_id = s.id
          ) as tags
        FROM stories s
        JOIN follows f ON s.id = f.story_id
        LEFT JOIN authors a ON s.author_id = a.id
        WHERE s.deleted_at IS NULL AND f.user_id = @userId
        ORDER BY f.created_at DESC
      `);
      
    let stories = res.recordset.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      coverImage: row.cover_image,
      coverUrl: row.cover_image,
      status: row.status === 'COMPLETED' ? 'Full' : 'Đang ra',
      type: row.content_type,
      views: formatViews(row.views),
      rating: 5,
      createdAt: row.created_at,
      author: row.author_name || 'Đang cập nhật',
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
    }));
    return { success: true, data: stories };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getUserByIdDb(userId) {
  noStore();
  try {
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, userId)
      .query('SELECT id, name, email, avatar as avatarUrl, role, created_at as createdAt FROM users WHERE id = @id');
      
    if (result.recordset.length === 0) {
      console.log('User not found:', userId);
      return { success: false, error: 'User not found' };
    }
    const row = result.recordset[0];
    const userObj = {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatarUrl,
      role: row.role,
      createdAt: row.createdAt ? row.createdAt.toISOString() : null
    };
    console.log('User found:', userObj);
    return { success: true, data: userObj };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
