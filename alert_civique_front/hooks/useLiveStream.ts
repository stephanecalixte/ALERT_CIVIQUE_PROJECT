import { CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState, useCallback } from 'react';
import LiveStreamService from '../app/services/LiveStreamService';
import MediaService from '../app/services/MediaService';
import { useAuth } from '../contexts/AuthContext';
import type { LiveStream } from '../models/LiveStream';
import { Alert } from 'react-native';

type LiveStreamPayload = {
  userId: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  facing?: string;
};

export function useLiveStream() {
  const { userId } = useAuth();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [livestreamId, setLivestreamId] = useState<number | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);

  const cameraRef = useRef<any>(null);
  const recorderRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load streams
  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const data = await LiveStreamService.getLiveStreams();
      setStreams(data || []);
    } catch (error) {
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
      const response = await LiveStreamService.sendLiveStreamData(payload);
      setLivestreamId(response?.livestreamId || null);
      console.log("Stream démarré ID:", response?.livestreamId);
    } catch (error) {
      Alert.alert('Erreur', 'Échec démarrage stream');
      console.error("Erreur envoi start stream:", error);
    }
  }, [userId, facing]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HighQuality
      );
      recorderRef.current = recording;
      await recorderRef.current.startAsync();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recorderRef.current) return;

      await recorderRef.current.stopAndUnloadAsync();
      const uri = recorderRef.current.getURI();
      recorderRef.current = null;
      setRecording(false);

      // Upload video
      const mediaResponse = await MediaService.uploadVideo(uri!);
      const videoUrl = mediaResponse?.url;

      // Update LiveStream with video
      if (livestreamId && videoUrl) {
        await LiveStreamService.updateLiveStream(livestreamId, {
          videoUrl,
          mediaId: mediaResponse?.mediaId,
        });
      }

      console.log('Video uploaded:', videoUrl);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Erreur', 'Échec enregistrement/upload');
    }
  };

  const sendStopStream = useCallback(async () => {
    try {
      if (!startTimeRef.current) return;

      const duration = (new Date().getTime() - startTimeRef.current.getTime()) / 1000;

      const payload: LiveStreamPayload = {
        userId: userId || '123',
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
      };
      await LiveStreamService.sendLiveStreamData(payload);
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

