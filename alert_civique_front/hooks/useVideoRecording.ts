import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import type { RefObject } from 'react';
import type { CameraView } from 'expo-camera';

export function useVideoRecording() {
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startRecording = useCallback(async (
    _cameraRef?: RefObject<CameraView | null>,
    onFailed?: () => void,
  ): Promise<string | null> => {
    try {
      setRecording(true);
      setUploadProgress(0);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos',
        videoMaxDuration: 60,
        quality: 0.8,
      });

      setRecording(false);

      if (result.canceled || !result.assets?.[0]?.uri) {
        console.log('📹 Enregistrement annulé par l\'utilisateur');
        onFailed?.();
        return null;
      }

      const uri = result.assets[0].uri;
      setVideoUri(uri);
      console.log('📁 Vidéo enregistrée URI:', uri);

      // Sauvegarder dans la galerie — même mécanisme que les photos (pas de requestPermissions qui plante)
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        console.log('💾 Vidéo sauvegardée dans la galerie');
      } catch (e) {
        console.log('⚠️ Galerie non disponible (Expo Go):', e);
      }

      return uri;
    } catch (error) {
      console.error('❌ Erreur enregistrement vidéo:', error);
      setRecording(false);
      Alert.alert('Erreur', "Impossible d'enregistrer la vidéo.", [{ text: 'OK', onPress: onFailed }]);
      return null;
    }
  }, []);

  const stopRecording = useCallback(async (
    _cameraRef?: RefObject<CameraView | null>
  ): Promise<string | null> => {
    return videoUri;
  }, [videoUri]);

  const resetVideoUri = useCallback(() => {
    setVideoUri(null);
  }, []);

  return {
    recording,
    videoUri,
    uploadProgress,
    setUploadProgress,
    startRecording,
    stopRecording,
    resetVideoUri,
  };
}
