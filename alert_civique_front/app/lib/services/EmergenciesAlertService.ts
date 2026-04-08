import { JAVA_BASE_URL } from '@/lib/config';
import { EmergenciesAlert } from '@/models';

export default class EmergenciesAlertService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Crée une alerte urgence (notifie les autorités ou un contact) → POST /api/emergencies
   */
  static async create(
    email: string,
    message: string,
    token: string
  ): Promise<EmergenciesAlert | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/emergencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          sentAt: new Date().toISOString(),
          messages: [{ message, createdAt: new Date().toISOString() }],
        }),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
      return JSON.parse(text) as EmergenciesAlert;
    } catch (e) {
      console.error('EmergenciesAlertService.create error:', e);
      return null;
    }
  }

  /**
   * Envoie une alerte à chaque contact de confiance
   */
  static async notifyTrustedContacts(
    contacts: { email: string; name: string }[],
    message: string,
    token: string
  ): Promise<{ email: string; sent: boolean }[]> {
    const results = await Promise.allSettled(
      contacts.map((c) => this.create(c.email, message, token))
    );

    return contacts.map((c, i) => ({
      email: c.email,
      sent: results[i].status === 'fulfilled' && results[i].value !== null,
    }));
  }
}
