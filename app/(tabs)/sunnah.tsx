import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { HadithViewer } from '@/components/HadithViewer';
import { SeerahCard } from '@/components/SeerahCard';
import { SeerahMapCard } from '@/components/SeerahMapCard';
import { SeerahReader } from '@/components/SeerahReader';
import { HadithSearch } from '@/components/HadithSearch';

const HADITH_COLLECTIONS = [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    compiler: 'Imam al-Bukhari',
    hadithCount: '7,563',
    description: 'La collection de hadiths la plus authentique, Compilé par Imam Muhammad ibn Ismail al-Bukhari.',
    url: 'https://sunnah.com/bukhari',
    isPrimary: true,
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    compiler: 'Imam Muslim',
    hadithCount: '7,500',
    description: 'La deuxième collection la plus authentique, Compilé par Imam Muslim ibn al-Hajjaj.',
    url: 'https://sunnah.com/muslim',
    isPrimary: true,
  },
  {
    id: 'tirmidhi',
    name: 'Jami at-Tirmidhi',
    arabicName: 'جامع الترمذي',
    compiler: 'Imam at-Tirmidhi',
    hadithCount: '3,956',
    description: 'Connu pour sa classification de l\'authenticité des hadiths et ses commentaires juridiques.',
    url: 'https://sunnah.com/tirmidhi',
    isPrimary: false,
  },
  {
    id: 'abudawud',
    name: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
    compiler: 'Imam Abu Dawud',
    hadithCount: '5,274',
    description: 'Focuses on hadith related to Islamic law and jurisprudence.',
    url: 'https://sunnah.com/abudawud',
    isPrimary: false,
  },
  {
    id: 'nasai',
    name: "Sunan an-Nasa'i",
    arabicName: 'سنن النسائي',
    compiler: "Imam an-Nasa'i",
    hadithCount: '5,761',
    description: 'Connu pour ses critères stricts dans l\'acceptation des narrateurs.',
    url: 'https://sunnah.com/nasai',
    isPrimary: false,
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    arabicName: 'سنن ابن ماجه',
    compiler: 'Imam Ibn Majah',
    hadithCount: '4,341',
    description: 'La sixième des grandes collections de hadiths, contenant des narrations uniques.',
    url: 'https://sunnah.com/ibnmajah',
    isPrimary: false,
  },
  {
    id: 'malik',
    name: 'Muwatta Malik',
    arabicName: 'موطأ مالك',
    compiler: 'Imam Malik',
    hadithCount: '1,720',
    description: 'L\'une des premières collections, axée sur la pratique de Médine.',
    url: 'https://sunnah.com/malik',
    isPrimary: false,
  },
  {
    id: 'nawawi',
    name: "Riyad as-Salihin",
    arabicName: 'رياض الصالحين',
    compiler: 'Imam an-Nawawi',
    hadithCount: '1,896',
    description: 'Une compilation de hadiths sur l\'éthique, les bonnes manières et le chemin vers la droiture.',
    url: 'https://sunnah.com/riyadussalihin',
    isPrimary: false,
  },
];

const HADITH_Catégories = [
  { id: 'faith', name: 'Foi (Iman)', icon: 'heart', color: '#e91e63' },
  { id: 'prayer', name: 'Prière (Salah)', icon: 'pray', color: '#9c27b0' },
  { id: 'fasting', name: 'Jeûne (Sawm)', icon: 'moon', color: '#673ab7' },
  { id: 'zakat', name: 'Aumône (Zakat)', icon: 'hand-holding-heart', color: '#3f51b5' },
  { id: 'hajj', name: 'Pèlerinage (Hajj)', icon: 'kaaba', color: '#c9a227' },
  { id: 'manners', name: 'Bonnes manières (Adab)', icon: 'user-friends', color: '#00897b' },
  { id: 'family', name: 'Relations familiales', icon: 'home', color: '#ff5722' },
  { id: 'business', name: 'Éthique des affaires', icon: 'balance-scale', color: '#607d8b' },
  { id: 'duas', name: "Dou'as et Dhikr", icon: 'praying-hands', color: '#00796b' },
];

