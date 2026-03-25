import React, { useRef } from 'react';
import { CameraType, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LiveStreamCameraProps {
  facing: CameraType;
  isCameraActive: boolean;
  cameraRef: React.RefObject<CameraView>;
  toggleCameraFacing: () => void;
  toggleCamera: () => void;
  onClose?: () => void;
  recording?: boolean;
}

export default function LiveStreamCamera({
  facing,
  isCameraActive,
  cameraRef,
  toggleCameraFacing,
  toggleCamera,
  onClose,
}: LiveStreamCameraProps) {
  return (
    <View style={styles.container}>
      {onClose && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color="white" />
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      )}

      <CameraView style={styles.camera} facing={facing} ref={cameraRef} /> 

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={32} color="white" />
          <Text style={styles.controlButtonText}>
            {facing === 'back' ? 'Avant' : 'Arrière'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainControlButton} onPress={toggleCamera}>
          <Ionicons
            name={isCameraActive ? "videocam-off" : "videocam"}
            size={40}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => Alert.alert('Info', 'Flash bientôt')}>
          <Ionicons name="flash" size={32} color="white" />
          <Text style={styles.controlButtonText}>Flash</Text>
        </TouchableOpacity>
      </View>

      {isCameraActive && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>EN DIRECT</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  mainControlButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

