import { useEffect, useCallback, useRef, useState } from 'react';
import { useCameraManager } from './useCameraManager';
import { useVideoRecording } from './useVideoRecording';
import { useLiveStreamAPI } from './useLiveStreamApi';
import { useVideoUpload } from './useVideoUpload';
import { useAuth } from '../contexts/AuthContext';
import { AlertType } from '@/contexts/AlertContext';

export function useLiveStreamManager(autoStart = false, onComplete?: () => void, reportId?: number, alertType?: AlertType) {
  const { user, token } = useAuth();
  const userId = user?.userId?.toString();
  const [isUploading, setIsUploading] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cameraManager = useCameraManager();
  const videoRecording = useVideoRecording();
  const liveStreamAPI = useLiveStreamAPI(token ?? undefined, userId ?? undefined, reportId, alertType);
  const senderName = user?.name ?? undefined;
  const videoUpload = useVideoUpload(token ?? undefined, userId ?? undefined, alertType, senderName);

  const toggleCameraRef = useRef<() => Promise<void>>(async () => {});

  const toggleCamera = useCallback(async () => {
    if (!cameraManager.isCameraActive) {
      videoRecording.resetVideoUri();
      cameraManager.activateCamera();
    } else {
      // Annulation manuelle avant que l'enregistrement démarre
      cameraManager.deactivateCamera();
      onCompleteRef.current?.();
    }
  }, [cameraManager, videoRecording]);

  toggleCameraRef.current = toggleCamera;

  // Démarre le stream et ouvre la caméra native dès que isCameraActive devient true
  useEffect(() => {
    if (!cameraManager.isCameraActive) return;

    const startStreamAndRecord = async () => {
      await liveStreamAPI.sendStartStream(cameraManager.facing);

      const videoUri = await videoRecording.startRecording(
        cameraManager.cameraRef,
        async () => {
          // Échec ou annulation
          await liveStreamAPI.sendStopStream();
          cameraManager.deactivateCamera();
          onCompleteRef.current?.();
        }
      );

      if (!videoUri) return; // handled by onFailed callback above

      // Enregistrement réussi — upload automatique
      setIsUploading(true);
      await liveStreamAPI.sendStopStream();
      try {
        const mediaResponse = await videoUpload.uploadVideo(videoUri, liveStreamAPI.currentLivestreamId!);
        if (mediaResponse?.url) {
          await liveStreamAPI.updateStreamWithVideo(mediaResponse.url, mediaResponse?.videoId);
        }
      } finally {
        setIsUploading(false);
        cameraManager.deactivateCamera();
        onCompleteRef.current?.();
      }
    };

    startStreamAndRecord();
  }, [cameraManager.isCameraActive]);

  // Auto-démarrage
  useEffect(() => {
    if (autoStart && cameraManager.hasPermission === true && !cameraManager.isCameraActive) {
      toggleCameraRef.current();
    }
  }, [autoStart, cameraManager.hasPermission]);

  // Vérifier permissions au montage
  useEffect(() => {
    cameraManager.checkCameraPermission();
    liveStreamAPI.loadStreams();
  }, []);

  return {
    facing: cameraManager.facing,
    toggleCameraFacing: cameraManager.toggleCameraFacing,
    isLoading: cameraManager.isLoading,
    isCameraActive: cameraManager.isCameraActive,
    hasPermission: cameraManager.hasPermission,
    cameraRef: cameraManager.cameraRef,
    checkCameraPermission: cameraManager.checkCameraPermission,
    onCameraReady: cameraManager.onCameraReady,
    recording: videoRecording.recording,
    videoUri: videoRecording.videoUri,
    uploadProgress: videoRecording.uploadProgress,
    isUploading,
    streams: liveStreamAPI.streams,
    toggleCamera,
  };
}
