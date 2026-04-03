import { LiveStream } from "@/models";
import { SERVER_BASE_URL } from '@/lib/config';

export interface LiveStreamStartResponse {
  success: boolean;
  livestreamId: number;
  startedAt: string;
}

export interface LiveStreamEndResponse {
  success: boolean;
  liveStream: LiveStream;
}

export interface LiveStreamUpdateResponse {
  success: boolean;
  liveStream: LiveStream;
}

function xhrRequest(method: 'GET' | 'POST', url: string, token: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 10000;

    xhr.onload = () => {
      // React Native: xhr.responseText can be empty even on success; fall back to xhr.response
      const responseText =
        xhr.responseText ||
        (xhr.response && typeof xhr.response === 'string' ? xhr.response : '');
      console.log('XHR response:', method, url, xhr.status, responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(responseText));
        } catch {
          reject(new Error(`JSON parse error: ${responseText}`));
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    xhr.send(body ? JSON.stringify(body) : null);
  });
}

export default class LiveStreamService {
  static BASE_URL = SERVER_BASE_URL;

  static async sendLiveStreamData(payload: any, token: string) {
    const isStart = !payload.livestreamId;
    const endpoint = isStart ? '/api/livestream/start' : '/api/livestream/end';

    const cleanPayload: any = {};
    if (payload.userId) cleanPayload.userId = payload.userId;
    if (payload.facing) cleanPayload.facing = payload.facing;
    if (payload.startedAt) cleanPayload.startedAt = payload.startedAt;
    if (payload.endedAt) cleanPayload.endedAt = payload.endedAt;
    if (payload.duration) cleanPayload.duration = payload.duration;
    if (payload.livestreamId) cleanPayload.livestreamId = payload.livestreamId;

    console.log('LiveStream request:', { endpoint, cleanPayload });
    return xhrRequest('POST', `${this.BASE_URL}${endpoint}`, token, cleanPayload);
  }

  static async updateLiveStream(livestreamId: number, data: any, token: string): Promise<LiveStreamUpdateResponse> {
    return xhrRequest('POST', `${this.BASE_URL}/api/livestream/update`, token, { livestreamId, ...data });
  }

  static async getLiveStreams(token: string): Promise<LiveStream[]> {
    try {
      return await xhrRequest('GET', `${this.BASE_URL}/api/livestream/list`, token);
    } catch (error) {
      console.error('Get live streams error:', error);
      return [];
    }
  }

  static async getLiveStreamById(livestreamId: number, token: string): Promise<LiveStream | null> {
    try {
      return await xhrRequest('GET', `${this.BASE_URL}/api/livestream/${livestreamId}`, token);
    } catch (error) {
      console.error('Get live stream error:', error);
      return null;
    }
  }
}
