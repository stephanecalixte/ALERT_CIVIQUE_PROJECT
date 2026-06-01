import { JAVA_BASE_URL } from '@/lib/config';
import { History } from '@/models/History';

export default class HistoryService {
  static BASE_URL = JAVA_BASE_URL;

  static async getAll(token?: string | null): Promise<History[]> {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${this.BASE_URL}/api/history`, { headers });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('HistoryService.getAll error:', e);
      return [];
    }
  }
}
