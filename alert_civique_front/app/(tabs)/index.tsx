// HomeScreen - boutons (SOS, Photo, Camera, Mic, Messages) dans topLayout horizontal
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapScreen from '@/components/MapScreen';
import LoadingPage from '../views/loadingPage/LoadingPage';
import SosButton from '@/components/alertButton/SosButton';
import PhotoButton from '@/components/alertButton/photoButton';
import MessageButton from '@/components/alertButton/MessageButton';
import CameraButton from '@/components/alertButton/CameraButton';
import MicButton from '@/components/alertButton/MicButton';

export default function HomeScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  return (
    <View style={styles.container}>
      <MapScreen onMapReady={() => setMapLoaded(true)} />

      {mapLoaded && (
        <View style={styles.topLayout}>
          <CameraButton />
          <PhotoButton/>
          <SosButton />
          <MicButton />
          <MessageButton />
        </View>
      )}
      {!mapLoaded && <LoadingPage />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  topLayout: {
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    height: 70,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#e8ecf0',
    
    zIndex: 20,
  },
});
