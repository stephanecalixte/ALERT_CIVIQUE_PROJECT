import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapScreen from '@/components/MapScreen';
import LoadingPage from '../views/loadingPage/LoadingPage';
import SosButton from '@/components/alertButton/SosButton';
import PhotoButton from '@/components/alertButton/photoButton';
import MessageButton from '@/components/alertButton/MessageButton';
import CameraButton from '@/components/alertButton/CameraButton';
import MicButton from '@/components/alertButton/MicButton';
import { useAlert, AlertType } from '@/contexts/AlertContext';
import { useMessagesContext } from '@/contexts/MessagesContext';

export default function HomeScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { setAlertType } = useAlert();
  const { sendAlertReport } = useMessagesContext();

  // Appelé par CameraButton, PhotoButton, MicButton dès qu'un type est choisi
  const handleAlertSelect = (type: AlertType) => {
    setAlertType(type);       // → bannière + marqueur carte
    sendAlertReport(type);    // → carte dans le chat + badge cloche
  };

  return (
    <View style={styles.container}>
      <MapScreen onMapReady={() => setMapLoaded(true)} />

      {mapLoaded && (
        <View style={styles.topLayout}>
          <CameraButton onAlertSelected={handleAlertSelect} />
          <PhotoButton  onAlertSelected={handleAlertSelect} />
          <SosButton />
          <MicButton    onAlertSelected={handleAlertSelect} />
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
    height: 70,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#e8ecf0',
    zIndex: 20,
  },
});
