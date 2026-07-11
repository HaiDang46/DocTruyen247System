CREATE TABLE users (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  name NVARCHAR(120) NOT NULL,
  avatar NVARCHAR(500) NULL,
  role INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL
);

CREATE TABLE user_profiles (
  user_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
  bio NVARCHAR(MAX) NULL,
  social_links NVARCHAR(MAX) NULL,
  preferences NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
  user_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
  theme NVARCHAR(20) NOT NULL DEFAULT 'system',
  font_size INT NOT NULL DEFAULT 18,
  reading_mode NVARCHAR(20) NOT NULL DEFAULT 'scroll',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE authors (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name NVARCHAR(160) NOT NULL,
  bio NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL
);

CREATE TABLE stories (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  slug NVARCHAR(255) NOT NULL UNIQUE,
  description NVARCHAR(MAX) NULL,
  cover_image NVARCHAR(500) NULL,
  author_id UNIQUEIDENTIFIER NOT NULL,
  owner_user_id UNIQUEIDENTIFIER NULL,
  status NVARCHAR(30) NOT NULL DEFAULT 'draft',
  content_type NVARCHAR(30) NOT NULL DEFAULT 'novel',
  views BIGINT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL,
  CONSTRAINT fk_stories_author FOREIGN KEY (author_id) REFERENCES authors(id),
  CONSTRAINT fk_stories_owner_user FOREIGN KEY (owner_user_id) REFERENCES users(id),
  CONSTRAINT ck_stories_status CHECK (status IN ('draft', 'ongoing', 'completed', 'hiatus')),
  CONSTRAINT ck_stories_content_type CHECK (content_type IN ('novel', 'manga'))
);

CREATE TABLE categories (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name NVARCHAR(120) NOT NULL UNIQUE,
  slug NVARCHAR(140) NOT NULL UNIQUE,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL
);

CREATE TABLE story_categories (
  story_id UNIQUEIDENTIFIER NOT NULL,
  category_id UNIQUEIDENTIFIER NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (story_id, category_id),
  CONSTRAINT fk_story_categories_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  CONSTRAINT fk_story_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE chapters (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  story_id UNIQUEIDENTIFIER NOT NULL,
  chapter_number INT NOT NULL,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NULL,
  image_manifest NVARCHAR(MAX) NULL,
  is_premium BIT NOT NULL DEFAULT 0,
  coin_price INT NOT NULL DEFAULT 0,
  views BIGINT NOT NULL DEFAULT 0,
  published_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL,
  CONSTRAINT fk_chapters_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);
CREATE UNIQUE NONCLUSTERED INDEX ux_chapters_story_chapter_number ON chapters(story_id, chapter_number) WHERE deleted_at IS NULL;

CREATE TABLE comments (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NULL,
  chapter_id UNIQUEIDENTIFIER NULL,
  content NVARCHAR(MAX) NOT NULL,
  parent_id UNIQUEIDENTIFIER NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  deleted_at DATETIME2 NULL,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_comments_story FOREIGN KEY (story_id) REFERENCES stories(id),
  CONSTRAINT fk_comments_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id),
  CONSTRAINT ck_comments_target CHECK (story_id IS NOT NULL OR chapter_id IS NOT NULL)
);

CREATE TABLE ratings (
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NOT NULL,
  rating INT NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (user_id, story_id),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ratings_story FOREIGN KEY (story_id) REFERENCES stories(id),
  CONSTRAINT ck_ratings_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE favorites (
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (user_id, story_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_favorites_story FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE follows (
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (user_id, story_id),
  CONSTRAINT fk_follows_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_follows_story FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE reading_history (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NOT NULL,
  chapter_id UNIQUEIDENTIFIER NOT NULL,
  read_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_reading_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_history_story FOREIGN KEY (story_id) REFERENCES stories(id),
  CONSTRAINT fk_reading_history_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE reading_progress (
  user_id UNIQUEIDENTIFIER NOT NULL,
  story_id UNIQUEIDENTIFIER NOT NULL,
  chapter_id UNIQUEIDENTIFIER NOT NULL,
  scroll_position INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (user_id, story_id),
  CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_progress_story FOREIGN KEY (story_id) REFERENCES stories(id),
  CONSTRAINT fk_reading_progress_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE chapter_views (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  chapter_id UNIQUEIDENTIFIER NOT NULL,
  user_id UNIQUEIDENTIFIER NULL,
  ip_address NVARCHAR(45) NULL,
  viewed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_chapter_views_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  CONSTRAINT fk_chapter_views_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  type NVARCHAR(50) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  is_read BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reports (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  target_type NVARCHAR(50) NOT NULL,
  target_id UNIQUEIDENTIFIER NOT NULL,
  reason NVARCHAR(MAX) NOT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT ck_reports_status CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected'))
);

CREATE TABLE audit_logs (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  admin_id UNIQUEIDENTIFIER NOT NULL,
  action NVARCHAR(100) NOT NULL,
  target_type NVARCHAR(50) NOT NULL,
  target_id UNIQUEIDENTIFIER NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE wallets (
  user_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
  balance INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_wallets_balance CHECK (balance >= 0)
);

CREATE TABLE transactions (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  amount INT NOT NULL,
  type NVARCHAR(40) NOT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT ck_transactions_status CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

CREATE TABLE chapter_purchases (
  user_id UNIQUEIDENTIFIER NOT NULL,
  chapter_id UNIQUEIDENTIFIER NOT NULL,
  price INT NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (user_id, chapter_id),
  CONSTRAINT fk_chapter_purchases_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_chapter_purchases_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE INDEX ix_users_role ON users(role);
CREATE INDEX ix_users_deleted_at ON users(deleted_at);
CREATE INDEX ix_authors_name ON authors(name);
CREATE INDEX ix_stories_slug ON stories(slug);
CREATE INDEX ix_stories_author_id ON stories(author_id);
CREATE INDEX ix_stories_owner_user_id ON stories(owner_user_id);
CREATE INDEX ix_stories_content_type_status ON stories(content_type, status);
CREATE INDEX ix_stories_deleted_at ON stories(deleted_at);
CREATE INDEX ix_categories_slug ON categories(slug);
CREATE INDEX ix_story_categories_category_id ON story_categories(category_id);
CREATE INDEX ix_chapters_story_id ON chapters(story_id);
CREATE INDEX ix_chapters_chapter_number ON chapters(chapter_number);
CREATE INDEX ix_chapters_deleted_at ON chapters(deleted_at);
CREATE INDEX ix_comments_user_id ON comments(user_id);
CREATE INDEX ix_comments_story_id ON comments(story_id);
CREATE INDEX ix_comments_chapter_id ON comments(chapter_id);
CREATE INDEX ix_comments_parent_id ON comments(parent_id);
CREATE INDEX ix_ratings_story_id ON ratings(story_id);
CREATE INDEX ix_favorites_story_id ON favorites(story_id);
CREATE INDEX ix_follows_story_id ON follows(story_id);
CREATE INDEX ix_reading_history_user_read_at ON reading_history(user_id, read_at);
CREATE INDEX ix_reading_history_story_id ON reading_history(story_id);
CREATE INDEX ix_reading_history_chapter_id ON reading_history(chapter_id);
CREATE INDEX ix_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX ix_reading_progress_story_id ON reading_progress(story_id);
CREATE INDEX ix_reading_progress_chapter_id ON reading_progress(chapter_id);
CREATE INDEX ix_chapter_views_chapter_id ON chapter_views(chapter_id);
CREATE INDEX ix_chapter_views_user_id ON chapter_views(user_id);
CREATE INDEX ix_chapter_views_viewed_at ON chapter_views(viewed_at);
CREATE INDEX ix_notifications_user_is_read ON notifications(user_id, is_read);
CREATE INDEX ix_reports_user_id ON reports(user_id);
CREATE INDEX ix_reports_target ON reports(target_type, target_id);
CREATE INDEX ix_reports_status ON reports(status);
CREATE INDEX ix_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX ix_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX ix_transactions_user_id ON transactions(user_id);
CREATE INDEX ix_transactions_status ON transactions(status);
CREATE INDEX ix_chapter_purchases_chapter_id ON chapter_purchases(chapter_id);
