import { JAVA_BASE_URL } from '@/lib/config';
import { Geolocalisation } from '@/models';

export default class GeolocalisationService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Crée une géolocalisation → POST /api/geolocations
   */
  static async create(
    data: Omit<Geolocalisation, 'geolocalisationId'>,
    token: string
  ): Promise<Geolocalisation> {
    const response = await fetch(`${this.BASE_URL}/api/geolocations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
    return JSON.parse(text) as Geolocalisation;
  }

  /**
   * Lie une géolocalisation existante à un report → PUT /api/geolocations/{id}
   */
  static async linkToReport(
    geolocalisationId: number,
    reportId: number,
    token: string
  ): Promise<Geolocalisation> {
    const response = await fetch(`${this.BASE_URL}/api/geolocations/${geolocalisationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ geolocalisationId, reportId }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
    return JSON.parse(text) as Geolocalisation;
  }
}
