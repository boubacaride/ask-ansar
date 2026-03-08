import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  part: number;
  duration: string;
  description: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: '2mICw81RlWI',
    title: "L'histoire de Djibril",
    part: 1,
    duration: '45:22',
    description:
      "D\u00e9couvrez le r\u00f4le essentiel de l'Ange Gabriel dans la r\u00e9v\u00e9lation divine et sa premi\u00e8re apparition aux proph\u00e8tes.",
  },
  {
    id: 'EVn1PJ2liVo',
    title: "L'histoire de Djibril",
    part: 2,
    duration: '38:15',
    description:
      "Les interactions de Djibril avec le Proph\u00e8te Muhammad (\uFDFA) et les moments cl\u00e9s de la R\u00e9v\u00e9lation.",
  },
  {
    id: 'uCL4jgqHnN8',
    title: "L'histoire de Djibril",
    part: 3,
    duration: '41:08',
    description:
      "Le r\u00f4le de Djibril au Jour du Jugement et ses apparitions sous forme humaine.",
  },
];

function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export default function DjibrilScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [playerVisible, setPlayerVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    bg: darkMode ? '#0a0a0a' : '#f0f4f8',
    card: darkMode ? '#1a1a2e' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    surface: darkMode ? '#151525' : '#f8f9fa',
  };

  const videoHeight = Math.round(SCREEN_WIDTH * 9 / 16);

  const openPlayer = useCallback((video: VideoItem) => {
    setCurrentVideo(video);
    setLoading(true);
    setPlayerVisible(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerVisible(false);
    setCurrentVideo(null);
  }, []);

  const renderVideoCard = (video: VideoItem) => (
    <TouchableOpacity
      key={video.id}
      style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => openPlayer(video)}
      activeOpacity={0.85}
    >
      {/* Thumbnail with overlay */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: getThumbnailUrl(video.id) }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 3 }} />
          </View>
        </View>
        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        {/* Series badge */}
        <View style={styles.seriesBadge}>
          <Text style={styles.seriesBadgeText}>S{'\u00e9'}rie</Text>
        </View>
      </View>
      {/* Card body */}
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View style={styles.partBadge}>
            <Text style={styles.partBadgeText}>Partie {video.part}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {video.title}
          </Text>
        </View>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {video.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* ── Decorative header banner ── */}
      <LinearGradient
        colors={['#0d47a1', '#1565C0', '#1976D2']}
        style={[styles.headerBanner, { paddingTop: (Platform.OS === 'web' ? 12 : insets.top) + 8 }]}
      >
        {/* Geometric pattern overlay */}
        <View style={styles.patternOverlay}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternDiamond,
                {
                  top: 10 + (i % 3) * 25,
                  left: 30 + i * 55,
                  opacity: 0.06 + (i % 3) * 0.03,
                  transform: [{ rotate: '45deg' }, { scale: 0.8 + (i % 3) * 0.4 }],
                },
              ]}
            />
          ))}
        </View>

        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Title section */}
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <FontAwesome5 name="star" size={28} color="#ffd54f" />
          </View>
          <Text style={styles.headerTitle}>L'histoire de Djibril</Text>
          <Text style={styles.headerSubtitle}>
            L'Ange Gabriel ({'\u0639\u0644\u064a\u0647 \u0627\u0644\u0633\u0644\u0627\u0645'})
          </Text>
          <View style={styles.headerDivider} />
          <Text style={styles.headerArabic}>
            {'\u062c\u0650\u0628\u0652\u0631\u0650\u064a\u0644'}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Video list ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="play-box-multiple" size={20} color="#1565C0" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            S{'\u00e9'}rie documentaire — 3 parties
          </Text>
        </View>

        {VIDEOS.map(renderVideoCard)}

        {/* ── Bottom info card ── */}
        <View style={[styles.infoCard, { backgroundColor: darkMode ? '#1a1a2e' : '#fffbf0' }]}>
          <View style={styles.infoCardBorder} />
          <View style={styles.infoCardContent}>
            <Text style={styles.infoArabicQuote}>
              {'\u0642\u064F\u0644\u0652 \u0645\u064E\u0646 \u0643\u064E\u0627\u0646\u064E \u0639\u064E\u062F\u064F\u0648\u064B\u0651\u0627 \u0644\u0650\u062C\u0650\u0628\u0652\u0631\u0650\u064A\u0644\u064E \u0641\u064E\u0625\u0650\u0646\u064E\u0651\u0647\u064F \u0646\u064E\u0632\u064E\u0651\u0644\u064E\u0647\u064F \u0639\u064E\u0644\u064E\u0649\u0670 \u0642\u064E\u0644\u0652\u0628\u0650\u0643\u064E \u0628\u0650\u0625\u0650\u0630\u0652\u0646\u0650 \u0627\u0644\u0644\u064E\u0651\u0647\u0650'}
            </Text>
            <Text style={[styles.infoTranslation, { color: colors.textSecondary }]}>
              {'"Dis : Quiconque est ennemi de Djibril... c\'est lui qui l\'a fait descendre sur ton c\u0153ur, avec la permission d\'Allah"'}
            </Text>
            <Text style={[styles.infoReference, { color: '#c9a227' }]}>
              — Sourate Al-Baqarah (2:97)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Video Player Modal ── */}
      <Modal
        visible={playerVisible}
        transparent
        animationType="fade"
        onRequestClose={closePlayer}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#111' : '#fff' }]}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={closePlayer}>
              <View style={styles.closeButtonBg}>
                <Ionicons name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Video player */}
            <View style={[styles.playerContainer, { height: videoHeight }]}>
              {currentVideo && (
                Platform.OS === 'web' ? (
                  <iframe
                    src={getEmbedUrl(currentVideo.id)}
                    style={{ width: '100%', height: '100%', border: 'none' } as any}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setLoading(false)}
                  />
                ) : (
                  <WebView
                    source={{ uri: getEmbedUrl(currentVideo.id) }}
                    style={{ width: '100%', height: '100%' }}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                )
              )}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#1565C0" />
                </View>
              )}
            </View>

            {/* Video info below player */}
            {currentVideo && (
              <View style={styles.playerInfo}>
                <View style={styles.playerPartBadge}>
                  <Text style={styles.playerPartText}>Partie {currentVideo.part}</Text>
                </View>
                <Text style={[styles.playerTitle, { color: darkMode ? '#fff' : '#1a1a2e' }]}>
                  {currentVideo.title} — Partie {currentVideo.part}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header banner ──
  headerBanner: {
    paddingBottom: 28,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDiamond: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,213,79,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,213,79,0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  headerDivider: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255,213,79,0.5)',
    borderRadius: 1,
    marginVertical: 10,
  },
  headerArabic: {
    fontSize: 32,
    color: 'rgba(255,213,79,0.9)',
    fontWeight: '300',
    textAlign: 'center',
  },

  // ── Content ──
  content: { flex: 1 },
  contentContainer: { padding: 16 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Video card ──
  videoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(21,101,192,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  seriesBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#c9a227',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  seriesBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardBody: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  partBadge: {
    backgroundColor: '#1565C0',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  partBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },

  // ── Info card ──
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  infoCardBorder: {
    height: 3,
    backgroundColor: '#c9a227',
  },
  infoCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  infoArabicQuote: {
    fontSize: 22,
    color: '#c9a227',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  infoTranslation: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoReference: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Modal / Player ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  closeButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playerInfo: {
    padding: 16,
  },
  playerPartBadge: {
    backgroundColor: '#1565C0',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  playerPartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  playerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
});
