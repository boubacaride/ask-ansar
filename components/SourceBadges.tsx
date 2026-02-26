import { View, Text, StyleSheet } from 'react-native';
import { memo } from 'react';
import { BookOpen, Book, Scale, Shield, MapPin, FileText, Info } from 'lucide-react-native';
import { FR } from '@/ui/strings.fr';
import type { SourceBadge } from '@/types/chat';

interface SourceBadgesProps {
  sources: SourceBadge[];
  darkMode: boolean;
}

const SOURCE_CONFIG: Record<string, { icon: any; color: string }> = {
  quran:   { icon: BookOpen, color: '#059669' },
  hadith:  { icon: Book,     color: '#D97706' },
  fiqh:    { icon: Scale,    color: '#7C3AED' },
  aqeedah: { icon: Shield,   color: '#2563EB' },
  seerah:  { icon: MapPin,   color: '#DC2626' },
  tafsir:  { icon: FileText, color: '#0891B2' },
  general: { icon: Info,     color: '#6B7280' },
};

const GRADE_COLORS: Record<string, string> = {
  sahih: '#10B981',
  hasan: '#F59E0B',
  sahih_li_ghayrihi: '#34D399',
  hasan_li_ghayrihi: '#FBBF24',
};

function SourceBadgesInner({ sources, darkMode }: SourceBadgesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, darkMode && styles.labelDark]}>{FR.sources}</Text>
      <View style={styles.badgesRow}>
        {sources.map((source, index) => {
          const config = SOURCE_CONFIG[source.type] ?? SOURCE_CONFIG.general;
          const Icon = config.icon;
          const gradeColor = source.grade ? (GRADE_COLORS[source.grade] ?? '#6B7280') : undefined;

          return (
            <View
              key={`${source.type}-${source.reference ?? index}`}
              style={[
                styles.badge,
                darkMode && styles.badgeDark,
                { borderLeftColor: config.color, borderLeftWidth: 3 },
              ]}
            >
              <Icon size={14} color={config.color} />
              <View style={styles.badgeTextContainer}>
                <Text style={[styles.badgeLabel, darkMode && styles.badgeLabelDark]} numberOfLines={1}>
                  {source.label}
                </Text>
                {source.reference && (
                  <Text style={[styles.badgeRef, darkMode && styles.badgeRefDark]} numberOfLines={1}>
                    {source.reference}
                  </Text>
                )}
              </View>
              {gradeColor && (
                <View style={[styles.gradeTag, { backgroundColor: gradeColor }]}>
                  <Text style={styles.gradeText}>
                    {source.grade === 'sahih' || source.grade === 'sahih_li_ghayrihi'
                      ? FR.gradeSahih
                      : FR.gradeHasan}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default memo(SourceBadgesInner);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelDark: {
    color: '#9CA3AF',
  },
  badgesRow: {
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    gap: 8,
  },
  badgeDark: {
    backgroundColor: '#111827',
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  badgeLabelDark: {
    color: '#E5E7EB',
  },
  badgeRef: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  badgeRefDark: {
    color: '#9CA3AF',
  },
  gradeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
