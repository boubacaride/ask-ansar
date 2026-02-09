import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, X, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { seerahUtils, SeerahEvent } from '../utils/seerahUtils';

interface SeerahAtlasScreenProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function SeerahAtlasScreen({ visible, onClose, darkMode }: SeerahAtlasScreenProps) {
  const [events, setEvents] = useState<SeerahEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SeerahEvent | null>(null);

  const colors = darkMode
    ? {
        background: '#0a0a0a',
        card: '#1e1e2d',
        cardSecondary: '#2a2a3d',
        text: '#ffffff',
        textSecondary: '#a0a0b0',
        border: '#3a3a4d',
        accent: '#c9a227',
        primary: '#00897b',
      }
    : {
        background: '#f8f9fa',
        card: '#ffffff',
        cardSecondary: '#f0f0f5',
        text: '#1a1a2e',
        textSecondary: '#6c757d',
        border: '#e0e0e8',
        accent: '#c9a227',
        primary: '#00897b',
      };

  useEffect(() => {
    if (visible) {
      loadEvents();
    }
  }, [visible]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await seerahUtils.getSeerahEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={darkMode
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : ['#ffffff', '#f0f4f8', '#e3f2fd']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <View style={[styles.headerIconContainer, { backgroundColor: `${colors.accent}20` }]}>
                <MapPin size={28} color={colors.accent} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Atlas de la Sîra</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  La vie du Prophète ﷺ
                </Text>
              </View>
            </View>
            <View style={styles.closeButton} />
          </View>
          <View style={[styles.timelineBadge, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
            <Clock size={16} color={colors.accent} />
            <Text style={[styles.timelineBadgeText, { color: colors.textSecondary }]}>
              {events.length} événements • 571-632 EC
            </Text>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement des événements...
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun événement disponible
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.timelineContainer}>
              {events.map((event, index) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                    />
                    {index < events.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor: colors.card,
                        borderLeftColor: colors.accent,
                      },
                    ]}
                    onPress={() => setSelectedEvent(event)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={darkMode
                        ? ['rgba(201, 162, 39, 0.05)', 'transparent']
                        : ['rgba(201, 162, 39, 0.03)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.eventCardGradient}
                    >
                      <View style={styles.eventContent}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.yearBadge, { backgroundColor: colors.accent }]}>
                            <Calendar size={14} color="#ffffff" strokeWidth={2} />
                            <Text style={styles.yearText}>{event.year} EC</Text>
                          </View>
                          <ChevronRight size={20} color={colors.textSecondary} />
                        </View>

                        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                          {event.title}
                        </Text>

                        <View style={[styles.eventLocationContainer, { backgroundColor: colors.cardSecondary }]}>
                          <MapPin size={16} color={colors.accent} strokeWidth={2} />
                          <Text style={[styles.eventLocationText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {event.location}
                          </Text>
                        </View>

                        {event.description && (
                          <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <Modal
          visible={!!selectedEvent}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedEvent(null)}
        >
          {selectedEvent && (
            <View style={styles.eventDetailOverlay}>
              <TouchableOpacity
                style={styles.overlayBackground}
                activeOpacity={1}
                onPress={() => setSelectedEvent(null)}
              />
              <View style={[styles.eventDetailCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={[styles.eventDetailCloseButton, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }]}
                  onPress={() => setSelectedEvent(null)}
                >
                  <X size={22} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <LinearGradient
                    colors={darkMode
                      ? ['#c9a227', '#d4af37', '#e6be44']
                      : ['#c9a227', '#d4af37', '#c9a227']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.eventDetailHeader}
                  >
                    <View style={[styles.eventDetailYearContainer, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                      <Calendar size={18} color="#ffffff" strokeWidth={2.5} />
                      <Text style={styles.eventDetailYear}>{selectedEvent.year} EC</Text>
                    </View>
                    <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                  </LinearGradient>

                  <View style={styles.eventDetailBody}>
                    <View style={[styles.eventDetailLocationCard, { backgroundColor: colors.cardSecondary }]}>
                      <MapPin size={22} color={colors.accent} strokeWidth={2.5} />
                      <View style={styles.eventDetailLocationTextContainer}>
                        <Text style={[styles.eventDetailLocationLabel, { color: colors.textSecondary }]}>
                          Localisation
                        </Text>
                        <Text style={[styles.eventDetailLocationText, { color: colors.text }]}>
                          {selectedEvent.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.coordinatesContainer}>
                      <View style={[styles.coordinateCard, { backgroundColor: colors.cardSecondary }]}>
                        <View style={[styles.coordinateIconContainer, { backgroundColor: `${colors.accent}20` }]}>
                          <Text style={[styles.coordinateIcon, { color: colors.accent }]}>φ</Text>
                        </View>
                        <Text style={[styles.coordinatesLabel, { color: colors.textSecondary }]}>Latitude</Text>
                        <Text style={[styles.coordinatesValue, { color: colors.text }]}>
                          {selectedEvent.latitude.toFixed(4)}°
                        </Text>
                      </View>
                      <View style={[styles.coordinateCard, { backgroundColor: colors.cardSecondary }]}>
                        <View style={[styles.coordinateIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                          <Text style={[styles.coordinateIcon, { color: colors.primary }]}>λ</Text>
                        </View>
                        <Text style={[styles.coordinatesLabel, { color: colors.textSecondary }]}>Longitude</Text>
                        <Text style={[styles.coordinatesValue, { color: colors.text }]}>
                          {selectedEvent.longitude.toFixed(4)}°
                        </Text>
                      </View>
                    </View>

                    {selectedEvent.description && (
                      <View style={styles.eventDetailSection}>
                        <View style={[styles.sectionHeader, { borderLeftColor: colors.accent }]}>
                          <Text style={[styles.eventDetailSectionTitle, { color: colors.text }]}>
                            Description
                          </Text>
                        </View>
                        <View style={[styles.sectionContent, { backgroundColor: colors.cardSecondary }]}>
                          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                            {selectedEvent.description}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedEvent.historical_significance && (
                      <View style={styles.eventDetailSection}>
                        <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
                          <Text style={[styles.eventDetailSectionTitle, { color: colors.text }]}>
                            Signification Historique
                          </Text>
                        </View>
                        <View style={[styles.sectionContent, { backgroundColor: colors.cardSecondary }]}>
                          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                            {selectedEvent.historical_significance}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  timelineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'center',
    borderWidth: 1,
  },
  timelineBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  eventsContainer: {
    flex: 1,
  },
  timelineContainer: {
    padding: 20,
    paddingTop: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    width: 44,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    shadowColor: '#c9a227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineLine: {
    flex: 1,
    width: 3,
    marginTop: 8,
    borderRadius: 2,
  },
  eventCard: {
    flex: 1,
    borderRadius: 20,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  eventCardGradient: {
    padding: 20,
  },
  eventContent: {
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    shadowColor: '#c9a227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  eventLocationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  eventDetailOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  eventDetailCard: {
    height: '88%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  eventDetailCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventDetailHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  eventDetailYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 8,
  },
  eventDetailYear: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  eventDetailTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
    color: '#ffffff',
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  eventDetailBody: {
    padding: 24,
  },
  eventDetailLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  eventDetailLocationTextContainer: {
    flex: 1,
  },
  eventDetailLocationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  eventDetailLocationText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  coordinateCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  coordinateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  coordinateIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  coordinatesLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coordinatesValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  eventDetailSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 12,
  },
  eventDetailSectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionContent: {
    padding: 18,
    borderRadius: 14,
  },
  eventDetailText: {
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
});
