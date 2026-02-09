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

interface NavigationState {
  savedLocations: SavedLocation[];
  selectedDestination: SavedLocation | null;
  currentLocation: { latitude: number; longitude: number } | null;
  maxLocations: number;
  
  // Actions
  addLocation: (location: Omit<SavedLocation, 'id' | 'createdAt'>) => boolean;
  removeLocation: (id: string) => void;
  setSelectedDestination: (location: SavedLocation | null) => void;
  setCurrentLocation: (coords: { latitude: number; longitude: number } | null) => void;
  getLocationById: (id: string) => SavedLocation | undefined;
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
      maxLocations: 11, // 1 preset (Kaaba) + 10 user locations
      
      addLocation: (location) => {
        const { savedLocations, maxLocations } = get();
        
        // Check if max locations reached (excluding preset)
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
          savedLocations: state.savedLocations.filter(
          (loc) => loc.id !== id
          ),
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
