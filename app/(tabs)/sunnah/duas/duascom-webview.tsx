import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { WebView } from 'react-native-webview';

const ACCENT_COLOR = '#8DB600';

export default function DuasComWebViewScreen() {
  const params = useLocalSearchParams<{
    url: string;
    title: string;
  }>();

  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const url = params.url || 'https://duas.com';
  const title = params.title || 'Duas.com';

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f5f5f5',
    header: darkMode ? '#1a1a2e' : '#ffffff',
    headerBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    accent: ACCENT_COLOR,
    loading: darkMode ? '#ffffff' : '#333333',
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      router.back();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n${url}`,
        url: url,
      });
    } catch (e) {
      // ignore
    }
  };

  // On web platform, use an iframe since react-native-webview doesn't work on web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.header,
              borderBottomColor: colors.headerBorder,
              paddingTop: 20 + 10,
            },
          ]}
        >
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.headerUrl, { color: colors.textSecondary }]} numberOfLines={1}>
              {url}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => window.open(url, '_blank')}
          >
            <MaterialCommunityIcons name="open-in-new" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Iframe for web */}
        <iframe
          src={url}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
          } as any}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </View>
    );
  }

  // Native platform: use WebView
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.header,
            borderBottomColor: colors.headerBorder,
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.headerUrl, { color: colors.textSecondary }]} numberOfLines={1}>
            duas.com
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={[styles.webview, loading && styles.webviewHidden]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        startInLoadingState={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        sharedCookiesEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerUrl: {
    fontSize: 12,
    marginTop: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  webviewHidden: {
    opacity: 0,
  },
});
