import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { SeerahEvent } from '@/types/seerahMap.d';
import { useSeerahMapStore } from '@/store/seerahMapStore';

interface UseSeerahEventsOptions {
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseSeerahEventsReturn {
  events: SeerahEvent[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount: number;
}

export function useSeerahEvents(options: UseSeerahEventsOptions = {}): UseSeerahEventsReturn {
  const { pageSize = 100, autoLoad = true } = options;

  const [events, setEvents] = useState<SeerahEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const { setEvents: setStoreEvents, setLoading, setError: setStoreError } = useSeerahMapStore();

  const fetchedRef = useRef(false);
  const cacheRef = useRef<{
    data: SeerahEvent[];
    timestamp: number;
    totalCount: number;
  } | null>(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchEvents = useCallback(
    async (pageNum: number, append: boolean = false) => {
      // Check cache for first page
      if (pageNum === 0 && !append && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.timestamp;
        if (cacheAge < CACHE_DURATION) {
          setEvents(cacheRef.current.data);
          setTotalCount(cacheRef.current.totalCount);
          setStoreEvents(cacheRef.current.data);
          setHasMore(cacheRef.current.data.length < cacheRef.current.totalCount);
          return;
        }
      }

      setIsLoading(true);
      setLoading(true);
      setError(null);
      setStoreError(null);

      try {
        // Get total count first
        const { count, error: countError } = await supabase
          .from('seerah_events')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        setTotalCount(count || 0);

        // Fetch events with pagination
        const from = pageNum * pageSize;
        const to = from + pageSize - 1;

        const { data, error: fetchError } = await supabase
          .from('seerah_events')
          .select('*')
          .order('year', { ascending: true })
          .range(from, to);

        if (fetchError) throw fetchError;

        const newEvents = data as SeerahEvent[];

        if (append) {
          setEvents(prev => {
            const combined = [...prev, ...newEvents];
            // Update cache
            cacheRef.current = {
              data: combined,
              timestamp: Date.now(),
              totalCount: count || 0,
            };
            return combined;
          });
        } else {
          setEvents(newEvents);
          setStoreEvents(newEvents);
          // Update cache
          cacheRef.current = {
            data: newEvents,
            timestamp: Date.now(),
            totalCount: count || 0,
          };
        }

        setHasMore(from + newEvents.length < (count || 0));
        setPage(pageNum);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
        setError(errorMessage);
        setStoreError(errorMessage);
        console.error('Error fetching seerah events:', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    },
    [pageSize, setStoreEvents, setLoading, setStoreError]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchEvents(page + 1, true);
  }, [fetchEvents, hasMore, isLoading, page]);

  const refresh = useCallback(async () => {
    // Clear cache and reload
    cacheRef.current = null;
    setPage(0);
    setEvents([]);
    await fetchEvents(0, false);
  }, [fetchEvents]);

  // Initial load
  useEffect(() => {
    if (autoLoad && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchEvents(0);
    }
  }, [autoLoad, fetchEvents]);

  // Update store when events change
  useEffect(() => {
    if (events.length > 0) {
      setStoreEvents(events);
    }
  }, [events, setStoreEvents]);

  return {
    events,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
  };
}

// Hook for real-time updates (optional)
export function useSeerahEventsRealtime() {
  const { setEvents } = useSeerahMapStore();

  useEffect(() => {
    const subscription = supabase
      .channel('seerah_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seerah_events',
        },
        async () => {
          // Refetch all events on any change
          const { data } = await supabase
            .from('seerah_events')
            .select('*')
            .order('year', { ascending: true });

          if (data) {
            setEvents(data as SeerahEvent[]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setEvents]);
}

// Hook for single event details
export function useSeerahEventDetails(eventId: number | null) {
  const [event, setEvent] = useState<SeerahEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('seerah_events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (fetchError) throw fetchError;
        setEvent(data as SeerahEvent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event';
        setError(errorMessage);
        console.error('Error fetching event details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, isLoading, error };
}

// Hook for nearby events
export function useNearbyEvents(
  latitude: number | null,
  longitude: number | null,
  radiusKm: number = 50
) {
  const [nearbyEvents, setNearbyEvents] = useState<SeerahEvent[]>([]);
  const { events } = useSeerahMapStore();

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyEvents([]);
      return;
    }

    // Filter events within radius using Haversine formula
    const filtered = events.filter(event => {
      const R = 6371; // Earth's radius in km
      const dLat = ((event.latitude - latitude) * Math.PI) / 180;
      const dLon = ((event.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((event.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= radiusKm;
    });

    setNearbyEvents(filtered);
  }, [latitude, longitude, radiusKm, events]);

  return nearbyEvents;
}
