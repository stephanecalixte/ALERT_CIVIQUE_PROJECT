import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useGeolocalisation } from '@/components/GeolocalisationContext';

if (Platform.OS === 'web') {
  // @ts-ignore
  global.MapView = MapView;
}

type MapScreenProps = {
  onMapReady: () => void;
};

const DEFAULT_LOCATION = { latitude: 48.8566, longitude: 2.3522 };

export default function MapScreen({ onMapReady }: MapScreenProps) {
  const bounceValue = useRef(new Animated.Value(1)).current;
  const { location } = useGeolocalisation();

  const currentLocation = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : DEFAULT_LOCATION;

  console.log('MapScreen rendered');

  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    // Test map ready manually after 2s if not called
    const testReady = setTimeout(() => {
      if (typeof onMapReady === 'function') {
        console.log('MapScreen: forcing ready for test');
        onMapReady();
      }
    }, 2000);
    return () => clearTimeout(testReady);
  }, [bounceValue, onMapReady]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onMapReady={onMapReady}
        region={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={currentLocation}
          title="Ma position"
        >
          <Animated.View
            style={{
              transform: [{ scale: bounceValue }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={styles.marker} />
          </Animated.View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: 'red',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
