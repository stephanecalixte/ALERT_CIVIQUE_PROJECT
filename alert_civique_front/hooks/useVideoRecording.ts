import { CameraView } from 'expo-camera';
import { useCallback, useRef, useState, type RefObject } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

export function useVideoRecording() {
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoUriRef = useRef<string | null>(null);
  const recordingPromiseRef = useRef<Promise<any> | null>(null);

  const startRecording = useCallback(async (cameraRef: RefObject<CameraView | null>) => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref is null');
      return false;
    }

    try {
      console.log('🎥 Démarrage enregistrement vidéo...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setRecording(true);
      setUploadProgress(0);

      const recordingPromise = cameraRef.current.recordAsync({ maxDuration: 60 });
      recordingPromiseRef.current = recordingPromise;

      recordingPromise
        .then((video: { uri: string } | undefined) => {
          if (video?.uri) {
            setVideoUri(video.uri);
            videoUriRef.current = video.uri;
            FileSystem.getInfoAsync(video.uri).then(fileInfo => {
              console.log('📁 Info fichier vidéo:', {
                exists: fileInfo.exists,
                size: (fileInfo as any).size,
              });
            });
          } else {
            console.error('❌ recordAsync: pas d\'URI dans la réponse');
          }
        })
        .catch((error: unknown) => {
          const msg = error instanceof Error ? error.message : 'Erreur inconnue';
          if (msg.includes('RECORD_AUDIO') || msg.includes('permission') || msg.includes('Permission')) {
            console.error('❌ Permission micro manquante — va dans Paramètres → Expo Go → Autorisations → Microphone');
            Alert.alert(
              'Permission micro requise',
              'Va dans Paramètres Android → Apps → Expo Go → Autorisations → Microphone → Autoriser'
            );
          } else if (!msg.includes('stopped before any data')) {
            console.error('❌ Erreur recordAsync:', error);
          }
          setRecording(false);
        });

      return true;
    } catch (error) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      setRecording(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (cameraRef: RefObject<CameraView | null>) => {
    if (!cameraRef.current || !recording) {
      return null;
    }

    try {
      console.log('🛑 Arrêt enregistrement...');
      
      if (recordingPromiseRef.current) {
        cameraRef.current.stopRecording();
        await recordingPromiseRef.current;
        recordingPromiseRef.current = null;
      } else {
        await cameraRef.current.stopRecording();
      }
      
      setRecording(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return videoUriRef.current;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (!msg.includes('stopped before any data')) {
        console.error('❌ Erreur stopRecording:', error);
      }
      setRecording(false);
      return null;
    }
  }, [recording]);

  const resetVideoUri = useCallback(() => {
    setVideoUri(null);
    videoUriRef.current = null;
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