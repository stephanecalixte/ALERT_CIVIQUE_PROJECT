import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import type { LiveStream } from '../models/LiveStream';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import { MediaService } from '@/app/lib/services/MediaService';

export function useLiveStream(autoStart = false) {
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
  // Garde une ref sur l'id courant pour stopRecording (évite closure stale)
  const livestreamIdRef = useRef<number | null>(null);
  const videoUriRef = useRef<string | null>(null);

  // Load streams
  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const data = await LiveStreamService.getLiveStreams(token!);
      setStreams(data || []);
    } catch (error) {
      console.error('Get LiveStreams error:', error);
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

  // ✅ FIX #1 — Auto-démarrage quand autoStart=true et permissions prêtes
  useEffect(() => {
    if (autoStart && hasPermission === true && !isCameraActive) {
      console.log('🚨 SOS autoStart déclenché');
      toggleCamera();
    }
  }, [autoStart, hasPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  const sendStartStream = useCallback(async () => {
    const effectiveUserId = userId || `anon_${Date.now()}`;
    const effectiveToken = token || '';

    try {
      const payload = {
        userId: effectiveUserId,
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };

      console.log('📡 SOS Envoi au serveur (auth ok):', payload);
      const response = await LiveStreamService.sendLiveStreamData(payload, effectiveToken);
      const id = response?.livestreamId || null;
      setLivestreamId(id);
      livestreamIdRef.current = id;
      console.log('✅ SOS Stream démarré ID:', id);
      return id;
    } catch (error) {
      console.error('❌ SOS Erreur start stream (continuing local):', error);
      // Continue sans backend pour SOS critique
      const fakeId = Date.now();
      setLivestreamId(fakeId);
      livestreamIdRef.current = fakeId;
      return fakeId;
    }
  }, [userId, facing, token]);

  // ✅ FIX #2 — recordAsync lancé sans await : non bloquant
  const startRecording = useCallback(async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref is null');
      return false;
    }

    try {
      console.log('🎥 Démarrage enregistrement vidéo...');

      // Petit délai pour s'assurer que la caméra est prête
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ On met recording à true AVANT d'attendre la fin de la vidéo
      setRecording(true);

      // ✅ recordAsync est bloquant jusqu'à stopRecording() — ne pas await ici
      cameraRef.current
        .recordAsync({ maxDuration: 60 })
        .then(video => {
          console.log('✅ Enregistrement terminé:', video);
          if (video?.uri) {
            setVideoUri(video.uri);
            videoUriRef.current = video.uri;
            console.log('✅ URI enregistrée:', video.uri);
          } else {
            console.error("❌ Pas d'URI dans la réponse");
          }
        })
        .catch(error => {
          console.error('❌ Erreur recordAsync:', error);
          setRecording(false);
          setIsCameraActive(false);
          setCameraInitialized(false);
          Alert.alert(
            'Erreur',
            `Impossible d'enregistrer: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          );
        });

      console.log('✅ ENREGISTREMENT VIDÉO LANCÉ (non bloquant)');
      return true;
    } catch (error) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      setRecording(false);
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

      // ✅ Utilise les refs pour éviter les closures stales
      const currentVideoUri = videoUriRef.current;
      const currentLivestreamId = livestreamIdRef.current;

      if (currentVideoUri && currentLivestreamId) {
        console.log('📤 Upload vidéo...');
        try {
          const mediaResponse = await MediaService.uploadVideo(currentVideoUri, token!);
          if (mediaResponse?.url) {
            await LiveStreamService.updateLiveStream(
              currentLivestreamId,
              { videoUrl: mediaResponse.url, videoId: mediaResponse?.videoId },
              token!
            );
            console.log('✅ Vidéo uploadée:', mediaResponse.url);
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
        }
      }
    } catch (error) {
      console.error('❌ Erreur stopRecording:', error);
    }
  }, [recording, token]);

  const sendStopStream = useCallback(async () => {
    try {
      if (!startTimeRef.current) return;

      const duration = (Date.now() - startTimeRef.current.getTime()) / 1000;

      const payload = {
        userId: userId || '123',
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
        livestreamId: livestreamIdRef.current,
      };
      await LiveStreamService.sendLiveStreamData(payload, token!);
      console.log('✅ Stream arrêté envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi stop stream:', error);
    }
  }, [userId, token]);

  const toggleCamera = useCallback(async () => {
    console.log('🔄 toggleCamera appelé, isCameraActive:', isCameraActive);

    if (!isCameraActive) {
      console.log('🚀 Démarrage de la caméra...');
      setCameraInitialized(false);
      setVideoUri(null);
      videoUriRef.current = null;
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

  // Délai d'initialisation caméra
  useEffect(() => {
    if (isCameraActive && !recording && !cameraInitialized) {
      console.log('⏳ Attente 1 seconde pour initialisation caméra SOS...');

      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }

      initTimerRef.current = setTimeout(() => {
        console.log('✅ Caméra prête après délai SOS');
        setCameraInitialized(true);
      }, 1000);
    }

    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
    };
  }, [isCameraActive, recording, cameraInitialized]);

  // Démarrer le stream et l'enregistrement
  useEffect(() => {
    if (isCameraActive && cameraInitialized && !recording && !videoUri) {
      console.log('🎬 DÉMARRAGE STREAM ET ENREGISTREMENT');
      startTimeRef.current = new Date();

      sendStartStream();

      console.log("📹 Lancement de l'enregistrement...");
      startRecording().then(success => {
        if (success) {
          console.log('✅ ENREGISTREMENT VIDÉO ACTIF !');
        } else {
          console.log('❌ ÉCHEC ENREGISTREMENT - Désactivation caméra');
          setIsCameraActive(false);
          setCameraInitialized(false);
        }
      });
    }
  }, [isCameraActive, cameraInitialized]);

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