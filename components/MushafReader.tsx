import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  Share as RNShare,
  useWindowDimensions,
  Linking,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';
import { generateFlipbookHtml } from './mushafFlipbookHtml';
import ShareModal from './ShareModal';

// ─── Surah-to-page mapping (Madina Mushaf, standard 604-page layout) ─────

interface SurahInfo {
  number: number;
  name: string;
  arabicName: string;
  startPage: number;
}

const SURAH_PAGES: SurahInfo[] = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', startPage: 1 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', startPage: 2 },
  { number: 3, name: 'Aal-E-Imran', arabicName: 'آل عمران', startPage: 50 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', startPage: 77 },
  { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', startPage: 106 },
  { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', startPage: 128 },
  { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', startPage: 151 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', startPage: 177 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', startPage: 187 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', startPage: 208 },
  { number: 11, name: 'Hud', arabicName: 'هود', startPage: 221 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', startPage: 235 },
  { number: 13, name: 'Ar-Rad', arabicName: 'الرعد', startPage: 249 },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', startPage: 255 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', startPage: 262 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', startPage: 267 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', startPage: 282 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', startPage: 293 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', startPage: 305 },
  { number: 20, name: 'Ta-Ha', arabicName: 'طه', startPage: 312 },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', startPage: 322 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', startPage: 332 },
  { number: 23, name: 'Al-Muminun', arabicName: 'المؤمنون', startPage: 342 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', startPage: 350 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', startPage: 359 },
  { number: 26, name: 'Ash-Shuara', arabicName: 'الشعراء', startPage: 367 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', startPage: 377 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', startPage: 385 },
  { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', startPage: 396 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', startPage: 404 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', startPage: 411 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', startPage: 415 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', startPage: 418 },
  { number: 34, name: 'Saba', arabicName: 'سبأ', startPage: 428 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', startPage: 434 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', startPage: 440 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', startPage: 446 },
  { number: 38, name: 'Sad', arabicName: 'ص', startPage: 453 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', startPage: 458 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', startPage: 467 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', startPage: 477 },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', startPage: 483 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', startPage: 489 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', startPage: 496 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', startPage: 499 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', startPage: 502 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', startPage: 507 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', startPage: 511 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', startPage: 515 },
  { number: 50, name: 'Qaf', arabicName: 'ق', startPage: 518 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', startPage: 520 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', startPage: 523 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', startPage: 526 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', startPage: 528 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', startPage: 531 },
  { number: 56, name: 'Al-Waqiah', arabicName: 'الواقعة', startPage: 534 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', startPage: 537 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', startPage: 542 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', startPage: 545 },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', startPage: 549 },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', startPage: 551 },
  { number: 62, name: 'Al-Jumuah', arabicName: 'الجمعة', startPage: 553 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', startPage: 554 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', startPage: 556 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', startPage: 558 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', startPage: 560 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', startPage: 562 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', startPage: 564 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', startPage: 566 },
  { number: 70, name: 'Al-Maarij', arabicName: 'المعارج', startPage: 568 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', startPage: 570 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', startPage: 572 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', startPage: 574 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', startPage: 575 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', startPage: 577 },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', startPage: 578 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', startPage: 580 },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', startPage: 582 },
  { number: 79, name: 'An-Naziat', arabicName: 'النازعات', startPage: 583 },
  { number: 80, name: 'Abasa', arabicName: 'عبس', startPage: 585 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', startPage: 586 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', startPage: 587 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', startPage: 587 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', startPage: 589 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', startPage: 590 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', startPage: 591 },
  { number: 87, name: 'Al-Ala', arabicName: 'الأعلى', startPage: 591 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', startPage: 592 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', startPage: 593 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', startPage: 594 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', startPage: 595 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', startPage: 595 },
  { number: 93, name: 'Ad-Duhaa', arabicName: 'الضحى', startPage: 596 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', startPage: 596 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', startPage: 597 },
  { number: 96, name: 'Al-Alaq', arabicName: 'العلق', startPage: 597 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', startPage: 598 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', startPage: 598 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', startPage: 599 },
  { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', startPage: 599 },
  { number: 101, name: 'Al-Qariah', arabicName: 'القارعة', startPage: 600 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', startPage: 600 },
  { number: 103, name: 'Al-Asr', arabicName: 'العصر', startPage: 601 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', startPage: 601 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', startPage: 601 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', startPage: 602 },
  { number: 107, name: 'Al-Maun', arabicName: 'الماعون', startPage: 602 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', startPage: 602 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', startPage: 603 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', startPage: 603 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', startPage: 603 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', startPage: 604 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', startPage: 604 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', startPage: 604 },
];

function getSurahForPage(page: number): SurahInfo {
  for (let i = SURAH_PAGES.length - 1; i >= 0; i--) {
    if (page >= SURAH_PAGES[i].startPage) return SURAH_PAGES[i];
  }
  return SURAH_PAGES[0];
}

// ─── Main MushafReader Component ─────────────────────────────────────

interface MushafReaderProps {
  visible: boolean;
  onClose: () => void;
  initialPage?: number;
  pdfUrl?: string;
  isFriday?: boolean;
}

export function MushafReader({ visible, onClose, initialPage = 1, pdfUrl, isFriday = false }: MushafReaderProps) {
  const { darkMode } = useSettings();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const webViewRef = useRef<any>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareText, setShareText] = useState('');

  // Generate HTML content
  const htmlContent = useMemo(
    () => generateFlipbookHtml(SURAH_PAGES, darkMode, initialPage, pdfUrl, isFriday),
    [darkMode, initialPage, pdfUrl, isFriday]
  );

  const currentSurah = getSurahForPage(currentPage);

  // Handle messages from WebView/iframe
  const handleMessage = useCallback((event: any) => {
    try {
      const data = typeof event === 'string'
        ? JSON.parse(event)
        : typeof event?.nativeEvent?.data === 'string'
          ? JSON.parse(event.nativeEvent.data)
          : typeof event?.data === 'string'
            ? JSON.parse(event.data)
            : event?.data;

      if (!data?.type) return;

      switch (data.type) {
        case 'pageChange':
          setCurrentPage(data.page);
          break;
        case 'share':
          handleShare(data.page, data.surah, data.text);
          break;
        case 'showShareModal':
          setShareText(data.text || `Le Saint Coran - Page ${data.page}`);
          setShareModalVisible(true);
          break;
        case 'copy':
          handleCopy(data.text);
          break;
        case 'download':
          handleDownload(data.url);
          break;
        case 'pdfLoaded':
          // PDF successfully loaded
          break;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Listen for iframe messages on web
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const listener = (e: MessageEvent) => handleMessage(e);
      window.addEventListener('message', listener);
      return () => window.removeEventListener('message', listener);
    }
  }, [visible, handleMessage]);

  // Send page jump command to WebView/iframe
  const sendMessage = useCallback((msg: object) => {
    const json = JSON.stringify(msg);
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(json, '*');
    } else {
      webViewRef.current?.injectJavaScript(`
        window.postMessage(${JSON.stringify(json)}, '*');
        true;
      `);
    }
  }, []);

  // Update dark mode in WebView when it changes
  useEffect(() => {
    if (visible) {
      sendMessage({ type: 'setDarkMode', dark: darkMode });
    }
  }, [darkMode, visible, sendMessage]);

  const handleShare = async (page: number, surah: any, text?: string) => {
    const surahInfo = surah || getSurahForPage(page);
    const shareText = text || `Le Saint Coran - ${surahInfo.arabicName} (${surahInfo.name}) - Page ${page}`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // Fallback
      }
    } else {
      try {
        await RNShare.share({ message: shareText, title: 'Le Saint Coran' });
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopy = async (text: string) => {
    if (Platform.OS === 'web') {
      try { await navigator.clipboard.writeText(text); } catch {}
    } else {
      try { await Clipboard.setStringAsync(text); } catch {}
    }
  };

  const handleDownload = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  if (!visible) return null;

  // ─── Web: Use iframe ───
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f5f0e8' }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: darkMode ? '#1a1a2e' : (isFriday ? '#5D4037' : '#1b5e20') }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>المصحف الشريف</Text>
              <Text style={styles.headerSubtitle}>{currentSurah.arabicName} - Page {currentPage}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Flipbook iframe */}
          <View style={styles.webviewContainer}>
            <iframe
              ref={iframeRef as any}
              srcDoc={htmlContent}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </View>
        </SafeAreaView>
        <ShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          text={shareText}
          darkMode={darkMode}
        />
      </Modal>
    );
  }

  // ─── Native: Use WebView ───
  const WebView = require('react-native-webview').default;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f5f0e8' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: darkMode ? '#1a1a2e' : (isFriday ? '#5D4037' : '#1b5e20') }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>المصحف الشريف</Text>
            <Text style={styles.headerSubtitle}>{currentSurah.arabicName} - Page {currentPage}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Flipbook WebView */}
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webviewContainer}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsFullscreenVideo={false}
          bounces={false}
          overScrollMode="never"
          scrollEnabled={false}
          scalesPageToFit={false}
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00897b" />
              <Text style={styles.loadingText}>Chargement du Mushaf...</Text>
            </View>
          )}
        />
      </SafeAreaView>
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        text={shareText}
        darkMode={darkMode}
      />
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: { paddingTop: 4 },
      default: {},
    }),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  webviewContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0e8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#00897b',
    fontWeight: '600',
  },
});
