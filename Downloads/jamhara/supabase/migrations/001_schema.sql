-- ============================================================
-- Jamhara — Migration 001: Core Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- CATEGORIES (24 main + 120 sub)
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  color       TEXT DEFAULT '#4CB36C',
  icon        TEXT,
  post_count  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX categories_parent_idx ON categories(parent_id);
CREATE INDEX categories_slug_idx ON categories(slug);

-- ============================================================
-- SOURCES
-- ============================================================
CREATE TABLE sources (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  domain            TEXT UNIQUE NOT NULL,
  badge_letter      CHAR(2) NOT NULL,
  badge_color       TEXT DEFAULT '#4CB36C',
  reliability_score FLOAT DEFAULT 0.8,
  language          TEXT DEFAULT 'ar',
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar         TEXT NOT NULL,
  title_en         TEXT,
  body_ar          TEXT NOT NULL,
  body_en          TEXT,
  slug             TEXT UNIQUE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  source_id        UUID REFERENCES sources(id) ON DELETE SET NULL,
  image_url        TEXT,
  status           TEXT DEFAULT 'published'
                     CHECK (status IN ('draft', 'published', 'flagged')),
  quality_score    FLOAT DEFAULT 0,
  hash_fingerprint TEXT UNIQUE,
  like_count       INT DEFAULT 0,
  share_count      INT DEFAULT 0,
  view_count       INT DEFAULT 0,
  reading_time     INT DEFAULT 1,
  is_featured      BOOLEAN DEFAULT false,
  search_vector    TSVECTOR,
  created_at       TIMESTAMPTZ DEFAULT now(),
  published_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX posts_category_idx      ON posts(category_id);
CREATE INDEX posts_subcategory_idx   ON posts(subcategory_id);
CREATE INDEX posts_status_idx        ON posts(status);
CREATE INDEX posts_published_at_idx  ON posts(published_at DESC);
CREATE INDEX posts_featured_idx      ON posts(is_featured) WHERE is_featured = true;
CREATE INDEX posts_search_idx        ON posts USING GIN(search_vector);

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title_ar, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.body_ar, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.title_en, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_vector_update
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- Auto-update category post_count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE categories SET post_count = post_count + 1
      WHERE id = NEW.category_id OR id = NEW.subcategory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET post_count = GREATEST(post_count - 1, 0)
      WHERE id = OLD.category_id OR id = OLD.subcategory_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_category_count_update
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- ============================================================
-- POST INTERACTIONS
-- ============================================================
CREATE TABLE post_interactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('like', 'share', 'view')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, session_id, action)
);

CREATE INDEX interactions_post_idx ON post_interactions(post_id);

-- ============================================================
-- GENERATION JOBS
-- ============================================================
CREATE TABLE generation_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID REFERENCES categories(id),
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'running', 'done', 'failed')),
  posts_generated INT DEFAULT 0,
  quality_passed  INT DEFAULT 0,
  quality_failed  INT DEFAULT 0,
  cost_usd        FLOAT DEFAULT 0,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- ============================================================
-- GENERATION PROMPTS (per category, versioned)
-- ============================================================
CREATE TABLE generation_prompts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id       UUID REFERENCES categories(id),
  prompt_text       TEXT NOT NULL,
  version           INT DEFAULT 1,
  performance_score FLOAT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_prompts ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT USING (status = 'published');

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "sources_public_read"
  ON sources FOR SELECT USING (is_active = true);

-- Interactions: anyone can insert/read
CREATE POLICY "interactions_insert"
  ON post_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "interactions_read"
  ON post_interactions FOR SELECT USING (true);

-- Generation tables: service role only (no public policy = blocked for anon)
