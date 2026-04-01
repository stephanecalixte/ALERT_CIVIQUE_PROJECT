import { useEffect, useCallback } from 'react';
import { useCameraManager } from './useCameraManager';
import { useVideoRecording } from './useVideoRecording';
import { useLiveStreamAPI } from './useLiveStreamApi';
import { useVideoUpload } from './useVideoUpload';
import { useAuth } from '../contexts/AuthContext';

export function useLiveStreamManager(autoStart = false) {
  const { userId, token } = useAuth();
  
  // Sous-hooks spécialisés
  const cameraManager = useCameraManager();
  const videoRecording = useVideoRecording();
  const liveStreamAPI = useLiveStreamAPI(token ?? undefined, userId ?? undefined);
  const videoUpload = useVideoUpload(token ?? undefined, userId ?? undefined);

  // Auto-démarrage
  useEffect(() => {
    if (autoStart && cameraManager.hasPermission === true && !cameraManager.isCameraActive) {
      toggleCamera();
    }
  }, [autoStart, cameraManager.hasPermission]);

  // Initialisation de la caméra
  useEffect(() => {
    cameraManager.initializeCamera();
  }, [cameraManager.isCameraActive, cameraManager.cameraInitialized, cameraManager.initializeCamera]);

  // Démarrer le stream et l'enregistrement quand la caméra est prête
  useEffect(() => {
    if (cameraManager.isCameraActive && cameraManager.cameraInitialized && !videoRecording.recording && !videoRecording.videoUri && cameraManager.cameraRef.current) {
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

  const toggleCamera = useCallback(async () => {
    if (!cameraManager.isCameraActive) {
      videoRecording.resetVideoUri();
      cameraManager.activateCamera();
    } else {
      if (videoRecording.recording) {
        const videoUri = await videoRecording.stopRecording(cameraManager.cameraRef);
        await liveStreamAPI.sendStopStream();
        
        if (videoUri && liveStreamAPI.currentLivestreamId) {
          const mediaResponse = await videoUpload.uploadVideo(videoUri, liveStreamAPI.currentLivestreamId);
          if (mediaResponse?.url) {
            await liveStreamAPI.updateStreamWithVideo(mediaResponse.url, mediaResponse?.videoId);
          }
        }
      } else {
        await liveStreamAPI.sendStopStream();
      }
      
      cameraManager.deactivateCamera();
    }
  }, [cameraManager, videoRecording, liveStreamAPI, videoUpload]);

  // Vérifier les permissions au montage
  useEffect(() => {
    cameraManager.checkCameraPermission();
    liveStreamAPI.loadStreams();
  }, []);

  return {
    // Camera
    facing: cameraManager.facing,
    toggleCameraFacing: cameraManager.toggleCameraFacing,
    isLoading: cameraManager.isLoading,
    isCameraActive: cameraManager.isCameraActive,
    hasPermission: cameraManager.hasPermission,
    cameraRef: cameraManager.cameraRef,
    checkCameraPermission: cameraManager.checkCameraPermission,
    
    // Recording
    recording: videoRecording.recording,
    videoUri: videoRecording.videoUri,
    uploadProgress: videoRecording.uploadProgress,
    
    // Streams
    streams: liveStreamAPI.streams,
    
    // Actions
    toggleCamera,
  };
}