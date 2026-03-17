// HomeScreen.js (simplifié)
import AlertButton from '@/components/alertButton/SosButton';
import PhotoButton from '@/components/alertButton/photoButton';
import MapScreen from '@/components/MapScreen';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoadingPage from '../views/loadingPage/LoadingPage';



export default function HomeScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  return (
    <View style={styles.container}>
      <MapScreen onMapReady={() => setMapLoaded(true)} />

      {mapLoaded&&(
        <>
      <AlertButton />
      <PhotoButton/>
        </>
      )}
  {!mapLoaded && <LoadingPage />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: "relative",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

