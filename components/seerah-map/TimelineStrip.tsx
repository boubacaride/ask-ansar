import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { SeerahEventWithMeta, CATEGORY_CONFIGS } from '@/types/seerahMap.d';
import { useSettings } from '@/store/settingsStore';
import { useSeerahMapStore } from '@/store/seerahMapStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_MARGIN = 10;

interface TimelineStripProps {
  events: SeerahEventWithMeta[];
  selectedEvent: SeerahEventWithMeta | null;
  onEventSelect: (event: SeerahEventWithMeta) => void;
  currentIndex: number;
}

interface TimelineCardProps {
  event: SeerahEventWithMeta;
  isSelected: boolean;
  isVisited: boolean;
  onPress: () => void;
  darkMode: boolean;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  event,
  isSelected,
  isVisited,
  onPress,
  darkMode,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const category = event.category || 'life_event';
  const categoryConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['life_event'];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim]);

  const colors = {
    card: darkMode ? '#252540' : '#ffffff',
    cardBorder: isSelected ? categoryConfig.color : darkMode ? '#3a3a55' : '#e5e5e5',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    overlay: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Unvisited overlay */}
        {!isVisited && (
          <View style={[styles.unvisitedOverlay, { backgroundColor: colors.overlay }]}>
            <FontAwesome5 name="question" size={24} color={colors.textSecondary} />
          </View>
        )}

        {/* Year badge */}
        <View style={[styles.yearBadge, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.yearText}>{event.year}</Text>
        </View>

        {/* Category icon */}
        <View style={[styles.categoryIcon, { backgroundColor: `${categoryConfig.color}20` }]}>
          <FontAwesome5
            name={categoryConfig.icon === 'kaaba' ? 'kaaba' : categoryConfig.icon}
            size={16}
            color={categoryConfig.color}
          />
        </View>

        {/* Title */}
        <Text
          style={[styles.cardTitle, { color: isVisited ? colors.text : colors.textSecondary }]}
          numberOfLines={2}
        >
          {event.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={10} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Visited indicator */}
        {isVisited && (
          <View style={styles.visitedCheck}>
            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" solid />
          </View>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: categoryConfig.color }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TimelineStrip: React.FC<TimelineStripProps> = ({
  events,
  selectedEvent,
  onEventSelect,
  currentIndex,
}) => {
  const { darkMode } = useSettings();
  const { progress } = useSeerahMapStore();
  const flatListRef = useRef<FlatList>(null);

  const colors = {
    background: darkMode ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#0D5C63',
    secondary: '#C4A35A',
  };

  // Scroll to selected event
  useEffect(() => {
    if (selectedEvent && flatListRef.current) {
      const index = events.findIndex(e => e.id === selectedEvent.id);
      if (index !== -1) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [selectedEvent, events]);

  const renderCard = ({ item, index }: { item: SeerahEventWithMeta; index: number }) => (
    <TimelineCard
      event={item}
      isSelected={selectedEvent?.id === item.id}
      isVisited={item.isVisited}
      onPress={() => onEventSelect(item)}
      darkMode={darkMode}
    />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: CARD_WIDTH + CARD_MARGIN * 2,
    offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
    index,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with position indicator */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          <FontAwesome5 name="history" size={12} color={colors.secondary} /> Frise Chronologique
        </Text>
        <View style={styles.positionIndicator}>
          <Text style={[styles.positionText, { color: colors.textSecondary }]}>
            Vous êtes ici dans l'histoire
          </Text>
          <View style={[styles.positionDot, { backgroundColor: colors.secondary }]} />
        </View>
      </View>

      {/* Timeline line */}
      <View style={styles.timelineLineContainer}>
        <View style={[styles.timelineLine, { backgroundColor: colors.textSecondary + '40' }]} />
        {/* Progress overlay */}
        <View
          style={[
            styles.timelineProgress,
            {
              backgroundColor: colors.secondary,
              width: `${progress.percentage}%`,
            },
          ]}
        />
        {/* Current position marker */}
        {selectedEvent && (
          <View
            style={[
              styles.currentPositionMarker,
              {
                left: `${(events.findIndex(e => e.id === selectedEvent.id) / events.length) * 100}%`,
                backgroundColor: colors.secondary,
              },
            ]}
          />
        )}
      </View>

      {/* Cards list */}
      <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderCard}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.max(0, currentIndex - 1)}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
      />

      {/* Year markers */}
      <View style={styles.yearMarkers}>
        {['571', '610', '622', '632'].map((year, index) => (
          <View key={year} style={styles.yearMarker}>
            <View style={[styles.yearMarkerDot, { backgroundColor: colors.secondary }]} />
            <Text style={[styles.yearMarkerText, { color: colors.textSecondary }]}>{year}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  positionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  positionText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  positionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLineContainer: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    borderRadius: 2,
  },
  timelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    borderRadius: 2,
  },
  currentPositionMarker: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  listContent: {
    paddingHorizontal: 16 - CARD_MARGIN,
  },
  cardWrapper: {
    marginHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    height: 130,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  unvisitedOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  yearBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  yearText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 8,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    flex: 1,
  },
  visitedCheck: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  yearMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  yearMarker: {
    alignItems: 'center',
    gap: 4,
  },
  yearMarkerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  yearMarkerText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
