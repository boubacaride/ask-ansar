import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle, Polygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationStore, SavedLocation, MapboxRoute, MapboxStep } from '@/store/navigationstore';
import { useSettings } from '@/store/settingsStore';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
const GOOGLE_MAPS_KEY = 'AIzaSyDEwtaEWWtkJb6zyIyRQdxPMjmcpasx0H8';
const OFF_ROUTE_THRESHOLD_M = 40;
const REROUTE_COOLDOWN_MS = 5000;

// Calculate bearing between two coordinates in degrees
function calculateBearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// Calculate distance between two coordinates in km
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Haversine distance in meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Decode Mapbox polyline6 encoding (precision 1e6)
function decodePolyline6(encoded: string): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e6, lng / 1e6]);
  }
  return coords;
}

// Find nearest point on polyline and distance from a GPS point
function pointToPolylineDistance(
  pLat: number, pLng: number, polyline: Array<[number, number]>
): { distance: number; nearestIndex: number } {
  let minDist = Infinity, nearestIdx = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const [aLat, aLng] = polyline[i];
    const [bLat, bLng] = polyline[i + 1];
    const dx = bLng - aLng, dy = bLat - aLat;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? Math.max(0, Math.min(1, ((pLng - aLng) * dx + (pLat - aLat) * dy) / lenSq)) : 0;
    const dist = haversineMeters(pLat, pLng, aLat + t * dy, aLng + t * dx);
    if (dist < minDist) { minDist = dist; nearestIdx = i; }
  }
  return { distance: minDist, nearestIndex: nearestIdx };
}

function formatDistanceM(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatETA(remainingSeconds: number): string {
  const arrival = new Date(Date.now() + remainingSeconds * 1000);
  return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// Maps Mapbox maneuver types to Ionicons
function ManeuverIcon({ type, modifier }: { type?: string; modifier?: string }) {
  let iconName: string = 'arrow-up';
  if (type === 'turn') {
    if (modifier === 'left' || modifier === 'sharp left') iconName = 'arrow-back';
    else if (modifier === 'right' || modifier === 'sharp right') iconName = 'arrow-forward';
    else if (modifier === 'uturn') iconName = 'return-down-back';
  } else if (type === 'roundabout' || type === 'rotary') {
    iconName = 'sync-outline';
  } else if (type === 'arrive') {
    iconName = 'flag';
  } else if (type === 'merge' || type === 'on ramp' || type === 'off ramp') {
    iconName = modifier?.includes('left') ? 'arrow-back' : 'arrow-forward';
  }
  return (
    <View style={navStyles.maneuverIcon}>
      <Ionicons name={iconName as any} size={72} color="#fff" />
    </View>
  );
}

// Navigation map HTML for WebView
function getNavigationMapHTML(isDark: boolean): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%}
#rerouting{position:absolute;top:20px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,0.85);color:#fff;padding:10px 24px;border-radius:24px;
  font-size:14px;font-family:-apple-system,sans-serif;display:none;z-index:999;
  backdrop-filter:blur(8px)}
#rerouting.show{display:block;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
</style></head><body>
<div id="map"></div>
<div id="rerouting">Recalcul de l'itin\\u00e9raire...</div>
<script>
var map,routePolylines=[],userMarker=null,destMarker=null,accuracyCircle=null;
var selectedIdx=0,isNavMode=false;
var PRIMARY_COLOR='#4285F4',ALT_COLOR='#9E9E9E';
${isDark ? `var mapStyles=[
{elementType:'geometry',stylers:[{color:'#242f3e'}]},
{elementType:'labels.text.stroke',stylers:[{color:'#242f3e'}]},
{elementType:'labels.text.fill',stylers:[{color:'#746855'}]},
{featureType:'road',elementType:'geometry',stylers:[{color:'#38414e'}]},
{featureType:'road',elementType:'geometry.stroke',stylers:[{color:'#212a37'}]},
{featureType:'road',elementType:'labels.text.fill',stylers:[{color:'#9ca5b3'}]},
{featureType:'water',elementType:'geometry',stylers:[{color:'#17263c'}]}
];` : `var mapStyles=[
{featureType:'poi',stylers:[{visibility:'off'}]},
{featureType:'transit',stylers:[{visibility:'off'}]}
];`}

