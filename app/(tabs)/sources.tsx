import { View, Text, StyleSheet, Platform, Linking, ScrollView, Pressable, Image, useWindowDimensions } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import QuranDropdown from '@/components/QuranDropdown';
import HadithDropdown from '@/components/HadithDropdown';

const sources = [
  {
    id: '1',
    name: 'Qur\'an',
    arabicName: 'القرآن الكريم',
    description: 'The holy book of Islam, the direct word of Allah revealed to Prophet Muhammad ﷺ',
    verified: true,
    image: 'https://d6artovf3mfn.cloudfront.net/images/quaran__upload__73895.png',
    hasDropdown: true,
    dropdownType: 'quran'
  },
  {
    id: '2',
    name: 'Sunnah',
    arabicName: 'السنة النبوية',
    description: 'The teachings, sayings, and traditions of Prophet Muhammad ﷺ',
    verified: true,
    image: 'https://d6artovf3mfn.cloudfront.net/images/sunnah_medina_museum_84888.jpg',
    url: 'https://hadeethenc.com/fr/#categories'
  },
  {
    id: '3',
    name: 'Hadith',
    arabicName: 'الحديث',
    description: 'Authentic collections of prophetic traditions and narrations',
    verified: true,
    image: 'https://d6artovf3mfn.cloudfront.net/images/historyofcompiliationsahihmuslim.webp',
    hasDropdown: true,
    dropdownType: 'hadith'
  },
  {
    id: '4',
    name: 'Islamic Q&A',
    arabicName: 'الفتاوى',
    description: 'Reliable answers to Islamic questions by qualified scholars',
    verified: true,
    image: 'https://d6artovf3mfn.cloudfront.net/images/Q&A_taweez-shining-light.jpg',
    url: 'https://islamqa.info/fr/categories'
  },
  {
    id: '5',
    name: 'Islamic Articles',
    arabicName: 'مقالات إسلامية',
    description: 'Educational articles on various Islamic topics',
    verified: true,
    image: 'https://pyariwalls.pk/cdn/shop/collections/islamic_articles.jpg?v=1696952630',
    url: 'https://www.islamweb.net/fr/index.php?page=listing'
  },
  {
    id: '6',
    name: 'Duas & Adhkar',
    arabicName: 'الأدعية والأذكار',
    description: 'Collection of authentic supplications and remembrances',
    verified: true,
    image: 'https://d6artovf3mfn.cloudfront.net/images/Duas.png',
    url: 'https://duas.com/collection.php'
  },
  {
    id: '7',
    name: 'Ijtihad',
    arabicName: 'الاجتهاد',
    description: 'Contemporary Islamic legal reasoning and scholarly discussions',
    verified: true,
    image: 'https://lamppostedu.org/wp-content/uploads/2018/06/ijtihad1.jpg',
    url: 'https://www.ijtihad.org'
  }
];

export default function SourcesScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const imageHeight = Math.min(240, screenHeight * 0.25);

  const handleSurahSelect = (surahNumber: number) => {
    Linking.openURL(`https://quran.com/${surahNumber}`);
  };

  const handleVisitSite = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
    });
  };

  return (
    <ScrollView 
      style={[styles.container, darkMode && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { marginTop: (Platform.OS === 'web' ? 20 : insets.top) + 8 }]}>
        <Text style={[styles.title, darkMode && styles.darkModeText, isSmallScreen && { fontSize: 20 }]}>
          The Guideposts of Islam
        </Text>
        <Text style={[styles.arabicTitle, darkMode && styles.darkModeTextSecondary]}>
          معالم الإسلام
        </Text>
        <Text style={[styles.subtitle, darkMode && styles.darkModeTextSecondary]}>
          Authentic and verified references for Islamic knowledge
        </Text>
      </View>

      <View style={styles.grid}>
        {sources.map((source) => (
          <Animated.View
            key={source.id}
            entering={FadeIn.duration(300).delay(Number(source.id) * 100)}
            style={[styles.card, darkMode && styles.cardDark]}
          >
            {source.hasDropdown && (
              <View style={styles.dropdownContainer}>
                {source.dropdownType === 'quran' ? (
                  <QuranDropdown
                    onSelect={handleSurahSelect}
                    darkMode={darkMode}
                  />
                ) : source.dropdownType === 'hadith' ? (
                  <HadithDropdown darkMode={darkMode} />
                ) : null}
              </View>
            )}
            
            <View style={[styles.imageContainer, { height: imageHeight }]}>
              <Image
                source={{ uri: source.image }}
                style={styles.cardImage}
              />
              <View style={[styles.imageOverlay, darkMode && styles.imageOverlayDark]} />
            </View>
            
            <View style={[styles.cardContent, darkMode && styles.cardContentDark]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, darkMode && styles.darkModeText]}>
                  {source.name}
                </Text>
                {source.arabicName && (
                  <Text style={[styles.arabicName, darkMode && styles.darkModeTextSecondary]}>
                    {source.arabicName}
                  </Text>
                )}
              </View>
              
              <Text style={[styles.cardDescription, darkMode && styles.darkModeTextSecondary]}>
                {source.description}
              </Text>

              {!source.hasDropdown && source.url && (
                <Pressable
                  style={[styles.visitButton, darkMode && styles.visitButtonDark]}
                  onPress={() => handleVisitSite(source.url!)}
                >
                  <Text style={styles.visitButtonText}>Visit Site</Text>
                  <ExternalLink size={16} color="#fff" />
                </Pressable>
              )}
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    // marginTop is set dynamically via useSafeAreaInsets
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
    letterSpacing: 0.5,
  },
  arabicTitle: {
    fontSize: 22,
    color: '#64748b',
    fontFamily: 'NotoNaskhArabic-Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
  },
  grid: {
    gap: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1e293b',
  },
  dropdownContainer: {
    padding: 16,
    paddingBottom: 0,
    zIndex: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardContent: {
    padding: 24,
  },
  cardContentDark: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
  },
  arabicName: {
    fontSize: 20,
    color: '#64748b',
    fontFamily: 'NotoNaskhArabic-Regular',
  },
  cardDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  visitButtonDark: {
    backgroundColor: '#2563eb',
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
  },
  darkModeText: {
    color: '#f8fafc',
  },
  darkModeTextSecondary: {
    color: '#94a3b8',
  },
});