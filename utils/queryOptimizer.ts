import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface QueryBatch {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  query: () => Promise<any>;
}

class QueryOptimizer {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private queryBatches: Map<string, QueryBatch[]> = new Map();
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly BATCH_DELAY = 50;
  private readonly DEFAULT_TTL = 5 * 60 * 1000;
  private readonly MEMORY_CACHE_MAX_SIZE = 100;

  private generateCacheKey(params: Record<string, any>): string {
    return JSON.stringify(params);
  }

  async getCached<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; useMemoryCache?: boolean } = {}
  ): Promise<T> {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const useMemoryCache = options.useMemoryCache !== false;

    if (useMemoryCache) {
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached && Date.now() - memoryCached.timestamp < memoryCached.ttl) {
        return memoryCached.data;
      }
    }

    try {
      const diskCacheKey = `query_cache_${cacheKey}`;
      const diskCached = await AsyncStorage.getItem(diskCacheKey);

      if (diskCached) {
        const parsed: CacheEntry<T> = JSON.parse(diskCached);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          if (useMemoryCache) {
            this.addToMemoryCache(cacheKey, parsed.data, parsed.ttl);
          }
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('Error reading from disk cache:', error);
    }

    const freshData = await fetchFn();

    if (useMemoryCache) {
      this.addToMemoryCache(cacheKey, freshData, ttl);
    }

    try {
      const cacheEntry: CacheEntry<T> = {
        data: freshData,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`query_cache_${cacheKey}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Error writing to disk cache:', error);
    }

    return freshData;
  }

  private addToMemoryCache(key: string, data: any, ttl: number) {
    if (this.memoryCache.size >= this.MEMORY_CACHE_MAX_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async batchQuery<T>(
    batchKey: string,
    query: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.queryBatches.has(batchKey)) {
        this.queryBatches.set(batchKey, []);
      }

      this.queryBatches.get(batchKey)!.push({
        resolve,
        reject,
        query,
      });

      if (this.batchTimeouts.has(batchKey)) {
        clearTimeout(this.batchTimeouts.get(batchKey)!);
      }

      const timeout = setTimeout(async () => {
        const batch = this.queryBatches.get(batchKey) || [];
        this.queryBatches.delete(batchKey);
        this.batchTimeouts.delete(batchKey);

        if (batch.length === 0) return;

        try {
          const results = await Promise.all(batch.map(b => b.query()));
          batch.forEach((b, index) => b.resolve(results[index]));
        } catch (error) {
          batch.forEach(b => b.reject(error));
        }
      }, this.BATCH_DELAY);

      this.batchTimeouts.set(batchKey, timeout);
    });
  }

  async queryWithCache<T>(
    params: {
      table: string;
      select?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    },
    options: { ttl?: number; useMemoryCache?: boolean } = {}
  ): Promise<T[]> {
    const cacheKey = this.generateCacheKey(params);

    return this.getCached(
      cacheKey,
      async () => {
        let query = supabase.from(params.table).select(params.select || '*');

        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        if (params.order) {
          query = query.order(params.order.column, { ascending: params.order.ascending !== false });
        }

        if (params.limit) {
          query = query.limit(params.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
      },
      options
    );
  }

  async fullTextSearch<T>(
    params: {
      table: string;
      column: string;
      searchTerm: string;
      language?: 'english' | 'french' | 'arabic';
      limit?: number;
    },
    options: { ttl?: number } = {}
  ): Promise<T[]> {
    const cacheKey = this.generateCacheKey(params);

    return this.getCached(
      cacheKey,
      async () => {
        const { data, error } = await supabase.rpc('search_' + params.table, {
          search_query: params.searchTerm,
          search_column: params.column,
          search_language: params.language || 'english',
          result_limit: params.limit || 50,
        });

        if (error) {
          console.warn('Full-text search RPC not available, falling back to LIKE search');
          const likeQuery = supabase
            .from(params.table)
            .select('*')
            .ilike(params.column, `%${params.searchTerm}%`)
            .limit(params.limit || 50);

          const { data: likeData, error: likeError } = await likeQuery;
          if (likeError) throw likeError;
          return likeData || [];
        }

        return data || [];
      },
      options
    );
  }

  clearCache(cacheKey?: string) {
    if (cacheKey) {
      this.memoryCache.delete(cacheKey);
      AsyncStorage.removeItem(`query_cache_${cacheKey}`).catch(console.error);
    } else {
      this.memoryCache.clear();
      AsyncStorage.getAllKeys().then(keys => {
        const cacheKeys = keys.filter(k => k.startsWith('query_cache_'));
        AsyncStorage.multiRemove(cacheKeys).catch(console.error);
      });
    }
  }

  async prefetchQueries<T>(queries: Array<() => Promise<T>>): Promise<void> {
    await Promise.all(queries.map(q => q().catch(error => {
      console.warn('Prefetch query failed:', error);
      return null;
    })));
  }

  getMemoryCacheSize(): number {
    return this.memoryCache.size;
  }

  async getDiskCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('query_cache_'));
      return cacheKeys.length;
    } catch {
      return 0;
    }
  }
}

export const queryOptimizer = new QueryOptimizer();

export default queryOptimizer;