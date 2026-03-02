-- =============================================================================
-- RAG Pipeline: Islamic Sources + Semantic Cache with pgvector
-- =============================================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- 1. ISLAMIC SOURCES TABLE (RAG knowledge base)
-- =============================================================================
CREATE TABLE IF NOT EXISTS islamic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN (
    'quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'tafsir', 'general'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_embedding VECTOR(1536),

  language TEXT NOT NULL DEFAULT 'ar',

  -- Source metadata
  book_name TEXT,
  reference TEXT,
  chapter TEXT,
  verse_key TEXT,

  -- Hadith-specific
  narrator TEXT,
  hadith_grade TEXT CHECK (hadith_grade IS NULL OR hadith_grade IN (
    'sahih', 'hasan', 'daif', 'mawdu', 'sahih_li_ghayrihi', 'hasan_li_ghayrihi'
  )),
  chain_of_narration TEXT,

  -- Translations
  arabic_text TEXT,
  french_text TEXT,
  english_text TEXT,

  -- Attribution
  scholar TEXT,
  reliability_score FLOAT DEFAULT 1.0 CHECK (reliability_score BETWEEN 0 AND 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. SEMANTIC CACHE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS semantic_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_embedding VECTOR(1536),
  answer_text TEXT NOT NULL,
  answer_sources JSONB DEFAULT '[]'::jsonb,
  language TEXT NOT NULL DEFAULT 'fr',
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- IVFFlat for source embeddings (lists ~sqrt(row_count), start at 100)
CREATE INDEX IF NOT EXISTS idx_islamic_sources_embedding
  ON islamic_sources
  USING ivfflat (content_embedding vector_cosine_ops)
  WITH (lists = 100);

-- IVFFlat for cache embeddings
CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding
  ON semantic_cache
  USING ivfflat (question_embedding vector_cosine_ops)
  WITH (lists = 50);

-- Supporting indexes
CREATE INDEX IF NOT EXISTS idx_islamic_sources_type ON islamic_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_islamic_sources_type_lang ON islamic_sources(source_type, language);
CREATE INDEX IF NOT EXISTS idx_islamic_sources_grade ON islamic_sources(hadith_grade);
CREATE INDEX IF NOT EXISTS idx_islamic_sources_book ON islamic_sources(book_name);
CREATE INDEX IF NOT EXISTS idx_islamic_sources_verse ON islamic_sources(verse_key);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_expires ON semantic_cache(expires_at);

-- Full-text search fallback
CREATE INDEX IF NOT EXISTS idx_islamic_sources_content_fts
  ON islamic_sources USING GIN(to_tsvector('english', content));

-- =============================================================================
-- 4. RPC: Search islamic sources by vector similarity
-- =============================================================================
CREATE OR REPLACE FUNCTION search_islamic_sources(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.70,
  match_count INT DEFAULT 5,
  filter_type TEXT DEFAULT NULL,
  filter_min_grade TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT,
  book_name TEXT,
  reference TEXT,
  chapter TEXT,
  verse_key TEXT,
  narrator TEXT,
  hadith_grade TEXT,
  arabic_text TEXT,
  french_text TEXT,
  english_text TEXT,
  scholar TEXT,
  reliability_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.source_type,
    s.title,
    s.content,
    1 - (s.content_embedding <=> query_embedding) AS similarity,
    s.book_name,
    s.reference,
    s.chapter,
    s.verse_key,
    s.narrator,
    s.hadith_grade,
    s.arabic_text,
    s.french_text,
    s.english_text,
    s.scholar,
    s.reliability_score
  FROM islamic_sources s
  WHERE
    1 - (s.content_embedding <=> query_embedding) > match_threshold
    AND (filter_type IS NULL OR s.source_type = filter_type)
    AND (
      filter_min_grade IS NULL
      OR s.hadith_grade IS NULL
      OR s.hadith_grade IN ('sahih', 'hasan', 'sahih_li_ghayrihi', 'hasan_li_ghayrihi')
    )
  ORDER BY s.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- 5. RPC: Check semantic cache
-- =============================================================================
CREATE OR REPLACE FUNCTION check_semantic_cache(
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.95
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  answer_text TEXT,
  answer_sources JSONB,
  similarity FLOAT,
  language TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.question_text,
    c.answer_text,
    c.answer_sources,
    1 - (c.question_embedding <=> query_embedding) AS similarity,
    c.language
  FROM semantic_cache c
  WHERE
    1 - (c.question_embedding <=> query_embedding) > similarity_threshold
    AND c.expires_at > NOW()
  ORDER BY c.question_embedding <=> query_embedding
  LIMIT 1;
END;
$$;

-- =============================================================================
-- 6. RPC: Increment cache hit count
-- =============================================================================
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE semantic_cache SET hit_count = hit_count + 1 WHERE id = cache_id;
$$;

-- =============================================================================
-- 7. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE islamic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_cache ENABLE ROW LEVEL SECURITY;

-- Islamic sources: public read
CREATE POLICY "Public read islamic_sources"
  ON islamic_sources FOR SELECT TO public USING (true);

-- Semantic cache: public read (non-expired only), anon/auth insert+update
CREATE POLICY "Public read semantic_cache"
  ON semantic_cache FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Anon insert semantic_cache"
  ON semantic_cache FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Auth insert semantic_cache"
  ON semantic_cache FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anon update semantic_cache"
  ON semantic_cache FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Auth update semantic_cache"
  ON semantic_cache FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
