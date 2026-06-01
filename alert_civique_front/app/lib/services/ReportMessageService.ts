import { JAVA_BASE_URL } from '@/lib/config';
import { ReportMessage } from '@/models/ReportMessage';

export default class ReportMessageService {
  static BASE_URL = JAVA_BASE_URL;

  static async getAll(token?: string | null): Promise<ReportMessage[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${this.BASE_URL}/api/reportMessages`, { headers, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}

