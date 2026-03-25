import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { useLiveStream } from '../../hooks/useLiveStream';

interface LiveStreamScreenProps {
  onClose?: () => void;
}

export default function LiveStreamScreen({ onClose }: LiveStreamScreenProps) {
  const {
    facing,
    toggleCameraFacing,
    isLoading,
    isCameraActive,
    hasPermission,
    cameraRef,
    toggleCamera,
    recording,
    onCameraReady, // ✅ Récupérer le callback
    checkCameraPermission,
  } = useLiveStream();

  // ✅ Demander la permission au montage
  useEffect(() => {
    checkCameraPermission();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission caméra requise</Text>
        <TouchableOpacity onPress={checkCameraPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      )}
      
      {isCameraActive ? (
        // ✅ Caméra active
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
            onCameraReady={onCameraReady} // ✅ Important : appelé quand la caméra est prête
          />
          
          {/* Bouton d'enregistrement */}
          <TouchableOpacity 
            style={[styles.recordButton, recording && styles.recordingActive]} 
            onPress={toggleCamera}
          >
            <Text style={styles.recordButtonText}>
              {recording ? 'Arrêter' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
          
          {/* Bouton flip caméra */}
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipButtonText}>⟳</Text>
          </TouchableOpacity>
          
          {/* Indicateur d'enregistrement */}
          {recording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>ENREGISTREMENT</Text>
            </View>
          )}
        </View>
      ) : (
        // ✅ Écran de démarrage
        <View style={styles.startContainer}>
          <Text style={styles.title}>Live Stream</Text>
          <Text style={styles.subtitle}>Partagez votre vidéo en direct</Text>
          <TouchableOpacity style={styles.startButton} onPress={toggleCamera}>
            <Text style={styles.startButtonText}>Démarrer Live Stream</Text>
          </TouchableOpacity>
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recordButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  recordingActive: {
    backgroundColor: '#FF0000',
    transform: [{ scale: 1.1 }],
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  flipButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 24,
  },
  startButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});