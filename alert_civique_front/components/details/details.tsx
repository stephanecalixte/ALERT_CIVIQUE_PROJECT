import React from 'react';
import { Text, View } from 'react-native';
import { useGeolocalisation } from '../GeolocalisationContext';

export default function Details() {
  const { location } = useGeolocalisation();

  return (
    <View>
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            secours: 112{'\n'}
            ville: {location.address?.city || 'Ville non disponible'}{'\n'}
            codePostale: {location.address?.postalCode || 'Code postal non disponible'}{'\n'}
            N.rue: {location.address?.streetNumber || 'Numéro de rue non disponible'}{'\n'}
            adresse: {location.address?.street || 'Rue non disponible'}{'\n'}
            Région: {location.address?.region || 'Région non disponible'}{'\n'}
            adresseComplète: {location.address ? `${location.address.street}, ${location.address.city}` : 'Adresse non disponible'}
          </Text>
        </View>
      )}
    </View>
  );
}

// Assuming styles are defined elsewhere or add them
const styles = {
  locationContainer: {
    padding: 10,
  },
  locationText: {
    fontSize: 16,
  },
};
