import { JAVA_BASE_URL } from '@/lib/config';
import { PushNotification } from '@/models';

export default class PushNotificationService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Envoie une push notification → POST /api/push-notifications/send
   */
  static async send(
    payload: Omit<PushNotification, 'pushNotificationId' | 'sent_at'>,
    token: string
  ): Promise<PushNotification | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/push-notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          sent_at: new Date().toISOString(),
        }),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
      return JSON.parse(text) as PushNotification;
    } catch (e) {
      console.error('PushNotificationService.send error:', e);
      return null;
    }
  }

  /**
   * Récupère les notifications d'un utilisateur → GET /api/push-notifications/user/{userId}
   */
  static async getByUserId(userId: number, token: string): Promise<PushNotification[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/push-notifications/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('PushNotificationService.getByUserId error:', e);
      return [];
    }
  }

  /**
   * Récupère les notifications liées à un report → GET /api/push-notifications/report/{reportId}
   */
  static async getByReportId(reportId: number, token: string): Promise<PushNotification[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/push-notifications/report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('PushNotificationService.getByReportId error:', e);
      return [];
    }
  }
}
