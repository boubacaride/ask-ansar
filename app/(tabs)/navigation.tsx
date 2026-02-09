import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigationStore, SavedLocation } from '@/store/navigationstore';
import { useSettings } from '@/store/settingsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Geocoding API - using OpenStreetMap Nominatim (free)
const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'AskAnsarApp/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocoding
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'AskAnsarApp/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export default function NavigationScreen() {
  const { darkMode } = useSettings();
  const {
    savedLocations,
    selectedDestination,
    currentLocation,
    addLocation,
    removeLocation,
    setSelectedDestination,
    setCurrentLocation,
  } = useNavigationStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  
  // Form state
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState<'current' | 'address'>('current');
  const [addressInput, setAddressInput] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  
  // Animation
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Get user's current location on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 1;
    Animated.spring(dropdownAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openAddModal = () => {
    setIsDropdownOpen(false);
    setIsAddModalOpen(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeAddModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsAddModalOpen(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setLocationName('');
    setLocationType('current');
    setAddressInput('');
    setCoordinates({ lat: '', lon: '' });
  };

const handleUseCurrentLocation = async () => {
      setIsLoadingLocation(true);
      try {
              // Use browser's native Geolocation API for web
              if (Platform.OS === 'web') {
                        if (!navigator.geolocation) {
                                    Alert.alert('Error', 'Geolocation is not supported by your browser.');
                                    return;
                        }

                        navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                                  const { latitude, longitude } = position.coords;
                                                  setCoordinates({
                                                                  lat: latitude.toFixed(6),
                                                                  lon: longitude.toFixed(6),
                                                  });

                                                  // Get address from coordinates
                                                  const address = await reverseGeocode(latitude, longitude);
                                                  if (address) {
                                                                  setAddressInput(address);
                                                  }
                                                  setIsLoadingLocation(false);
                                    },
                                    (error) => {
                                                  console.error('Geolocation error:', error);
                                                  Alert.alert('Error', 'Failed to get current location. Please enable location services.');
                                                  setIsLoadingLocation(false);
                                    },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                                  );
              } else {
                        // Use expo-location for native platforms
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== 'granted') {
                                    Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
                                    return;
                        }

                        const location = await Location.getCurrentPositionAsync({
                                    accuracy: Location.Accuracy.High,
                        });

                        setCoordinates({
                                    lat: location.coords.latitude.toFixed(6),
                                    lon: location.coords.longitude.toFixed(6),
                        });

                        // Get address from coordinates
                        const address = await reverseGeocode(
                                    location.coords.latitude,
                                    location.coords.longitude
                                  );
                        if (address) {
                                    setAddressInput(address);
                        }
                        setIsLoadingLocation(false);
              }
      } catch (error) {
              Alert.alert('Error', 'Failed to get current location. Please try again.');
              setIsLoadingLocation(false);
      }
};
                        
  const handleAddressLookup = async () => {
    if (!addressInput.trim()) {
      Alert.alert('Error', 'Please enter an address.');
      return;
    }

    setIsGeocodingAddress(true);
    try {
      const coords = await geocodeAddress(addressInput);
      if (coords) {
        setCoordinates({
          lat: coords.lat.toFixed(6),
          lon: coords.lon.toFixed(6),
        });
      } else {
        Alert.alert('Not Found', 'Could not find coordinates for this address. Please try a different address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup address. Please try again.');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const handleSaveLocation = () => {
    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name.');
      return;
    }

    if (!coordinates.lat || !coordinates.lon) {
      Alert.alert('Error', 'Please get coordinates by using your current location or entering an address.');
      return;
    }

    const userLocations = savedLocations.filter(loc => !loc.isPreset);
    if (userLocations.length >= 10) {
      Alert.alert('Limit Reached', 'You can only save up to 10 custom locations. Please delete an existing location first.');
      return;
    }

    const success = addLocation({
      name: locationName.trim(),
      latitude: parseFloat(coordinates.lat),
      longitude: parseFloat(coordinates.lon),
      address: addressInput || undefined,
    });

    if (success) {
      Alert.alert('Success', 'Location saved successfully!');
      closeAddModal();
    } else {
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  const handleSelectDestination = (location: SavedLocation) => {
    setSelectedDestination(location);
    setIsDropdownOpen(false);
  };

const handleDeleteLocation = (location: SavedLocation) => {
      if (location.isPreset) {
              Alert.alert('Cannot Delete', 'The Kaaba location cannot be deleted.');
              return;
      }

      // Use window.confirm for web, Alert.alert for native
      if (Platform.OS === 'web') {
              const confirmed = window.confirm(`Are you sure you want to delete "${location.name}"?`);
              if (confirmed) {
                        removeLocation(location.id);
              }
      } else {
              Alert.alert(
                        'Delete Location',
                        `Are you sure you want to delete "${location.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: () => removeLocation(location.id),
                          },
                                  ]
                      );
      }
};
                          
  const startNavigation = () => {
    if (!selectedDestination) {
      Alert.alert('No Destination', 'Please select a destination from the dropdown menu.');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services to start navigation.');
      requestLocationPermission();
      return;
    }

    setIsNavigating(true);

    // Open in native maps app with turn-by-turn directions
    const { latitude, longitude } = selectedDestination;
    const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    const destination = `${latitude},${longitude}`;

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });

    const url = Platform.select({
      ios: `maps://app?saddr=${origin}&daddr=${destination}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}&mode=d`,
      default: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
    });

    Linking.canOpenURL(url as string)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url as string);
        } else {
          // Fallback to Google Maps web
          return Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
          );
        }
      })
      .catch((err) => {
        console.error('Navigation error:', err);
        Alert.alert('Error', 'Could not open maps application.');
      })
      .finally(() => {
        setIsNavigating(false);
      });
  };

  const formatCoordinate = (value: number, type: 'lat' | 'lon') => {
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  const userLocationsCount = savedLocations.filter(loc => !loc.isPreset).length;

  // Theme colors
  const colors = {
    background: darkMode ? ['#0a0a0a', '#1a1a2e'] : ['#f8f9fa', '#e9ecef'],
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    primaryLight: '#4db6ac',
    accent: '#ffd54f',
    danger: '#ef5350',
    success: '#66bb6a',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
    inputBorder: darkMode ? '#3d3d5c' : '#ced4da',
    kaaba: '#c9a227',
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa' }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f8f9fa', '#e3f2fd', '#bbdefb']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <FontAwesome5 name="compass" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Navigation</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Find your way to sacred places
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Current Location Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={22} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Your Location</Text>
            </View>
            {currentLocation ? (
              <View style={styles.locationInfo}>
                <Text style={[styles.coordinateText, { color: colors.textSecondary }]}>
                  {formatCoordinate(currentLocation.latitude, 'lat')}, {formatCoordinate(currentLocation.longitude, 'lon')}
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={requestLocationPermission}
                >
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.enableLocationButton, { backgroundColor: colors.primary }]}
                onPress={requestLocationPermission}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.enableLocationText}>Enable Location</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Destination Dropdown */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="map-marker-alt" size={20} color={colors.danger} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Destination</Text>
              <Text style={[styles.locationCount, { color: colors.textSecondary }]}>
                {userLocationsCount}/10 saved
              </Text>
            </View>

            {/* Dropdown Button */}
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              onPress={toggleDropdown}
              activeOpacity={0.8}
            >
              {selectedDestination ? (
                <View style={styles.selectedDestination}>
                  {selectedDestination.isPreset ? (
                    <FontAwesome5 name="kaaba" size={18} color={colors.kaaba} />
                  ) : (
                    <Ionicons name="bookmark" size={18} color={colors.primary} />
                  )}
                  <Text style={[styles.dropdownText, { color: colors.text }]} numberOfLines={1}>
                    {selectedDestination.name}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.dropdownPlaceholder, { color: colors.textSecondary }]}>
                  Select a destination...
                </Text>
              )}
              <Animated.View
                style={{
                  transform: [{
                    rotate: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  }],
                }}
              >
                <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
              </Animated.View>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <Animated.View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    opacity: dropdownAnim,
                    transform: [{
                      translateY: dropdownAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    }],
                  },
                ]}
              >
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {savedLocations.map((location) => (
                    <View
                      key={location.id}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.cardBorder },
                        selectedDestination?.id === location.id && { backgroundColor: darkMode ? '#252538' : '#e3f2fd' },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.dropdownItemContent}
                        onPress={() => handleSelectDestination(location)}
                      >
                        {location.isPreset ? (
                          <View style={[styles.locationIcon, { backgroundColor: '#fef3c7' }]}>
                            <FontAwesome5 name="kaaba" size={16} color={colors.kaaba} />
                          </View>
                        ) : (
                          <View style={[styles.locationIcon, { backgroundColor: darkMode ? '#1e3a3a' : '#e0f2f1' }]}>
                            <Ionicons name="bookmark" size={16} color={colors.primary} />
                          </View>
                        )}
                        <View style={styles.dropdownItemText}>
                          <Text style={[styles.dropdownItemName, { color: colors.text }]} numberOfLines={1}>
                            {location.name}
                          </Text>
                          <Text style={[styles.dropdownItemCoords, { color: colors.textSecondary }]}>
                            {formatCoordinate(location.latitude, 'lat')}, {formatCoordinate(location.longitude, 'lon')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {!location.isPreset && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteLocation(location)}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                      {location.isPreset && (
                        <View style={styles.presetBadge}>
                          <Text style={styles.presetBadgeText}>PRESET</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Add New Location Button */}
                  <TouchableOpacity
                    style={[styles.addLocationButton, { borderColor: colors.primary }]}
                    onPress={openAddModal}
                  >
                    <Ionicons name="add-circle" size={22} color={colors.primary} />
                    <Text style={[styles.addLocationText, { color: colors.primary }]}>
                      Add New Location
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {/* Selected Destination Details */}
          {selectedDestination && (
            <View style={[styles.card, styles.destinationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.destinationHeader}>
                {selectedDestination.isPreset ? (
                  <View style={[styles.destinationIcon, { backgroundColor: '#fef3c7' }]}>
                    <FontAwesome5 name="kaaba" size={24} color={colors.kaaba} />
                  </View>
                ) : (
                  <View style={[styles.destinationIcon, { backgroundColor: darkMode ? '#1e3a3a' : '#e0f2f1' }]}>
                    <FontAwesome5 name="map-marker-alt" size={24} color={colors.primary} />
                  </View>
                )}
                <View style={styles.destinationInfo}>
                  <Text style={[styles.destinationName, { color: colors.text }]}>
                    {selectedDestination.name}
                  </Text>
                  <Text style={[styles.destinationCoords, { color: colors.textSecondary }]}>
                    {formatCoordinate(selectedDestination.latitude, 'lat')}, {formatCoordinate(selectedDestination.longitude, 'lon')}
                  </Text>
                  {selectedDestination.address && (
                    <Text style={[styles.destinationAddress, { color: colors.textSecondary }]} numberOfLines={2}>
                      {selectedDestination.address}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Start Navigation Button */}
          <TouchableOpacity
            style={[
              styles.navigationButton,
              { opacity: selectedDestination && currentLocation ? 1 : 0.5 },
            ]}
            onPress={startNavigation}
            disabled={!selectedDestination || !currentLocation || isNavigating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00897b', '#00695c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navigationButtonGradient}
            >
              {isNavigating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="navigation" size={26} color="#fff" />
                  <Text style={styles.navigationButtonText}>Start Navigation</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.navigationHint, { color: colors.textSecondary }]}>
            Opens turn-by-turn directions in your maps app
          </Text>
        </ScrollView>

        {/* Add Location Modal */}
        <Modal
          visible={isAddModalOpen}
          transparent
          animationType="fade"
          onRequestClose={closeAddModal}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                  transform: [{
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  }],
                  opacity: modalAnim,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Location</Text>
                <TouchableOpacity onPress={closeAddModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Location Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Location Name *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholder="e.g., My Home, Work, Mosque"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Location Type Selection */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Get Coordinates</Text>
                  <View style={styles.typeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        { borderColor: colors.inputBorder },
                        locationType === 'current' && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setLocationType('current')}
                    >
                      <Ionicons
                        name="navigate"
                        size={18}
                        color={locationType === 'current' ? '#fff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: locationType === 'current' ? '#fff' : colors.textSecondary },
                        ]}
                      >
                        My Location
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        { borderColor: colors.inputBorder },
                        locationType === 'address' && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setLocationType('address')}
                    >
                      <Ionicons
                        name="search"
                        size={18}
                        color={locationType === 'address' ? '#fff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: locationType === 'address' ? '#fff' : colors.textSecondary },
                        ]}
                      >
                        Enter Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Current Location Button */}
                {locationType === 'current' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                    onPress={handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <>
                        <Ionicons name="locate" size={22} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                          Use My Current Location
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Address Input */}
                {locationType === 'address' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
                    <View style={styles.addressInputRow}>
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.addressInput,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                        ]}
                        value={addressInput}
                        onChangeText={setAddressInput}
                        placeholder="Enter full address..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                      />
                      <TouchableOpacity
                        style={[styles.lookupButton, { backgroundColor: colors.primary }]}
                        onPress={handleAddressLookup}
                        disabled={isGeocodingAddress}
                      >
                        {isGeocodingAddress ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Ionicons name="search" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Coordinates Display */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Coordinates</Text>
                  <View style={styles.coordinatesRow}>
                    <View style={[styles.coordinateBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                      <Text style={[styles.coordinateLabel, { color: colors.textSecondary }]}>Latitude</Text>
                      <Text style={[styles.coordinateValue, { color: coordinates.lat ? colors.text : colors.textSecondary }]}>
                        {coordinates.lat ? `${coordinates.lat}°` : '—'}
                      </Text>
                    </View>
                    <View style={[styles.coordinateBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                      <Text style={[styles.coordinateLabel, { color: colors.textSecondary }]}>Longitude</Text>
                      <Text style={[styles.coordinateValue, { color: coordinates.lon ? colors.text : colors.textSecondary }]}>
                        {coordinates.lon ? `${coordinates.lon}°` : '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
                  onPress={closeAddModal}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { opacity: locationName && coordinates.lat && coordinates.lon ? 1 : 0.5 },
                  ]}
                  onPress={handleSaveLocation}
                  disabled={!locationName || !coordinates.lat || !coordinates.lon}
                >
                  <LinearGradient
                    colors={['#00897b', '#00695c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Location</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </LinearGradient>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  locationCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coordinateText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  refreshButton: {
    padding: 8,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  enableLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 15,
  },
  dropdownMenu: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  dropdownItemCoords: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  presetBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  presetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addLocationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  destinationCard: {
    marginTop: 0,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  destinationIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  destinationCoords: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  navigationButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#00897b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navigationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navigationHint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addressInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addressInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  lookupButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
