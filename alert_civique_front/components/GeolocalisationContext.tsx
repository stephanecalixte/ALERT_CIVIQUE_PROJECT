import * as Location from 'expo-location';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
  address: Location.LocationGeocodedAddress | null;
}

interface GeolocalisationContextType {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;

  requestLocation: () => void;
}

const GeolocalisationContext = createContext<GeolocalisationContextType | undefined>(undefined);

export const useGeolocalisation = () => {
  const context = useContext(GeolocalisationContext);
  if (!context) {
    throw new Error('useGeolocalisation must be used within a GeolocalisationProvider');
  }
  return context;
};

interface GeolocalisationProviderProps {
  children: ReactNode;
}

export const GeolocalisationProvider: React.FC<GeolocalisationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = position.coords;

      // Reverse geocoding avec timeout 3s (le service Android peut être lent)
      let address = null;
      try {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const geocode = Location.reverseGeocodeAsync({ latitude, longitude }).then(
          (r) => (r.length > 0 ? r[0] : null)
        );
        address = await Promise.race([geocode, timeout]);
      } catch {
        // Adresse non disponible, on continue sans bloquer
      }

      setLocation({ latitude, longitude, address });
      setLoading(false);
    } catch (error) {
      setError((error as Error).message || 'Failed to get location');
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <GeolocalisationContext.Provider value={{ location, error, loading, requestLocation }}>
      {children}
    </GeolocalisationContext.Provider>
  );
};
