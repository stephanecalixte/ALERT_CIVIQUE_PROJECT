// HomeScreen - 3 boutons (SOS, Photo, Messages) dans topLayout horizontal
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapScreen from '@/components/MapScreen';
import LoadingPage from '../views/loadingPage/LoadingPage';
import SosButton from '@/components/alertButton/SosButton';
import PhotoButton from '@/components/alertButton/photoButton';
import MessageButton from '@/components/alertButton/MessageButton';

export default function HomeScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  return (
    <View style={styles.container}>
      <MapScreen onMapReady={() => setMapLoaded(true)} />

      {mapLoaded && (
        <View style={styles.topLayout}>
          <SosButton />
          <PhotoButton/>
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
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    height: 130,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,0,0,0.4)',
    paddingHorizontal: 20,
    zIndex: 20,
  },
});

