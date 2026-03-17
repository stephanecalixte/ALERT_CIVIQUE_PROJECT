import AsyncStorage from '@react-native-async-storage/async-storage';
import sendData from './SendData';
import type { PushNotification } from '../../models/PushNotification';

export type PushNotificationProps = Omit<PushNotification, 'pushNotificationId' | 'sent_at'> & { 
  sent_at?: string;
};

class PushNotificationService {
  async sendPushNotification(payload: PushNotificationProps) {
    try {
      const response = await sendData('/api/push-notifications/send', payload);
      console.log('✅ Notif envoyée:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur push:', error);
      throw error;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('pushToken');
  }
}

export default new PushNotificationService();

