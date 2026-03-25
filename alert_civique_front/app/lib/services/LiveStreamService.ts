// app/lib/services/LiveStreamService.ts
// import type { LiveStream } from '../models/LiveStream';

import { LiveStream } from "@/models";

export default class LiveStreamService {
  static BASE_URL = 'http://10.0.2.2:9092'; // ✅ Utilisez le bon port (9092 pour le serveur vidéo)
  
  static async sendLiveStreamData(payload: any, token: string) {
    try {
      const isStart = !payload.livestreamId;
      const endpoint = isStart ? '/api/livestream/start' : '/api/livestream/end';
      
      // ✅ Nettoyer le payload
      const cleanPayload: any = {};
      if (payload.userId) cleanPayload.userId = payload.userId;
      if (payload.facing) cleanPayload.facing = payload.facing;
      if (payload.startedAt) cleanPayload.startedAt = payload.startedAt;
      if (payload.endedAt) cleanPayload.endedAt = payload.endedAt;
      if (payload.duration) cleanPayload.duration = payload.duration;
      if (payload.livestreamId) cleanPayload.livestreamId = payload.livestreamId;
      
      console.log('LiveStream request:', { endpoint, cleanPayload });
      
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanPayload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiveStream error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('LiveStream response:', data);
      return data;
    } catch (error) {
      console.error('LiveStreamService error:', error);
      throw error;
    }
  }
  
  static async updateLiveStream(livestreamId: number, data: any, token: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/api/livestream/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ livestreamId, ...data }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update live stream error:', error);
      throw error;
    }
  }
  
  static async getLiveStreams(token: string): Promise<LiveStream[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/livestream/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get live streams error:', error);
      return [];
    }
  }
}