import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SeerahEvent,
  SeerahEventWithMeta,
  StackedMarker,
  MapViewport,
  UserProgress,
  FilterState,
  BottomSheetState,
  TimelinePosition,
  Achievement,
  AchievementId,
  DEFAULT_ACHIEVEMENTS,
  SeerahCategory,
} from '@/types/seerahMap.d';

// Helper to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper to parse year string and calculate years ago
const calculateYearsAgo = (yearString: string): number => {
  const currentYear = new Date().getFullYear();
  const match = yearString.match(/(\d+)/);
  if (match) {
    const year = parseInt(match[1]);
    // Handle CE/AD years
    if (yearString.toLowerCase().includes('ap') || yearString.toLowerCase().includes('ad') || yearString.toLowerCase().includes('ce')) {
      return currentYear - year;
    }
    // Handle BCE/BC years
    if (yearString.toLowerCase().includes('av') || yearString.toLowerCase().includes('bc') || yearString.toLowerCase().includes('bce')) {
      return currentYear + year;
    }
    // Default: assume CE if no indicator
    return currentYear - year;
  }
  return 0;
};

// Group events by coordinates for stacking
const groupEventsByCoordinates = (events: SeerahEventWithMeta[]): StackedMarker[] => {
  const coordMap = new Map<string, SeerahEventWithMeta[]>();

  events.forEach(event => {
    // Round coordinates to 4 decimal places for grouping nearby events
    const key = `${event.latitude.toFixed(4)},${event.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key)!.push(event);
  });

  return Array.from(coordMap.entries()).map(([key, groupedEvents]) => {
    const [lat, lng] = key.split(',').map(Number);
    return {
      latitude: lat,
      longitude: lng,
      events: groupedEvents.sort((a, b) => {
        // Sort by year chronologically
        const yearA = parseInt(a.year.match(/\d+/)?.[0] || '0');
        const yearB = parseInt(b.year.match(/\d+/)?.[0] || '0');
        return yearA - yearB;
      }),
      count: groupedEvents.length,
    };
  });
};

interface SeerahMapStore {
  // Events
  events: SeerahEventWithMeta[];
  stackedMarkers: StackedMarker[];
  isLoading: boolean;
  error: string | null;

  // Selection
  selectedEvent: SeerahEventWithMeta | null;
  selectedStackIndex: number;

  // Map
  viewport: MapViewport;
  userLocation: { latitude: number; longitude: number } | null;

  // Filters
  filters: FilterState;
  filteredEvents: SeerahEventWithMeta[];

  // Progress
  progress: UserProgress;
  visitedEventIds: number[];
  favoriteEventIds: number[];
  readDescriptionCount: number;

  // UI State
  bottomSheetState: BottomSheetState;
  timelinePosition: TimelinePosition;
  eventOfTheDay: SeerahEventWithMeta | null;
  activeExplorers: number;

  // TTS
  isSpeaking: boolean;
  speechProgress: number;

  // Actions
  setEvents: (events: SeerahEvent[]) => void;
  selectEvent: (event: SeerahEventWithMeta | null) => void;
  selectStackEvent: (index: number) => void;
  markEventVisited: (eventId: number) => void;
  toggleFavorite: (eventId: number) => void;
  incrementReadCount: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setViewport: (viewport: MapViewport) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setBottomSheetState: (state: Partial<BottomSheetState>) => void;
  setTimelinePosition: (position: TimelinePosition) => void;
  setSpeaking: (speaking: boolean) => void;
  setSpeechProgress: (progress: number) => void;
  unlockAchievement: (achievementId: AchievementId) => void;
  checkAndUnlockAchievements: () => void;
  incrementStreak: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pickEventOfTheDay: () => void;
  updateActiveExplorers: () => void;
}

// Default viewport centered on Mecca
const DEFAULT_VIEWPORT: MapViewport = {
  latitude: 21.4225,
  longitude: 39.8262,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  locations: [],
  searchQuery: '',
  showOnlyUnvisited: false,
  showOnlyFavorites: false,
};

const DEFAULT_PROGRESS: UserProgress = {
  visitedEvents: [],
  totalEvents: 0,
  percentage: 0,
  currentStreak: 0,
  lastVisitDate: null,
  achievements: [...DEFAULT_ACHIEVEMENTS],
};

export const useSeerahMapStore = create<SeerahMapStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: [],
      stackedMarkers: [],
      isLoading: false,
      error: null,
      selectedEvent: null,
      selectedStackIndex: 0,
      viewport: DEFAULT_VIEWPORT,
      userLocation: null,
      filters: DEFAULT_FILTERS,
      filteredEvents: [],
      progress: DEFAULT_PROGRESS,
      visitedEventIds: [],
      favoriteEventIds: [],
      readDescriptionCount: 0,
      bottomSheetState: {
        isOpen: false,
        snapIndex: 0,
        selectedEvent: null,
      },
      timelinePosition: {
        currentIndex: 0,
        totalEvents: 0,
      },
      eventOfTheDay: null,
      activeExplorers: 0,
      isSpeaking: false,
      speechProgress: 0,

      // Actions
      setEvents: (rawEvents: SeerahEvent[]) => {
        const { visitedEventIds, favoriteEventIds, userLocation } = get();

        const events: SeerahEventWithMeta[] = rawEvents.map(event => ({
          ...event,
          // Ensure category has a default value
          category: event.category || 'life_event',
          isVisited: visitedEventIds.includes(event.id),
          isFavorite: favoriteEventIds.includes(event.id),
          distanceFromUser: userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                event.latitude,
                event.longitude
              )
            : undefined,
          yearsAgo: calculateYearsAgo(event.year || ''),
        }));

        const stackedMarkers = groupEventsByCoordinates(events);

        set({
          events,
          stackedMarkers,
          filteredEvents: events,
          progress: {
            ...get().progress,
            totalEvents: events.length,
            percentage: events.length > 0
              ? Math.round((visitedEventIds.length / events.length) * 100)
              : 0,
          },
          timelinePosition: {
            currentIndex: 0,
            totalEvents: events.length,
          },
        });

        // Pick event of the day
        get().pickEventOfTheDay();
        get().updateActiveExplorers();
      },

      selectEvent: (event: SeerahEventWithMeta | null) => {
        set({
          selectedEvent: event,
          selectedStackIndex: 0,
          bottomSheetState: {
            isOpen: event !== null,
            snapIndex: event !== null ? 1 : 0,
            selectedEvent: event,
          },
        });
      },

      selectStackEvent: (index: number) => {
        const { selectedEvent, stackedMarkers } = get();
        if (!selectedEvent) return;

        const stack = stackedMarkers.find(
          s => s.latitude === selectedEvent.latitude && s.longitude === selectedEvent.longitude
        );

        if (stack && stack.events[index]) {
          set({
            selectedEvent: stack.events[index],
            selectedStackIndex: index,
            bottomSheetState: {
              isOpen: true,
              snapIndex: 1,
              selectedEvent: stack.events[index],
            },
          });
        }
      },

      markEventVisited: (eventId: number) => {
        const { visitedEventIds, events } = get();

        if (visitedEventIds.includes(eventId)) return;

        const newVisitedIds = [...visitedEventIds, eventId];
        const updatedEvents = events.map(e => ({
          ...e,
          isVisited: newVisitedIds.includes(e.id),
        }));

        set({
          visitedEventIds: newVisitedIds,
          events: updatedEvents,
          filteredEvents: updatedEvents,
          stackedMarkers: groupEventsByCoordinates(updatedEvents),
          progress: {
            ...get().progress,
            visitedEvents: newVisitedIds,
            percentage: Math.round((newVisitedIds.length / events.length) * 100),
          },
        });

        // Check achievements
        get().incrementStreak();
        get().checkAndUnlockAchievements();
      },

      toggleFavorite: (eventId: number) => {
        const { favoriteEventIds, events } = get();

        const newFavoriteIds = favoriteEventIds.includes(eventId)
          ? favoriteEventIds.filter(id => id !== eventId)
          : [...favoriteEventIds, eventId];

        const updatedEvents = events.map(e => ({
          ...e,
          isFavorite: newFavoriteIds.includes(e.id),
        }));

        set({
          favoriteEventIds: newFavoriteIds,
          events: updatedEvents,
          filteredEvents: updatedEvents,
          stackedMarkers: groupEventsByCoordinates(updatedEvents),
        });
      },

      incrementReadCount: () => {
        const newCount = get().readDescriptionCount + 1;
        set({ readDescriptionCount: newCount });
        get().checkAndUnlockAchievements();
      },

      setFilters: (newFilters: Partial<FilterState>) => {
        const { events } = get();
        const filters = { ...get().filters, ...newFilters };

        let filtered = [...events];

        // Filter by categories
        if (filters.categories.length > 0) {
          filtered = filtered.filter(e => filters.categories.includes(e.category));
        }

        // Filter by locations
        if (filters.locations.length > 0) {
          filtered = filtered.filter(e =>
            filters.locations.some(loc =>
              e.location.toLowerCase().includes(loc.toLowerCase())
            )
          );
        }

        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            e =>
              e.title.toLowerCase().includes(query) ||
              e.location.toLowerCase().includes(query) ||
              e.description.toLowerCase().includes(query) ||
              e.year.toLowerCase().includes(query)
          );
        }

        // Filter by visited
        if (filters.showOnlyUnvisited) {
          filtered = filtered.filter(e => !e.isVisited);
        }

        // Filter by favorites
        if (filters.showOnlyFavorites) {
          filtered = filtered.filter(e => e.isFavorite);
        }

        set({
          filters,
          filteredEvents: filtered,
          stackedMarkers: groupEventsByCoordinates(filtered),
        });
      },

      clearFilters: () => {
        const { events } = get();
        set({
          filters: DEFAULT_FILTERS,
          filteredEvents: events,
          stackedMarkers: groupEventsByCoordinates(events),
        });
      },

      setViewport: (viewport: MapViewport) => {
        set({ viewport });
      },

      setUserLocation: (location: { latitude: number; longitude: number } | null) => {
        const { events } = get();

        if (location) {
          const updatedEvents = events.map(e => ({
            ...e,
            distanceFromUser: calculateDistance(
              location.latitude,
              location.longitude,
              e.latitude,
              e.longitude
            ),
          }));

          set({
            userLocation: location,
            events: updatedEvents,
            filteredEvents: updatedEvents,
          });
        } else {
          set({ userLocation: location });
        }
      },

      setBottomSheetState: (state: Partial<BottomSheetState>) => {
        set({
          bottomSheetState: { ...get().bottomSheetState, ...state },
        });
      },

      setTimelinePosition: (position: TimelinePosition) => {
        set({ timelinePosition: position });
      },

      setSpeaking: (speaking: boolean) => {
        set({ isSpeaking: speaking });
      },

      setSpeechProgress: (progress: number) => {
        set({ speechProgress: progress });
      },

      unlockAchievement: (achievementId: AchievementId) => {
        const { progress } = get();
        const achievements = progress.achievements.map(a => {
          if (a.id === achievementId && !a.isUnlocked) {
            return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });

        set({
          progress: { ...progress, achievements },
        });
      },

      checkAndUnlockAchievements: () => {
        const { visitedEventIds, events, readDescriptionCount, progress } = get();
        const currentHour = new Date().getHours();

        // First step - visited first event
        if (visitedEventIds.length >= 1) {
          get().unlockAchievement('first_step');
        }

        // Knowledge seeker - read 10 descriptions
        if (readDescriptionCount >= 10) {
          get().unlockAchievement('knowledge_seeker');
        }

        // Night explorer - used after Isha (roughly 8 PM - 4 AM)
        if (currentHour >= 20 || currentHour < 4) {
          get().unlockAchievement('night_explorer');
        }

        // Seerah master - 100% completion
        if (visitedEventIds.length === events.length && events.length > 0) {
          get().unlockAchievement('seerah_master');
        }

        // Category-specific achievements
        const meccaEvents = events.filter(e =>
          e.location.toLowerCase().includes('mecque') ||
          e.location.toLowerCase().includes('mecca') ||
          e.location.toLowerCase().includes('مكة')
        );
        const visitedMeccaEvents = meccaEvents.filter(e => visitedEventIds.includes(e.id));
        if (meccaEvents.length > 0 && visitedMeccaEvents.length === meccaEvents.length) {
          get().unlockAchievement('virtual_pilgrim');
          get().unlockAchievement('mecca_explorer');
        }

        const medinaEvents = events.filter(e =>
          e.location.toLowerCase().includes('médine') ||
          e.location.toLowerCase().includes('medina') ||
          e.location.toLowerCase().includes('المدينة')
        );
        const visitedMedinaEvents = medinaEvents.filter(e => visitedEventIds.includes(e.id));
        if (medinaEvents.length > 0 && visitedMedinaEvents.length === medinaEvents.length) {
          get().unlockAchievement('medina_explorer');
        }

        const battleEvents = events.filter(e => e.category === 'battle');
        const visitedBattleEvents = battleEvents.filter(e => visitedEventIds.includes(e.id));
        if (battleEvents.length > 0 && visitedBattleEvents.length === battleEvents.length) {
          get().unlockAchievement('battle_historian');
        }

        const revelationEvents = events.filter(e => e.category === 'revelation');
        const visitedRevelationEvents = revelationEvents.filter(e => visitedEventIds.includes(e.id));
        if (revelationEvents.length > 0 && visitedRevelationEvents.length === revelationEvents.length) {
          get().unlockAchievement('revelation_scholar');
        }
      },

      incrementStreak: () => {
        const { progress } = get();
        const today = new Date().toDateString();
        const lastVisit = progress.lastVisitDate;

        if (lastVisit) {
          const lastDate = new Date(lastVisit);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastDate.toDateString() === yesterday.toDateString()) {
            // Consecutive day - increment streak
            set({
              progress: {
                ...progress,
                currentStreak: progress.currentStreak + 1,
                lastVisitDate: today,
              },
            });
          } else if (lastDate.toDateString() !== today) {
            // Not consecutive and not today - reset streak
            set({
              progress: {
                ...progress,
                currentStreak: 1,
                lastVisitDate: today,
              },
            });
          }
        } else {
          // First visit
          set({
            progress: {
              ...progress,
              currentStreak: 1,
              lastVisitDate: today,
            },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      pickEventOfTheDay: () => {
        const { events } = get();
        if (events.length === 0) return;

        // Use date as seed for consistent daily selection
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % events.length;

        set({ eventOfTheDay: events[index] });
      },

      updateActiveExplorers: () => {
        // Simulate active explorers (in production, this would come from Supabase realtime)
        const baseCount = 50;
        const variance = Math.floor(Math.random() * 100);
        set({ activeExplorers: baseCount + variance });
      },
    }),
    {
      name: 'seerah-map-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        visitedEventIds: state.visitedEventIds,
        favoriteEventIds: state.favoriteEventIds,
        readDescriptionCount: state.readDescriptionCount,
        progress: state.progress,
        viewport: state.viewport,
      }),
    }
  )
);
