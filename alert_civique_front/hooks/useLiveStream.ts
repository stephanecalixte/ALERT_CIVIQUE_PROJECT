import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState, useCallback } from 'react';
// import LiveStreamService from '../lib/services/LiveStreamService';
// import MediaService from '../lib/services/MediaService';
import { useAuth } from '../contexts/AuthContext';
import type { LiveStream } from '../models/LiveStream';
import { Alert } from 'react-native';
import LiveStreamCamera from '@/components/LiveStreamCamera';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import MediaService from '@/app/lib/services/MediaService';



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

const cameraRef = useRef<CameraView>(null as any);
  const recorderRef = useRef<Audio.Recording | null>(null);
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
      Alert.alert('Erreur', 'Impossible de charger les streams');
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
      const payload: LiveStreamPayload = {
        userId: userId || '123',
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };

      
      const response = await LiveStreamService.sendLiveStreamData(payload, token!);
      setLivestreamId(response?.livestreamId || null);
      console.log("Stream démarré ID:", response?.livestreamId);
    } catch (error) {
      Alert.alert('Erreur', 'Échec démarrage stream');
      console.error("Erreur envoi start stream:", error);
    }
  }, [userId, facing]);

  const startRecording = async () => {
    try {
      console.log('=== START RECORDING DEBUG ===');
      
      // Cleanup previous
      if (recorderRef.current) {
        console.log('Cleanup previous recording');
        await recorderRef.current.stopAndUnloadAsync();
        recorderRef.current = null;
      }
      
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Audio permission:', status);
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission audio refusée');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 0,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false
      });
      
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.MAX,
          numberOfChannels: 2,
          sampleRate: 44100,
        },
        web: {}
      } as Audio.RecordingOptions;
      
      console.log('Custom recording options:', recordingOptions);
      
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recorderRef.current = recording;
      console.log('New recorder created:', recording);
      
// Direct start - no prepare needed
      await recorderRef.current.startAsync();
      console.log('Recording STARTED SUCCESS');
      setRecording(true);
      setRecording(true);
    } catch (err: any) {
      console.error('RECORDING ERROR FULL:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      Alert.alert('Erreur enregistrement', err.message || 'Erreur inconnue');
    }
  };

  const stopRecording = async () => {
    try {
      if (recorderRef.current == null) return;

      await recorderRef.current.stopAndUnloadAsync();
      const uri = recorderRef.current.getURI();
      recorderRef.current = null;
      setRecording(false);

      // Upload video
      const mediaResponse = await MediaService.uploadVideo(uri!, token!);
      const videoUrl = mediaResponse?.url;

      // Update LiveStream with video
      if (livestreamId && videoUrl) {
        await LiveStreamService.updateLiveStream(livestreamId, {
          videoUrl,
          mediaId: mediaResponse?.mediaId,
        }, token!);
      }

      console.log('Video uploaded:', videoUrl);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Erreur', 'Échec enregistrement/upload');
    }
  };

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
      console.log("Stream arrêté envoyé au backend");
    } catch (error) {
      console.error("Erreur envoi stop stream:", error);
    }
  }, [userId]);

  const toggleCamera = useCallback(async () => {
    if (!isCameraActive) {
      startTimeRef.current = new Date();
      await sendStartStream();
      await startRecording();
    } else {
      await sendStopStream();
      await stopRecording();
      startTimeRef.current = null;
    }
    setIsCameraActive(prev => !prev);
    loadStreams(); // Refresh list
  }, [isCameraActive, sendStartStream, sendStopStream]);

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

