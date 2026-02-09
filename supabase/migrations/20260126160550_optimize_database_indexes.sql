/*
  # Database Performance Optimization - Indexes and Full-Text Search

  ## 1. New Indexes for Query Optimization
  
  ### Hadiths Table
  - `idx_hadiths_collection_book`: Speed up filtering by collection and book
  - `idx_hadiths_hadith_number`: Speed up lookups by hadith number
  - `idx_hadiths_created_at`: Speed up time-based queries
  - Full-text search indexes for Arabic, English, and French texts
  
  ### Translation Cache Table
  - `idx_translation_cache_lookup`: Composite index for cache lookups
  - `idx_translation_cache_source_type_id`: Speed up source-based queries
  - `idx_translation_cache_created_at`: Speed up cache expiration queries
  
  ### AI Content Cache Table
  - `idx_ai_content_cache_lookup`: Composite index for cache lookups
  - `idx_ai_content_cache_expires`: Speed up expiration checks
  
  ### Islamic Content Table
  - `idx_islamic_content_type_language`: Speed up filtering by type and language
  - Full-text search index for content
  
  ### Seerah Tables
  - `idx_seerah_bookmarks_user_page`: Speed up bookmark lookups
  - `idx_seerah_notes_user_page`: Speed up note lookups
  
  ### Saved Locations Table
  - `idx_saved_locations_user`: Speed up user location lookups
  
  ## 2. Full-Text Search Configuration
  - Creates GIN indexes for fast text search
  - Configures multi-language search support
  
  ## 3. Performance Improvements
  - Faster queries for all search operations
  - Optimized cache lookups
  - Efficient filtering and sorting
*/

-- =====================================================
-- HADITHS TABLE INDEXES
-- =====================================================

-- Composite index for collection and book filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_hadiths_collection_book 
ON hadiths(collection_id, book_number);

-- Index for hadith number lookups
CREATE INDEX IF NOT EXISTS idx_hadiths_hadith_number 
ON hadiths(hadith_number);

-- Index for created_at (useful for cache invalidation)
CREATE INDEX IF NOT EXISTS idx_hadiths_created_at 
ON hadiths(created_at DESC);

-- Full-text search indexes for hadith text search
-- Arabic text search
CREATE INDEX IF NOT EXISTS idx_hadiths_arabic_text_search 
ON hadiths USING GIN(to_tsvector('arabic', arabic_text));

-- English text search
CREATE INDEX IF NOT EXISTS idx_hadiths_english_text_search 
ON hadiths USING GIN(to_tsvector('english', english_text));

-- French text search (using french configuration)
CREATE INDEX IF NOT EXISTS idx_hadiths_french_text_search 
ON hadiths USING GIN(to_tsvector('french', coalesce(french_text, '')));

-- =====================================================
-- TRANSLATION CACHE TABLE INDEXES
-- =====================================================

-- Composite index for the most common cache lookup pattern
CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup 
ON translation_cache(source_text, source_language, target_language);

-- Index for source_type and source_id lookups
CREATE INDEX IF NOT EXISTS idx_translation_cache_source_type_id 
ON translation_cache(source_type, source_id, target_language);

-- Index for cache expiration and cleanup
CREATE INDEX IF NOT EXISTS idx_translation_cache_created_at 
ON translation_cache(created_at DESC);

-- =====================================================
-- AI CONTENT CACHE TABLE INDEXES
-- =====================================================

-- Composite index for cache lookups
CREATE INDEX IF NOT EXISTS idx_ai_content_cache_lookup 
ON ai_content_cache(verse_key, content_type, language);

-- Index for expiration checks
CREATE INDEX IF NOT EXISTS idx_ai_content_cache_expires 
ON ai_content_cache(expires_at);

-- =====================================================
-- ISLAMIC CONTENT TABLE INDEXES
-- =====================================================

-- Composite index for type and language filtering
CREATE INDEX IF NOT EXISTS idx_islamic_content_type_language 
ON islamic_content(type, language);

-- Full-text search index for content
CREATE INDEX IF NOT EXISTS idx_islamic_content_search 
ON islamic_content USING GIN(to_tsvector('english', content));

-- =====================================================
-- SEERAH BOOKMARKS TABLE INDEXES
-- =====================================================

-- Composite index for user and page lookups
CREATE INDEX IF NOT EXISTS idx_seerah_bookmarks_user_page 
ON seerah_bookmarks(user_id, page_number);

-- Index for created_at for sorting bookmarks
CREATE INDEX IF NOT EXISTS idx_seerah_bookmarks_created_at 
ON seerah_bookmarks(created_at DESC);

-- =====================================================
-- SEERAH NOTES TABLE INDEXES
-- =====================================================

-- Composite index for user and page lookups
CREATE INDEX IF NOT EXISTS idx_seerah_notes_user_page 
ON seerah_notes(user_id, page_number);

-- Index for updated_at for sorting notes
CREATE INDEX IF NOT EXISTS idx_seerah_notes_updated_at 
ON seerah_notes(updated_at DESC);

-- =====================================================
-- SAVED LOCATIONS TABLE INDEXES
-- =====================================================

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_saved_locations_user 
ON saved_locations(user_id);

-- Index for created_at for sorting locations
CREATE INDEX IF NOT EXISTS idx_saved_locations_created_at 
ON saved_locations(created_at DESC);

-- =====================================================
-- HADITH COLLECTIONS METADATA TABLE INDEXES
-- =====================================================

-- Index for collection_id lookups (already has unique constraint, but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_hadith_collections_metadata_collection 
ON hadith_collections_metadata(collection_id);

-- =====================================================
-- VACUUM AND ANALYZE
-- =====================================================
-- Note: These will run automatically in Supabase, but including for completeness

-- Analyze all tables to update statistics for query planner
ANALYZE hadiths;
ANALYZE translation_cache;
ANALYZE ai_content_cache;
ANALYZE islamic_content;
ANALYZE seerah_bookmarks;
ANALYZE seerah_notes;
ANALYZE saved_locations;
ANALYZE hadith_collections_metadata;