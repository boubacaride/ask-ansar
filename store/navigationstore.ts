import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  isPreset?: boolean;
  createdAt: Date;
}

// ─── Mapbox Directions API types ──────────────────────────────────
export interface MapboxStep {
  maneuver: {
    type: string;
    modifier?: string;
    instruction: string;
    bearing_after: number;
    bearing_before: number;
    location: [number, number]; // [lng, lat]
  };
  distance: number;
  duration: number;
  name: string;
  geometry: string;
}

export interface MapboxLeg {
  duration: number;
  distance: number;
  steps: MapboxStep[];
}

export interface MapboxRoute {
  geometry: string;
  duration: number;
  distance: number;
  legs: MapboxLeg[];
  weight_name: string;
}

export interface NavigationSession {
  isActive: boolean;
  routes: MapboxRoute[];
  selectedRouteIndex: number;
  currentStepIndex: number;
  currentLegIndex: number;
  decodedRoutes: Array<Array<[number, number]>>; // [lat, lng] arrays
  nearestPointIndex: number;
  distanceToRoute: number;
  isRerouting: boolean;
  lastRerouteTime: number;
  remainingDistance: number;
  remainingDuration: number;
  phase: 'route_selection' | 'navigating' | 'arrived';
}

interface NavigationState {
  savedLocations: SavedLocation[];
  selectedDestination: SavedLocation | null;
  currentLocation: { latitude: number; longitude: number } | null;
  maxLocations: number;
  navigationSession: NavigationSession | null;

  // Actions
  addLocation: (location: Omit<SavedLocation, 'id' | 'createdAt'>) => boolean;
  removeLocation: (id: string) => void;
  setSelectedDestination: (location: SavedLocation | null) => void;
  setCurrentLocation: (coords: { latitude: number; longitude: number } | null) => void;
  getLocationById: (id: string) => SavedLocation | undefined;
  startNavigationSession: (routes: MapboxRoute[], decodedRoutes: Array<Array<[number, number]>>) => void;
  selectRoute: (index: number) => void;
  updateNavigationProgress: (updates: Partial<NavigationSession>) => void;
  endNavigationSession: () => void;
}

// Kaaba preset location - cannot be modified or deleted
const KAABA_LOCATION: SavedLocation = {
  id: 'kaaba-preset',
  name: 'Kaaba (Al-Masjid al-Haram)',
  latitude: 21.4225,
  longitude: 39.8262,
  address: 'Al Haram, Mecca 24231, Saudi Arabia',
  isPreset: true,
  createdAt: new Date('2024-01-01'),
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      savedLocations: [KAABA_LOCATION],
      selectedDestination: null,
      currentLocation: null,
      maxLocations: 11,
      navigationSession: null,

      addLocation: (location) => {
        const { savedLocations, maxLocations } = get();
        const userLocations = savedLocations.filter(loc => !loc.isPreset);
        if (userLocations.length >= 10) {
          return false;
        }
        const newLocation: SavedLocation = {
          ...location,
          id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          isPreset: false,
        };
        set((state) => ({
          savedLocations: [...state.savedLocations, newLocation],
        }));
        return true;
      },

      removeLocation: (id) => {
        set((state) => ({
          savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
          selectedDestination:
            state.selectedDestination?.id === id ? null : state.selectedDestination,
        }));
      },

      setSelectedDestination: (location) => {
        set({ selectedDestination: location });
      },

      setCurrentLocation: (coords) => {
        set({ currentLocation: coords });
      },

      getLocationById: (id) => {
        return get().savedLocations.find((loc) => loc.id === id);
      },

      startNavigationSession: (routes, decodedRoutes) => {
        set({
          navigationSession: {
            isActive: true,
            routes,
            selectedRouteIndex: 0,
            currentStepIndex: 0,
            currentLegIndex: 0,
            decodedRoutes,
            nearestPointIndex: 0,
            distanceToRoute: 0,
            isRerouting: false,
            lastRerouteTime: 0,
            remainingDistance: routes[0].distance,
            remainingDuration: routes[0].duration,
            phase: 'route_selection',
          },
        });
      },

      selectRoute: (index) => {
        set((state) => ({
          navigationSession: state.navigationSession
            ? {
                ...state.navigationSession,
                selectedRouteIndex: index,
                remainingDistance: state.navigationSession.routes[index].distance,
                remainingDuration: state.navigationSession.routes[index].duration,
              }
            : null,
        }));
      },

      updateNavigationProgress: (updates) => {
        set((state) => ({
          navigationSession: state.navigationSession
            ? { ...state.navigationSession, ...updates }
            : null,
        }));
      },

      endNavigationSession: () => {
        set({ navigationSession: null });
      },
    }),
    {
      name: 'ask-ansar-navigation',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedLocations: state.savedLocations,
      }),
    }
  )
);
