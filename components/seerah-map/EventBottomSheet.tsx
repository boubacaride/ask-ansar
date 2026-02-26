import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import SeerahFormattedText from '@/components/SeerahFormattedText';
import { router } from 'expo-router';

// Only import expo-speech on native platforms to avoid web issues
let Speech: any = null;
if (Platform.OS !== 'web') {
  Speech = require('expo-speech');
}
import {
  SeerahEventWithMeta,
  StackedMarker,
  CATEGORY_CONFIGS,
} from '@/types/seerahMap.d';
import { useSettings } from '@/store/settingsStore';
import { useSeerahMapStore } from '@/store/seerahMapStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const SNAP_POINTS = {
  COLLAPSED: SCREEN_HEIGHT * 0.12,
  MID: SCREEN_HEIGHT * 0.45,
  EXPANDED: SCREEN_HEIGHT * 0.92,
};

interface EventBottomSheetProps {
  event: SeerahEventWithMeta | null;
  stackedMarker?: StackedMarker;
  isOpen: boolean;
  snapIndex: number;
  onClose: () => void;
  onSnapChange: (index: number) => void;
}

export const EventBottomSheet: React.FC<EventBottomSheetProps> = ({
  event,
  stackedMarker,
  isOpen,
  snapIndex,
  onClose,
  onSnapChange,
}) => {
  const { darkMode, language } = useSettings();
  const {
    markEventVisited,
    toggleFavorite,
    incrementReadCount,
    selectStackEvent,
    selectedStackIndex,
    isSpeaking,
    setSpeaking,
  } = useSeerahMapStore();

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGestureDy = useRef(0);

  const isStacked = stackedMarker && stackedMarker.count > 1;

  const colors = {
    background: darkMode ? '#1a1a2e' : '#ffffff',
    card: darkMode ? '#252540' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#0D5C63',
    secondary: '#C4A35A',
    accent: '#2E7D32',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };

  // Animation when sheet opens/closes
  useEffect(() => {
    if (isOpen && event) {
      const snapHeight = [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID, SNAP_POINTS.EXPANDED][snapIndex];
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - snapHeight,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();

      // Mark as visited when fully expanded
      if (snapIndex === 2) {
        markEventVisited(event.id);
        incrementReadCount();
      }
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, snapIndex, event, translateY, markEventVisited, incrementReadCount]);

  const handleSnapToIndex = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSnapChange(index);
  };

  const handleSpeak = useCallback(async () => {
    if (!event) return;

    // expo-speech has issues on web, use native Web Speech API instead
    if (Platform.OS === 'web') {
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
        setSpeaking(false);
      } else {
        if ('speechSynthesis' in window) {
          setSpeaking(true);
          const text = `${event.title}. ${event.year}. ${event.location}. ${event.description}. ${event.historical_significance || ''}`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
          utterance.rate = 0.9;
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
      }
      return;
    }

    if (Speech) {
      if (isSpeaking) {
        await Speech.stop();
        setSpeaking(false);
      } else {
        setSpeaking(true);
        const text = `${event.title}. ${event.year}. ${event.location}. ${event.description}. ${event.historical_significance || ''}`;

        const languageCode = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';

        await Speech.speak(text, {
          language: languageCode,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => setSpeaking(false),
          onError: () => setSpeaking(false),
        });
      }
    }
  }, [event, isSpeaking, language, setSpeaking]);

  const handleShare = useCallback(async () => {
    if (!event) return;

    const message = `${event.title}\n\n${event.year} - ${event.location}\n\n${event.historical_significance}\n\n📱 Découvert via Ask Ansar`;

    try {
      await Share.share({
        message,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [event]);

  const handleDirections = useCallback(() => {
    if (!event) return;

    const url = Platform.select({
      ios: `maps:0,0?q=${event.latitude},${event.longitude}`,
      android: `geo:0,0?q=${event.latitude},${event.longitude}(${encodeURIComponent(event.title)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`,
    });

    Linking.openURL(url);
  }, [event]);

  if (!event) return null;

  const category = event.category || 'life_event';
  const categoryConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['life_event'];

  const renderCollapsedContent = () => (
    <View style={styles.collapsedContent}>
      <View style={styles.handle} />
      <View style={styles.collapsedHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
          <FontAwesome5 name={categoryConfig.icon === 'kaaba' ? 'kaaba' : categoryConfig.icon} size={12} color="#fff" />
        </View>
        <View style={styles.collapsedTitleContainer}>
          <Text style={[styles.collapsedTitle, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={[styles.collapsedSubtitle, { color: colors.textSecondary }]}>
            {event.year} • {event.location}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => handleSnapToIndex(1)}
        >
          <Ionicons name="chevron-up" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>
        Glisser pour en savoir plus ↑
      </Text>
    </View>
  );

  const renderMidContent = () => (
    <ScrollView style={styles.midContent} showsVerticalScrollIndicator={false} bounces={false}>
      <View style={styles.handle} />

      {/* Stacked events carousel */}
      {isStacked && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stackCarousel}
          contentContainerStyle={styles.stackCarouselContent}
        >
          {stackedMarker!.events.map((e, index) => (
            <TouchableOpacity
              key={e.id}
              style={[
                styles.stackCard,
                {
                  backgroundColor: selectedStackIndex === index ? categoryConfig.color : colors.card,
                  borderColor: selectedStackIndex === index ? categoryConfig.color : colors.border,
                },
              ]}
              onPress={() => selectStackEvent(index)}
            >
              <Text
                style={[
                  styles.stackCardTitle,
                  { color: selectedStackIndex === index ? '#fff' : colors.text },
                ]}
                numberOfLines={2}
              >
                {e.title}
              </Text>
              <Text
                style={[
                  styles.stackCardYear,
                  { color: selectedStackIndex === index ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                ]}
              >
                {e.year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Hero section */}
      <View style={styles.heroSection}>
        <View style={styles.heroHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
            <FontAwesome5 name={categoryConfig.icon === 'kaaba' ? 'kaaba' : categoryConfig.icon} size={14} color="#fff" />
          </View>
          <View style={styles.heroTitleContainer}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{event.title}</Text>
            <View style={styles.heroMeta}>
              <Text style={[styles.yearBadge, { backgroundColor: colors.secondary, color: '#fff' }]}>
                {event.year}
              </Text>
              <Text style={[styles.location, { color: colors.textSecondary }]}>
                <FontAwesome5 name="map-marker-alt" size={12} /> {event.location}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          {event.yearsAgo && (
            <View style={styles.statItem}>
              <FontAwesome5 name="calendar-alt" size={14} color={colors.secondary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                Il y a {event.yearsAgo.toLocaleString()} ans
              </Text>
            </View>
          )}
          {event.distanceFromUser && (
            <View style={styles.statItem}>
              <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                À {Math.round(event.distanceFromUser).toLocaleString()} km
              </Text>
            </View>
          )}
        </View>

        {/* Short description */}
        <Text style={[styles.shortDescription, { color: colors.text }]} numberOfLines={3}>
          {event.description}
        </Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSnapToIndex(2)}
          >
            <FontAwesome5 name="book-reader" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Lire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isSpeaking ? '#E91E63' : colors.secondary }]}
            onPress={handleSpeak}
          >
            <FontAwesome5 name={isSpeaking ? 'stop' : 'headphones'} size={16} color="#fff" />
            <Text style={styles.actionButtonText}>{isSpeaking ? 'Stop' : 'Écouter'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleDirections}
          >
            <FontAwesome5 name="directions" size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleShare}
          >
            <FontAwesome5 name="share-alt" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quiz button */}
        <TouchableOpacity
          style={[styles.quizButton, { backgroundColor: colors.secondary, marginTop: 16 }]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push(`/quiz/play?eventId=${event.id}`);
          }}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="question-circle" size={18} color="#fff" />
          <Text style={styles.quizButtonText}>Testez vos connaissances</Text>
          <FontAwesome5 name="arrow-right" size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderExpandedContent = () => (
    <ScrollView style={styles.expandedContent} showsVerticalScrollIndicator={false}>
      <View style={styles.handle} />

      {/* Compact header */}
      <View style={styles.expandedHeader}>
        <View style={styles.expandedTitleRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
            <FontAwesome5 name={categoryConfig.icon === 'kaaba' ? 'kaaba' : categoryConfig.icon} size={14} color="#fff" />
          </View>
          <Text style={[styles.expandedTitle, { color: colors.text }]} numberOfLines={2}>
            {event.title}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.expandedMeta}>
          <Text style={[styles.yearBadge, { backgroundColor: colors.secondary, color: '#fff' }]}>
            {event.year}
          </Text>
          <Text style={[styles.location, { color: colors.textSecondary }]}>
            <FontAwesome5 name="map-marker-alt" size={12} /> {event.location}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(event.id)}
          >
            <FontAwesome5
              name="heart"
              size={18}
              color={event.isFavorite ? '#E91E63' : colors.textSecondary}
              solid={event.isFavorite}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading time estimate */}
      <View style={[styles.readingTimeRow, { backgroundColor: colors.card }]}>
        <FontAwesome5 name="clock" size={14} color={colors.textSecondary} />
        <Text style={[styles.readingTimeText, { color: colors.textSecondary }]}>
          ⏱️ 3 min de lecture
        </Text>
        <View style={styles.fontSizeControls}>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={[styles.fontButtonText, { color: colors.textSecondary }]}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={[styles.fontButtonText, { color: colors.text, fontWeight: '700' }]}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={[styles.fontButtonText, { color: colors.textSecondary }]}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <FontAwesome5 name="scroll" size={16} color={colors.secondary} /> Description
        </Text>
        <SeerahFormattedText
          text={event.description}
          darkMode={darkMode}
          accentColor={colors.secondary}
        />
      </View>

      {/* Historical significance */}
      <View style={[styles.significanceSection, { backgroundColor: colors.card, borderLeftColor: colors.secondary }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <FontAwesome5 name="star" size={16} color={colors.secondary} /> Signification Historique
        </Text>
        <SeerahFormattedText
          text={event.historical_significance}
          darkMode={darkMode}
          accentColor={colors.secondary}
          italic
        />
      </View>

      {/* Action buttons */}
      <View style={styles.expandedActions}>
        <TouchableOpacity
          style={[styles.mainActionButton, { backgroundColor: isSpeaking ? '#E91E63' : colors.primary }]}
          onPress={handleSpeak}
        >
          <FontAwesome5 name={isSpeaking ? 'stop' : 'headphones'} size={18} color="#fff" />
          <Text style={styles.mainActionButtonText}>
            {isSpeaking ? 'Arrêter la lecture' : 'Écouter le texte'}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleDirections}
          >
            <FontAwesome5 name="directions" size={16} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Itinéraire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleShare}
          >
            <FontAwesome5 name="share-alt" size={16} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Partager</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.favoriteFullButton,
            {
              backgroundColor: event.isFavorite ? '#E91E63' : colors.card,
              borderColor: event.isFavorite ? '#E91E63' : colors.border,
            },
          ]}
          onPress={() => toggleFavorite(event.id)}
        >
          <FontAwesome5
            name="heart"
            size={16}
            color={event.isFavorite ? '#fff' : colors.textSecondary}
            solid={event.isFavorite}
          />
          <Text
            style={[
              styles.favoriteButtonText,
              { color: event.isFavorite ? '#fff' : colors.text },
            ]}
          >
            {event.isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quiz button */}
      <TouchableOpacity
        style={[styles.quizButton, { backgroundColor: colors.secondary }]}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push(`/quiz/play?eventId=${event.id}`);
        }}
        activeOpacity={0.8}
      >
        <FontAwesome5 name="question-circle" size={18} color="#fff" />
        <Text style={styles.quizButtonText}>Testez vos connaissances</Text>
        <FontAwesome5 name="arrow-right" size={14} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* Reflection prompt */}
      <View style={[styles.reflectionSection, { backgroundColor: `${colors.secondary}15` }]}>
        <Text style={[styles.reflectionTitle, { color: colors.secondary }]}>
          🤲 Moment de Réflexion
        </Text>
        <Text style={[styles.reflectionText, { color: colors.text }]}>
          Prenez un moment pour réfléchir à cette leçon de la vie du Prophète (ﷺ)...
        </Text>
      </View>

      {/* Feedback */}
      <TouchableOpacity
        style={[styles.feedbackButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          💡 J'ai appris quelque chose
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: colors.background,
        },
      ]}
    >
      {snapIndex === 0 && renderCollapsedContent()}
      {snapIndex === 1 && renderMidContent()}
      {snapIndex === 2 && renderExpandedContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  // Collapsed styles
  collapsedContent: {
    paddingHorizontal: 20,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  collapsedTitleContainer: {
    flex: 1,
  },
  collapsedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  collapsedSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  expandButton: {
    padding: 8,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Mid styles
  midContent: {
    paddingHorizontal: 20,
  },
  stackCarousel: {
    marginBottom: 16,
  },
  stackCarouselContent: {
    paddingRight: 20,
  },
  stackCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  stackCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  stackCardYear: {
    fontSize: 11,
  },
  heroSection: {},
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroTitleContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  location: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
  },
  shortDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Expanded styles
  expandedContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  expandedHeader: {
    marginBottom: 16,
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  expandedTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  expandedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  favoriteButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  readingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  readingTimeText: {
    flex: 1,
    fontSize: 13,
  },
  fontSizeControls: {
    flexDirection: 'row',
    gap: 4,
  },
  fontButton: {
    padding: 8,
  },
  fontButtonText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 26,
  },
  significanceSection: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  significanceText: {
    fontSize: 15,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  expandedActions: {
    gap: 12,
    marginBottom: 24,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  mainActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  favoriteFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  favoriteButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  reflectionSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  feedbackButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  quizButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
