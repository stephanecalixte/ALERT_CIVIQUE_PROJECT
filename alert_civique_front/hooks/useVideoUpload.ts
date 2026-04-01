import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MediaService } from '@/app/lib/services/MediaService';

export function useVideoUpload(token: string | undefined, userId: string | undefined) {
  const uploadVideo = useCallback(async (videoUri: string, livestreamId: number) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        console.error('❌ Fichier vidéo introuvable:', videoUri);
        Alert.alert('Erreur', 'Le fichier vidéo est introuvable');
        return null;
      }

      console.log('📤 Upload vidéo en cours...', {
        uri: videoUri,
        size: (fileInfo as any).size
      });
      
      const mediaResponse = await MediaService.uploadVideo(videoUri, token!, userId || undefined);
      console.log('📤 Réponse upload:', mediaResponse);
      
      if (mediaResponse?.url) {
        Alert.alert('Succès', 'Vidéo enregistrée avec succès');
        return mediaResponse;
      } else {
        console.error('❌ Pas d\'URL dans la réponse upload');
        Alert.alert('Erreur', 'L\'upload a échoué: réponse invalide');
        return null;
      }
    } catch (uploadError) {
      console.error('❌ Upload error détaillé:', uploadError);
      Alert.alert(
        'Erreur upload',
        `Impossible d'uploader la vidéo: ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`
      );
      return null;
    }
  }, [token, userId]);

  return { uploadVideo };
}