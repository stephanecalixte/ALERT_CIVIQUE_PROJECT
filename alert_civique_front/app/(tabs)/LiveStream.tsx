import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useLiveStream } from '../../hooks/useLiveStream';
import LiveStreamCamera from '../../components/LiveStreamCamera';
import { useAuth } from '../../contexts/AuthContext';
import CameraView from 'expo-camera/build/CameraView';

interface LiveStreamScreenProps {
  onClose?: () => void;
}

interface LiveStreamScreenProps {
  onClose?: () => void;
  autoStart?: boolean;
}

export default function LiveStreamScreen({ onClose, autoStart = false }: LiveStreamScreenProps) {
  const { userId } = useAuth();
  const {
    facing,
    toggleCameraFacing,
    isLoading,
    isCameraActive,
    hasPermission,
    cameraRef,
    toggleCamera,
    recording,
    streams,
    checkCameraPermission,
  } = useLiveStream();

  // Auto-start live stream if prop set
  React.useEffect(() => {
    if (autoStart && hasPermission && !isLoading && !isCameraActive) {
      console.log('🚀 AUTO-START LIVE STREAM');
      toggleCamera();
    }
  }, [autoStart, hasPermission, isLoading, isCameraActive, toggleCamera]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chargement... (User ID: {userId})</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission caméra requise</Text>
        <Text style={styles.textSmall}>Cliquez pour demander</Text>
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
        <LiveStreamCamera
          facing={facing}
          isCameraActive={isCameraActive}
          cameraRef={cameraRef as React.RefObject<CameraView>}
          toggleCameraFacing={toggleCameraFacing}
          toggleCamera={toggleCamera}
          onClose={onClose}
          recording={recording}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Live Stream</Text>
            <Text style={styles.subtitle}>User: {userId}</Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={toggleCamera}>
            <Text style={styles.startButtonText}>Démarrer Live Stream</Text>
          </TouchableOpacity>
          <Text style={styles.listTitle}>Streams récents:</Text>
          <FlatList
            data={streams}
            keyExtractor={(item) => item.livestreamId?.toString() || ''}
            renderItem={({ item }) => (
              <View style={styles.streamItem}>
                <Text style={styles.streamTitle}>#{item.livestreamId}</Text>
                <Text style={styles.streamInfo}>Status: {item.status}</Text>
                <Text style={styles.streamInfo}>Durée: {item.duration}s</Text>
                {item.videoUrl && (
                  <Text style={styles.videoUrl}>Vidéo: {item.videoUrl.split('/').pop()}</Text>
                )}
              </View>
            )}
            style={styles.list}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  startButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginTop: 20,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  streamItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  streamInfo: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  videoUrl: {
    fontSize: 12,
    color: 'green',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  text: {
    fontSize: 18,
  },
  textSmall: {
    fontSize: 14,
    color: 'gray',
  },
});

