import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraType, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Camera } from 'expo-camera';

type FlashMode = 'off' | 'on' | 'torch' | 'auto';

interface CameraState {
  hasPermission: boolean;
  type: CameraType;
  flash: FlashMode;
  zoom: number;
  isProcessing: boolean;
}

export function useCamera() {
  const [cameraState, setCameraState] = useState<CameraState>({
    hasPermission: false,
type: 'back' as any,
    flash: 'off',
    zoom: 0,
    isProcessing: false,
  });
const cameraRef = useRef<CameraView>(null);

  // Permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setCameraState(prev => ({ 
        ...prev, 
        hasPermission: cameraStatus === 'granted' && mediaStatus === 'granted' 
      }));
    })();
  }, []);

  const toggleCameraType = useCallback(() => {
    setCameraState(prev => ({ 
      ...prev, 
type: prev.type === 'back' ? 'front' : 'back' as any
    }));
  }, []);

  const cycleFlash = useCallback(() => {
    const flashes: FlashMode[] = ['off', 'on', 'torch', 'auto'];
    const currentIndex = flashes.indexOf(cameraState.flash);
    const nextIndex = (currentIndex + 1) % flashes.length;
    setCameraState(prev => ({ ...prev, flash: flashes[nextIndex] }));
  }, [cameraState.flash]);

  const setZoom = useCallback((zoom: number) => {
    setCameraState(prev => ({ ...prev, zoom: Math.max(0, Math.min(1, zoom)) }));
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current === null) {
      Alert.alert('Erreur', 'Caméra non disponible');
      return;
    }

    try {
      setCameraState(prev => ({ ...prev, isProcessing: true }));
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
      });

      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert('Succès', 'Photo sauvegardée dans la galerie !');
      setCameraState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
      setCameraState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        Alert.alert('Succès', 'Image sélectionnée !');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
    }
  }, []);

  return {
    cameraState,
    cameraRef,
    toggleCameraType,
    cycleFlash,
    setZoom,
    takePicture,
    pickFromGallery,
    hasPermission: cameraState.hasPermission,
  };
}

