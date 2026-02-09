// Seerah Map Types and Interfaces

export type SeerahCategory = 'sacred' | 'battle' | 'revelation' | 'migration' | 'life_event';

export interface SeerahEvent {
  id: number;
  year: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  historical_significance: string;
  category: SeerahCategory;
  created_at?: string;
  updated_at?: string;
}

export interface SeerahEventWithMeta extends SeerahEvent {
  isVisited: boolean;
  isFavorite: boolean;
  distanceFromUser?: number; // in km
  yearsAgo?: number;
}

export interface StackedMarker {
  latitude: number;
  longitude: number;
  events: SeerahEventWithMeta[];
  count: number;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface UserProgress {
  visitedEvents: number[];
  totalEvents: number;
  percentage: number;
  currentStreak: number;
  lastVisitDate: string | null;
  achievements: Achievement[];
}

export type AchievementId =
  | 'first_step'
  | 'virtual_pilgrim'
  | 'knowledge_seeker'
  | 'night_explorer'
  | 'seerah_master'
  | 'mecca_explorer'
  | 'medina_explorer'
  | 'battle_historian'
  | 'revelation_scholar';

export interface Achievement {
  id: AchievementId;
  title: string;
  titleFr: string;
  titleAr: string;
  description: string;
  descriptionFr: string;
  descriptionAr: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface FilterState {
  categories: SeerahCategory[];
  locations: string[];
  searchQuery: string;
  showOnlyUnvisited: boolean;
  showOnlyFavorites: boolean;
}

export interface BottomSheetState {
  isOpen: boolean;
  snapIndex: number; // 0: collapsed (12%), 1: mid (45%), 2: expanded (92%)
  selectedEvent: SeerahEventWithMeta | null;
}

export interface TimelinePosition {
  currentIndex: number;
  totalEvents: number;
}

export interface SeerahMapState {
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

