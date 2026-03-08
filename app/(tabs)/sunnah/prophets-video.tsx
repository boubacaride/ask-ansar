import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { WebView } from 'react-native-webview';

const YOUTUBE_VIDEO_ID = 'JKV6CMxbpQg';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Chapter {
  time: string;
  seconds: number;
  title: string;
}

const CHAPTERS: Chapter[] = [
  { time: '00:00', seconds: 0, title: "Adam et la cr\u00e9ation de l'Univers" },
  { time: '22:10', seconds: 1330, title: "Abel et Ca\u00efn les deux fils d'Adam" },
  { time: '28:41', seconds: 1721, title: 'Seth' },
  { time: '31:37', seconds: 1897, title: 'Idriss' },
  { time: '33:56', seconds: 2036, title: 'No\u00e9' },
  { time: '51:01', seconds: 3061, title: 'Hud' },
  { time: '57:44', seconds: 3464, title: 'Saleh' },
  { time: '01:05:20', seconds: 3920, title: 'Ibrahim/Abraham' },
  { time: '01:26:26', seconds: 5186, title: 'Isma\u00ebl' },
  { time: '01:38:45', seconds: 5925, title: 'Loth' },
  { time: '01:43:12', seconds: 6192, title: 'Chua\u00efb' },
  { time: '01:46:55', seconds: 6415, title: "Ya'cub/Jacob" },
  { time: '01:52:26', seconds: 6746, title: 'Yusuf/Joseph' },
  { time: '02:06:29', seconds: 7589, title: 'Ayoub/Job' },
  { time: '02:11:19', seconds: 7879, title: 'Yunus/Jonas' },
  { time: '02:19:22', seconds: 8362, title: 'Moussa/Mo\u00efse' },
  { time: '02:29:19', seconds: 8959, title: 'Josu\u00e9' },
  { time: '02:34:16', seconds: 9256, title: 'Dhul Kifl' },
  { time: '02:38:31', seconds: 9511, title: 'Elyas/Elie' },
  { time: '02:41:03', seconds: 9663, title: 'Samuel' },
  { time: '02:51:37', seconds: 10297, title: 'Dawud/David' },
  { time: '02:56:56', seconds: 10616, title: 'Sulayman/Salomon' },
  { time: '03:08:39', seconds: 11319, title: 'Daniyal/Daniel' },
  { time: '03:12:02', seconds: 11522, title: 'Uzayr' },
  { time: '03:16:31', seconds: 11791, title: 'Zakarya et Yahya' },
  { time: '03:24:17', seconds: 12257, title: 'Isa/Jesus' },
  { time: '03:38:38', seconds: 13118, title: "Muhammad \uFDFA" },
];

function getEmbedUrl(startSeconds: number): string {
  return `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?start=${startSeconds}&autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

export default function ProphetsVideoScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<any>(null);
  const [videoUrl, setVideoUrl] = useState(getEmbedUrl(0));

  const colors = {
    bg: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1a1a2e' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    accent: '#c9a227',
    accentBg: darkMode ? 'rgba(201,162,39,0.12)' : 'rgba(201,162,39,0.08)',
    activeBg: darkMode ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.12)',
    activeBorder: '#c9a227',
    headerBg: darkMode ? '#101824' : '#0b2b2b',
  };

  const videoHeight = Math.round((SCREEN_WIDTH) * 9 / 16);

  const handleChapterPress = useCallback((index: number) => {
    setActiveChapter(index);
    setLoading(true);
    setVideoUrl(getEmbedUrl(CHAPTERS[index].seconds));
  }, []);

  const renderChapter = useCallback(({ item, index }: { item: Chapter; index: number }) => {
    const isActive = index === activeChapter;
    return (
      <TouchableOpacity
        style={[
          styles.chapterRow,
          {
            backgroundColor: isActive ? colors.activeBg : 'transparent',
            borderLeftColor: isActive ? colors.activeBorder : 'transparent',
            borderBottomColor: colors.cardBorder,
          },
        ]}
        onPress={() => handleChapterPress(index)}
        activeOpacity={0.7}
      >
        <View style={[styles.chapterNumber, { backgroundColor: isActive ? colors.accent : colors.accentBg }]}>
          <Text style={[styles.chapterNumberText, { color: isActive ? '#fff' : colors.accent }]}>
            {index + 1}
          </Text>
        </View>
        <View style={styles.chapterInfo}>
          <Text style={[styles.chapterTitle, { color: isActive ? colors.accent : colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.chapterTime, { color: colors.textSecondary }]}>
            {item.time}
          </Text>
        </View>
        {isActive && (
          <View style={styles.playingIndicator}>
            <Ionicons name="play-circle" size={22} color={colors.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [activeChapter, colors]);

  const webViewContent = Platform.OS === 'web' ? (
    <iframe
      src={videoUrl}
      style={{
        width: '100%',
        height: videoHeight,
        border: 'none',
      } as any}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      onLoad={() => setLoading(false)}
    />
  ) : (
    <WebView
      ref={webViewRef}
      source={{ uri: videoUrl }}
      style={{ width: '100%', height: videoHeight }}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      allowsFullscreenVideo
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, paddingTop: (Platform.OS === 'web' ? 12 : insets.top) + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#e8d5a3" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <FontAwesome5 name="film" size={16} color="#c9a227" />
          <Text style={styles.headerTitle}>L'histoire des proph{'\u00e8'}tes</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Video Player */}
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        {webViewContent}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#c9a227" />
          </View>
        )}
      </View>

      {/* Chapter List Header */}
      <View style={[styles.chaptersHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <FontAwesome5 name="list-ol" size={14} color={colors.accent} />
        <Text style={[styles.chaptersHeaderText, { color: colors.text }]}>
          Chapitres ({CHAPTERS.length})
        </Text>
      </View>

      {/* Chapter List */}
      <FlatList
        data={CHAPTERS}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderChapter}
        style={[styles.chapterList, { backgroundColor: colors.card }]}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 60 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#e8d5a3',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  chaptersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
  },
  chaptersHeaderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  chapterList: {
    flex: 1,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterTime: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  playingIndicator: {
    marginLeft: 4,
  },
});
