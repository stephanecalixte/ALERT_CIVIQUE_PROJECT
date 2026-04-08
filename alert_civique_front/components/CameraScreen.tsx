import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useCamera } from '@/hooks/useCamera';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function CameraScreen({ onClose, onPhotoTaken }: { onClose: () => void; onPhotoTaken?: (uri: string) => void }) {
  const { cameraState, cameraRef, toggleCameraType, cycleFlash, setZoom, takePicture, resetPreview, pickFromGallery, hasPermission } = useCamera();

  const onPinchGesture = ({ nativeEvent }: any) => {
    setZoom(nativeEvent.scale);
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Permission caméra refusée</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text>Fermer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={cameraState.type}
        flash={cameraState.flash}
        zoom={cameraState.zoom}
        ref={cameraRef}
      />
      
      {/* Controls overlay */}
      <View style={styles.controls}>
        {/* Close */}
        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Flash */}
        <TouchableOpacity style={styles.controlButton} onPress={cycleFlash}>
          <Ionicons name={(['flash-off', 'flash', 'flashlight', 'flash-outline'][(['off', 'on', 'torch', 'auto'] as const).indexOf(cameraState.flash)] || 'flash-off') as any} size={28} color="white" />
        </TouchableOpacity>

        {/* Switch camera */}
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Capture button */}
      <View style={styles.captureArea}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
          <Ionicons name="image-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {cameraState.isProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Traitement...</Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureArea: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,    
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

