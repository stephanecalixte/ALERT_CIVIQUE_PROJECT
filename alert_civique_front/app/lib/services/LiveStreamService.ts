import { LiveStream } from "@/models";
import { JAVA_BASE_URL } from '@/lib/config';

export interface LiveStreamStartResponse {
  livestreamId: number;
  userId: string;
  startedAt: string;
  status: string;
}

export interface LiveStreamEndResponse {
  livestreamId: number;
  status: string;
  endedAt: string;
}

export interface LiveStreamUpdateResponse {
  livestreamId: number;
  videoUrl: string;
}

// ─── XHR helper (GET / POST / PUT) ───────────────────────────────────────────
function xhrRequest(
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  token: string,
  body?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 6000;

    xhr.onload = () => {
      const text = xhr.responseText || '';
      console.log('XHR', method, url, xhr.status, text.slice(0, 200));
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(text ? JSON.parse(text) : {});
        } catch {
          resolve({});
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${text}`));
      }
    };
    xhr.onerror   = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    xhr.send(body != null ? JSON.stringify(body) : null);
  });
}

// ─── LiveStreamService ────────────────────────────────────────────────────────
export default class LiveStreamService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Démarre un livestream → POST /api/livestream/create
   * Java retourne un LiveStreamDTO : { livestreamId, userId, startedAt, status, … }
   */
  static async startStream(
    userId: string,
    facing: string,
    token: string
  ): Promise<LiveStreamStartResponse> {
    const body = {
      userId,
      status: 'LIVE',
      startedAt: new Date().toISOString(),
    };
    console.log('📡 Start stream →', body);
    return xhrRequest('POST', `${this.BASE_URL}/api/livestream/create`, token, body);
  }

  /**
   * Arrête un livestream → PUT /api/livestream/update
   */
  static async stopStream(
    livestreamId: number,
    userId: string,
    duration: number,
    token: string
  ): Promise<LiveStreamEndResponse> {
    const body = {
      livestreamId,
      userId,
      status: 'ENDED',
      endedAt: new Date().toISOString(),
      duration,
    };
    console.log('📡 Stop stream →', body);
    return xhrRequest('PUT', `${this.BASE_URL}/api/livestream/update`, token, body);
  }

  /**
   * Associe une vidéo au livestream → PUT /api/livestream/update
   */
  static async updateStreamWithVideo(
    livestreamId: number,
    videoUrl: string,
    token: string
  ): Promise<LiveStreamUpdateResponse> {
    const body = { livestreamId, videoUrl };
    console.log('📡 Update stream video →', body);
    return xhrRequest('PUT', `${this.BASE_URL}/api/livestream/update`, token, body);
  }

  /**
   * Liste tous les livestreams → GET /api/livestream
   */
  static async getLiveStreams(token: string): Promise<LiveStream[]> {
    try {
      return await xhrRequest('GET', `${this.BASE_URL}/api/livestream`, token);
    } catch (error) {
      console.error('Get live streams error:', error);
      return [];
    }
  }

  /**
   * Récupère un livestream par ID → GET /api/livestream/{id}
   */
  static async getLiveStreamById(
    livestreamId: number,
    token: string
  ): Promise<LiveStream | null> {
    try {
      return await xhrRequest('GET', `${this.BASE_URL}/api/livestream/${livestreamId}`, token);
    } catch (error) {
      console.error('Get live stream error:', error);
      return null;
    }
  }

  // ── Compatibilité avec l'ancien appel sendLiveStreamData ──────────────────
  static async sendLiveStreamData(payload: any, token: string) {
    if (!payload.livestreamId) {
      // start
      return this.startStream(payload.userId, payload.facing || 'back', token);
    } else {
      // stop
      const duration = payload.duration || 0;
      return this.stopStream(payload.livestreamId, payload.userId || '', duration, token);
    }
  }

  // ── Compatibilité avec l'ancien appel updateLiveStream ────────────────────
  static async updateLiveStream(
    livestreamId: number,
    data: { videoUrl?: string; videoId?: string },
    token: string
  ): Promise<LiveStreamUpdateResponse> {
    return this.updateStreamWithVideo(livestreamId, data.videoUrl || '', token);
  }
}
