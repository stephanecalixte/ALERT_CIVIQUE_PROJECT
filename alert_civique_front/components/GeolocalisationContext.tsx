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

      // Reverse geocoding
      let address = null;
      try {
        const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResponse.length > 0) {
          address = addressResponse[0];
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding error:', geocodeError);
        // Nous ne bloquons pas l'utilisateur pour cette erreur, nous mettons juste l'adresse à null.
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
