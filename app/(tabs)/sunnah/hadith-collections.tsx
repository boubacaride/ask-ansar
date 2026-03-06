import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { HadithViewer } from '@/components/HadithViewer';

// ─── HADITH COLLECTIONS DATA ────────────────────────────────────
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

export default function HadithCollectionsScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{ url: string; name: string } | null>(null);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
  };

  const handleCollectionPress = (url: string, name: string) => {
    setSelectedCollection({ url, name });
    setViewerVisible(true);
  };

  const primaryCollections = HADITH_COLLECTIONS.filter((c) => c.isPrimary);
  const otherCollections = HADITH_COLLECTIONS.filter((c) => !c.isPrimary);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f8f9fa', '#e3f2fd', '#bbdefb']}
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
            onPress={() => router.replace('/(tabs)/sunnah')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Hadiths du Messager d'Allah
            </Text>
            <Text style={[styles.headerArabic, { color: colors.accent }]}>
              أحاديث رسول الله ﷺ
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* ─── Primary Collections (Sahihayn) ─── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Primary Collections (Sahihayn)
          </Text>

          {primaryCollections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionCard,
                styles.primaryCard,
                { backgroundColor: colors.card, borderColor: colors.accent },
              ]}
              onPress={() => handleCollectionPress(collection.url, collection.name)}
              activeOpacity={0.7}
            >
              <View style={styles.collectionHeader}>
                <View style={[styles.collectionIcon, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                  <FontAwesome5 name="star" size={20} color={colors.accent} />
                </View>
                <View style={styles.collectionTitleContainer}>
                  <Text style={[styles.collectionName, { color: colors.text }]}>
                    {collection.name}
                  </Text>
                  <Text style={[styles.collectionArabic, { color: colors.accent }]}>
                    {collection.arabicName}
                  </Text>
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

          {/* ─── Other Major Collections ─── */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            Other Major Collections
          </Text>

          {otherCollections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
              onPress={() => handleCollectionPress(collection.url, collection.name)}
              activeOpacity={0.7}
            >
              <View style={styles.collectionHeader}>
                <View style={[styles.collectionIcon, { backgroundColor: 'rgba(0, 137, 123, 0.1)' }]}>
                  <FontAwesome5 name="book" size={18} color={colors.primary} />
                </View>
                <View style={styles.collectionTitleContainer}>
                  <Text style={[styles.collectionName, { color: colors.text }]}>
                    {collection.name}
                  </Text>
                  <Text style={[styles.collectionArabic, { color: colors.textSecondary }]}>
                    {collection.arabicName}
                  </Text>
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

          {/* ─── Bibliothèque de Hadiths Authentiques ─── */}
          <View style={{ marginTop: 28, marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.collectionCard,
                styles.primaryCard,
                styles.bibliothequeCard,
                { backgroundColor: colors.card, borderColor: colors.accent },
              ]}
              onPress={() => router.push('/(tabs)/sunnah/bibliotheque')}
              activeOpacity={0.7}
            >
              <View style={styles.collectionHeader}>
                <View style={[styles.collectionIcon, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                  <FontAwesome5 name="mosque" size={20} color={colors.accent} />
                </View>
                <View style={styles.collectionTitleContainer}>
                  <Text style={[styles.collectionName, { color: colors.text, fontSize: 16 }]}>
                    Biblioth&egrave;que de Hadiths Authentiques
                  </Text>
                  <Text style={[styles.collectionArabic, { color: colors.accent }]}>
                    {'\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0623\u062d\u0627\u062f\u064a\u062b \u0627\u0644\u0635\u062d\u064a\u062d\u0629'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.collectionDescription, { color: colors.textSecondary }]}>
                Acc&eacute;dez &agrave; une biblioth&egrave;que compl&egrave;te de hadiths authentifi&eacute;s avec progression de v&eacute;rification pour chaque collection.
              </Text>
              <View style={styles.collectionFooter}>
                <View style={[styles.hadithCount, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.hadithCountText, { color: colors.primary }]}>
                    2 289 hadiths authentifi&eacute;s
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* HadithViewer Modal */}
      {selectedCollection && (
        <HadithViewer
          visible={viewerVisible}
          url={selectedCollection.url}
          collectionName={selectedCollection.name}
          onClose={() => setViewerVisible(false)}
        />
      )}
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerArabic: {
    fontSize: 16,
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
  bibliothequeCard: {
    borderStyle: 'solid' as any,
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
});
