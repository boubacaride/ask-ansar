import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Image,
} from 'react-native';

// Camel marker image URL - The exact camel illustration with green saddle, tassels, facing left
// This image will be used for the active/selected event marker
const CAMEL_MARKER_IMAGE_URL = 'https://d6artovf3mfn.cloudfront.net/images/Gemini_Generated_Image_8tspiy8tspiy8tsp-removebg-preview%20(1).png';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useSettings } from '@/store/settingsStore';
import { useSeerahMapStore } from '@/store/seerahMapStore';
import { useSeerahEvents } from '@/hooks/useSeerahEvents';
import {
  SeerahEventWithMeta,
  SeerahCategory,
  CATEGORY_CONFIGS,
  HISTORICAL_MAP_STYLE,
} from '@/types/seerahMap.d';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Conditionally import expo-speech only on native platforms
let Speech: any = null;
if (Platform.OS !== 'web') {
  Speech = require('expo-speech');
}

// Category labels in French
const CATEGORY_LABELS_FR: Record<SeerahCategory, string> = {
  sacred: 'lieu sacré',
  battle: 'bataille',
  revelation: 'révélation',
  migration: 'migration',
  life_event: 'personnel',
};

export default function SeerahMapScreen() {
  const { darkMode } = useSettings();
  const {
    events,
    filteredEvents,
    isLoading,
    error,
    selectedEvent,
    selectEvent,
    markEventVisited,
    progress,
    visitedEventIds,
    setFilters,
    filters,
    clearFilters,
  } = useSeerahMapStore();

  const { refresh } = useSeerahEvents({ autoLoad: true });

  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const popupAnim = useRef(new Animated.Value(0)).current;

  // Seerah Atlas inspired dark color scheme
  const colors = {
    background: '#0f172a',
    headerBg: '#0a0f1a',
    card: '#1e293b',
    cardBorder: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    primary: '#0D5C63',
    accent: '#d97706',
    accentLight: '#fbbf24',
    gold: '#C4A35A',
    timeline: '#1e3a5f',
    success: '#22c55e',
  };

  // Sort events by year for timeline
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const yearA = parseInt(a.year?.toString() || '0');
      const yearB = parseInt(b.year?.toString() || '0');
      return yearA - yearB;
    });
  }, [filteredEvents]);

  // Current event
  const currentEvent = sortedEvents[currentEventIndex] || null;

  // Navigate to event - called when user taps marker or timeline dot
  const navigateToEvent = useCallback((index: number) => {
    if (index >= 0 && index < sortedEvents.length) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentEventIndex(index);
      const event = sortedEvents[index];
      selectEvent(event);
      markEventVisited(event.id);
      setShowEventPopup(true);

      // Animate popup
      Animated.spring(popupAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();

      // Pan map to event with smooth animation
      if (Platform.OS === 'web') {
        // For web, we'll post message to iframe
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'panToEvent',
            lat: event.latitude,
            lng: event.longitude,
            index: index,
          }, '*');
        }
      } else if (webViewRef.current && event.latitude && event.longitude) {
        webViewRef.current.injectJavaScript(
          `panToEvent(${event.latitude}, ${event.longitude}, ${index + 1}); true;`
        );
      }
    }
  }, [sortedEvents, selectEvent, markEventVisited, popupAnim]);

  // Navigate to previous event
  const goToPreviousEvent = () => {
    navigateToEvent(currentEventIndex - 1);
  };

  // Navigate to next event
  const goToNextEvent = () => {
    navigateToEvent(currentEventIndex + 1);
  };

  // Open detail modal
  const openDetailModal = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowDetailModal(true);
  };

  // Close popup
  const closePopup = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEventPopup(false);
    });
  };

  // Generate map HTML ONCE - use ref to prevent WebView reloads on state changes
  const mapHTMLRef = useRef<string>('');
  const mapGeneratedRef = useRef(false);

  if (sortedEvents.length > 0 && !mapGeneratedRef.current) {
    mapGeneratedRef.current = true;
    const markers = sortedEvents.map((event, index) => {
      const category = event.category || 'life_event';
      const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['life_event'];
      const isVisited = visitedEventIds.includes(event.id);
      return {
        id: event.id,
        index: index + 1,
        lat: event.latitude,
        lng: event.longitude,
        title: event.title,
        description: event.description?.substring(0, 100) + '...' || '',
        location: event.location,
        category: category,
        categoryLabel: CATEGORY_LABELS_FR[category] || 'événement',
        year: event.year,
        isVisited,
      };
    });

    mapHTMLRef.current = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; width: 100%; background: #f5f1e8; }
          #map { height: 100%; width: 100%; }

          /* Animated pin marker */
          .pin-marker {
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .pin-marker .pin-icon {
            width: 40px;
            height: 48px;
            position: relative;
            animation: float 2s ease-in-out infinite;
            transition: transform 0.3s ease;
          }
          .pin-marker .pin-icon svg {
            width: 100%;
            height: 100%;
          }
          .pin-marker .camel-icon {
            width: 120px;
            height: 120px;
            position: relative;
            transition: transform 0.3s ease;
          }
          .pin-marker .camel-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .pin-marker:hover .pin-icon {
            transform: scale(1.15);
          }
          .pin-marker.active .pin-icon,
          .pin-marker.active .camel-icon {
            transform: scale(1.1);
            animation: bounce 0.6s ease infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes shadow-pulse {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
            50% { transform: translateX(-50%) scale(0.8); opacity: 0.2; }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1.2) translateY(0); }
            50% { transform: scale(1.2) translateY(-8px); }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5)); }
            50% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8)); }
          }

          /* Location label tooltip */
          .pin-label {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 41, 59, 0.95);
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .pin-label::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid rgba(30, 41, 59, 0.95);
          }
          .pin-marker:hover .pin-label,
          .pin-marker.active .pin-label {
            opacity: 1;
            transform: translateX(-50%) translateY(-5px);
          }

          /* Pulse ring for active marker */
          .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid rgba(245, 158, 11, 0.6);
            animation: pulse-ring 1.5s ease-out infinite;
            pointer-events: none;
            opacity: 0;
          }
          .pin-marker.active .pulse-ring {
            opacity: 1;
          }
          @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }

          /* Modern Tooltip/Callout styles - ultra compact for mobile */
          .tooltip {
            position: absolute;
            background: #ffffff;
            border-radius: 0 0 6px 6px;
            padding: 0;
            min-width: 180px;
            max-width: calc(100vw - 16px);
            width: min(260px, calc(100vw - 16px));
            max-height: calc(100vh - 8px);
            overflow-y: auto;
            box-shadow: 0 4px 16px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.1);
            z-index: 1000;
            display: none;
            border: none;
          }
          .tooltip.show {
            display: block;
            animation: tooltipIn 0.25s ease-out;
          }
          @keyframes tooltipIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .tooltip-arrow { display: none; }
          .tooltip-header {
            padding: 3px 8px;
            background: linear-gradient(135deg, #1e3a5f 0%, #0D5C63 50%, #0a4a50 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .tooltip-category {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: 1px solid rgba(255,255,255,0.25);
          }
          .tooltip-year {
            color: #fbbf24;
            font-size: 11px;
            font-weight: 800;
          }
          .tooltip-location {
            padding: 2px 8px;
            background: #f1f5f9;
            color: #334155;
            font-size: 10px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
            border-bottom: 1px solid #e2e8f0;
          }
          .tooltip-location svg {
            color: #dc2626;
            flex-shrink: 0;
            width: 10px;
            height: 10px;
          }
          .tooltip-counter {
            margin-left: auto;
            color: #475569;
            font-size: 8px;
            font-weight: 700;
            background: #e2e8f0;
            padding: 1px 5px;
            border-radius: 10px;
            white-space: nowrap;
          }
          .tooltip-content {
            padding: 4px 8px;
            display: flex;
            gap: 6px;
          }
          .tooltip-image {
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: linear-gradient(135deg, #0D5C63 0%, #1e3a5f 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            flex-shrink: 0;
          }
          .tooltip-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
          }
          .tooltip-title {
            color: #0f172a;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 0;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .tooltip-desc {
            color: #475569;
            font-size: 9px;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .tooltip-link {
            padding: 3px 8px 4px;
            display: flex;
            flex-direction: row;
            gap: 4px;
          }
          .tooltip-link a {
            flex: 1;
            color: #ffffff;
            text-decoration: none;
            font-size: 9px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            padding: 5px 6px;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }
          .tooltip-link a svg {
            width: 10px;
            height: 10px;
          }
          .tooltip-quiz-btn {
            flex: 1;
            border: none;
            font-size: 9px;
            font-weight: 700;
            color: #ffffff;
            background: linear-gradient(135deg, #0D5C63 0%, #0a4a50 100%);
            padding: 5px 6px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }
          /* Extra compact on very small screens */
          @media (max-width: 380px) {
            .tooltip { width: calc(100vw - 12px); min-width: 160px; }
            .tooltip-header { padding: 2px 6px; }
            .tooltip-category { font-size: 7px; padding: 1px 5px; }
            .tooltip-year { font-size: 10px; }
            .tooltip-location { padding: 2px 6px; font-size: 9px; gap: 3px; }
            .tooltip-location svg { width: 8px; height: 8px; }
            .tooltip-counter { font-size: 7px; padding: 1px 4px; }
            .tooltip-content { padding: 3px 6px; gap: 4px; }
            .tooltip-image { width: 22px; height: 22px; font-size: 11px; border-radius: 5px; }
            .tooltip-title { font-size: 10px; }
            .tooltip-desc { font-size: 8px; }
            .tooltip-link { padding: 2px 6px 3px; gap: 3px; }
            .tooltip-link a { padding: 4px 4px; font-size: 8px; border-radius: 4px; gap: 2px; }
            .tooltip-link a svg { width: 8px; height: 8px; }
            .tooltip-quiz-btn { padding: 4px 4px; font-size: 8px; border-radius: 4px; gap: 2px; }
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDEwtaEWWtkJb6zyIyRQdxPMjmcpasx0H8&callback=initMap" async defer></script>
      </head>
      <body>
        <div id="map"></div>
        <div id="tooltip" class="tooltip">
          <div class="tooltip-header">
            <span id="tooltip-category" class="tooltip-category">événement</span>
            <span id="tooltip-year" class="tooltip-year">571</span>
          </div>
          <div class="tooltip-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
            </svg>
            <span id="tooltip-location-text">Mecca, Saudi Arabia</span>
            <span id="tooltip-counter" class="tooltip-counter">1 / 33</span>
          </div>
          <div class="tooltip-content">
            <div id="tooltip-image" class="tooltip-image">🕋</div>
            <div class="tooltip-text">
              <div id="tooltip-title" class="tooltip-title">Event Title</div>
              <div id="tooltip-desc" class="tooltip-desc">Description...</div>
            </div>
          </div>
          <div class="tooltip-link">
            <a href="#" id="tooltip-readmore" onclick="readMore(); return false;">
              En savoir plus
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <button class="tooltip-quiz-btn" onclick="startQuiz()">
              <span>❓</span>
              <span>Testez vos connaissances</span>
              <span>→</span>
            </button>
          </div>
          <div class="tooltip-arrow"></div>
        </div>
        <script>
          const markers = ${JSON.stringify(markers)};
          const totalEvents = markers.length;

          // Dark map style
          // Lighter vintage/historical map style for better visibility
          const mapStyle = [
            { elementType: "geometry", stylers: [{ color: "#f5f1e8" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#5c4a32" }] },
            { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c4a35a" }] },
            { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#8b7355" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6b5344" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8e0d0" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#7a6b5a" }] },
            { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#d4e5c7" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#e0d6c6" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d4c4a8" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c4a35a" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#ddd5c5" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8c8d8" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5a7a8a" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#ebe5d8" }] },
          ];

          let map;
          let markerObjects = [];
          let activeMarkerIndex = -1;
          let currentInfoWindow = null;
          const tooltip = document.getElementById('tooltip');

          const camelMarkerUrl = 'https://d6artovf3mfn.cloudfront.net/images/Gemini_Generated_Image_8tspiy8tspiy8tsp-removebg-preview%20(1).png';

          function makePinSvg(pinColor, darkColor, id) {
            return '<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pG' + id + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:' + pinColor + ';stop-opacity:1" /><stop offset="100%" style="stop-color:' + darkColor + ';stop-opacity:1" /></linearGradient></defs><ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/><path d="M20 0C11.716 0 5 6.716 5 15c0 10.5 15 29 15 29s15-18.5 15-29C35 6.716 28.284 0 20 0z" fill="url(#pG' + id + ')" stroke="#ffffff" stroke-width="2.5"/><circle cx="20" cy="15" r="6" fill="#ffffff"/></svg>';
          }

          function setPinIcon(markerObj, idx) {
            const isVisited = markerObj.data.isVisited || markers[idx]?.isVisited;
            const pinColor = isVisited ? '#22c55e' : '#c4a35a';
            const darkColor = isVisited ? '#15803d' : '#8b7355';
            markerObj.marker.setIcon({
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(makePinSvg(pinColor, darkColor, idx)),
              scaledSize: new google.maps.Size(40, 48),
              anchor: new google.maps.Point(20, 44),
            });
            markerObj.marker.setZIndex(idx);
          }

          function setCamelIcon(markerObj) {
            markerObj.marker.setIcon({
              url: camelMarkerUrl,
              scaledSize: new google.maps.Size(120, 120),
              anchor: new google.maps.Point(60, 105),
            });
            markerObj.marker.setZIndex(1000);
          }

          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 24.5, lng: 42.0 },
              zoom: 5,
              styles: mapStyle,
              disableDefaultUI: true,
              zoomControl: false,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              backgroundColor: '#f5f1e8',
            });

            // Create markers using legacy Marker API (compatible with all WebViews)
            markers.forEach((marker, idx) => {
              const pinColor = marker.isVisited ? '#22c55e' : '#c4a35a';
              const darkColor = marker.isVisited ? '#15803d' : '#8b7355';

              const gmMarker = new google.maps.Marker({
                position: { lat: marker.lat, lng: marker.lng },
                map: map,
                title: marker.title,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(makePinSvg(pinColor, darkColor, idx)),
                  scaledSize: new google.maps.Size(40, 48),
                  anchor: new google.maps.Point(20, 44),
                },
                animation: google.maps.Animation.DROP,
                optimized: false,
              });

              gmMarker.addListener('click', () => {
                showTooltipForMarker(idx);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                  type: 'markerClick',
                  eventIndex: idx,
                  eventId: marker.id,
                }));
              });

              markerObjects.push({ marker: gmMarker, data: marker });
            });

            window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'mapReady' }));

            // Auto-select first event
            if (markers.length > 0) {
              setTimeout(() => {
                panToEvent(markers[0].lat, markers[0].lng, 1);
                showTooltipForMarker(0);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                  type: 'markerClick',
                  eventIndex: 0,
                  eventId: markers[0].id,
                }));
              }, 1000);
            }
          }

          function showTooltipForMarker(idx) {
            const marker = markers[idx];
            const markerObj = markerObjects[idx];
            if (!marker || !markerObj) return;

            const categoryIcons = { sacred: '🕋', battle: '⚔️', revelation: '📖', migration: '🐪', life_event: '🌟' };

            // Update tooltip content
            document.getElementById('tooltip-category').textContent = marker.categoryLabel;
            document.getElementById('tooltip-year').textContent = marker.year;
            document.getElementById('tooltip-location-text').textContent = marker.location;
            document.getElementById('tooltip-counter').textContent = (idx + 1) + ' / ' + totalEvents;
            document.getElementById('tooltip-title').textContent = marker.title;
            document.getElementById('tooltip-desc').textContent = marker.description || 'Aucune description disponible.';
            document.getElementById('tooltip-image').textContent = categoryIcons[marker.category] || '📍';

            // Position tooltip centered horizontally at top of screen - responsive width
            const mapDiv = document.getElementById('map');
            const mapWidth = mapDiv.offsetWidth;
            const tooltipWidth = Math.min(260, mapWidth - 16);
            tooltip.style.width = tooltipWidth + 'px';
            tooltip.style.minWidth = 'auto';
            tooltip.style.left = ((mapWidth - tooltipWidth) / 2) + 'px';
            tooltip.style.top = '2px';
            tooltip.classList.add('show');

            // Restore previous marker to pin icon
            if (activeMarkerIndex >= 0 && markerObjects[activeMarkerIndex]) {
              setPinIcon(markerObjects[activeMarkerIndex], activeMarkerIndex);
            }

            activeMarkerIndex = idx;

            // Set active marker to camel icon with bounce
            setCamelIcon(markerObj);
            markerObj.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => markerObj.marker.setAnimation(null), 1400);
          }

          function hideTooltip() {
            tooltip.classList.remove('show');
          }

          // Store previous location for smooth transitions
          let previousLocation = null;
          let isAnimating = false;
          const INITIAL_ZOOM = 5;
          const TARGET_ZOOM = 11;
          const TRANSITION_ZOOM = 6;

          // Calculate distance between two points
          function getDistance(lat1, lng1, lat2, lng2) {
            return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
          }

          // Smooth easing function
          function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          }

          // Animate camera smoothly with zoom out -> pan -> zoom in
          function animateCamera(targetLat, targetLng, callback) {
            if (isAnimating) return;
            isAnimating = true;

            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            const distance = previousLocation
              ? getDistance(previousLocation.lat, previousLocation.lng, targetLat, targetLng)
              : 0;

            const needsZoomOut = distance > 0.5;
            const zoomOutLevel = needsZoomOut ? Math.max(TRANSITION_ZOOM, currentZoom - 4) : currentZoom;
            const animationDuration = needsZoomOut ? 2000 : 1200;
            const startTime = performance.now();

            function animate(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              const easedProgress = easeInOutCubic(progress);

              if (needsZoomOut) {
                if (progress < 0.3) {
                  const phaseProgress = progress / 0.3;
                  const zoomProgress = easeInOutCubic(phaseProgress);
                  const newZoom = currentZoom - (currentZoom - zoomOutLevel) * zoomProgress;
                  map.setZoom(newZoom);
                } else if (progress < 0.7) {
                  const phaseProgress = (progress - 0.3) / 0.4;
                  const panProgress = easeInOutCubic(phaseProgress);
                  const newLat = currentCenter.lat() + (targetLat - currentCenter.lat()) * panProgress;
                  const newLng = currentCenter.lng() + (targetLng - currentCenter.lng()) * panProgress;
                  map.setCenter({ lat: newLat, lng: newLng });
                  map.setZoom(zoomOutLevel);
                } else {
                  const phaseProgress = (progress - 0.7) / 0.3;
                  const zoomProgress = easeInOutCubic(phaseProgress);
                  const newZoom = zoomOutLevel + (TARGET_ZOOM - zoomOutLevel) * zoomProgress;
                  map.setCenter({ lat: targetLat, lng: targetLng });
                  map.setZoom(newZoom);
                }
              } else {
                const newLat = currentCenter.lat() + (targetLat - currentCenter.lat()) * easedProgress;
                const newLng = currentCenter.lng() + (targetLng - currentCenter.lng()) * easedProgress;
                const newZoom = currentZoom + (TARGET_ZOOM - currentZoom) * easedProgress;
                map.setCenter({ lat: newLat, lng: newLng });
                map.setZoom(newZoom);
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                map.setCenter({ lat: targetLat, lng: targetLng });
                map.setZoom(TARGET_ZOOM);
                previousLocation = { lat: targetLat, lng: targetLng };
                isAnimating = false;
                if (callback) callback();
              }
            }

            requestAnimationFrame(animate);
          }

          function panToEvent(lat, lng, index) {
            const idx = index - 1;

            // Restore previous marker to pin
            if (activeMarkerIndex >= 0 && markerObjects[activeMarkerIndex]) {
              setPinIcon(markerObjects[activeMarkerIndex], activeMarkerIndex);
            }
            activeMarkerIndex = idx;

            // Calculate offset so marker appears BELOW the tooltip
            const mapDiv = document.getElementById('map');
            const mapHeight = mapDiv.offsetHeight;
            const offsetPixels = mapHeight * 0.3;

            // Animate camera smoothly
            animateCamera(lat, lng, () => {
              setTimeout(() => {
                map.panBy(0, -offsetPixels);
                setTimeout(() => {
                  if (idx >= 0 && idx < markers.length) {
                    showTooltipForMarker(idx);
                  }
                }, 200);
              }, 100);
            });
          }

          function readMore() {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'readMore',
              eventIndex: activeMarkerIndex,
            }));
          }

          function startQuiz() {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'startQuiz',
              eventIndex: activeMarkerIndex,
            }));
          }

          function updateVisitedMarkers(visitedIds) {
            markers.forEach((m, i) => {
              m.isVisited = visitedIds.includes(m.id);
            });
            markerObjects.forEach((obj, i) => {
              if (i === activeMarkerIndex) return;
              obj.data.isVisited = markers[i]?.isVisited;
              setPinIcon(obj, i);
            });
          }

          function zoomIn() {
            map.setZoom(map.getZoom() + 1);
          }

          function zoomOut() {
            map.setZoom(map.getZoom() - 1);
          }

          window.initMap = initMap;
        </script>
      </body>
      </html>
    `;
  }
  const mapHTML = mapHTMLRef.current;

  // Web map HTML for iframe
  const webMapHTML = useMemo(() => {
    const markers = sortedEvents.map((event, index) => ({
      id: event.id,
      index: index + 1,
      lat: event.latitude,
      lng: event.longitude,
      title: event.title,
      description: event.description?.substring(0, 100) + '...' || '',
      location: event.location,
      category: event.category || 'life_event',
      categoryLabel: CATEGORY_LABELS_FR[event.category || 'life_event'] || 'événement',
      year: event.year,
      isVisited: false,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; width: 100%; background: #f5f1e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          #map { height: 100%; width: 100%; }

          /* Map type toggle button */
          .map-type-toggle {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 1000;
            display: flex;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            overflow: hidden;
          }
          .map-type-btn {
            padding: 10px 16px;
            border: none;
            background: white;
            color: #475569;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .map-type-btn:hover {
            background: #f1f5f9;
          }
          .map-type-btn.active {
            background: #0D5C63;
            color: white;
          }
          .map-type-btn:first-child {
            border-right: 1px solid #e2e8f0;
          }

          /* Modern Custom Info Window Styles - responsive for all screens */
          .custom-info-window {
            background: #ffffff;
            border-radius: 12px;
            min-width: 200px;
            max-width: min(280px, calc(100vw - 40px));
            width: min(280px, calc(100vw - 40px));
            box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: none;
          }
          .info-header {
            padding: 8px 10px;
            background: linear-gradient(135deg, #1e3a5f 0%, #0D5C63 50%, #0a4a50 100%);
            position: relative;
            overflow: hidden;
          }
          .info-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
            pointer-events: none;
          }
          .info-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0;
          }
          .info-category {
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            color: white;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: 1px solid rgba(255,255,255,0.2);
          }
          .info-year {
            color: #fbbf24;
            font-size: 14px;
            font-weight: 800;
            text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          .info-location {
            padding: 6px 10px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #334155;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-location-icon {
            font-size: 12px;
          }
          .info-counter {
            margin-left: auto;
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            padding: 2px 6px;
            border-radius: 12px;
            white-space: nowrap;
          }
          .info-content {
            padding: 8px 10px;
            display: flex;
            gap: 10px;
            background: #ffffff;
          }
          .info-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: linear-gradient(135deg, #0D5C63 0%, #1e3a5f 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 3px 8px rgba(13, 92, 99, 0.25);
            flex-shrink: 0;
          }
          .info-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
          }
          .info-title {
            color: #0f172a;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 2px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .info-desc {
            color: #475569;
            font-size: 11px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .info-footer {
            padding: 6px 10px 8px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          }
          .info-btn {
            width: 100%;
            text-decoration: none;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 3px 10px rgba(217, 119, 6, 0.35);
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .info-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 16px rgba(217, 119, 6, 0.45);
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }
          .info-btn:active {
            transform: translateY(-1px);
          }
          .info-quiz-btn {
            width: 100%;
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            background: linear-gradient(135deg, #0D5C63 0%, #0a4a50 100%);
            border: none;
            border-radius: 8px;
            padding: 6px 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(13, 92, 99, 0.25);
          }
          .info-quiz-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 14px rgba(13, 92, 99, 0.35);
          }

          /* Responsive adjustments for small screens */
          @media (max-width: 380px) {
            .custom-info-window { min-width: 180px; max-width: calc(100vw - 32px); }
            .info-header { padding: 6px 8px; }
            .info-category { font-size: 9px; padding: 2px 6px; }
            .info-year { font-size: 12px; }
            .info-location { padding: 4px 8px; font-size: 10px; }
            .info-counter { font-size: 8px; padding: 2px 5px; }
            .info-content { padding: 6px 8px; gap: 6px; }
            .info-icon { width: 30px; height: 30px; font-size: 15px; border-radius: 6px; }
            .info-title { font-size: 12px; }
            .info-desc { font-size: 10px; -webkit-line-clamp: 1; }
            .info-footer { padding: 5px 8px 6px; }
            .info-btn { padding: 6px 10px; font-size: 11px; }
            .info-quiz-btn { padding: 5px 8px; font-size: 10px; }
          }

          /* Hide default Google info window styling */
          .gm-style-iw-c {
            padding: 0 !important;
            border-radius: 16px !important;
            box-shadow: none !important;
          }
          .gm-style-iw-d {
            overflow: visible !important;
          }
          .gm-style-iw-tc {
            display: none !important;
          }
          .gm-ui-hover-effect {
            top: 8px !important;
            right: 8px !important;
            background: rgba(255,255,255,0.9) !important;
            border-radius: 50% !important;
            width: 28px !important;
            height: 28px !important;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDEwtaEWWtkJb6zyIyRQdxPMjmcpasx0H8&callback=initMap" async defer></script>
      </head>
      <body>
        <div id="map"></div>

        <!-- Map Type Toggle -->
        <div class="map-type-toggle">
          <button class="map-type-btn active" id="btn-roadmap" onclick="setMapType('roadmap')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
              <path d="M8 2v16M16 6v16"/>
            </svg>
            Carte
          </button>
          <button class="map-type-btn" id="btn-satellite" onclick="setMapType('hybrid')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Satellite
          </button>
        </div>

        <div id="tooltip" class="tooltip" style="display:none;">
          <div class="tooltip-header">
            <span id="tooltip-category" class="tooltip-category">événement</span>
            <span id="tooltip-year" class="tooltip-year">571</span>
          </div>
          <div class="tooltip-location">
            <span>📍</span>
            <span id="tooltip-location-text">Location</span>
            <span id="tooltip-counter" class="tooltip-counter">1 / 33</span>
          </div>
          <div class="tooltip-content">
            <div id="tooltip-image" class="tooltip-image">🕌</div>
            <div class="tooltip-text">
              <div id="tooltip-title" class="tooltip-title">Title</div>
              <div id="tooltip-desc" class="tooltip-desc">Description</div>
            </div>
          </div>
          <div class="tooltip-link">
            <a href="#" id="readmore-link">En savoir plus →</a>
          </div>
          <div class="tooltip-arrow"></div>
        </div>
        <script>
          const markers = ${JSON.stringify(markers)};
          const totalEvents = markers.length;
          let map, markerObjects = [], activeIdx = -1;
          let currentInfoWindow = null;
          let currentMapType = 'roadmap';
          const categoryIcons = { sacred: '🕋', battle: '⚔️', revelation: '📖', migration: '🐪', life_event: '🌟' };

          // Camel marker image URL for active event location
          window.camelMarkerUrl = 'https://d6artovf3mfn.cloudfront.net/images/Gemini_Generated_Image_8tspiy8tspiy8tsp-removebg-preview%20(1).png';

          // Lighter vintage/historical map style
          const mapStyle = [
            { elementType: "geometry", stylers: [{ color: "#f5f1e8" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#5c4a32" }] },
            { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c4a35a" }] },
            { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#8b7355" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6b5344" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8e0d0" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#7a6b5a" }] },
            { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#d4e5c7" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#e0d6c6" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d4c4a8" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c4a35a" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8c8d8" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5a7a8a" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#ebe5d8" }] },
          ];

          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 24.5, lng: 42.0 },
              zoom: 5,
              styles: mapStyle,
              disableDefaultUI: true,
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
              },
              backgroundColor: '#f5f1e8',
            });

            // Create markers - normal pins by default, camel only for active
            markers.forEach((m, idx) => {
              // Create normal pin marker icon (golden for unvisited, green for visited)
              const pinColor = m.isVisited ? '#22c55e' : '#c4a35a';
              const darkColor = m.isVisited ? '#15803d' : '#8b7355';
              const pinSvg = \`
                <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow\${idx}" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
                    </filter>
                    <linearGradient id="pinGrad\${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:\${pinColor};stop-opacity:1" />
                      <stop offset="100%" style="stop-color:\${darkColor};stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
                  <path d="M20 0C11.716 0 5 6.716 5 15c0 10.5 15 29 15 29s15-18.5 15-29C35 6.716 28.284 0 20 0z"
                        fill="url(#pinGrad\${idx})"
                        stroke="#ffffff"
                        stroke-width="2.5"
                        filter="url(#shadow\${idx})"/>
                  <circle cx="20" cy="15" r="6" fill="#ffffff"/>
                </svg>
              \`;

              const marker = new google.maps.Marker({
                position: { lat: m.lat, lng: m.lng },
                map: map,
                title: m.title,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
                  scaledSize: new google.maps.Size(40, 48),
                  anchor: new google.maps.Point(20, 44),
                },
                animation: google.maps.Animation.DROP,
                optimized: false,
              });

              // Create modern info window content
              const infoContent = \`
                <div class="custom-info-window">
                  <div class="info-header">
                    <div class="info-header-top">
                      <span class="info-category">\${m.categoryLabel}</span>
                      <span class="info-year">\${m.year}</span>
                    </div>
                  </div>
                  <div class="info-location">
                    <span class="info-location-icon">📍</span>
                    <span>\${m.location}</span>
                    <span class="info-counter">\${idx + 1} / \${totalEvents}</span>
                  </div>
                  <div class="info-content">
                    <div class="info-icon">\${categoryIcons[m.category] || '🌟'}</div>
                    <div class="info-text">
                      <div class="info-title">\${m.title}</div>
                      <div class="info-desc">\${m.description || 'Description non disponible.'}</div>
                    </div>
                  </div>
                  <div class="info-footer">
                    <button class="info-btn" onclick="readMore(\${idx})">
                      <span>En savoir plus</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <button class="info-quiz-btn" onclick="startQuiz(\${idx})">
                      <span>❓</span>
                      <span>Testez vos connaissances</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              \`;

              const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
                maxWidth: Math.min(280, window.innerWidth - 40),
              });

              marker.addListener('click', () => {
                selectMarker(idx);
              });

              // Add bounce animation on hover
              marker.addListener('mouseover', () => {
                if (activeIdx !== idx) {
                  marker.setAnimation(google.maps.Animation.BOUNCE);
                  setTimeout(() => marker.setAnimation(null), 700);
                }
              });

              markerObjects.push({ marker, infoWindow, data: m });
            });

            // Listen for messages from parent
            window.addEventListener('message', (e) => {
              if (e.data?.type === 'panToEvent') {
                panToEvent(e.data.lat, e.data.lng, e.data.index);
              } else if (e.data?.type === 'updateVisited') {
                // Update visited state for markers without reloading iframe
                const visitedIds = e.data.visitedIds || [];
                markers.forEach((m, i) => {
                  m.isVisited = visitedIds.includes(m.id);
                });
                // Refresh non-active marker icons to reflect visited state
                markerObjects.forEach((obj, i) => {
                  if (i === activeIdx) return; // Don't change the active camel marker
                  const isVisited = obj.data.isVisited || markers[i]?.isVisited;
                  const pinColor = isVisited ? '#22c55e' : '#c4a35a';
                  const darkColor = isVisited ? '#15803d' : '#8b7355';
                  const pinSvg = '<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pS' + i + '" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/></filter><linearGradient id="pG' + i + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:' + pinColor + ';stop-opacity:1" /><stop offset="100%" style="stop-color:' + darkColor + ';stop-opacity:1" /></linearGradient></defs><ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/><path d="M20 0C11.716 0 5 6.716 5 15c0 10.5 15 29 15 29s15-18.5 15-29C35 6.716 28.284 0 20 0z" fill="url(#pG' + i + ')" stroke="#ffffff" stroke-width="2.5" filter="url(#pS' + i + ')"/><circle cx="20" cy="15" r="6" fill="#ffffff"/></svg>';
                  obj.marker.setIcon({
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
                    scaledSize: new google.maps.Size(40, 48),
                    anchor: new google.maps.Point(20, 44),
                  });
                });
              }
            });

            if (markers.length > 0) {
              setTimeout(() => selectMarker(0), 1000);
            }
          }

          function setMapType(type) {
            currentMapType = type;
            if (type === 'roadmap') {
              map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
              map.setOptions({ styles: mapStyle });
              document.getElementById('btn-roadmap').classList.add('active');
              document.getElementById('btn-satellite').classList.remove('active');
            } else {
              map.setMapTypeId(google.maps.MapTypeId.HYBRID);
              map.setOptions({ styles: [] });
              document.getElementById('btn-satellite').classList.add('active');
              document.getElementById('btn-roadmap').classList.remove('active');
            }
          }

          // Store previous location for smooth transitions
          let previousLocation = null;
          let isAnimating = false;
          const INITIAL_ZOOM = 5;
          const TARGET_ZOOM = 11;
          const TRANSITION_ZOOM = 6; // Zoom level when transitioning between distant locations

          // Calculate distance between two points (in degrees, approximate)
          function getDistance(lat1, lng1, lat2, lng2) {
            return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
          }

          // Smooth easing function
          function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          }

          // Animate camera smoothly with zoom out -> pan -> zoom in
          function animateCamera(targetLat, targetLng, callback) {
            if (isAnimating) return;
            isAnimating = true;

            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            const distance = previousLocation
              ? getDistance(previousLocation.lat, previousLocation.lng, targetLat, targetLng)
              : 0;

            // Determine if we need to zoom out first (for distant locations)
            const needsZoomOut = distance > 0.5; // More than ~50km apart
            const zoomOutLevel = needsZoomOut ? Math.max(TRANSITION_ZOOM, currentZoom - 4) : currentZoom;

            const animationDuration = needsZoomOut ? 2000 : 1200; // Longer for distant transitions
            const startTime = performance.now();

            function animate(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              const easedProgress = easeInOutCubic(progress);

              if (needsZoomOut) {
                // Three-phase animation: zoom out -> pan -> zoom in
                if (progress < 0.3) {
                  // Phase 1: Zoom out
                  const phaseProgress = progress / 0.3;
                  const zoomProgress = easeInOutCubic(phaseProgress);
                  const newZoom = currentZoom - (currentZoom - zoomOutLevel) * zoomProgress;
                  map.setZoom(newZoom);
                } else if (progress < 0.7) {
                  // Phase 2: Pan to new location
                  const phaseProgress = (progress - 0.3) / 0.4;
                  const panProgress = easeInOutCubic(phaseProgress);
                  const newLat = currentCenter.lat() + (targetLat - currentCenter.lat()) * panProgress;
                  const newLng = currentCenter.lng() + (targetLng - currentCenter.lng()) * panProgress;
                  map.setCenter({ lat: newLat, lng: newLng });
                  map.setZoom(zoomOutLevel);
                } else {
                  // Phase 3: Zoom in to target
                  const phaseProgress = (progress - 0.7) / 0.3;
                  const zoomProgress = easeInOutCubic(phaseProgress);
                  const newZoom = zoomOutLevel + (TARGET_ZOOM - zoomOutLevel) * zoomProgress;
                  map.setCenter({ lat: targetLat, lng: targetLng });
                  map.setZoom(newZoom);
                }
              } else {
                // Simple smooth pan and zoom for nearby locations
                const newLat = currentCenter.lat() + (targetLat - currentCenter.lat()) * easedProgress;
                const newLng = currentCenter.lng() + (targetLng - currentCenter.lng()) * easedProgress;
                const newZoom = currentZoom + (TARGET_ZOOM - currentZoom) * easedProgress;
                map.setCenter({ lat: newLat, lng: newLng });
                map.setZoom(newZoom);
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Animation complete
                map.setCenter({ lat: targetLat, lng: targetLng });
                map.setZoom(TARGET_ZOOM);
                previousLocation = { lat: targetLat, lng: targetLng };
                isAnimating = false;
                if (callback) callback();
              }
            }

            requestAnimationFrame(animate);
          }

          function selectMarker(idx) {
            const m = markers[idx];
            const markerObj = markerObjects[idx];
            if (!m || !markerObj) return;

            // Close previous info window
            if (currentInfoWindow) {
              currentInfoWindow.close();
            }

            // Update marker icons - camel image for active, normal pins for others
            markerObjects.forEach((obj, i) => {
              const isActive = i === idx;
              const isVisited = obj.data.isVisited || i <= idx;

              if (isActive) {
                // Use the camel image for active marker (larger size 120x120)
                obj.marker.setIcon({
                  url: window.camelMarkerUrl || 'https://d6artovf3mfn.cloudfront.net/images/Gemini_Generated_Image_8tspiy8tspiy8tsp-removebg-preview%20(1).png',
                  scaledSize: new google.maps.Size(120, 120),
                  anchor: new google.maps.Point(60, 105),
                });
              } else {
                // Normal pin icon for non-active markers
                const pinColor = isVisited ? '#22c55e' : '#c4a35a';
                const darkColor = isVisited ? '#15803d' : '#8b7355';
                const pinSvg = \`
                  <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="pinShadow\${i}" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
                      </filter>
                      <linearGradient id="pinGrad\${i}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:\${pinColor};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:\${darkColor};stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="20" cy="44" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
                    <path d="M20 0C11.716 0 5 6.716 5 15c0 10.5 15 29 15 29s15-18.5 15-29C35 6.716 28.284 0 20 0z"
                          fill="url(#pinGrad\${i})"
                          stroke="#ffffff"
                          stroke-width="2.5"
                          filter="url(#pinShadow\${i})"/>
                    <circle cx="20" cy="15" r="6" fill="#ffffff"/>
                  </svg>
                \`;
                obj.marker.setIcon({
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
                  scaledSize: new google.maps.Size(40, 48),
                  anchor: new google.maps.Point(20, 44),
                });
              }

              obj.marker.setZIndex(isActive ? 1000 : i);
            });

            activeIdx = idx;

            // Calculate offset for info window positioning
            const mapDiv = document.getElementById('map');
            const mapHeight = mapDiv.offsetHeight;
            const offsetPixels = mapHeight * 0.25;

            // Animate camera smoothly to the new location
            animateCamera(m.lat, m.lng, () => {
              // After animation, offset for info window and open it
              setTimeout(() => {
                map.panBy(0, offsetPixels);
                setTimeout(() => {
                  markerObj.infoWindow.open(map, markerObj.marker);
                  currentInfoWindow = markerObj.infoWindow;
                  // Bounce the marker after info window opens
                  markerObj.marker.setAnimation(google.maps.Animation.BOUNCE);
                  setTimeout(() => markerObj.marker.setAnimation(null), 1400);
                }, 200);
              }, 100);
            });

            // Notify parent
            window.parent.postMessage({ type: 'markerSelected', index: idx, id: m.id }, '*');
          }

          function panToEvent(lat, lng, index) {
            // Animate camera smoothly
            animateCamera(lat, lng, () => {
              // Select the marker after camera animation completes
              if (index >= 0) {
                setTimeout(() => selectMarker(index), 100);
              }
            });
          }

          function readMore(idx) {
            window.parent.postMessage({ type: 'readMore', index: idx }, '*');
          }

          function startQuiz(idx) {
            window.parent.postMessage({ type: 'startQuiz', index: idx }, '*');
          }
        </script>
      </body>
      </html>
    `;
  }, [sortedEvents]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setMapReady(true);
      } else if (data.type === 'markerClick') {
        navigateToEvent(data.eventIndex);
      } else if (data.type === 'readMore') {
        setShowDetailModal(true);
      } else if (data.type === 'startQuiz') {
        const evt = sortedEvents[data.eventIndex];
        if (evt) {
          router.push(`/quiz/play?eventId=${evt.id}`);
        }
      }
    } catch (e) {
      console.error('WebView message error:', e);
    }
  }, [navigateToEvent, sortedEvents]);

  // Listen for messages from web iframe
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'markerSelected') {
          setCurrentEventIndex(event.data.index);
          const evt = sortedEvents[event.data.index];
          if (evt) {
            selectEvent(evt);
            markEventVisited(evt.id);
            setShowEventPopup(true);
            Animated.spring(popupAnim, {
              toValue: 1,
              useNativeDriver: true,
              friction: 8,
            }).start();
          }
        } else if (event.data?.type === 'readMore') {
          setShowDetailModal(true);
        } else if (event.data?.type === 'startQuiz') {
          const evt = sortedEvents[event.data.index];
          if (evt) {
            router.push(`/quiz/play?eventId=${evt.id}`);
          }
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [sortedEvents, selectEvent, markEventVisited, popupAnim]);

  // Send visited state updates without reloading the map
  useEffect(() => {
    if (visitedEventIds.length > 0) {
      if (Platform.OS === 'web') {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'updateVisited',
            visitedIds: visitedEventIds,
          }, '*');
        }
      } else if (webViewRef.current && mapReady) {
        webViewRef.current.injectJavaScript(
          `if(typeof updateVisitedMarkers==='function'){updateVisitedMarkers(${JSON.stringify(visitedEventIds)});}true;`
        );
      }
    }
  }, [visitedEventIds, mapReady]);

  // Text-to-speech for event
  const speakEvent = (event: SeerahEventWithMeta) => {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${event.title}. ${event.description || ''}`
        );
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    } else if (Speech) {
      Speech.speak(`${event.title}. ${event.description || ''}`, {
        language: 'fr-FR',
        pitch: 1,
        rate: 0.9,
      });
    }
  };

  // Get year range for timeline
  const yearRange = useMemo(() => {
    if (sortedEvents.length === 0) return { min: 571, max: 632 };
    const years = sortedEvents.map(e => parseInt(e.year?.toString() || '0')).filter(y => y > 0);
    return {
      min: Math.min(...years, 571),
      max: Math.max(...years, 632),
    };
  }, [sortedEvents]);

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#0a0f1a', '#0f172a', '#1e293b']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement de l'Atlas...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#0a0f1a', '#0f172a', '#1e293b']}
          style={styles.loadingGradient}
        >
          <FontAwesome5 name="exclamation-triangle" size={48} color={colors.accent} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Erreur de chargement
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0a0f1a', '#0f172a']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/sunnah')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.accent }]}>
            Atlas de la Sîra
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Biographie du Prophète Muhammad ﷺ
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowHelpModal(true)}
          >
            <Ionicons name="help-circle-outline" size={26} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={webMapHTML}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#f5f1e8',
            }}
            allow="geolocation"
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHTML }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mixedContentMode="always"
            originWhitelist={['*']}
            allowFileAccess
            allowUniversalAccessFromFileURLs
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.mapLoading, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            )}
          />
        )}

        {/* Map Controls - Only for native */}
        {Platform.OS !== 'web' && (
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: colors.card }]}
              onPress={() => webViewRef.current?.injectJavaScript('zoomIn(); true;')}
            >
              <Ionicons name="add" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: colors.card }]}
              onPress={() => webViewRef.current?.injectJavaScript('zoomOut(); true;')}
            >
              <Ionicons name="remove" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Timeline Strip */}
      <LinearGradient
        colors={['#0f172a', '#1e3a5f', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.timelineContainer}
      >
        <TouchableOpacity
          style={[styles.navArrow, { opacity: currentEventIndex > 0 ? 1 : 0.3 }]}
          onPress={goToPreviousEvent}
          disabled={currentEventIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>

        <View style={styles.timelineInfo}>
          <Text style={[styles.timelineYear, { color: colors.accentLight }]}>
            {currentEvent?.year || '---'}
          </Text>
          <Text style={[styles.timelineTitle, { color: colors.text }]} numberOfLines={1}>
            {currentEvent?.title || 'Sélectionnez un événement'}
          </Text>
        </View>

        <Text style={[styles.timelineCounter, { color: colors.textSecondary }]}>
          Événement {currentEventIndex + 1}/{sortedEvents.length}
        </Text>

        <TouchableOpacity
          style={[styles.navArrow, { opacity: currentEventIndex < sortedEvents.length - 1 ? 1 : 0.3 }]}
          onPress={goToNextEvent}
          disabled={currentEventIndex >= sortedEvents.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.accent} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Timeline Dots - Evenly spaced like Seerah Atlas */}
      <View style={[styles.timelineDots, { backgroundColor: colors.headerBg }]}>
        <Text style={[styles.timelineYearLabel, { color: colors.textSecondary }]}>
          {yearRange.min}
        </Text>
        <View style={styles.timelineTrack}>
          {/* Background track line */}
          <View style={[styles.timelineTrackLine, { backgroundColor: colors.cardBorder }]} />
          {/* Progress line up to current event */}
          <View
            style={[
              styles.timelineProgressLine,
              {
                backgroundColor: colors.accent,
                width: `${((currentEventIndex + 1) / sortedEvents.length) * 100}%`
              }
            ]}
          />
          {/* Event dots container */}
          <View style={styles.timelineDotsRow}>
            {sortedEvents.map((event, index) => {
              const isActive = index === currentEventIndex;
              const isVisited = visitedEventIds.includes(event.id);

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.timelineDot,
                    isActive && styles.timelineDotActive,
                    {
                      backgroundColor: isActive ? colors.accentLight :
                                      isVisited ? colors.success : colors.accent,
                    },
                  ]}
                  onPress={() => navigateToEvent(index)}
                />
              );
            })}
          </View>
        </View>
        <Text style={[styles.timelineYearLabel, { color: colors.textSecondary }]}>
          {yearRange.max}
        </Text>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        {currentEvent && (
          <View style={styles.modalOverlay}>
            <View style={[styles.detailModal, { backgroundColor: colors.card }]}>
              <LinearGradient
                colors={['#1e3a5f', colors.card]}
                style={styles.modalHeader}
              >
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>

                <View style={[styles.modalCategoryTag, { backgroundColor: colors.accent }]}>
                  <Text style={styles.categoryTagText}>
                    {CATEGORY_LABELS_FR[currentEvent.category || 'life_event']}
                  </Text>
                </View>

                <Text style={[styles.modalYear, { color: colors.accentLight }]}>
                  {currentEvent.year}
                </Text>

                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {currentEvent.title}
                </Text>

                <View style={styles.modalLocation}>
                  <FontAwesome5 name="map-marker-alt" size={14} color={colors.accent} />
                  <Text style={[styles.modalLocationText, { color: colors.textSecondary }]}>
                    {currentEvent.location}
                  </Text>
                </View>
              </LinearGradient>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {currentEvent.description && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                      <FontAwesome5 name="scroll" size={14} /> Description
                    </Text>
                    <Text style={[styles.modalSectionText, { color: colors.textSecondary }]}>
                      {currentEvent.description}
                    </Text>
                  </View>
                )}

                {currentEvent.historical_significance && (
                  <View style={[styles.modalSection, styles.significanceBox, { backgroundColor: 'rgba(217, 119, 6, 0.1)', borderLeftColor: colors.accent }]}>
                    <Text style={[styles.modalSectionTitle, { color: colors.accent }]}>
                      <FontAwesome5 name="star" size={14} /> Signification Historique
                    </Text>
                    <Text style={[styles.modalSectionText, { color: colors.textSecondary }]}>
                      {currentEvent.historical_significance}
                    </Text>
                  </View>
                )}

                <View style={styles.coordinatesContainer}>
                  <View style={[styles.coordBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Latitude</Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {currentEvent.latitude?.toFixed(4)}°
                    </Text>
                  </View>
                  <View style={[styles.coordBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Longitude</Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {currentEvent.longitude?.toFixed(4)}°
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => speakEvent(currentEvent)}
                  >
                    <FontAwesome5 name="volume-up" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Écouter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      setShowDetailModal(false);
                      if (Platform.OS === 'web') {
                        const iframe = document.querySelector('iframe');
                        iframe?.contentWindow?.postMessage({
                          type: 'panToEvent',
                          lat: currentEvent.latitude,
                          lng: currentEvent.longitude,
                          index: currentEventIndex,
                        }, '*');
                      } else if (webViewRef.current && currentEvent.latitude && currentEvent.longitude) {
                        webViewRef.current.injectJavaScript(
                          `panToEvent(${currentEvent.latitude}, ${currentEvent.longitude}, ${currentEventIndex + 1}); true;`
                        );
                      }
                    }}
                  >
                    <FontAwesome5 name="search-location" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Localiser</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.helpOverlay}>
          <View style={[styles.helpModal, { backgroundColor: colors.card }]}>
            <View style={styles.helpHeader}>
              <Text style={[styles.helpTitle, { color: colors.accent }]}>
                <FontAwesome5 name="question-circle" size={20} /> Guide d'utilisation
              </Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                  <FontAwesome5 name="map-marked-alt" size={18} color={colors.accent} />
                </View>
                <View style={styles.helpText}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Explorer la carte
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Touchez les points dorés sur la carte pour découvrir les {sortedEvents.length} événements de la vie du Prophète ﷺ.
                  </Text>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                  <Ionicons name="chevron-back-outline" size={18} color={colors.accentLight} />
                  <Ionicons name="chevron-forward-outline" size={18} color={colors.accentLight} />
                </View>
                <View style={styles.helpText}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Naviguer dans le temps
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Utilisez les flèches ou la frise chronologique pour parcourir les événements dans l'ordre.
                  </Text>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <FontAwesome5 name="trophy" size={18} color={colors.success} />
                </View>
                <View style={styles.helpText}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Progresser
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Chaque événement consulté est marqué comme "découvert". Essayez de tous les explorer!
                  </Text>
                </View>
              </View>

              <View style={[styles.helpTip, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                <Text style={styles.helpTipEmoji}>💡</Text>
                <Text style={[styles.helpTipText, { color: colors.textSecondary }]}>
                  Les points verts indiquent les événements déjà découverts.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.helpCloseBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.helpCloseBtnText}>J'ai compris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  helpButton: {
    padding: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  streakEmoji: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navArrow: {
    padding: 8,
  },
  timelineInfo: {
    flex: 1,
    alignItems: 'center',
  },
  timelineYear: {
    fontSize: 16,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineCounter: {
    fontSize: 11,
    marginRight: 8,
  },
  timelineDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timelineYearLabel: {
    fontSize: 11,
    fontWeight: '600',
    width: 28,
    textAlign: 'center',
  },
  timelineTrack: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 8,
  },
  timelineTrackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  timelineProgressLine: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 1.5,
  },
  timelineDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timelineDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fbbf24',
    transform: [{ scale: 1.2 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  detailModal: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    paddingTop: 16,
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  modalCategoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalYear: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  modalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalLocationText: {
    fontSize: 14,
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalSectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  significanceBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  coordBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helpModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 14,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  helpText: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpItemDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  helpTip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  helpTipEmoji: {
    fontSize: 18,
  },
  helpTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  helpCloseBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpCloseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
