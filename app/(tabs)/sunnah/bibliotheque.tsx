import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Modal,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { WebView } from 'react-native-webview';

// ─── HADITH LIBRARY DATA (scraped from bibliotheque-islamique.fr) ───────────
const HADITH_BOOKS = [
  {
    id: 'bukhari',
    name: 'Sahih Al Boukhary',
    arabicName: '\u0635\u062d\u064a\u062d \u0627\u0644\u0628\u062e\u0627\u0631\u064a',
    compiler: 'Imam Al-Boukhary',
    authenticated: 665,
    total: 7563,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-al-boukhari#here',
    category: 'primary',
  },
  {
    id: 'muslim',
    name: 'Sahih Mouslim',
    arabicName: '\u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645',
    compiler: 'Imam Mouslim',
    authenticated: 556,
    total: 3033,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-mouslim',
    category: 'primary',
  },
  {
    id: 'tirmidhi',
    name: "Jami' at-Tirmidhi",
    arabicName: '\u062c\u0627\u0645\u0639 \u0627\u0644\u062a\u0631\u0645\u0630\u064a',
    compiler: 'Imam at-Tirmidhi',
    authenticated: 365,
    total: 3956,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-jami-at-tirmidhi/',
    category: 'sunan',
  },
  {
    id: 'abudawud',
    name: 'Sunan Abi Daoud',
    arabicName: '\u0633\u0646\u0646 \u0623\u0628\u064a \u062f\u0627\u0648\u062f',
    compiler: 'Imam Abi Daoud',
    authenticated: 293,
    total: 2393,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-sahih-abou-daoud',
    category: 'sunan',
  },
  {
    id: 'nasai',
    name: "Sunan Nasa'i",
    arabicName: '\u0633\u0646\u0646 \u0627\u0644\u0646\u0633\u0627\u0626\u064a',
    compiler: "Imam Nasa'i",
    authenticated: 110,
    total: 5758,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-sahih-an-nasai/',
    category: 'sunan',
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    arabicName: '\u0633\u0646\u0646 \u0627\u0628\u0646 \u0645\u0627\u062c\u0647',
    compiler: 'Imam Ibn Majah',
    authenticated: 173,
    total: 4341,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-sahih-ibn-majah/',
    category: 'sunan',
  },
  {
    id: 'riyad',
    name: 'Riyad as-Salihine',
    arabicName: '\u0631\u064a\u0627\u0636 \u0627\u0644\u0635\u0627\u0644\u062d\u064a\u0646',
    compiler: 'Imam an-Nawawi',
    authenticated: 71,
    total: 1896,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-riyad-as-salihin',
    category: 'compilations',
  },
  {
    id: 'nawawi40',
    name: '40 Hadith Nawawi',
    arabicName: '\u0627\u0644\u0623\u0631\u0628\u0639\u0648\u0646 \u0627\u0644\u0646\u0648\u0648\u064a\u0629',
    compiler: 'Imam an-Nawawi',
    authenticated: 42,
    total: 42,
    url: 'https://bibliotheque-islamique.fr/hadith/sommaire-40-hadith-nawawi',
    category: 'compilations',
  },
  {
    id: 'qoudousi',
    name: '40 Hadith Qoudousi',
    arabicName: '\u0627\u0644\u0623\u062d\u0627\u062f\u064a\u062b \u0627\u0644\u0642\u062f\u0633\u064a\u0629',
    compiler: 'Compilation',
    authenticated: 14,
    total: 40,
    url: 'https://bibliotheque-islamique.fr/hadith/40-hadith-qoudousi',
    category: 'compilations',
  },
];

const TOTAL_AUTHENTICATED = HADITH_BOOKS.reduce((sum, b) => sum + b.authenticated, 0);
const TOTAL_HADITHS = HADITH_BOOKS.reduce((sum, b) => sum + b.total, 0);