function initMap(){
  map=new google.maps.Map(document.getElementById('map'),{
    center:{lat:0,lng:0},zoom:15,
    disableDefaultUI:true,zoomControl:true,
    mapTypeControl:false,streetViewControl:false,fullscreenControl:false,
    styles:mapStyles,gestureHandling:'greedy'
  });
  sendToRN({type:'mapReady'});
}

function sendToRN(data){
  try{
    var s=JSON.stringify(data);
    if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s);}
    else{window.parent.postMessage(s,'*');}
  }catch(e){}
}

function createArrowIcon(heading){
  var svg='<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">'
    +'<circle cx="20" cy="20" r="18" fill="'+PRIMARY_COLOR+'" opacity="0.15"/>'
    +'<g transform="rotate('+(heading||0)+',20,20)">'
    +'<polygon points="20,4 30,28 20,22 10,28" fill="'+PRIMARY_COLOR+'" stroke="#fff" stroke-width="2"/>'
    +'</g></svg>';
  return{
    url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),
    scaledSize:new google.maps.Size(40,40),
    anchor:new google.maps.Point(20,20)
  };
}

function drawRoutes(routes,destLat,destLng){
  routePolylines.forEach(function(p){p.setMap(null);});
  routePolylines=[];
  if(destMarker)destMarker.setMap(null);
  var bounds=new google.maps.LatLngBounds();
  routes.forEach(function(coords,idx){
    var path=coords.map(function(c){return{lat:c[0],lng:c[1]};});
    var poly=new google.maps.Polyline({
      path:path,
      strokeColor:idx===selectedIdx?PRIMARY_COLOR:ALT_COLOR,
      strokeOpacity:idx===selectedIdx?1:0.6,
      strokeWeight:idx===selectedIdx?6:4,
      zIndex:idx===selectedIdx?10:5,map:map
    });
    poly.addListener('click',function(){sendToRN({type:'routeTapped',index:idx});});
    routePolylines.push(poly);
    path.forEach(function(p){bounds.extend(p);});
  });
  destMarker=new google.maps.Marker({
    position:{lat:destLat,lng:destLng},map:map,
    icon:{path:google.maps.SymbolPath.CIRCLE,fillColor:'#EA4335',fillOpacity:1,
      strokeColor:'#fff',strokeWeight:3,scale:10},zIndex:20
  });
  bounds.extend({lat:destLat,lng:destLng});
  map.fitBounds(bounds,{top:80,bottom:80,left:40,right:40});
}

function highlightRoute(idx){
  selectedIdx=idx;
  routePolylines.forEach(function(p,i){
    p.setOptions({
      strokeColor:i===idx?PRIMARY_COLOR:ALT_COLOR,
      strokeOpacity:i===idx?1:0.6,
      strokeWeight:i===idx?6:4,
      zIndex:i===idx?10:5
    });
  });
}

function updateUserPosition(lat,lng,heading,accuracy){
  var pos={lat:lat,lng:lng};
  if(!userMarker){
    userMarker=new google.maps.Marker({position:pos,map:map,icon:createArrowIcon(heading),zIndex:30});
  }else{
    userMarker.setPosition(pos);
    userMarker.setIcon(createArrowIcon(heading));
  }
  if(!accuracyCircle){
    accuracyCircle=new google.maps.Circle({
      center:pos,map:map,radius:accuracy||10,
      fillColor:PRIMARY_COLOR,fillOpacity:0.1,
      strokeColor:PRIMARY_COLOR,strokeOpacity:0.3,strokeWeight:1,zIndex:1
    });
  }else{
    accuracyCircle.setCenter(pos);
    accuracyCircle.setRadius(accuracy||10);
  }
  if(isNavMode){map.panTo(pos);if(map.getZoom()<16)map.setZoom(16);}
}

