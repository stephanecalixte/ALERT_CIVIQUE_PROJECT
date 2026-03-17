import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLiveStream } from '../../hooks/useLiveStream';
import LiveStreamCamera from '../../components/LiveStreamCamera';
// import LiveStreamService from '../services/LiveStreamService';

export default function LiveStream() {
  const userId = "123"; // TODO: from auth context
  const {
    facing,
    toggleCameraFacing,
    isLoading,
    isCameraActive,
    hasPermission,
    cameraRef,
    toggleCamera,
  } = useLiveStream(userId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Permission caméra requise</Text>
      </View>
    );
  }

  return (
    <LiveStreamCamera
      facing={facing}
      isCameraActive={isCameraActive}
      cameraRef={cameraRef}
      toggleCameraFacing={toggleCameraFacing}
      toggleCamera={toggleCamera}
      onClose={() => {}} // Gère close
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

