# Seerah Map Experience - Setup Guide

## Overview

The Seerah Map Experience is an immersive, gamified map screen that allows users to explore the life of Prophet Muhammad (peace be upon him) through an interactive geographical timeline.

## Features

### Core Features
- Full-screen Google Maps with custom historical styling (sepia/golden tones)
- Interactive markers for different event types (Sacred, Battles, Revelations, Migration, Life Events)
- Smart stacking for events at the same location
- Bottom sheet with 3 snap states (Collapsed 12%, Mid 45%, Expanded 92%)
- Horizontal timeline strip with chronological navigation
- Filter chips for categories and locations

### Gamification Features
- Progress tracking with circular progress ring
- Achievement system (9 achievements)
- Daily streak counter
- "Event of the Day" spotlight
- Active explorers counter (simulated)
- Milestone celebrations with haptic feedback

### Psychological Engagement
- Curiosity triggers ("A Decouvrir" prompts)
- Accomplishment through progress visualization
- Emotional connection through spiritual reflection prompts
- Ownership through favorites and visited events
- Social proof through community activity

## File Structure

```
project/
├── app/
│   └── (tabs)/
│       ├── _layout.tsx          # Updated with Seerah tab
│       └── seerah-map.tsx       # Main screen
├── components/
│   └── seerah-map/
│       ├── index.ts             # Exports
│       ├── SeerahMapMarker.tsx  # Custom marker component
│       ├── EventBottomSheet.tsx # 3-state bottom sheet
│       ├── TimelineStrip.tsx    # Horizontal timeline
│       ├── FilterChips.tsx      # Search & filter UI
│       └── ProgressTracker.tsx  # Gamification UI
├── hooks/
│   └── useSeerahEvents.ts       # Supabase data hook
├── store/
│   └── seerahMapStore.ts        # Zustand state management
├── types/
│   └── seerahMap.d.ts           # TypeScript types + map styles
├── app.config.ts                # Expo config with Google Maps
└── docs/
    └── SEERAH_MAP_SETUP.md      # This file
```

## Installation

### 1. Install Dependencies

The project already has the required dependencies. If you need to add react-native-maps for native map support instead of WebView, run:

```bash
npm install react-native-maps
```

Or with Expo:

```bash
npx expo install react-native-maps
```

### 2. Google Maps API Setup

#### Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps JavaScript API (for web)
4. Create credentials > API Key
5. Restrict the key:
   - **Android**: Add your app's SHA-1 fingerprint and package name
   - **iOS**: Add your bundle identifier
   - **Web**: Add your domain

#### Configure Environment Variables

Create a `.env` file in the project root (if not exists):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Update the Map Screen

In `app/(tabs)/seerah-map.tsx`, replace the placeholder API key in the WebView HTML:

```javascript
// Find this line in the mapHtml template:
src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"

// Replace with:
src="https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap"
```

### 3. Supabase Database Setup

Ensure your `seerah_events` table has the following structure:

```sql
CREATE TABLE seerah_events (
  id SERIAL PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  historical_significance TEXT,
  category VARCHAR(50) DEFAULT 'life_event',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category constraint
ALTER TABLE seerah_events
ADD CONSTRAINT valid_category
CHECK (category IN ('sacred', 'battle', 'revelation', 'migration', 'life_event'));

-- Create index for performance
CREATE INDEX idx_seerah_events_category ON seerah_events(category);
CREATE INDEX idx_seerah_events_location ON seerah_events(location);
```

### 4. Run the App

#### Development (Expo Go - Limited)
Note: Expo Go has limitations with react-native-maps. The WebView-based map will work.

```bash
npm start
# or
npx expo start
```

#### Development Build (Recommended)
For full native map support:

```bash
# Create development build
npx expo prebuild

# iOS
npx expo run:ios

# Android
npx expo run:android
```

#### EAS Build (Production)

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Usage

### Navigating the Map
1. Open the app and tap the "Seerah" tab (map icon)
2. Browse markers on the map
3. Tap a marker to see event details
4. Use the timeline strip to jump to specific events
5. Apply filters using the category/location chips

### Progress System
- Events are marked as "visited" when you expand the bottom sheet fully
- Your progress is saved locally and persists across sessions
- Achievements unlock automatically based on your activity

### Achievements
| Achievement | Criteria |
|-------------|----------|
| Premier Pas | Visit first event |
| Pelerin Virtuel | Explore all Mecca events |
| Chercheur de Savoir | Read 10 full descriptions |
| Explorateur Nocturne | Use app after Isha (8 PM) |
| Maitre de la Seerah | 100% completion |
| Mecca Explorer | Visit all Mecca events |
| Medina Explorer | Visit all Medina events |
| Battle Historian | Explore all battle events |
| Revelation Scholar | Explore all revelation events |

## Customization

### Changing Colors

Edit the color palette in `types/seerahMap.d.ts`:

```typescript
export const CATEGORY_CONFIGS: Record<SeerahCategory, CategoryConfig> = {
  sacred: {
    color: '#C4A35A',     // Golden
    glowColor: 'rgba(196, 163, 90, 0.4)',
  },
  battle: {
    color: '#C62828',     // Red
    // ...
  },
  // etc.
};
```

### Map Styling

Edit the map style arrays in `types/seerahMap.d.ts`:
- `HISTORICAL_MAP_STYLE` - Light mode
- `HISTORICAL_MAP_STYLE_DARK` - Dark mode

Use [Snazzy Maps](https://snazzymaps.com/) or [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) to generate custom styles.

### Adding New Achievements

1. Add the achievement ID to the `AchievementId` type
2. Add the achievement object to `DEFAULT_ACHIEVEMENTS`
3. Add unlock logic in `checkAndUnlockAchievements()` in the store

## Troubleshooting

### Map Not Loading

1. Check API key is correctly set in environment variables
2. Verify API key has correct restrictions (bundle ID, package name, SHA-1)
3. Check browser console for Google Maps errors
4. Ensure billing is enabled on Google Cloud project

### Events Not Loading

1. Verify Supabase URL and anon key are correct
2. Check RLS policies allow reading from `seerah_events`
3. Look for errors in console from `useSeerahEvents` hook

### Markers Not Appearing

1. Ensure events have valid latitude/longitude values
2. Check that category field matches allowed values
3. Verify markers are being rendered (check stackedMarkers array)

### Performance Issues

1. Reduce marker count with pagination
2. Use `React.memo` for components (already implemented)
3. Optimize map style JSON (reduce feature count)
4. Consider clustering for dense marker areas

## Known Limitations

1. **Expo Go**: Limited support for react-native-maps; WebView fallback works
2. **Web**: Full Google Maps API requires paid billing account for high usage
3. **Offline**: Map tiles require internet; events cached in Zustand persist

## Future Enhancements

- [ ] Native react-native-maps integration for better performance
- [ ] Offline map tiles for Mecca/Medina regions
- [ ] Community notes feature
- [ ] Audio narration for events
- [ ] AR mode for on-location experiences
- [ ] Push notifications for daily event reminders
- [ ] Leaderboard for exploration progress

## Support

For issues or questions, please open an issue in the project repository.
