import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapScreen from '@/components/MapScreen';
import LoadingPage from '../views/loadingPage/LoadingPage';
import SosButton from '@/components/alertButton/SosButton';
import { ConfirmationScreen } from '@/components/alertButton/SosButton';
import PhotoButton from '@/components/alertButton/photoButton';
import MessageButton from '@/components/alertButton/MessageButton';
import CameraButton from '@/components/alertButton/CameraButton';
import MicButton from '@/components/alertButton/MicButton';
import LiveStreamScreen from '@/app/views/LiveStreamSreen';
import CameraScreen from '@/components/CameraScreen';
import AudioRecordScreen from '@/components/AudioRecordScreen';
import { useAlert, AlertType } from '@/contexts/AlertContext';
import { useMessagesContext } from '@/contexts/MessagesContext';
import { ReportFlowResult } from '@/hooks/useReportFlow';

type OverlayType = null | 'livestream' | 'photo' | 'audio' | 'sos-confirm' | 'sos-stream';

export default function HomeScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [overlay, setOverlay]             = useState<OverlayType>(null);
  const [overlayAlertType, setOverlayAlertType] = useState<AlertType | null>(null);
  const [sosResult, setSosResult]         = useState<ReportFlowResult | null>(null);

  const { setAlertType } = useAlert();
  const { sendAlertReport } = useMessagesContext();

  const handleAlertSelect = (type: AlertType) => {
    setAlertType(type);
    sendAlertReport(type);
  };

  const closeOverlay = () => {
    setOverlay(null);
    setOverlayAlertType(null);
  };

  const handleSosComplete = (result: ReportFlowResult) => {
    setSosResult(result);
    setOverlay('sos-confirm');
  };

  return (
    <View style={styles.container}>
      <MapScreen onMapReady={() => setMapLoaded(true)} />

      {mapLoaded && (
        <View style={styles.topLayout}>
          <CameraButton
            onAlertSelected={handleAlertSelect}
            onOpenStream={(type) => { setOverlayAlertType(type); setOverlay('livestream'); }}
          />
          <PhotoButton
            onAlertSelected={handleAlertSelect}
            onOpenPhoto={(type) => { setOverlayAlertType(type); setOverlay('photo'); }}
          />
          <SosButton onSosComplete={handleSosComplete} />
          <MicButton
            onAlertSelected={handleAlertSelect}
            onOpenAudio={(type) => { setOverlayAlertType(type); setOverlay('audio'); }}
          />
          <MessageButton />
        </View>
      )}
      {!mapLoaded && <LoadingPage />}

      {/* ── Overlays : rendus dans la zone du tab screen, tabs et header toujours visibles ── */}

      {overlay === 'livestream' && (
        <View style={StyleSheet.absoluteFill}>
          <LiveStreamScreen
            onClose={closeOverlay}
            autoStart
            alertType={overlayAlertType ?? undefined}
          />
        </View>
      )}

      {overlay === 'photo' && (
        <View style={StyleSheet.absoluteFill}>
          <CameraScreen onClose={closeOverlay} />
        </View>
      )}

      {overlay === 'audio' && (
        <View style={StyleSheet.absoluteFill}>
          <AudioRecordScreen onClose={closeOverlay} />
        </View>
      )}

      {overlay === 'sos-confirm' && sosResult && (
        <View style={StyleSheet.absoluteFill}>
          <ConfirmationScreen
            result={sosResult}
            onContinue={() => setOverlay('sos-stream')}
            onClose={closeOverlay}
          />
        </View>
      )}

      {overlay === 'sos-stream' && (
        <View style={StyleSheet.absoluteFill}>
          <LiveStreamScreen
            onClose={closeOverlay}
            autoStart
            reportId={sosResult?.reportId ?? undefined}
          />
        </View>
      )}
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
