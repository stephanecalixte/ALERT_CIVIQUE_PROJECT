import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';

export function useCameraManager() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkCameraPermission = useCallback(async () => {
    try {
      const camGranted = permission?.granted ?? (await requestPermission()).status === 'granted';
      const micGranted = micPermission?.granted ?? (await requestMicPermission()).status === 'granted';
      setHasPermission(camGranted && micGranted);
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [permission, requestPermission, micPermission, requestMicPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const activateCamera = useCallback(() => {
    setIsCameraActive(true);
  }, []);

  const deactivateCamera = useCallback(() => {
    setIsCameraActive(false);
    setCameraInitialized(false);
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
  }, []);

  // Appelé par onCameraReady de CameraView — garantit que le ref est prêt
  const onCameraReady = useCallback(() => {
    if (isCameraActive) {
      setCameraInitialized(true);
    }
  }, [isCameraActive]);

  // Garde pour compatibilité (ne fait plus rien)
  const initializeCamera = useCallback(() => {}, []);

  return {
    facing,
    toggleCameraFacing,
    isLoading,
    isCameraActive,
    hasPermission,
    cameraInitialized,
    cameraRef,
    checkCameraPermission,
    activateCamera,
    deactivateCamera,
    initializeCamera,
    onCameraReady,
  };
}