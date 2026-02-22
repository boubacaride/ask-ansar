import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';

const TOTAL_PAGES = 604;

// Fast CDN serving Quran page images (Madina Mushaf, high quality PNGs)
const getPageImageUrl = (pageNumber: number): string => {
  const padded = String(pageNumber).padStart(3, '0');
  return `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${padded}.png`;
};

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

/** Find which surah is displayed on a given page number */
function getSurahForPage(page: number): SurahInfo {
  for (let i = SURAH_PAGES.length - 1; i >= 0; i--) {
    if (page >= SURAH_PAGES[i].startPage) {
      return SURAH_PAGES[i];
    }
  }
  return SURAH_PAGES[0];
}

// ─── Page Component (memoized for FlatList performance) ──────────────

const QuranPage = memo(({ pageNumber, width, height }: { pageNumber: number; width: number; height: number }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.pageContainer, { width, height }]}>
      {/* Loading spinner behind image */}
      {!loaded && !error && (
        <View style={styles.pageLoading}>
          <ActivityIndicator size="large" color="#00897b" />
          <Text style={styles.pageLoadingText}>Page {pageNumber}</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.pageLoading}>
          <Ionicons name="image-outline" size={48} color="#ccc" />
          <Text style={styles.pageErrorText}>Impossible de charger la page {pageNumber}</Text>
        </View>
      )}

      {/* The actual Quran page image */}
      {!error && (
        <Image
          source={{ uri: getPageImageUrl(pageNumber) }}
          style={[styles.pageImage, { width, height }]}
          resizeMode="contain"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </View>
  );
});

// ─── Main MushafReader Component ─────────────────────────────────────

interface MushafReaderProps {
  visible: boolean;
  onClose: () => void;
  initialPage?: number;
}

