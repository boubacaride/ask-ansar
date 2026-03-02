-- =============================================================================
-- Hybrid Search: FTS indexes + combined vector+text search RPC
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. French full-text search index on islamic_sources
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_islamic_sources_french_fts
  ON islamic_sources USING GIN(to_tsvector('french', COALESCE(french_text, '') || ' ' || COALESCE(content, '')));

-- ---------------------------------------------------------------------------
-- 2. Arabic / simple text search index on islamic_sources
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_islamic_sources_arabic_fts
  ON islamic_sources USING GIN(to_tsvector('simple', COALESCE(arabic_text, '') || ' ' || COALESCE(content, '')));

-- ---------------------------------------------------------------------------
-- 3. RPC: Hybrid search combining vector similarity + full-text relevance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION hybrid_search_islamic_sources(
  query_embedding VECTOR(1536),
  query_text TEXT DEFAULT '',
  match_threshold FLOAT DEFAULT 0.60,
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
  combined_score FLOAT,
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
DECLARE
  fts_query TSQUERY;
  has_fts_results BOOLEAN := FALSE;
BEGIN
  -- Build a simple tsquery from the query text (safe for mixed language input)
  IF query_text IS NOT NULL AND LENGTH(TRIM(query_text)) > 0 THEN
    BEGIN
      fts_query := to_tsquery('simple', regexp_replace(TRIM(query_text), '\s+', ' & ', 'g'));
    EXCEPTION WHEN OTHERS THEN
      fts_query := NULL;
    END;
  END IF;

  -- Check if FTS produces any results
  IF fts_query IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM islamic_sources s
      WHERE (
        to_tsvector('simple', COALESCE(s.arabic_text, '') || ' ' || COALESCE(s.content, '')) @@ fts_query
        OR to_tsvector('french', COALESCE(s.french_text, '') || ' ' || COALESCE(s.content, '')) @@ fts_query
      )
      LIMIT 1
    ) INTO has_fts_results;
  END IF;

  -- Combined vector (0.7) + FTS (0.3) scoring, with fallback to vector-only
  RETURN QUERY
  SELECT
    s.id,
    s.source_type,
    s.title,
    s.content,
    (1 - (s.content_embedding <=> query_embedding))::FLOAT AS similarity,
    CASE
      WHEN has_fts_results AND fts_query IS NOT NULL THEN
        (
          0.7 * (1 - (s.content_embedding <=> query_embedding))
          + 0.3 * COALESCE(
            ts_rank(
              to_tsvector('simple', COALESCE(s.arabic_text, '') || ' ' || COALESCE(s.content, '')),
              fts_query
            )
            + ts_rank(
              to_tsvector('french', COALESCE(s.french_text, '') || ' ' || COALESCE(s.content, '')),
              fts_query
            ),
            0
          )
        )::FLOAT
      ELSE
        (1 - (s.content_embedding <=> query_embedding))::FLOAT
    END AS combined_score,
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
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Helper: Cleanup expired semantic cache entries
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM semantic_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