// ─── Progress Bar Component ────────────────────────────────────────
function ProgressBar({ progress, color, bgColor }: { progress: number; color: string; bgColor: string }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[progressStyles.track, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          progressStyles.fill,
          {
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

// ─── WebView Reader Modal ──────────────────────────────────────────
function BookReader({
  visible,
  url,
  title,
  onClose,
}: {
  visible: boolean;
  url: string;
  title: string;
  onClose: () => void;
}) {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f5f5f5',
    header: darkMode ? '#1a1a2e' : '#ffffff',
    headerBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    accent: '#00897b',
  };

  // JavaScript to inject into WebView to clean up the website
  // Hides header, nav, menu, jumbotron, sidebar, footer — keeps only hadith content
  const darkModeCSS = darkMode
    ? 'background:#0a0a0a !important;color:#e0e0e0 !important;'
    : 'background:#f8f9fa !important;';

  const darkModeExtras = darkMode
    ? 'a{color:#4db6ac !important;}' +
      'h1,h2,h3,h4,h5,h6,p,span,div,li,td,th{color:#e0e0e0 !important;}' +
      '.card,[class*="card"],[class*="panel"]{background:#1e1e2d !important;border-color:#2d2d44 !important;}' +
      'table,tr,td,th{border-color:#2d2d44 !important;}'
    : '';

  const CLEANUP_JS = '(function(){' +
    'var s=document.createElement("style");' +
    's.textContent="' +
      '.site-header,header,.jumbotron,nav,.nav,.navbar,.navigation,.menu,' +
      '.breadcrumb,.breadcrumbs,footer,.footer,.site-footer,' +
      '.sidebar,.widget,.widget-area,' +
      '#cookie-notice,.cookie-banner,.cookie-consent,' +
      '[class*=cookie],[id*=cookie],[class*=popup],[class*=modal],' +
      '[class*=subscribe],[class*=newsletter],[class*=social],[class*=share],' +
      '[class*=terrorisme],[class*=terrorism]{display:none !important;}' +
      'body{padding:8px !important;margin:0 !important;' +
        'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif !important;' +
        darkModeCSS + '}' +
      '.container,.content,main,article,.main-content,[role=main]{' +
        'max-width:100% !important;padding:0 !important;margin:0 !important;' +
        'width:100% !important;float:none !important;}' +
      '.row{margin:0 !important;}' +
      'img{max-width:100% !important;height:auto !important;}' +
      'a{color:#00897b !important;}' +
      darkModeExtras +
    '";' +
    'document.head.appendChild(s);' +
    'function h(){' +
      'var els=document.querySelectorAll("h2,h3,h4,h5,h6,p,div,section,aside");' +
      'var pats=["En Quelques mots","Liens utiles","Non au Terrorisme",' +
        '"Tous droits","Design,","Abou Z","MENU",' +
        '"Apprenez votre religion","hadiths authentifi"];' +
      'els.forEach(function(e){' +
        'var t=(e.textContent||"").trim();' +
        'for(var i=0;i<pats.length;i++){' +
          'if(t.indexOf(pats[i])===0||t===pats[i]){e.style.display="none";break;}' +
        '}' +
      '});' +
      'document.querySelectorAll("img[src*=logo],img[src*=bg\\\\.png]").forEach(function(i){' +
        'var p=i.closest("div,header,a")||i;p.style.display="none";' +
      '});' +
      'document.querySelectorAll("a").forEach(function(a){' +
        'if((a.textContent||"").trim()==="MENU")a.style.display="none";' +
      '});' +
    '}' +
    'h();' +
    'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",h);' +
    'window.addEventListener("load",h);' +
    'var o=new MutationObserver(function(){h();});' +
    'o.observe(document.body,{childList:true,subtree:true});' +
  '})();true;';

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      onClose();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${title}\n${url}`, url });
    } catch (_e) {
      // ignore
    }
  };

  // On web, show a modal with book info and "Open in Browser" button
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={readerStyles.webOverlay}>
          <View style={[readerStyles.webModal, { backgroundColor: colors.header, borderColor: colors.headerBorder }]}>
            <TouchableOpacity style={readerStyles.webCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[readerStyles.webIconCircle, { backgroundColor: 'rgba(0,137,123,0.12)' }]}>
              <FontAwesome5 name="book-open" size={28} color={colors.accent} />
            </View>

            <Text style={[readerStyles.webTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[readerStyles.webUrl, { color: colors.textSecondary }]}>
              bibliotheque-islamique.fr
            </Text>

            <TouchableOpacity
              style={[readerStyles.webOpenBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                Linking.openURL(url);
                onClose();
              }}
            >
              <MaterialCommunityIcons name="open-in-new" size={18} color="#fff" />
              <Text style={readerStyles.webOpenBtnText}>Ouvrir dans le navigateur</Text>
            </TouchableOpacity>

            <TouchableOpacity style={readerStyles.webCancelBtn} onPress={onClose}>
              <Text style={[readerStyles.webCancelText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Native: use WebView with injected cleanup JS
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[readerStyles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            readerStyles.header,
            {
              backgroundColor: colors.header,
              borderBottomColor: colors.headerBorder,
              paddingTop: insets.top + 6,
            },
          ]}
        >
          <TouchableOpacity style={readerStyles.headerBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={readerStyles.headerTitleWrap}>
            <Text style={[readerStyles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[readerStyles.headerUrl, { color: colors.textSecondary }]} numberOfLines={1}>
              bibliotheque-islamique.fr
            </Text>
          </View>
          <TouchableOpacity style={readerStyles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {loading && !hasError && (
          <View style={readerStyles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[readerStyles.loadingText, { color: colors.textSecondary }]}>
              Chargement...
            </Text>
          </View>
        )}

        {hasError && (
          <View style={readerStyles.errorWrap}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textSecondary} />
            <Text style={[readerStyles.errorTitle, { color: colors.text }]}>
              Impossible de charger la page
            </Text>
            <Text style={[readerStyles.errorText, { color: colors.textSecondary }]}>
              V&eacute;rifiez votre connexion internet et r&eacute;essayez.
            </Text>
            <TouchableOpacity
              style={[readerStyles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setHasError(false);
                setLoading(true);
                webViewRef.current?.reload();
              }}
            >
              <Text style={readerStyles.retryText}>R&eacute;essayer</Text>
            </TouchableOpacity>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={[readerStyles.webview, (loading || hasError) && readerStyles.webviewHidden]}
          onLoadStart={() => { setLoading(true); setHasError(false); }}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setHasError(true); }}
          onHttpError={() => { setLoading(false); setHasError(true); }}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
          injectedJavaScript={CLEANUP_JS}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          sharedCookiesEnabled
        />
      </View>
    </Modal>
  );
}

const readerStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8, borderRadius: 20 },
  headerTitleWrap: { flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 15, fontWeight: '600' },
  headerUrl: { fontSize: 12, marginTop: 1 },
  loadingWrap: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    gap: 10,
  },
  loadingText: { fontSize: 14 },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' as const },
  errorText: { fontSize: 14, textAlign: 'center' as const, lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  webview: { flex: 1 },
  webviewHidden: { opacity: 0, height: 0 },

  // Web modal styles
  webOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webModal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative' as const,
  },
  webCloseBtn: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    padding: 6,
  },
  webIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  webUrl: {
    fontSize: 13,
    marginBottom: 24,
  },
  webOpenBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  webOpenBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  webCancelBtn: {
    marginTop: 14,
    padding: 8,
  },
  webCancelText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});

// ─── MAIN SCREEN ───────────────────────────────────────────────────
export default function BibliothequeScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [readerVisible, setReaderVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{ url: string; name: string } | null>(null);

  // Entrance animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(heroAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    primaryLight: darkMode ? 'rgba(0, 137, 123, 0.15)' : 'rgba(0, 137, 123, 0.08)',
    accent: '#c9a227',
    accentLight: darkMode ? 'rgba(201, 162, 39, 0.15)' : 'rgba(201, 162, 39, 0.08)',
    progressBg: darkMode ? '#252538' : '#e8e8e8',
    inputBg: darkMode ? '#252538' : '#f0f0f0',
    heroBg: darkMode ? '#141425' : '#ffffff',
  };

  const openBook = (url: string, name: string) => {
    setSelectedBook({ url, name });
    setReaderVisible(true);
  };

  const primaryBooks = HADITH_BOOKS.filter((b) => b.category === 'primary');
  const sunanBooks = HADITH_BOOKS.filter((b) => b.category === 'sunan');
  const compilationBooks = HADITH_BOOKS.filter((b) => b.category === 'compilations');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          darkMode
            ? ['#0a0a0a', '#1a1a2e', '#0d2137']
            : ['#f8f9fa', '#e3f2fd', '#bbdefb']
        }
        style={styles.gradient}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.cardBorder,
              paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/sunnah/hadith-collections')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Biblioth&egrave;que de Hadiths
            </Text>
            <Text style={[styles.headerArabic, { color: colors.accent }]}>
              {'\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0623\u062d\u0627\u062f\u064a\u062b \u0627\u0644\u0635\u062d\u064a\u062d\u0629'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* ─── Hero Stats Section ─── */}
          <Animated.View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.heroBg,
                borderColor: colors.cardBorder,
                opacity: heroAnim,
                transform: [
                  {
                    translateY: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={darkMode ? ['#1a2a3a', '#0d1f2d'] : ['#e8f5e9', '#e3f2fd']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroIconRow}>
                <View style={[styles.heroIconCircle, { backgroundColor: colors.accentLight }]}>
                  <FontAwesome5 name="mosque" size={28} color={colors.accent} />
                </View>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Hadiths Authentiques
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {'\u0627\u0644\u0623\u062d\u0627\u062f\u064a\u062b \u0627\u0644\u0635\u062d\u064a\u062d\u0629'}
              </Text>

              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {TOTAL_AUTHENTICATED.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Authentifi&eacute;s
                  </Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.statNumber, { color: colors.accent }]}>
                    {HADITH_BOOKS.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Collections
                  </Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {TOTAL_HADITHS.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Total
                  </Text>
                </View>
              </View>

              {/* Overall progress */}
              <View style={styles.heroProgressWrap}>
                <View style={styles.heroProgressLabel}>
                  <Text style={[styles.heroProgressText, { color: colors.textSecondary }]}>
                    Progression de l'authentification
                  </Text>
                  <Text style={[styles.heroProgressPercent, { color: colors.primary }]}>
                    {Math.round((TOTAL_AUTHENTICATED / TOTAL_HADITHS) * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={TOTAL_AUTHENTICATED / TOTAL_HADITHS}
                  color={colors.primary}
                  bgColor={colors.progressBg}
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ─── Primary Collections (Sahihayn) ─── */}
          <Animated.View
            style={{
              opacity: cardsAnim,
              transform: [
                {
                  translateY: cardsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Les Deux Sahih
              </Text>
              <Text style={[styles.sectionArabic, { color: colors.accent }]}>
                {'\u0627\u0644\u0635\u062d\u064a\u062d\u0627\u0646'}
              </Text>
            </View>

            {primaryBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookCard,
                  styles.primaryBookCard,
                  { backgroundColor: colors.card, borderColor: colors.accent },
                ]}
                onPress={() => openBook(book.url, book.name)}
                activeOpacity={0.7}
              >
                <View style={styles.bookTop}>
                  <View style={[styles.bookIcon, { backgroundColor: colors.accentLight }]}>
                    <FontAwesome5 name="star" size={18} color={colors.accent} />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookName, { color: colors.text }]}>{book.name}</Text>
                    <Text style={[styles.bookArabic, { color: colors.accent }]}>{book.arabicName}</Text>
                    <Text style={[styles.bookCompiler, { color: colors.textSecondary }]}>
                      {book.compiler}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>

                <View style={styles.bookProgress}>
                  <View style={styles.bookProgressLabels}>
                    <View style={[styles.authBadge, { backgroundColor: colors.primaryLight }]}>
                      <FontAwesome5 name="check-circle" size={10} color={colors.primary} />
                      <Text style={[styles.authBadgeText, { color: colors.primary }]}>
                        {book.authenticated} authentifi&eacute;s
                      </Text>
                    </View>
                    <Text style={[styles.bookTotal, { color: colors.textSecondary }]}>
                      / {book.total.toLocaleString()} total
                    </Text>
                  </View>
                  <ProgressBar
                    progress={book.authenticated / book.total}
                    color={colors.accent}
                    bgColor={colors.progressBg}
                  />
                </View>
              </TouchableOpacity>
            ))}

            {/* ─── Sunan Collections ─── */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Les Sunan
              </Text>
              <Text style={[styles.sectionArabic, { color: colors.primary }]}>
                {'\u0627\u0644\u0633\u0646\u0646'}
              </Text>
            </View>

            {sunanBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
                onPress={() => openBook(book.url, book.name)}
                activeOpacity={0.7}
              >
                <View style={styles.bookTop}>
                  <View style={[styles.bookIcon, { backgroundColor: colors.primaryLight }]}>
                    <FontAwesome5 name="book" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookName, { color: colors.text }]}>{book.name}</Text>
                    <Text style={[styles.bookArabic, { color: colors.textSecondary }]}>{book.arabicName}</Text>
                    <Text style={[styles.bookCompiler, { color: colors.textSecondary }]}>
                      {book.compiler}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>

                <View style={styles.bookProgress}>
                  <View style={styles.bookProgressLabels}>
                    <View style={[styles.authBadge, { backgroundColor: colors.primaryLight }]}>
                      <FontAwesome5 name="check-circle" size={10} color={colors.primary} />
                      <Text style={[styles.authBadgeText, { color: colors.primary }]}>
                        {book.authenticated} authentifi&eacute;s
                      </Text>
                    </View>
                    <Text style={[styles.bookTotal, { color: colors.textSecondary }]}>
                      / {book.total.toLocaleString()} total
                    </Text>
                  </View>
                  <ProgressBar
                    progress={book.authenticated / book.total}
                    color={colors.primary}
                    bgColor={colors.progressBg}
                  />
                </View>
              </TouchableOpacity>
            ))}

            {/* ─── Compilations ─── */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <View style={[styles.sectionDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Compilations
              </Text>
              <Text style={[styles.sectionArabic, { color: colors.accent }]}>
                {'\u0627\u0644\u0645\u062c\u0627\u0645\u064a\u0639'}
              </Text>
            </View>

            {compilationBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
                onPress={() => openBook(book.url, book.name)}
                activeOpacity={0.7}
              >
                <View style={styles.bookTop}>
                  <View style={[styles.bookIcon, { backgroundColor: colors.accentLight }]}>
                    <FontAwesome5 name="scroll" size={16} color={colors.accent} />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookName, { color: colors.text }]}>{book.name}</Text>
                    <Text style={[styles.bookArabic, { color: colors.accent }]}>{book.arabicName}</Text>
                    <Text style={[styles.bookCompiler, { color: colors.textSecondary }]}>
                      {book.compiler}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>

                <View style={styles.bookProgress}>
                  <View style={styles.bookProgressLabels}>
                    <View style={[styles.authBadge, { backgroundColor: colors.primaryLight }]}>
                      <FontAwesome5 name="check-circle" size={10} color={colors.primary} />
                      <Text style={[styles.authBadgeText, { color: colors.primary }]}>
                        {book.authenticated} authentifi&eacute;s
                      </Text>
                    </View>
                    <Text style={[styles.bookTotal, { color: colors.textSecondary }]}>
                      / {book.total.toLocaleString()} total
                    </Text>
                  </View>
                  <ProgressBar
                    progress={book.authenticated / book.total}
                    color={book.category === 'compilations' ? colors.accent : colors.primary}
                    bgColor={colors.progressBg}
                  />
                </View>
              </TouchableOpacity>
            ))}

            {/* ─── Source Attribution ─── */}
            <View style={[styles.sourceCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
              <FontAwesome5 name="info-circle" size={14} color={colors.textSecondary} />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                Source : bibliotheque-islamique.fr
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* WebView Reader Modal */}
      {selectedBook && (
        <BookReader
          visible={readerVisible}
          url={selectedBook.url}
          title={selectedBook.name}
          onClose={() => setReaderVisible(false)}
        />
      )}
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerArabic: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroIconRow: {
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroProgressWrap: {
    width: '100%',
  },
  heroProgressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroProgressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroProgressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionArabic: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginLeft: 4,
  },

  // Book cards
  bookCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  primaryBookCard: {
    borderWidth: 2,
  },
  bookTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookArabic: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 2,
  },
  bookCompiler: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookProgress: {
    marginTop: 12,
  },
  bookProgressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  authBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookTotal: {
    fontSize: 12,
  },

  // Source
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
