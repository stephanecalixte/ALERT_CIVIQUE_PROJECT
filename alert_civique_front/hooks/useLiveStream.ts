import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import type { LiveStream } from '../models/LiveStream';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import { MediaService } from '@/app/lib/services/MediaService';

type LiveStreamPayload = {
  userId: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  facing?: string;
};

export function useLiveStream() {
  const { userId, token } = useAuth();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [livestreamId, setLivestreamId] = useState<number | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false); // ✅ Nouvel état

  const cameraRef = useRef<CameraView>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load streams
  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const data = await LiveStreamService.getLiveStreams(token!);
      setStreams(data || []);
    } catch (error) {
      console.error("Get LiveStreams error:", error);
    }
  };

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = useCallback(async () => {
    try {
      if (!permission) {
        const { status } = await requestPermission();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(permission.granted);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [permission, requestPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  // ✅ Callback quand la caméra est prête
  const onCameraReady = useCallback(() => {
    console.log('✅ Caméra prête');
    setIsCameraReady(true);
  }, []);

  const sendStartStream = useCallback(async () => {
    try {
      const payload: LiveStreamPayload = {
        userId: userId || '123',
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };

      const response = await LiveStreamService.sendLiveStreamData(payload, token!);
      setLivestreamId(response?.livestreamId || null);
      console.log("Stream démarré ID:", response?.livestreamId);
      return response?.livestreamId;
    } catch (error) {
      Alert.alert('Erreur', 'Échec démarrage stream');
      console.error("Erreur envoi start stream:", error);
      throw error;
    }
  }, [userId, facing, token]);

  // ✅ Version corrigée avec vérification que la caméra est prête
  const startRecording = useCallback(async () => {
    // ✅ Vérifier que la caméra est prête ET que le ref existe
    if (!isCameraReady || !cameraRef.current) {
      console.log('⏳ Caméra pas encore prête, attente...');
      return false;
    }

    try {
      console.log('🎥 Début enregistrement vidéo...');
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (video && video.uri) {
        console.log('✅ Vidéo enregistrée:', video.uri);
        setVideoUri(video.uri);
        setRecording(true);
        return true;
      } else {
        console.error('❌ Enregistrement sans URI');
        Alert.alert('Erreur', 'L\'enregistrement vidéo a échoué');
        setRecording(false);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo');
      setRecording(false);
      return false;
    }
  }, [isCameraReady]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !recording) {
      return;
    }

    try {
      console.log('🛑 Arrêt enregistrement...');
      
      await cameraRef.current.stopRecording();
      setRecording(false);
      
      console.log('📹 Vidéo sauvegardée:', videoUri);
      
      if (videoUri && livestreamId) {
        console.log('📤 Upload de la vidéo...');
        
        try {
          const mediaResponse = await MediaService.uploadVideo(videoUri, token!);
          
          if (mediaResponse?.url) {
            await LiveStreamService.updateLiveStream(livestreamId, {
              videoUrl: mediaResponse.url,
              mediaId: mediaResponse?.mediaId,
            }, token!);
            
            console.log('✅ Vidéo uploadée:', mediaResponse.url);
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
          Alert.alert('Erreur', 'La vidéo a été enregistrée mais l\'upload a échoué');
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur arrêt:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'arrêt');
    }
  }, [recording, videoUri, livestreamId, token]);

  const sendStopStream = useCallback(async () => {
    try {
      if (startTimeRef.current == null) return;

      const duration = (new Date().getTime() - startTimeRef.current.getTime()) / 1000;

      const payload: any = {
        userId: userId || '123',
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
        livestreamId: livestreamId,
      };
      await LiveStreamService.sendLiveStreamData(payload, token!);
      console.log("Stream arrêté envoyé");
    } catch (error) {
      console.error("Erreur envoi stop stream:", error);
    }
  }, [userId, livestreamId, token]);

  // ✅ Version corrigée de toggleCamera
  const toggleCamera = useCallback(async () => {
    if (!isCameraActive) {
      // Activer la caméra d'abord
      setIsCameraActive(true);
      
      // Attendre que la caméra soit prête avant de démarrer l'enregistrement
      // Le onCameraReady s'occupera de démarrer l'enregistrement
    } else {
      // Désactiver la caméra
      await stopRecording();
      await sendStopStream();
      startTimeRef.current = null;
      setIsCameraActive(false);
      setIsCameraReady(false); // Reset l'état de préparation
    }
  }, [isCameraActive, stopRecording, sendStopStream]);

  // ✅ Effet pour démarrer l'enregistrement quand la caméra est prête
  useEffect(() => {
    const startStreamAndRecording = async () => {
      if (isCameraActive && isCameraReady && !recording) {
        console.log('🎬 Caméra prête, démarrage du stream...');
        startTimeRef.current = new Date();
        
        try {
          await sendStartStream();
          await startRecording();
        } catch (error) {
          console.error('Erreur démarrage:', error);
          // En cas d'erreur, désactiver la caméra
          setIsCameraActive(false);
          setIsCameraReady(false);
        }
      }
    };
    
    startStreamAndRecording();
  }, [isCameraActive, isCameraReady, recording, sendStartStream, startRecording]);

  return {
    facing,
    toggleCameraFacing,
    isLoading,
    isCameraActive,
    hasPermission,
    cameraRef,
    toggleCamera,
    checkCameraPermission,
    recording,
    streams,
    onCameraReady, // ✅ Exporter le callback
  };
}