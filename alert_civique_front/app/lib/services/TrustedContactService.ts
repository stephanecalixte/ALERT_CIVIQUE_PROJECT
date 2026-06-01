import { JAVA_BASE_URL } from '@/lib/config';
import { TrustedContact } from '@/models';

export default class TrustedContactService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Récupère les contacts de confiance d'un utilisateur → GET /api/trusted-contacts/user/{userId}
   */
  static async getByUserId(userId: number, token?: string | null): Promise<TrustedContact[]> {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${this.BASE_URL}/api/trusted-contacts/user/${userId}`, { headers });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('TrustedContactService.getByUserId error:', e);
      return [];
    }
  }

  /**
   * Crée un contact de confiance → POST /api/trusted-contacts
   */
  static async create(data: Omit<TrustedContact, 'id'>, token?: string | null): Promise<TrustedContact | null> {
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${this.BASE_URL}/api/trusted-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(data),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
      return JSON.parse(text) as TrustedContact;
    } catch (e) {
      console.error('TrustedContactService.create error:', e);
      return null;
    }
  }

  /**
   * Supprime un contact → DELETE /api/trusted-contacts/{id}
   */
  static async delete(id: number, token?: string | null): Promise<boolean> {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${this.BASE_URL}/api/trusted-contacts/${id}`, {
        method: 'DELETE',
        headers,
      });
      return response.ok;
    } catch (e) {
      console.error('TrustedContactService.delete error:', e);
      return false;
    }
  }
}
