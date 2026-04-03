import { useGeolocalisation } from '@/components/GeolocalisationContext';
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraScreen from '@/components/CameraScreen';

export default function PhotoButton() {
  const { requestLocation, location, error, loading } = useGeolocalisation();
  const [showPhoto, setShowPhoto] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    try {
      // Optionnel: Demander la localisation avant d'ouvrir la caméra
      // await requestLocation();
      
      // Active la caméra
      setShowPhoto(true);
    } catch (err) {
      console.warn("Erreur lors de l'activation de la caméra :", err);
    }
  };

  const handleCloseCamera = () => {
    setShowPhoto(false);
  };

  // Si vous voulez utiliser un Modal au lieu de remplacer complètement la vue
  return (
    <View style={styles.container}>
      {/* Bouton d'alerte animé */}
      <Animated.View style={[styles.button, { transform: [{ translateY: bounceAnim }] }]}>
        <TouchableOpacity 
          onPress={handlePress}
          style={styles.touchableArea}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={26} color="#007AFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Indicateurs */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#30ff86" />
          <Text style={styles.loadingText}>Localisation...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Modal pour la caméra */}
      <Modal
        visible={showPhoto}
        animationType="slide"
        onRequestClose={handleCloseCamera}
      >
        <CameraScreen onClose={handleCloseCamera} />
      </Modal>

      {/* Afficher la localisation si disponible */}
      {/* {location && !showPhoto && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // bottom: 30,
    // right: 20,
  
    
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '80%',
    height: '80%',
    borderRadius: 16,
    backgroundColor: '#e8ecf0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderBottomColor: '#c4cdd8',
    borderRightColor: '#c4cdd8',
  },
  touchableArea: {
    // width: '100%',
    // height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
    elevation: 3,
  },
  loadingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    maxWidth: 200,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    elevation: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});
