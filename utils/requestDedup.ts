/**
 * Request Deduplication — prevents duplicate concurrent requests
 * and provides an LRU embedding cache.
 */

// ---------------------------------------------------------------------------
// Query normalisation
// ---------------------------------------------------------------------------

/** Lowercase, trim, and collapse whitespace for consistent cache keys. */
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// In-flight request deduplication
// ---------------------------------------------------------------------------

const inflight = new Map<string, Promise<any>>();

/**
 * If a request with the same `key` is already in-flight, return the existing
 * promise instead of spawning a duplicate. Auto-cleans after resolve/reject.
 */
export function deduplicateRequest<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const normalized = normalizeQuery(key);

  const existing = inflight.get(normalized);
  if (existing) return existing as Promise<T>;

  const promise = factory().finally(() => {
    inflight.delete(normalized);
  });

  inflight.set(normalized, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// LRU Embedding cache (max 100 entries)
// ---------------------------------------------------------------------------

const MAX_CACHE_SIZE = 100;
const embeddingCache = new Map<string, number[]>();

/**
 * Look up a cached embedding vector for `text`.
 * Returns `null` on cache miss.
 */
export function getCachedEmbedding(text: string): number[] | null {
  const key = normalizeQuery(text);
  const value = embeddingCache.get(key);
  if (value === undefined) return null;

  // Move to end (most-recently used) by re-inserting
  embeddingCache.delete(key);
  embeddingCache.set(key, value);
  return value;
}

/**
 * Store an embedding vector in the LRU cache.
 * Evicts the oldest entry when the cache is full.
 */
export function setCachedEmbedding(text: string, embedding: number[]): void {
  const key = normalizeQuery(text);

  // If already present, delete first so re-insert moves to end
  if (embeddingCache.has(key)) {
    embeddingCache.delete(key);
  }

  // Evict oldest entry if at capacity
  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey !== undefined) {
      embeddingCache.delete(oldestKey);
    }
  }

  embeddingCache.set(key, embedding);
}
