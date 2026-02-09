import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';
import { QuranViewer } from '@/components/QuranViewer';

// Conditionally import WebView for native platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch {}
}

const QURAN_READER_URL = 'https://qurancomplex.gov.sa/quran-hafs/#flipbook-df_11311/9/';

const SURAHS = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', verses: 7, type: 'Mecquoise' },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286, type: 'Médinoise' },
  { number: 3, name: 'Aal-E-Imran', arabicName: 'آل عمران', verses: 200, type: 'Médinoise' },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176, type: 'Médinoise' },
  { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', verses: 120, type: 'Médinoise' },
  { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', verses: 165, type: 'Mecquoise' },
  { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', verses: 206, type: 'Mecquoise' },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', verses: 75, type: 'Médinoise' },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', verses: 129, type: 'Médinoise' },
  { number: 10, name: 'Yunus', arabicName: 'يونس', verses: 109, type: 'Mecquoise' },
  { number: 11, name: 'Hud', arabicName: 'هود', verses: 123, type: 'Mecquoise' },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', verses: 111, type: 'Mecquoise' },
  { number: 13, name: 'Ar-Rad', arabicName: 'الرعد', verses: 43, type: 'Médinoise' },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', verses: 52, type: 'Mecquoise' },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', verses: 99, type: 'Mecquoise' },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', verses: 128, type: 'Mecquoise' },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', verses: 111, type: 'Mecquoise' },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', verses: 110, type: 'Mecquoise' },
  { number: 19, name: 'Maryam', arabicName: 'مريم', verses: 98, type: 'Mecquoise' },
  { number: 20, name: 'Ta-Ha', arabicName: 'طه', verses: 135, type: 'Mecquoise' },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', verses: 112, type: 'Mecquoise' },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', verses: 78, type: 'Médinoise' },
  { number: 23, name: 'Al-Muminun', arabicName: 'المؤمنون', verses: 118, type: 'Mecquoise' },
  { number: 24, name: 'An-Nur', arabicName: 'النور', verses: 64, type: 'Médinoise' },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', verses: 77, type: 'Mecquoise' },
  { number: 26, name: 'Ash-Shuara', arabicName: 'الشعراء', verses: 227, type: 'Mecquoise' },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', verses: 93, type: 'Mecquoise' },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', verses: 88, type: 'Mecquoise' },
  { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', verses: 69, type: 'Mecquoise' },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', verses: 60, type: 'Mecquoise' },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', verses: 34, type: 'Mecquoise' },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', verses: 30, type: 'Mecquoise' },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', verses: 73, type: 'Médinoise' },
  { number: 34, name: 'Saba', arabicName: 'سبأ', verses: 54, type: 'Mecquoise' },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', verses: 45, type: 'Mecquoise' },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', verses: 83, type: 'Mecquoise' },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', verses: 182, type: 'Mecquoise' },
  { number: 38, name: 'Sad', arabicName: 'ص', verses: 88, type: 'Mecquoise' },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', verses: 75, type: 'Mecquoise' },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', verses: 85, type: 'Mecquoise' },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', verses: 54, type: 'Mecquoise' },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', verses: 53, type: 'Mecquoise' },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', verses: 89, type: 'Mecquoise' },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', verses: 59, type: 'Mecquoise' },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', verses: 37, type: 'Mecquoise' },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', verses: 35, type: 'Mecquoise' },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', verses: 38, type: 'Médinoise' },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', verses: 29, type: 'Médinoise' },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', verses: 18, type: 'Médinoise' },
  { number: 50, name: 'Qaf', arabicName: 'ق', verses: 45, type: 'Mecquoise' },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', verses: 60, type: 'Mecquoise' },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', verses: 49, type: 'Mecquoise' },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', verses: 62, type: 'Mecquoise' },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', verses: 55, type: 'Mecquoise' },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', verses: 78, type: 'Médinoise' },
  { number: 56, name: 'Al-Waqiah', arabicName: 'الواقعة', verses: 96, type: 'Mecquoise' },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', verses: 29, type: 'Médinoise' },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', verses: 22, type: 'Médinoise' },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', verses: 24, type: 'Médinoise' },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', verses: 13, type: 'Médinoise' },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', verses: 14, type: 'Médinoise' },
  { number: 62, name: 'Al-Jumuah', arabicName: 'الجمعة', verses: 11, type: 'Médinoise' },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', verses: 11, type: 'Médinoise' },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', verses: 18, type: 'Médinoise' },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', verses: 12, type: 'Médinoise' },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', verses: 12, type: 'Médinoise' },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', verses: 30, type: 'Mecquoise' },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', verses: 52, type: 'Mecquoise' },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', verses: 52, type: 'Mecquoise' },
  { number: 70, name: 'Al-Maarij', arabicName: 'المعارج', verses: 44, type: 'Mecquoise' },
  { number: 71, name: 'Nuh', arabicName: 'نوح', verses: 28, type: 'Mecquoise' },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', verses: 28, type: 'Mecquoise' },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', verses: 20, type: 'Mecquoise' },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', verses: 56, type: 'Mecquoise' },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', verses: 40, type: 'Mecquoise' },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', verses: 31, type: 'Médinoise' },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', verses: 50, type: 'Mecquoise' },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', verses: 40, type: 'Mecquoise' },
  { number: 79, name: 'An-Naziat', arabicName: 'النازعات', verses: 46, type: 'Mecquoise' },
  { number: 80, name: 'Abasa', arabicName: 'عبس', verses: 42, type: 'Mecquoise' },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', verses: 29, type: 'Mecquoise' },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', verses: 19, type: 'Mecquoise' },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', verses: 36, type: 'Mecquoise' },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', verses: 25, type: 'Mecquoise' },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', verses: 22, type: 'Mecquoise' },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', verses: 17, type: 'Mecquoise' },
  { number: 87, name: 'Al-Ala', arabicName: 'الأعلى', verses: 19, type: 'Mecquoise' },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', verses: 26, type: 'Mecquoise' },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', verses: 30, type: 'Mecquoise' },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', verses: 20, type: 'Mecquoise' },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', verses: 15, type: 'Mecquoise' },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', verses: 21, type: 'Mecquoise' },
  { number: 93, name: 'Ad-Duhaa', arabicName: 'الضحى', verses: 11, type: 'Mecquoise' },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', verses: 8, type: 'Mecquoise' },
  { number: 95, name: 'At-Tin', arabicName: 'التين', verses: 8, type: 'Mecquoise' },
  { number: 96, name: 'Al-Alaq', arabicName: 'العلق', verses: 19, type: 'Mecquoise' },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', verses: 5, type: 'Mecquoise' },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', verses: 8, type: 'Médinoise' },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', verses: 8, type: 'Médinoise' },
  { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', verses: 11, type: 'Mecquoise' },
  { number: 101, name: 'Al-Qariah', arabicName: 'القارعة', verses: 11, type: 'Mecquoise' },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', verses: 8, type: 'Mecquoise' },
  { number: 103, name: 'Al-Asr', arabicName: 'العصر', verses: 3, type: 'Mecquoise' },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', verses: 9, type: 'Mecquoise' },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', verses: 5, type: 'Mecquoise' },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', verses: 4, type: 'Mecquoise' },
  { number: 107, name: 'Al-Maun', arabicName: 'الماعون', verses: 7, type: 'Mecquoise' },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', verses: 3, type: 'Mecquoise' },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', verses: 6, type: 'Mecquoise' },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', verses: 3, type: 'Médinoise' },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', verses: 5, type: 'Mecquoise' },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', verses: 4, type: 'Mecquoise' },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', verses: 5, type: 'Mecquoise' },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', verses: 6, type: 'Mecquoise' },
];