export function MushafReader({ visible, onClose, initialPage = 1 }: MushafReaderProps) {
  const { darkMode } = useSettings();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');
  const [surahSearch, setSurahSearch] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Page data (1 through 604)
  const pages = useRef(Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1)).current;

  // Compute available height for page images (minus header + footer)
  const headerHeight = Platform.OS === 'ios' ? 94 : 64;
  const footerHeight = 56;
  const pageHeight = screenHeight - headerHeight - footerHeight;

  const currentSurah = getSurahForPage(currentPage);

  const colors = {
    headerBg: darkMode ? '#1a1a2e' : '#00897b',
    footerBg: darkMode ? '#1a1a2e' : '#ffffff',
    footerBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    background: darkMode ? '#0a0a0a' : '#f5f0e8',
    primary: '#00897b',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
  };

  // Reset to initial page when modal opens
  useEffect(() => {
    if (visible) {
      const page = initialPage || 1;
      setCurrentPage(page);
      // Delay scroll to let FlatList mount
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: page - 1, animated: false });
      }, 100);
    }
  }, [visible, initialPage]);

  // Prefetch adjacent pages for smoother scrolling
  useEffect(() => {
    if (!visible) return;
    const pagesToPrefetch = [currentPage - 2, currentPage - 1, currentPage + 1, currentPage + 2]
      .filter((p) => p >= 1 && p <= TOTAL_PAGES);
    pagesToPrefetch.forEach((p) => {
      Image.prefetch(getPageImageUrl(p)).catch(() => {});
    });
  }, [currentPage, visible]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth]
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderPage = useCallback(
    ({ item: pageNumber }: { item: number }) => (
      <QuranPage pageNumber={pageNumber} width={screenWidth} height={pageHeight} />
    ),
    [screenWidth, pageHeight]
  );

  const jumpToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(TOTAL_PAGES, page));
      flatListRef.current?.scrollToIndex({ index: validPage - 1, animated: false });
      setCurrentPage(validPage);
    },
    []
  );

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= TOTAL_PAGES) {
      jumpToPage(page);
    }
    setShowPageInput(false);
    setPageInputValue('');
  };

  const handleSurahSelect = (surah: SurahInfo) => {
    jumpToPage(surah.startPage);
    setShowSurahPicker(false);
    setSurahSearch('');
  };

  const filteredSurahs = surahSearch
    ? SURAH_PAGES.filter(
        (s) =>
          s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
          s.arabicName.includes(surahSearch) ||
          s.number.toString() === surahSearch
      )
    : SURAH_PAGES;

  const goToPrevPage = () => {
    if (currentPage > 1) jumpToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < TOTAL_PAGES) jumpToPage(currentPage + 1);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* ─── Header ─── */}
        <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>المصحف الشريف</Text>
            <Text style={styles.headerSubtitle}>Le Saint Coran</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ─── Page Viewer ─── */}
        <FlatList
          ref={flatListRef}
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => `page-${item}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={Math.max(0, initialPage - 1)}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
          removeClippedSubviews={Platform.OS !== 'web'}
          style={styles.pageList}
        />

        {/* ─── Footer Navigation ─── */}
        <View style={[styles.footer, { backgroundColor: colors.footerBg, borderTopColor: colors.footerBorder }]}>
          <TouchableOpacity onPress={goToPrevPage} style={styles.navBtn} disabled={currentPage <= 1}>
            <Ionicons name="chevron-back" size={22} color={currentPage <= 1 ? colors.cardBorder : colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setPageInputValue(String(currentPage)); setShowPageInput(true); }} style={styles.pageInfo}>
            <Text style={[styles.pageNumber, { color: colors.primary }]}>
              {currentPage} / {TOTAL_PAGES}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowSurahPicker(true)} style={styles.surahInfo}>
            <Text style={[styles.surahName, { color: colors.text }]} numberOfLines={1}>
              {currentSurah.arabicName}
            </Text>
            <Ionicons name="list" size={18} color={colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextPage} style={styles.navBtn} disabled={currentPage >= TOTAL_PAGES}>
            <Ionicons name="chevron-forward" size={22} color={currentPage >= TOTAL_PAGES ? colors.cardBorder : colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── Page Jump Input Modal ─── */}
        <Modal visible={showPageInput} transparent animationType="fade" onRequestClose={() => setShowPageInput(false)}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPageInput(false)}>
            <View style={[styles.pageInputCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.pageInputTitle, { color: colors.text }]}>Aller à la page</Text>
              <TextInput
                style={[styles.pageInputField, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                value={pageInputValue}
                onChangeText={setPageInputValue}
                keyboardType="number-pad"
                placeholder={`1 - ${TOTAL_PAGES}`}
                placeholderTextColor={colors.textSecondary}
                autoFocus
                onSubmitEditing={handlePageInputSubmit}
                selectTextOnFocus
              />
              <TouchableOpacity style={[styles.pageInputBtn, { backgroundColor: colors.primary }]} onPress={handlePageInputSubmit}>
                <Text style={styles.pageInputBtnText}>Aller</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ─── Surah Picker Modal ─── */}
        <Modal visible={showSurahPicker} animationType="slide" onRequestClose={() => { setShowSurahPicker(false); setSurahSearch(''); }}>
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.pickerHeader, { backgroundColor: colors.headerBg }]}>
              <TouchableOpacity onPress={() => { setShowSurahPicker(false); setSurahSearch(''); }} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.pickerHeaderTitle}>Sourates</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={[styles.pickerSearch, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.pickerSearchInput, { color: colors.text }]}
                placeholder="Rechercher une sourate..."
                placeholderTextColor={colors.textSecondary}
                value={surahSearch}
                onChangeText={setSurahSearch}
              />
              {surahSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSurahSearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {filteredSurahs.map((surah) => (
                <TouchableOpacity
                  key={surah.number}
                  style={[
                    styles.pickerItem,
                    { borderBottomColor: colors.cardBorder },
                    currentSurah.number === surah.number && { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => handleSurahSelect(surah)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pickerNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.pickerNumberText}>{surah.number}</Text>
                  </View>
                  <View style={styles.pickerItemInfo}>
                    <Text style={[styles.pickerItemName, { color: colors.text }]}>{surah.name}</Text>
                    <Text style={[styles.pickerItemPage, { color: colors.textSecondary }]}>
                      Page {surah.startPage}
                    </Text>
                  </View>
                  <Text style={[styles.pickerItemArabic, { color: colors.primary }]}>{surah.arabicName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
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
  // Page viewer
  pageList: {
    flex: 1,
  },
  pageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0e8',
  },
  pageImage: {
    flex: 1,
  },
  pageLoading: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pageLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6c757d',
  },
  pageErrorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageInfo: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  // Page jump modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pageInputCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  pageInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pageInputField: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  pageInputBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageInputBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Surah picker
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...Platform.select({
      ios: { paddingTop: 4 },
      default: {},
    }),
  },
  pickerHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pickerNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  pickerItemPage: {
    fontSize: 12,
  },
  pickerItemArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