function startNavMode(){
  isNavMode=true;
  routePolylines.forEach(function(p,i){if(i!==selectedIdx)p.setMap(null);});
  if(userMarker){map.setCenter(userMarker.getPosition());map.setZoom(17);}
}

function updateRoute(coords){
  if(routePolylines[selectedIdx])routePolylines[selectedIdx].setMap(null);
  var path=coords.map(function(c){return{lat:c[0],lng:c[1]};});
  var poly=new google.maps.Polyline({
    path:path,strokeColor:PRIMARY_COLOR,strokeOpacity:1,strokeWeight:6,zIndex:10,map:map
  });
  routePolylines[selectedIdx]=poly;
}

function setRerouting(show){
  var el=document.getElementById('rerouting');
  el.className=show?'show':'';
  el.style.display=show?'block':'none';
}

function handleMessage(event){
  try{
    var d=typeof event.data==='string'?JSON.parse(event.data):event.data;
    switch(d.type){
      case 'initRoutes':drawRoutes(d.routes,d.destLat,d.destLng);
        if(d.userLat!=null)updateUserPosition(d.userLat,d.userLng,d.heading,d.accuracy);break;
      case 'selectRoute':highlightRoute(d.index);break;
      case 'startNavigation':startNavMode();break;
      case 'updatePosition':updateUserPosition(d.lat,d.lng,d.heading,d.accuracy);break;
      case 'updateRoute':updateRoute(d.coords);break;
      case 'reroutingStarted':setRerouting(true);break;
      case 'reroutingFinished':setRerouting(false);break;
    }
  }catch(e){}
}
document.addEventListener('message',handleMessage);
window.addEventListener('message',handleMessage);
</script>
<script async src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&callback=initMap"></script>
</body></html>`;
}

/** Big blue direction arrow component */
function DirectionArrow({
  bearing,
  heading,
  size = 140,
  color = '#1976D2',
}: {
  bearing: number;
  heading: number;
  size?: number;
  color?: string;
}) {
  // Arrow rotation = bearing - device heading
  const rotation = bearing - heading;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Thick filled arrow pointing up */}
          <Polygon
            points="50,8 72,60 58,52 58,88 42,88 42,52 28,60"
            fill={color}
          />
        </Svg>
      </View>
    </View>
  );
}

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
  const insets = useSafeAreaInsets();
  const {
    savedLocations,
    selectedDestination,
    currentLocation,
    addLocation,
    removeLocation,
    setSelectedDestination,
    setCurrentLocation,
    navigationSession,
    startNavigationSession,
    selectRoute: storeSelectRoute,
    updateNavigationProgress,
    endNavigationSession,
  } = useNavigationStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);
  
  // Form state
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState<'current' | 'address'>('current');
  const [addressInput, setAddressInput] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  
  // Animation
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Navigation state
  const [viewMode, setViewMode] = useState<'setup' | 'route_selection' | 'navigating'>('setup');
  const webViewRef = useRef<any>(null);
  const gpsSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapReadyRef = useRef(false);

  // Get user's current location on mount + watch heading
  useEffect(() => {
    requestLocationPermission();

    // Watch device compass heading
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          headingSubscription.current = await Location.watchHeadingAsync((h) => {
            setDeviceHeading(h.trueHeading ?? h.magHeading ?? 0);
          });
        }
      } catch (_) { /* heading not available on web */ }
    })();

    return () => {
      headingSubscription.current?.remove();
      gpsSubscription.current?.remove();
    };
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
                          
  // Navigation map HTML
  const navigationMapHTML = useMemo(() => getNavigationMapHTML(darkMode), [darkMode]);

  const sendToWebView = useCallback((msg: any) => {
    if (!webViewRef.current) return;
    const json = JSON.stringify(msg);
    const code = `try{handleMessage({data:${JSON.stringify(json)}});}catch(e){}true;`;
    if (Platform.OS === 'web') {
      try {
        const iframe = (webViewRef.current as HTMLIFrameElement);
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(json, '*');
        }
      } catch (e) {}
    } else {
      webViewRef.current.injectJavaScript(code);
    }
  }, []);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const rawData = Platform.OS === 'web' ? event.data : event.nativeEvent?.data;
      if (!rawData || typeof rawData !== 'string') return;
      const data = JSON.parse(rawData);
      if (data.type === 'mapReady') {
        mapReadyRef.current = true;
        const session = useNavigationStore.getState().navigationSession;
        const dest = useNavigationStore.getState().selectedDestination;
        const loc = useNavigationStore.getState().currentLocation;
        if (session) {
          // Small delay to ensure map is fully initialized
          setTimeout(() => {
            sendToWebView({
              type: 'initRoutes',
              routes: session.decodedRoutes,
              destLat: dest?.latitude,
              destLng: dest?.longitude,
              userLat: loc?.latitude,
              userLng: loc?.longitude,
              heading: 0,
              accuracy: 10,
            });
          }, 300);
        }
      } else if (data.type === 'routeTapped') {
        const idx = data.index;
        storeSelectRoute(idx);
        sendToWebView({ type: 'selectRoute', index: idx });
      }
    } catch (e) {}
  }, [sendToWebView, storeSelectRoute]);

  // Web: listen for postMessage from iframe
  useEffect(() => {
    if (Platform.OS === 'web' && viewMode !== 'setup') {
      const handler = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'string') {
          try {
            const d = JSON.parse(event.data);
            if (d.type === 'mapReady' || d.type === 'routeTapped') {
              handleWebViewMessage({ data: event.data });
            }
          } catch (e) {}
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
  }, [viewMode, handleWebViewMessage]);

  const handleStartActiveNavigation = useCallback(() => {
    updateNavigationProgress({ phase: 'navigating' });
    setViewMode('navigating');
    sendToWebView({ type: 'startNavigation' });
    // Start GPS tracking
    if (Platform.OS === 'web') {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, heading, accuracy } = position.coords;
            setCurrentLocation({ latitude, longitude });
            processNavigationUpdate(latitude, longitude, heading || 0, accuracy || 10);
          },
          (err) => console.error('GPS error:', err),
          { enableHighAccuracy: true, maximumAge: 1000 }
        );
        gpsSubscription.current = { remove: () => navigator.geolocation.clearWatch(watchId) } as any;
      }
    } else {
      (async () => {
        try {
          gpsSubscription.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5, timeInterval: 1000 },
            (location) => {
              const { latitude, longitude, heading, accuracy } = location.coords;
              setCurrentLocation({ latitude, longitude });
              processNavigationUpdate(latitude, longitude, heading || 0, accuracy || 10);
            }
          );
        } catch (e) { console.error('GPS tracking error:', e); }
      })();
    }
  }, [updateNavigationProgress, sendToWebView, setCurrentLocation]);

  const processNavigationUpdate = useCallback((lat: number, lng: number, heading: number, accuracy: number) => {
    const session = useNavigationStore.getState().navigationSession;
    if (!session || session.phase !== 'navigating') return;
    const route = session.decodedRoutes[session.selectedRouteIndex];
    if (!route || route.length === 0) return;

    const { distance, nearestIndex } = pointToPolylineDistance(lat, lng, route);
    sendToWebView({ type: 'updatePosition', lat, lng, heading, accuracy });

    // Check arrival (within 30m of destination)
    const dest = useNavigationStore.getState().selectedDestination;
    if (dest) {
      const distToDest = haversineMeters(lat, lng, dest.latitude, dest.longitude);
      if (distToDest < 30) {
        updateNavigationProgress({ phase: 'arrived' });
        Alert.alert('Arrivée', 'Vous êtes arrivé à destination !');
        stopNavigation();
        return;
      }
    }

    // Calculate remaining distance from nearest point to end
    let remaining = 0;
    for (let i = nearestIndex; i < route.length - 1; i++) {
      remaining += haversineMeters(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
    }

    // Find current step
    const currentRoute = session.routes[session.selectedRouteIndex];
    let currentStepIdx = 0;
    const steps = currentRoute?.legs[0]?.steps || [];
    let closestDist = Infinity;
    for (let i = 0; i < steps.length; i++) {
      const [sLng, sLat] = steps[i].maneuver.location;
      const d = haversineMeters(lat, lng, sLat, sLng);
      if (d < closestDist) { closestDist = d; currentStepIdx = i; }
    }
    if (closestDist < 50 && currentStepIdx < steps.length - 1) {
      currentStepIdx++;
    }

    // Estimate remaining duration
    const totalDist = currentRoute.distance;
    const totalDur = currentRoute.duration;
    const remainingDuration = totalDist > 0 ? (remaining / totalDist) * totalDur : 0;

    // Check off-route
    if (distance > OFF_ROUTE_THRESHOLD_M && !session.isRerouting) {
      const now = Date.now();
      if (now - session.lastRerouteTime > REROUTE_COOLDOWN_MS) {
        triggerReroute(lat, lng);
      }
    }

    updateNavigationProgress({
      nearestPointIndex: nearestIndex,
      distanceToRoute: distance,
      currentStepIndex: currentStepIdx,
      remainingDistance: remaining,
      remainingDuration: remainingDuration,
    });
  }, [sendToWebView, updateNavigationProgress]);

  const triggerReroute = useCallback(async (lat: number, lng: number) => {
    const dest = useNavigationStore.getState().selectedDestination;
    if (!dest) return;
    updateNavigationProgress({ isRerouting: true, lastRerouteTime: Date.now() });
    sendToWebView({ type: 'reroutingStarted' });
    try {
      const origin = `${lng},${lat}`;
      const destination = `${dest.longitude},${dest.latitude}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?geometries=polyline6&steps=true&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const newRoute = data.routes[0];
        const decoded = decodePolyline6(newRoute.geometry);
        const session = useNavigationStore.getState().navigationSession;
        if (session) {
          const newRoutes = [...session.routes];
          const newDecoded = [...session.decodedRoutes];
          newRoutes[session.selectedRouteIndex] = newRoute;
          newDecoded[session.selectedRouteIndex] = decoded;
          updateNavigationProgress({
            routes: newRoutes,
            decodedRoutes: newDecoded,
            isRerouting: false,
            remainingDistance: newRoute.distance,
            remainingDuration: newRoute.duration,
          } as any);
          sendToWebView({ type: 'updateRoute', coords: decoded });
        }
      }
    } catch (e) {
      console.error('Reroute error:', e);
    } finally {
      updateNavigationProgress({ isRerouting: false });
      sendToWebView({ type: 'reroutingFinished' });
    }
  }, [updateNavigationProgress, sendToWebView]);

  const stopNavigation = useCallback(() => {
    gpsSubscription.current?.remove();
    gpsSubscription.current = null;
    mapReadyRef.current = false;
    endNavigationSession();
    setViewMode('setup');
  }, [endNavigationSession]);

  const startNavigation = async () => {
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
    try {
      const origin = `${currentLocation.longitude},${currentLocation.latitude}`;
      const dest = `${selectedDestination.longitude},${selectedDestination.latitude}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${dest}?alternatives=true&geometries=polyline6&steps=true&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        Alert.alert('Aucun itinéraire', 'Impossible de trouver un itinéraire vers cette destination.');
        return;
      }
      const routes: MapboxRoute[] = data.routes;
      const decodedRoutes = routes.map((r: MapboxRoute) => decodePolyline6(r.geometry));
      startNavigationSession(routes, decodedRoutes);
      setViewMode('route_selection');
    } catch (error) {
      console.error('Route fetch error:', error);
      Alert.alert('Erreur', "Impossible de calculer l'itinéraire. Vérifiez votre connexion.");
    } finally {
      setIsNavigating(false);
    }
  };

  const formatCoordinate = (value: number, type: 'lat' | 'lon') => {
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  const userLocationsCount = savedLocations.filter(loc => !loc.isPreset).length;

  // ─── Navigation views (route_selection + navigating) ────────────────
  if (viewMode !== 'setup' && navigationSession) {
    const currentRoute = navigationSession.routes[navigationSession.selectedRouteIndex];
    const currentStep = currentRoute?.legs[0]?.steps[navigationSession.currentStepIndex];

    const mapView = Platform.OS === 'web' ? (
      <iframe
        srcDoc={navigationMapHTML}
        style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 } as any}
        ref={(el: any) => { webViewRef.current = el; }}
      />
    ) : (
      <WebView
        ref={webViewRef}
        source={{ html: navigationMapHTML }}
        style={StyleSheet.absoluteFill}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
      />
    );

    if (viewMode === 'route_selection') {
      return (
        <View style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa' }]}>
          {mapView}
          {/* Back button */}
          <TouchableOpacity
            style={[navStyles.backButton, { top: Platform.OS === 'web' ? 20 : insets.top + 10 }]}
            onPress={stopNavigation}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          {/* Bottom panel */}
          <View style={navStyles.bottomPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
              {navigationSession.routes.map((route, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    navStyles.routeCard,
                    idx === navigationSession.selectedRouteIndex && navStyles.routeCardSelected,
                  ]}
                  onPress={() => {
                    storeSelectRoute(idx);
                    sendToWebView({ type: 'selectRoute', index: idx });
                  }}
                >
                  <Text style={[navStyles.routeTime, idx === navigationSession.selectedRouteIndex && navStyles.routeTimeSelected]}>
                    {formatDuration(route.duration)}
                  </Text>
                  <Text style={[navStyles.routeDistance, idx === navigationSession.selectedRouteIndex && navStyles.routeDistanceSelected]}>
                    {formatDistanceM(route.distance)}
                  </Text>
                  {idx === 0 && <Text style={navStyles.routeFastest}>Plus rapide</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={navStyles.startButton}
              onPress={handleStartActiveNavigation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4285F4', '#1a73e8']}
                style={navStyles.startButtonGradient}
              >
                <MaterialIcons name="navigation" size={24} color="#fff" />
                <Text style={navStyles.startButtonText}>Démarrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Active navigation view
    return (
      <View style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa' }]}>
        {mapView}
        {/* Top maneuver banner */}
        {currentStep && (
          <View style={[navStyles.maneuverBanner, { top: Platform.OS === 'web' ? 0 : insets.top }]}>
            <ManeuverIcon type={currentStep.maneuver.type} modifier={currentStep.maneuver.modifier} />
            <View style={navStyles.maneuverInfo}>
              <Text style={navStyles.maneuverDistance}>
                {formatDistanceM(currentStep.distance)}
              </Text>
              <Text style={navStyles.maneuverInstruction} numberOfLines={2}>
                {currentStep.maneuver.instruction || currentStep.name}
              </Text>
            </View>
          </View>
        )}
        {/* Bottom info panel */}
        <View style={navStyles.infoPanel}>
          <View style={navStyles.infoPanelRow}>
            <View style={navStyles.infoItem}>
              <Text style={navStyles.infoValue}>{formatETA(navigationSession.remainingDuration)}</Text>
              <Text style={navStyles.infoLabel}>Arrivée</Text>
            </View>
            <View style={navStyles.infoDivider} />
            <View style={navStyles.infoItem}>
              <Text style={navStyles.infoValue}>{formatDuration(navigationSession.remainingDuration)}</Text>
              <Text style={navStyles.infoLabel}>Durée</Text>
            </View>
            <View style={navStyles.infoDivider} />
            <View style={navStyles.infoItem}>
              <Text style={navStyles.infoValue}>{formatDistanceM(navigationSession.remainingDistance)}</Text>
              <Text style={navStyles.infoLabel}>Distance</Text>
            </View>
          </View>
          <TouchableOpacity style={navStyles.stopButton} onPress={stopNavigation}>
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={navStyles.stopButtonText}>Arrêter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <View style={[styles.header, { borderBottomColor: colors.cardBorder, paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10 }]}>
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

          {/* Selected Destination Details — collapsible */}
          {selectedDestination && showDetails && (
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

          {/* Direction Arrow — shows bearing toward destination */}
          {selectedDestination && currentLocation && (
            <View style={[styles.directionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {/* Collapsed mini header when details are hidden */}
              {!showDetails && (
                <TouchableOpacity
                  style={styles.collapsedHeader}
                  onPress={() => setShowDetails(true)}
                >
                  {selectedDestination.isPreset ? (
                    <FontAwesome5 name="kaaba" size={16} color={colors.kaaba} />
                  ) : (
                    <FontAwesome5 name="map-marker-alt" size={16} color={colors.primary} />
                  )}
                  <Text style={[styles.collapsedHeaderText, { color: colors.text }]} numberOfLines={1}>
                    {selectedDestination.name}
                  </Text>
                  <Text style={[styles.collapsedDistance, { color: colors.primary }]}>
                    {calculateDistance(
                      currentLocation.latitude, currentLocation.longitude,
                      selectedDestination.latitude, selectedDestination.longitude
                    ).toFixed(1)} km
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              <View style={styles.directionArrowContainer}>
                <DirectionArrow
                  bearing={calculateBearing(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    selectedDestination.latitude,
                    selectedDestination.longitude
                  )}
                  heading={deviceHeading}
                  size={showDetails ? 120 : 160}
                  color="#1976D2"
                />
              </View>

              <View style={styles.directionInfo}>
                <Text style={[styles.directionDistance, { color: colors.text }]}>
                  {calculateDistance(
                    currentLocation.latitude, currentLocation.longitude,
                    selectedDestination.latitude, selectedDestination.longitude
                  ).toFixed(1)} km
                </Text>
                <Text style={[styles.directionBearing, { color: colors.textSecondary }]}>
                  {Math.round(calculateBearing(
                    currentLocation.latitude, currentLocation.longitude,
                    selectedDestination.latitude, selectedDestination.longitude
                  ))}° — vers {selectedDestination.name}
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.navigationHint, { color: colors.textSecondary }]}>
            Navigation pas à pas intégrée avec itinéraires alternatifs
          </Text>
        </ScrollView>

        {/* Fixed "Démarrer la navigation" button at bottom */}
        <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 12) + 60, backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa' }]}>
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
              colors={['#1976D2', '#1565C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navigationButtonGradient}
            >
              {isNavigating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="navigation" size={28} color="#fff" />
                  <Text style={styles.navigationButtonText}>Démarrer la navigation</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
    // paddingTop is set dynamically via useSafeAreaInsets
    paddingBottom: 20,
    paddingHorizontal: 16,
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
  // Direction arrow card
  directionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  collapsedHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  collapsedDistance: {
    fontSize: 14,
    fontWeight: '700',
  },
  directionArrowContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionInfo: {
    alignItems: 'center',
    paddingTop: 8,
  },
  directionDistance: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  directionBearing: {
    fontSize: 13,
    marginTop: 4,
  },
  // Fixed bottom button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navigationButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
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
    letterSpacing: 0.3,
  },
  navigationHint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 120,
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

// ─── Navigation-mode styles ────────────────────────────────────────
const navStyles = StyleSheet.create({
  maneuverIcon: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  routeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 110,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeCardSelected: {
    backgroundColor: '#e8f0fe',
    borderColor: '#4285F4',
  },
  routeTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  routeTimeSelected: {
    color: '#4285F4',
  },
  routeDistance: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  routeDistanceSelected: {
    color: '#5a9cf5',
  },
  routeFastest: {
    fontSize: 10,
    color: '#4285F4',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startButton: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  maneuverBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50,50,50,0.95)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 20,
    zIndex: 10,
  },
  maneuverInfo: {
    flex: 1,
  },
  maneuverDistance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  maneuverInstruction: {
    color: '#ddd',
    fontSize: 20,
    marginTop: 4,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  infoPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA4335',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    gap: 6,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
