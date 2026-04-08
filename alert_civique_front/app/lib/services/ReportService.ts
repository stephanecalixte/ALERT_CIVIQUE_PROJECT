import { JAVA_BASE_URL } from '@/lib/config';
import { Report, ReportsStatus } from '@/models';

export type ReportCreate = {
  description: string;
  latitude?: number;
  longitude?: number;
  locationText?: string;
  anonymous?: boolean;
  userId?: number;
  categoryId?: number;
  geolocalisationId?: number;
  priority?: string;
};

export default class ReportService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Crée un signalement → POST /api/report
   */
  static async createReport(payload: ReportCreate, token: string): Promise<Report> {
    const response = await fetch(`${this.BASE_URL}/api/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        status: ReportsStatus.PENDING,
        createdAt: new Date().toISOString(),
      }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
    return JSON.parse(text) as Report;
  }

  /**
   * Récupère tous les signalements → GET /api/report
   */
  static async getAll(token: string): Promise<Report[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Récupère un signalement par ID → GET /api/report/{id}
   */
  static async getById(reportId: number, token: string): Promise<Report | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Met à jour un signalement → PUT /api/report/{id}
   */
  static async update(reportId: number, payload: Partial<Report>, token: string): Promise<Report | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/report/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      if (!response.ok) return null;
      return JSON.parse(text) as Report;
    } catch {
      return null;
    }
  }
}
