import { CameraType, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState, useCallback } from 'react';
import LiveStreamService from '../app/services/LiveStreamService';
import type { LiveStream } from '../models/LiveStream';

type LiveStreamPayload = {
  userId: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  facing?: string;
};

export function useLiveStream(userId: string) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const cameraRef = useRef<any>(null);
  const startTimeRef = useRef<Date | null>(null);

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
        userId,
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };
      await LiveStreamService.sendLiveStreamData(payload);
      console.log("Stream démarré envoyé au backend");
    } catch (error) {
      console.error("Erreur envoi start stream:", error);
    }
  }, [userId, facing]);

  const sendStopStream = useCallback(async () => {
    try {
      if (!startTimeRef.current) return;

      const duration = (new Date().getTime() - startTimeRef.current.getTime()) / 1000;

      const payload: LiveStreamPayload = {
        userId,
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
    } else {
      await sendStopStream();
      startTimeRef.current = null;
    }
    setIsCameraActive(prev => !prev);
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
  };
}

