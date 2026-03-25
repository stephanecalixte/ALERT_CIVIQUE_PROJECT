import LiveStream from '@/app/(tabs)/LiveStream';
import { useGeolocalisation } from '@/components/GeolocalisationContext';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SosButton() {
  const { requestLocation, location, error, loading } = useGeolocalisation();
  const [showCamera, setShowCamera] = useState(false);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    blink.start();
  }, [blinkAnim]);

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF3B30', '#000000'], // Red to lighter red
  });

  const handlePress = () => {
    try {
      // Active la caméra
      setShowCamera(true);
      // Demande la localisation si nécessaire
      // requestLocation();
    } catch (err) {
      console.warn('Erreur lors de l\'activation de la caméra :', err);
    }
  };

  // Si la caméra doit être affichée, on retourne le composant LiveStream
  if (showCamera) {
    return <LiveStream onClose={() => setShowCamera(false)} />;
  }

  // Sinon, on affiche le bouton d'alerte
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.button, { backgroundColor }]}>
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.buttonText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>
      {loading && <Text>Chargement de la localisation...</Text>}
      {error && <Text style={styles.errorText}>Erreur: {error}</Text>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // top: '40%',
    // left: '10%',
    // transform: [{ translateX: -50}, { translateY: -90 }],
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
     borderColor: 'red',
      width:'33%',
    borderWidth: 2,
  
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30', 
    height: '100%',
    width:'100%',
    
    borderRadius: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
  // locationContainer: {
  //   marginTop: 30,
  //   padding: 15,
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   borderRadius: 10,
  //   maxWidth: '90%',
  // },
  // locationText: {
  //   fontWeight: '600',
  //   fontSize: 14,
  //   textAlign: 'left',
  //   color: '#333',
  // },
});