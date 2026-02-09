import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

interface SeerahMapCardProps {
  onPress: () => void;
  darkMode: boolean;
}

export function SeerahMapCard({ onPress, darkMode }: SeerahMapCardProps) {
  const colors = {
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    badge: darkMode ? 'rgba(201, 162, 39, 0.2)' : 'rgba(201, 162, 39, 0.15)',
    icon: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#0D5C63', '#00897b', '#00695c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative elements */}
        <View style={styles.decorativePattern}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.icon }]}>
              <FontAwesome5 name="map-marked-alt" size={24} color="#fff" />
            </View>
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <FontAwesome5 name="star" size={10} color="#c9a227" />
              <Text style={styles.badgeText}>Interactif</Text>
            </View>
          </View>

          <Text style={styles.arabicTitle}>أطلس السيرة</Text>
          <Text style={styles.frenchTitle}>Atlas de la Sîra</Text>

          <Text style={styles.subtitle}>
            Explorez les lieux saints et les événements majeurs de la vie du Prophète ﷺ sur une carte interactive
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <FontAwesome5 name="map-marker-alt" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Lieux</Text>
            </View>
            <View style={styles.featureDot} />
            <View style={styles.featureItem}>
              <FontAwesome5 name="history" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Timeline</Text>
            </View>
            <View style={styles.featureDot} />
            <View style={styles.featureItem}>
              <FontAwesome5 name="trophy" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Progrès</Text>
            </View>
          </View>

          <View style={styles.ctaButton}>
            <FontAwesome5 name="compass" size={16} color="#0D5C63" />
            <Text style={styles.ctaText}>Explorer la carte</Text>
            <FontAwesome5 name="arrow-right" size={14} color="#0D5C63" />
          </View>
        </View>

        {/* Corner decoration */}
        <View style={styles.cornerDecoration}>
          <FontAwesome5 name="kaaba" size={36} color="rgba(255,255,255,0.08)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
    minHeight: 220,
    position: 'relative',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -40,
    right: -20,
  },
  patternCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    bottom: -20,
    left: -20,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  badgeText: {
    color: '#c9a227',
    fontSize: 11,
    fontWeight: '600',
  },
  arabicTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  frenchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 14,
    lineHeight: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D5C63',
  },
  cornerDecoration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});