export default function QuranScreen() {
  const { darkMode } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<{ number: number; name: string } | null>(null);
  const [quranReaderVisible, setQuranReaderVisible] = useState(false);
  const [readerLoading, setReaderLoading] = useState(true);
  const [readerError, setReaderError] = useState(false);
  const [readerKey, setReaderKey] = useState(0); // bump to force re-mount iframe/WebView
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LOAD_TIMEOUT_MS = 20000; // 20 seconds

  // Clear timeout on unmount or when modal closes
  useEffect(() => {
    if (!quranReaderVisible && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [quranReaderVisible]);

  const startLoadTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // If still loading after timeout, show error
      setReaderLoading(false);
      setReaderError(true);
    }, LOAD_TIMEOUT_MS);
  }, []);

  const handleReaderLoad = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setReaderLoading(false);
    setReaderError(false);
  }, []);

  const handleReaderError = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setReaderLoading(false);
    setReaderError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setReaderLoading(true);
    setReaderError(false);
    setReaderKey((k) => k + 1); // force re-mount
    startLoadTimeout();
  }, [startLoadTimeout]);

  const openQuranReader = useCallback(() => {
    setReaderLoading(true);
    setReaderError(false);
    setQuranReaderVisible(true);
    startLoadTimeout();
  }, [startLoadTimeout]);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
    inputBorder: darkMode ? '#3d3d5c' : '#ced4da',
  };

  const filteredSurahs = SURAHS.filter(
    (surah) =>
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.arabicName.includes(searchQuery) ||
      surah.number.toString().includes(searchQuery)
  );

  const handleSurahPress = (surah: { number: number; name: string }) => {
    setSelectedSurah(surah);
    setViewerVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f8f9fa', '#e3f2fd', '#bbdefb']}
        style={styles.gradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(0, 137, 123, 0.1)' }]}>
              <Ionicons name="book" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>The Holy Qur'an</Text>
              <Text style={[styles.headerArabic, { color: colors.accent }]}>القرآن الكريم</Text>
            </View>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search surah..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* "Lisez le Saint Coran" Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openQuranReader}
          style={styles.readerBannerWrapper}
        >
          <LinearGradient
            colors={darkMode ? ['#00695c', '#004d40'] : ['#00897b', '#00695c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.readerBanner}
          >
            <View style={styles.readerBannerLeft}>
              <View style={styles.readerBannerIconCircle}>
                <Ionicons name="book-outline" size={22} color="#fff" />
              </View>
              <View style={styles.readerBannerTextContainer}>
                <Text style={styles.readerBannerTitle}>Lisez le Saint Coran</Text>
                <Text style={styles.readerBannerSubtitle}>اقرأ القرآن الكريم</Text>
              </View>
            </View>
            <View style={styles.readerBannerArrow}>
              <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>114</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sourates</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>6,236</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Versets</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>30</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Juz'</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Toutes les sourates ({filteredSurahs.length})
          </Text>

          {filteredSurahs.map((surah) => (
            <TouchableOpacity
              key={surah.number}
              style={[styles.surahCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => handleSurahPress({ number: surah.number, name: surah.name })}
              activeOpacity={0.7}
            >
              <View style={[styles.surahNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.surahNumberText}>{surah.number}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={[styles.surahName, { color: colors.text }]}>{surah.name}</Text>
                <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
                  {surah.verses} versets - {surah.type}
                </Text>
              </View>
              <Text style={[styles.surahArabic, { color: colors.accent }]}>{surah.arabicName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {selectedSurah && (
        <QuranViewer
          visible={viewerVisible}
          surahNumber={selectedSurah.number}
          surahName={selectedSurah.name}
          onClose={() => setViewerVisible(false)}
        />
      )}

      {/* Quran Reader Modal — full-screen with WebView (native) or iframe (web) */}
      <Modal
        visible={quranReaderVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setQuranReaderVisible(false)}
      >
        <SafeAreaView style={[styles.readerModal, { backgroundColor: darkMode ? '#0a0a0a' : '#fff' }]}>
          {/* Header bar */}
          <View style={[styles.readerHeader, { backgroundColor: darkMode ? '#1a1a2e' : '#00897b' }]}>
            <TouchableOpacity
              onPress={() => setQuranReaderVisible(false)}
              style={styles.readerCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.readerHeaderCenter}>
              <Text style={styles.readerHeaderTitle}>Lisez le Saint Coran</Text>
              <Text style={styles.readerHeaderArabic}>اقرأ القرآن الكريم</Text>
            </View>
            <TouchableOpacity
              onPress={() => setQuranReaderVisible(false)}
              style={styles.readerCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Loading overlay */}
          {readerLoading && !readerError && (
            <View style={[styles.readerLoadingOverlay, { backgroundColor: darkMode ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.92)' }]}>
              <ActivityIndicator size="large" color="#00897b" />
              <Text style={[styles.readerLoadingText, { color: darkMode ? '#a0a0b0' : '#6c757d' }]}>
                Chargement du Coran...
              </Text>
              <Text style={[styles.readerLoadingHint, { color: darkMode ? '#6b6b80' : '#9CA3AF' }]}>
                Le site peut prendre quelques secondes
              </Text>
            </View>
          )}

          {/* Error / Timeout state */}
          {readerError && (
            <View style={[styles.readerErrorOverlay, { backgroundColor: darkMode ? '#0a0a0a' : '#fff' }]}>
              <Ionicons name="cloud-offline-outline" size={56} color={darkMode ? '#555' : '#ccc'} />
              <Text style={[styles.readerErrorTitle, { color: darkMode ? '#e0e0e0' : '#1a1a2e' }]}>
                Impossible de charger la page
              </Text>
              <Text style={[styles.readerErrorText, { color: darkMode ? '#a0a0b0' : '#6c757d' }]}>
                Le site met trop de temps à répondre.{'\n'}Vérifiez votre connexion et réessayez.
              </Text>
              <TouchableOpacity style={styles.readerRetryBtn} onPress={handleRetry}>
                <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.readerRetryBtnText}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.readerOpenBrowserBtn}
                onPress={() => {
                  Linking.openURL(QURAN_READER_URL);
                  setQuranReaderVisible(false);
                }}
              >
                <Ionicons name="open-outline" size={18} color="#00897b" style={{ marginRight: 6 }} />
                <Text style={[styles.readerOpenBrowserText, { color: '#00897b' }]}>
                  Ouvrir dans le navigateur
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content — WebView for native, iframe for web */}
          {!readerError && (
            Platform.OS === 'web' ? (
              <iframe
                key={readerKey}
                src={QURAN_READER_URL}
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                } as any}
                onLoad={handleReaderLoad}
                onError={handleReaderError}
                allow="fullscreen"
                title="Quran Reader"
              />
            ) : WebView ? (
              <WebView
                key={readerKey}
                source={{ uri: QURAN_READER_URL }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                onLoadEnd={handleReaderLoad}
                onError={handleReaderError}
                onHttpError={handleReaderError}
                allowsFullscreenVideo={true}
                scalesPageToFit={true}
                mixedContentMode="compatibility"
              />
            ) : (
              <View style={styles.readerFallback}>
                <Ionicons name="globe-outline" size={48} color="#00897b" />
                <Text style={[styles.readerFallbackText, { color: darkMode ? '#a0a0b0' : '#6c757d' }]}>
                  WebView non disponible
                </Text>
                <TouchableOpacity
                  style={styles.readerFallbackBtn}
                  onPress={() => {
                    Linking.openURL(QURAN_READER_URL);
                    setQuranReaderVisible(false);
                  }}
                >
                  <Text style={styles.readerFallbackBtnText}>Ouvrir dans le navigateur</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  surahNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  surahDetails: {
    fontSize: 12,
  },
  surahArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // --- "Lisez le Saint Coran" Banner ---
  readerBannerWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#00897b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  readerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  readerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readerBannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  readerBannerTextContainer: {
    flex: 1,
  },
  readerBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  readerBannerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  readerBannerArrow: {
    marginLeft: 8,
  },

  // --- Quran Reader Modal ---
  readerModal: {
    flex: 1,
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        paddingTop: 4,
      },
      default: {},
    }),
  },
  readerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  readerHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  readerHeaderArabic: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  readerLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  readerLoadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  readerLoadingHint: {
    marginTop: 6,
    fontSize: 13,
  },

  // --- Error / Timeout state ---
  readerErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    padding: 32,
  },
  readerErrorTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  readerErrorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  readerRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00897b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 24,
  },
  readerRetryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  readerOpenBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  readerOpenBrowserText: {
    fontSize: 15,
    fontWeight: '500',
  },
  readerFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  readerFallbackText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  readerFallbackBtn: {
    backgroundColor: '#00897b',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  readerFallbackBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