  // Progress
  progress: UserProgress;

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
  markEventVisited: (eventId: number) => void;
  toggleFavorite: (eventId: number) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setViewport: (viewport: MapViewport) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setBottomSheetState: (state: Partial<BottomSheetState>) => void;
  setTimelinePosition: (position: TimelinePosition) => void;
  setSpeaking: (speaking: boolean) => void;
  setSpeechProgress: (progress: number) => void;
  unlockAchievement: (achievementId: AchievementId) => void;
  incrementStreak: () => void;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
}

export interface CategoryConfig {
  id: SeerahCategory;
  label: string;
  labelFr: string;
  labelAr: string;
  icon: string;
  color: string;
  glowColor: string;
}

export const CATEGORY_CONFIGS: Record<SeerahCategory, CategoryConfig> = {
  sacred: {
    id: 'sacred',
    label: 'Sacred Sites',
    labelFr: 'Lieux Sacrés',
    labelAr: 'الأماكن المقدسة',
    icon: 'kaaba',
    color: '#C4A35A',
    glowColor: 'rgba(196, 163, 90, 0.4)',
  },
  battle: {
    id: 'battle',
    label: 'Battles',
    labelFr: 'Batailles',
    labelAr: 'المعارك',
    icon: 'shield',
    color: '#C62828',
    glowColor: 'rgba(198, 40, 40, 0.4)',
  },
  revelation: {
    id: 'revelation',
    label: 'Revelations',
    labelFr: 'Révélations',
    labelAr: 'الوحي',
    icon: 'book-open',
    color: '#2E7D32',
    glowColor: 'rgba(46, 125, 50, 0.4)',
  },
  migration: {
    id: 'migration',
    label: 'Migration',
    labelFr: 'Migration',
    labelAr: 'الهجرة',
    icon: 'route',
    color: '#1565C0',
    glowColor: 'rgba(21, 101, 192, 0.4)',
  },
  life_event: {
    id: 'life_event',
    label: 'Life Events',
    labelFr: 'Événements de Vie',
    labelAr: 'أحداث الحياة',
    icon: 'baby',
    color: '#E65100',
    glowColor: 'rgba(230, 81, 0, 0.4)',
  },
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    titleFr: 'Premier Pas',
    titleAr: 'الخطوة الأولى',
    description: 'Visited your first event',
    descriptionFr: 'Visité votre premier événement',
    descriptionAr: 'زرت حدثك الأول',
    icon: '🏆',
    isUnlocked: false,
  },
  {
    id: 'virtual_pilgrim',
    title: 'Virtual Pilgrim',
    titleFr: 'Pèlerin Virtuel',
    titleAr: 'الحاج الافتراضي',
    description: 'Explored all Mecca events',
    descriptionFr: 'Exploré tous les événements de La Mecque',
    descriptionAr: 'استكشفت جميع أحداث مكة',
    icon: '🕋',
    isUnlocked: false,
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    titleFr: 'Chercheur de Savoir',
    titleAr: 'طالب العلم',
    description: 'Read 10 full descriptions',
    descriptionFr: 'Lu 10 descriptions complètes',
    descriptionAr: 'قرأت 10 أوصاف كاملة',
    icon: '📖',
    isUnlocked: false,
  },
  {
    id: 'night_explorer',
    title: 'Night Explorer',
    titleFr: 'Explorateur Nocturne',
    titleAr: 'مستكشف الليل',
    description: 'Used app after Isha',
    descriptionFr: "Utilisé l'app après Isha",
    descriptionAr: 'استخدمت التطبيق بعد العشاء',
    icon: '🌙',
    isUnlocked: false,
  },
  {
    id: 'seerah_master',
    title: 'Seerah Master',
    titleFr: 'Maître de la Seerah',
    titleAr: 'سيد السيرة',
    description: '100% completion',
    descriptionFr: 'Achèvement à 100%',
    descriptionAr: 'إكمال 100%',
    icon: '⭐',
    isUnlocked: false,
  },
  {
    id: 'mecca_explorer',
    title: 'Mecca Explorer',
    titleFr: 'Explorateur de la Mecque',
    titleAr: 'مستكشف مكة',
    description: 'Visited all Mecca events',
    descriptionFr: 'Visité tous les événements de La Mecque',
    descriptionAr: 'زرت جميع أحداث مكة',
    icon: '🕌',
    isUnlocked: false,
  },
  {
    id: 'medina_explorer',
    title: 'Medina Explorer',
    titleFr: 'Explorateur de Médine',
    titleAr: 'مستكشف المدينة',
    description: 'Visited all Medina events',
    descriptionFr: 'Visité tous les événements de Médine',
    descriptionAr: 'زرت جميع أحداث المدينة',
    icon: '🌴',
    isUnlocked: false,
  },
  {
    id: 'battle_historian',
    title: 'Battle Historian',
    titleFr: 'Historien des Batailles',
    titleAr: 'مؤرخ المعارك',
    description: 'Explored all battle events',
    descriptionFr: 'Exploré tous les événements de bataille',
    descriptionAr: 'استكشفت جميع أحداث المعارك',
    icon: '⚔️',
    isUnlocked: false,
  },
  {
    id: 'revelation_scholar',
    title: 'Revelation Scholar',
    titleFr: 'Érudit des Révélations',
    titleAr: 'عالم الوحي',
    description: 'Explored all revelation events',
    descriptionFr: 'Exploré tous les événements de révélation',
    descriptionAr: 'استكشفت جميع أحداث الوحي',
    icon: '📚',
    isUnlocked: false,
  },
];

// Map style for historical/sepia feel
export const HISTORICAL_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f0e1" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#5c4d3c" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f0e1" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#c9a227" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#dcd2be" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#ae9b77" }]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#e8dfc9" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#d4c9a8" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b5e4c" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#c5d5a8" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4e6a3d" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#f5ebe0" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#f0e4cf" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#e8d9bc" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#c9a227" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#e0cfa8" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#b8942d" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#806b55" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#dfd2ae" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8f7d60" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#ebe3cd" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#dfd2ae" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#b9d3c2" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4e7a65" }]
  }
];

// Dark mode map style
export const HISTORICAL_MAP_STYLE_DARK = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a2e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#c9a227" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1a1a2e" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#c9a227" }]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#232338" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#2a2a40" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8b7d55" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#1e3a2f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4e8a65" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#2a2a40" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#353550" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3a3a55" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#8b7d55" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#2a2a40" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#0d3d3d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4e8a80" }]
  }
];
