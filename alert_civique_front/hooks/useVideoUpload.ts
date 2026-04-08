import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { MediaService } from '@/app/lib/services/MediaService';
import ContactAlertService from '@/app/lib/services/ContactAlertService';
import { AlertType } from '@/contexts/AlertContext';

export function useVideoUpload(
  token: string | undefined,
  userId: string | undefined,
  alertType?: AlertType,
  senderName?: string,
) {
  const uploadVideo = useCallback(async (videoUri: string, livestreamId: number) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        console.error('❌ Fichier vidéo introuvable:', videoUri);
        Alert.alert('Erreur', 'Le fichier vidéo est introuvable');
        return null;
      }

      console.log('📤 Upload vidéo en cours...', { uri: videoUri, size: (fileInfo as any).size });

      const mediaResponse = await MediaService.uploadVideo(videoUri, token!, userId || undefined);
      console.log('📤 Réponse upload:', mediaResponse);

      if (mediaResponse?.url) {
        // Notifier les contacts de confiance (email + SMS + bienveillance)
        if (token && userId && alertType) {
          const numericUserId = parseInt(userId, 10);
          const name = senderName || 'Un utilisateur';
          const results = await ContactAlertService.notifyContacts(
            numericUserId, alertType, name, token
          );
          const emailOk = results.some(r => r.emailSent);
          const smsOk   = results.some(r => r.smsSent);
          console.log('📬 Contacts notifiés:', results);

          Alert.alert(
            '🚨 Alerte transmise',
            `Votre signalement vidéo a été envoyé aux autorités.\n\n` +
            `Vos contacts de confiance ont été notifiés :\n` +
            `${emailOk ? '✅' : '⚠️'} Email\n` +
            `${smsOk   ? '✅' : '⚠️'} SMS\n` +
            `💚 Un message de bienveillance leur a été adressé.`
          );
        } else {
          Alert.alert(
            '🚨 Alerte envoyée',
            'Votre signalement vidéo a été transmis aux autorités compétentes. Les secours ont été notifiés.'
          );
        }
        return mediaResponse;
      } else {
        console.error('❌ Pas d\'URL dans la réponse upload');
        Alert.alert('Erreur', 'L\'upload a échoué : réponse invalide');
        return null;
      }
    } catch (uploadError) {
      console.error('❌ Upload error détaillé:', uploadError);
      Alert.alert(
        'Erreur upload',
        `Impossible d'uploader la vidéo : ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`
      );
      return null;
    }
  }, [token, userId, alertType, senderName]);

  return { uploadVideo };
}
