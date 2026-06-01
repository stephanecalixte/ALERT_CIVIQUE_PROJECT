import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLiveStreamManager } from '../../hooks/useLiveStreamManager';
import { AlertType } from '@/contexts/AlertContext';

interface LiveStreamScreenProps {
  onClose?: () => void;
  autoStart?: boolean;
  reportId?: number;
  alertType?: AlertType;
}

export default function LiveStreamScreen({ onClose, autoStart = false, reportId, alertType }: LiveStreamScreenProps) {
  const {
    isLoading,
    isCameraActive,
    hasPermission,
    toggleCamera,
    recording,
    isUploading,
    checkCameraPermission,
  } = useLiveStreamManager(autoStart, onClose, reportId, alertType);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission caméra requise</Text>
        <TouchableOpacity onPress={checkCameraPermission} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isUploading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.statusText}>Envoi de la vidéo en cours...</Text>
      </View>
    );
  }

  if (recording) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.statusText}>Ouverture de la caméra...</Text>
        <Text style={styles.hintText}>Enregistre ta vidéo puis appuie sur stop dans la caméra</Text>
      </View>
    );
  }

  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.statusText}>Préparation...</Text>
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
      <View style={styles.startContainer}>
        <Text style={styles.title}>Enregistrement vidéo</Text>
        <Text style={styles.subtitle}>La vidéo sera sauvegardée sur ton téléphone et envoyée aux autorités</Text>
        <TouchableOpacity style={styles.actionButton} onPress={toggleCamera}>
          <Text style={styles.actionButtonText}>▶ Démarrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContainer: {
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  hintText: {
    color: '#999',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});
