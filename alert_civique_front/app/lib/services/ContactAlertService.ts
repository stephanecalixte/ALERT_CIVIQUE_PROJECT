import { JAVA_BASE_URL } from '@/lib/config';

export interface ContactNotificationResult {
  contactName: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
}

export default class ContactAlertService {
  static BASE_URL = JAVA_BASE_URL;

  static async notifyContacts(
    userId: number,
    alertType: string,
    senderName: string,
    token: string
  ): Promise<ContactNotificationResult[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/trusted-contacts/notify-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, alertType, senderName }),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('ContactAlertService.notifyContacts error:', e);
      return [];
    }
  }
}
