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


async function fetchRequest(
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  token: string,
  body?: any
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  const options: RequestInit = {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log('Fetch', method, url, response.status, text.slice(0, 200));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return text ? JSON.parse(text) : {};
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}


export default class LiveStreamService {
  static BASE_URL = JAVA_BASE_URL;

  /**
   * Démarre un livestream → POST /api/livestream/create
   */
  static async startStream(
    userId: string,
    facing: string,
    token: string
  ): Promise<LiveStreamStartResponse> {
    const body = { userId };
    console.log('📡 Start stream →', body);
    return fetchRequest('POST', `${this.BASE_URL}/api/livestream/create`, token, body);
  }

  /**
   * Arrête un livestream → PUT /api/livestream/update
   */
  static async stopStream(
    livestreamId: number,
    userId: string | null,
    duration: number,
    token: string
  ): Promise<LiveStreamEndResponse> {
    // endedAt formaté sans timezone pour LocalDateTime Java
    const now = new Date();
    const endedAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const body = { livestreamId, userId, status: 'ENDED', endedAt, duration };
    console.log('📡 Stop stream →', body);
    return fetchRequest('PUT', `${this.BASE_URL}/api/livestream/update`, token, body);
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
    return fetchRequest('PUT', `${this.BASE_URL}/api/livestream/update`, token, body);
  }

  /**
   * Liste tous les livestreams → GET /api/livestream
   */
  static async getLiveStreams(token: string): Promise<LiveStream[]> {
    try {
      return await fetchRequest('GET', `${this.BASE_URL}/api/livestream`, token);
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
      return await fetchRequest('GET', `${this.BASE_URL}/api/livestream/${livestreamId}`, token);
    } catch (error) {
      console.error('Get live stream error:', error);
      return null;
    }
  }

  // ── Compatibilité avec l'ancien appel sendLiveStreamData ──────────────────
  static async sendLiveStreamData(payload: any, token: string) {
    if (!payload.livestreamId) {
      return this.startStream(payload.userId, payload.facing || 'back', token);
    } else {
      const duration = payload.duration || 0;
      return this.stopStream(payload.livestreamId, payload.userId ?? null, duration, token);
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