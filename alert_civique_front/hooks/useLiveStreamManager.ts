import { useEffect, useCallback, useRef, useState } from 'react';
import { useCameraManager } from './useCameraManager';
import { useVideoRecording } from './useVideoRecording';
import { useLiveStreamAPI } from './useLiveStreamApi';
import { useVideoUpload } from './useVideoUpload';
import { useAuth } from '../contexts/AuthContext';

export function useLiveStreamManager(autoStart = false, onComplete?: () => void) {
  const { userId, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // Ref pour éviter les closures périmées sur onComplete
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cameraManager = useCameraManager();
  const videoRecording = useVideoRecording();
  const liveStreamAPI = useLiveStreamAPI(token ?? undefined, userId ?? undefined);
  const videoUpload = useVideoUpload(token ?? undefined, userId ?? undefined);

  // Ref stable vers toggleCamera pour l'effet autoStart
  const toggleCameraRef = useRef<() => Promise<void>>(async () => {});

  const toggleCamera = useCallback(async () => {
    if (!cameraManager.isCameraActive) {
      videoRecording.resetVideoUri();
      cameraManager.activateCamera();
    } else {
      if (videoRecording.recording) {
        const videoUri = await videoRecording.stopRecording(cameraManager.cameraRef);
        await liveStreamAPI.sendStopStream();

        if (videoUri && liveStreamAPI.currentLivestreamId) {
          setIsUploading(true);
          try {
            const mediaResponse = await videoUpload.uploadVideo(videoUri, liveStreamAPI.currentLivestreamId);
            if (mediaResponse?.url) {
              await liveStreamAPI.updateStreamWithVideo(mediaResponse.url, mediaResponse?.videoId);
            }
          } finally {
            setIsUploading(false);
            onCompleteRef.current?.();
          }
        } else {
          onCompleteRef.current?.();
        }
      } else {
        await liveStreamAPI.sendStopStream();
        onCompleteRef.current?.();
      }

      cameraManager.deactivateCamera();
    }
  }, [cameraManager, videoRecording, liveStreamAPI, videoUpload]);

  // Maintenir la ref à jour
  toggleCameraRef.current = toggleCamera;

  // Initialisation de la caméra
  useEffect(() => {
    cameraManager.initializeCamera();
  }, [cameraManager.isCameraActive, cameraManager.cameraInitialized, cameraManager.initializeCamera]);

  // Démarrer le stream et l'enregistrement quand la caméra est prête
  useEffect(() => {
    if (
      cameraManager.isCameraActive &&
      cameraManager.cameraInitialized &&
      !videoRecording.recording &&
      !videoRecording.videoUri &&
      cameraManager.cameraRef.current
    ) {
      const startStreamAndRecord = async () => {
        await liveStreamAPI.sendStartStream(cameraManager.facing);
        const success = await videoRecording.startRecording(cameraManager.cameraRef);
        if (!success) {
          cameraManager.deactivateCamera();
        }
      };
      startStreamAndRecord();
    }
  }, [cameraManager.isCameraActive, cameraManager.cameraInitialized]);

  // Auto-démarrage via ref stable (évite la closure périmée)
  useEffect(() => {
    if (autoStart && cameraManager.hasPermission === true && !cameraManager.isCameraActive) {
      toggleCameraRef.current();
    }
  }, [autoStart, cameraManager.hasPermission]);

  // Vérifier les permissions au montage
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
    recording: videoRecording.recording,
    videoUri: videoRecording.videoUri,
    uploadProgress: videoRecording.uploadProgress,
    isUploading,
    streams: liveStreamAPI.streams,
    toggleCamera,
  };
}
