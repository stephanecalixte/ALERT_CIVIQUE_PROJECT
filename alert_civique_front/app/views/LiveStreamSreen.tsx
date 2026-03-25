import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
// import { useAuth } from '../contexts/AuthContext';
// import type { LiveStream } from '../models/LiveStream';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import { MediaService } from '@/app/lib/services/MediaService';
import { useAuth } from '@/contexts/AuthContext';
import { LiveStream } from '@/models';

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
  const [cameraInitialized, setCameraInitialized] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const startTimeRef = useRef<Date | null>(null);
  const initTimerRef = useRef<number | null>(null);
  const recordTimerRef = useRef<number | null>(null);

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

  const sendStartStream = useCallback(async () => {
    try {
      const payload = {
        userId: userId || '123',
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };

      console.log('📡 Envoi au serveur:', payload);
      const response = await LiveStreamService.sendLiveStreamData(payload, token!);
      setLivestreamId(response?.livestreamId || null);
      console.log("✅ Stream démarré ID:", response?.livestreamId);
      return response?.livestreamId;
    } catch (error) {
      console.error("❌ Erreur envoi start stream:", error);
      return null;
    }
  }, [userId, facing, token]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref is null');
      return false;
    }

    try {
      console.log('🎥 DÉMARRAGE ENREGISTREMENT VIDEO...');
      
      // Attendre un peu que la caméra soit vraiment prête
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      
      console.log('✅ Enregistrement terminé:', video);
      
      if (video && video.uri) {
        setVideoUri(video.uri);
        setRecording(true);
        console.log('✅ ENREGISTREMENT RÉUSSI! URI:', video.uri);
        return true;
      } else {
        console.error('❌ Pas d\'URI dans la réponse');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur recordAsync:', error);
      Alert.alert('Erreur', `Impossible d'enregistrer: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !recording) {
      return;
    }

    try {
      console.log('🛑 Arrêt enregistrement...');
      await cameraRef.current.stopRecording();
      setRecording(false);
      console.log('✅ Enregistrement arrêté');
      
      if (videoUri && livestreamId) {
        console.log('📤 Upload vidéo...');
        try {
          const mediaResponse = await MediaService.uploadVideo(videoUri, token!);
          if (mediaResponse?.url) {
            await LiveStreamService.updateLiveStream(livestreamId, {
              videoUrl: mediaResponse.url,
              videoId: mediaResponse?.videoId,
            }, token!);
            console.log('✅ Vidéo uploadée:', mediaResponse.url);
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
        }
      }
    } catch (error) {
      console.error('❌ Erreur stopRecording:', error);
    }
  }, [recording, videoUri, livestreamId, token]);

  const sendStopStream = useCallback(async () => {
    try {
      if (!startTimeRef.current) return;

      const duration = (Date.now() - startTimeRef.current.getTime()) / 1000;

      const payload = {
        userId: userId || '123',
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
        livestreamId: livestreamId,
      };
      await LiveStreamService.sendLiveStreamData(payload, token!);
      console.log("✅ Stream arrêté envoyé");
    } catch (error) {
      console.error("❌ Erreur envoi stop stream:", error);
    }
  }, [userId, livestreamId, token]);

  const toggleCamera = useCallback(async () => {
    console.log('🔄 toggleCamera appelé, isCameraActive:', isCameraActive);
    
    if (!isCameraActive) {
      console.log('🚀 Démarrage de la caméra...');
      setCameraInitialized(false);
      setIsCameraActive(true);
    } else {
      console.log('🛑 Arrêt de la caméra...');
      if (recording) {
        await stopRecording();
      }
      await sendStopStream();
      startTimeRef.current = null;
      setIsCameraActive(false);
      setCameraInitialized(false);
      
      // Nettoyer les timers
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
      if (recordTimerRef.current) {
        clearTimeout(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  }, [isCameraActive, recording, stopRecording, sendStopStream]);

  // Démarrer l'enregistrement après un délai fixe (plus fiable que onCameraReady)
  useEffect(() => {
    if (isCameraActive && !recording && !cameraInitialized) {
      console.log('⏳ Attente 2 secondes pour initialisation caméra...');
      
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
      
      initTimerRef.current = setTimeout(() => {
        console.log('✅ Caméra considérée comme prête après délai');
        setCameraInitialized(true);
      }, 2000);
    }
    
    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
    };
  }, [isCameraActive, recording, cameraInitialized]);

  // Démarrer le stream et l'enregistrement
  useEffect(() => {
    const startStreamAndRecording = async () => {
      if (isCameraActive && cameraInitialized && !recording) {
        console.log('🎬 DÉMARRAGE STREAM ET ENREGISTREMENT');
        startTimeRef.current = new Date();
        
        // Démarrer le stream sur le serveur
        await sendStartStream();
        
        // Démarrer l'enregistrement
        console.log('📹 Lancement de l\'enregistrement...');
        const success = await startRecording();
        
        if (success) {
          console.log('✅ ENREGISTREMENT VIDÉO ACTIF !');
        } else {
          console.log('❌ ÉCHEC ENREGISTREMENT - Désactivation caméra');
          setIsCameraActive(false);
          setCameraInitialized(false);
        }
      }
    };
    
    startStreamAndRecording();
  }, [isCameraActive, cameraInitialized, recording, sendStartStream, startRecording]);

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
  };
}