export default function SunnahScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'collections' | 'Catégories'>('collections');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{ url: string; name: string } | null>(null);
  const [seerahReaderVisible, setSeerahReaderVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

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

  const filteredCollections = HADITH_COLLECTIONS;

  const handleCollectionPress = (url: string, name: string) => {
    setSelectedCollection({ url, name });
    setViewerVisible(true);
  };

  const handleOpenInBrowser = (url: string) => {
    Linking.openURL(url);
  };

  const handleCategoryPress = (category: { id: string; name: string; icon: string; color: string }) => {
    if (category.id === 'duas') {
      router.push('/(tabs)/sunnah/duas');
      return;
    }
    router.push({
      pathname: '/(tabs)/sunnah/[categoryId]',
      params: {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f8f9fa', '#e8f5e9', '#c8e6c9']}
        style={styles.gradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.cardBorder, paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10 }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(0, 137, 123, 0.1)', width: isSmallScreen ? 42 : 50, height: isSmallScreen ? 42 : 50, borderRadius: isSmallScreen ? 21 : 25 }]}>
              <FontAwesome5 name="book-open" size={isSmallScreen ? 20 : 24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: isSmallScreen ? 20 : 24 }]}>La Sounna</Text>
              <Text style={[styles.headerArabic, { color: colors.accent, fontSize: isSmallScreen ? 16 : 18 }]}>السنة النبوية</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setSearchModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Rechercher des hadiths...
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'collections' && { backgroundColor: colors.primary },
                { borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab('collections')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'collections' ? '#fff' : colors.primary }]}>
                Collections
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Catégories' && { backgroundColor: colors.primary },
                { borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab('Catégories')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'Catégories' ? '#fff' : colors.primary }]}>
                Catégories
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {activeTab === 'collections' ? (
            <>
              <SeerahCard
                onPress={() => setSeerahReaderVisible(true)}
                darkMode={darkMode}
              />

              <SeerahMapCard
                onPress={() => router.push('/(tabs)/seerah-map')}
                darkMode={darkMode}
              />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Primary Collections (Sahihayn)
              </Text>

              {filteredCollections
                .filter((c) => c.isPrimary)
                .map((collection) => (
                  <TouchableOpacity
                    key={collection.id}
                    style={[styles.collectionCard, styles.primaryCard, { backgroundColor: colors.card, borderColor: colors.accent }]}
                    onPress={() => handleCollectionPress(collection.url, collection.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.collectionHeader}>
                      <View style={[styles.collectionIcon, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                        <FontAwesome5 name="star" size={20} color={colors.accent} />
                      </View>
                      <View style={styles.collectionTitleContainer}>
                        <Text style={[styles.collectionName, { color: colors.text }]}>{collection.name}</Text>
                        <Text style={[styles.collectionArabic, { color: colors.accent }]}>{collection.arabicName}</Text>
                      </View>
                    </View>
                    <Text style={[styles.collectionCompiler, { color: colors.textSecondary }]}>
                      Compilé par {collection.compiler}
                    </Text>
                    <Text style={[styles.collectionDescription, { color: colors.textSecondary }]}>
                      {collection.description}
                    </Text>
                    <View style={styles.collectionFooter}>
                      <View style={[styles.hadithCount, { backgroundColor: colors.inputBg }]}>
                        <Text style={[styles.hadithCountText, { color: colors.primary }]}>
                          {collection.hadithCount} hadiths
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                Other Major Collections
              </Text>

              {filteredCollections
                .filter((c) => !c.isPrimary)
                .map((collection) => (
                  <TouchableOpacity
                    key={collection.id}
                    style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => handleCollectionPress(collection.url, collection.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.collectionHeader}>
                      <View style={[styles.collectionIcon, { backgroundColor: 'rgba(0, 137, 123, 0.1)' }]}>
                        <FontAwesome5 name="book" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.collectionTitleContainer}>
                        <Text style={[styles.collectionName, { color: colors.text }]}>{collection.name}</Text>
                        <Text style={[styles.collectionArabic, { color: colors.textSecondary }]}>{collection.arabicName}</Text>
                      </View>
                    </View>
                    <Text style={[styles.collectionDescription, { color: colors.textSecondary }]}>
                      {collection.description}
                    </Text>
                    <View style={styles.collectionFooter}>
                      <View style={[styles.hadithCount, { backgroundColor: colors.inputBg }]}>
                        <Text style={[styles.hadithCountText, { color: colors.primary }]}>
                          {collection.hadithCount} hadiths
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Topic</Text>
              <View style={styles.CatégoriesGrid}>
                {HADITH_Catégories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <FontAwesome5 name={category.icon as any} size={24} color={category.color} />
                    </View>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.browseAllButton, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL('https://sunnah.com')}
              >
                <Text style={styles.browseAllText}>Browse All Hadith</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </LinearGradient>

      {selectedCollection && (
        <HadithViewer
          visible={viewerVisible}
          url={selectedCollection.url}
          collectionName={selectedCollection.name}
          onClose={() => setViewerVisible(false)}
        />
      )}

      <SeerahReader
        visible={seerahReaderVisible}
        onClose={() => setSeerahReaderVisible(false)}
        darkMode={darkMode}
      />

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={[styles.searchModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              style={styles.closeSearchButton}
            >
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.searchModalTitle, { color: colors.text }]}>Recherche de Hadiths</Text>
            <View style={styles.placeholder} />
          </View>

          <HadithSearch darkMode={darkMode} />
        </View>
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
    // paddingTop is set dynamically via useSafeAreaInsets
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  collectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  primaryCard: {
    borderWidth: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  collectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionTitleContainer: {
    flex: 1,
  },
  collectionName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  collectionArabic: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  collectionCompiler: {
    fontSize: 13,
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  collectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hadithCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hadithCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  CatégoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    minWidth: 140,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  browseAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchModalContainer: {
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeSearchButton: {
    padding: 8,
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
});
