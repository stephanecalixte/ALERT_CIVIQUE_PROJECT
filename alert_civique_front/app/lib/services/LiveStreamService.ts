// import type { LiveStream } from '../../models/LiveStream';

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { LiveStream } from '@/models';

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:9090';
    if (Platform.OS === 'ios') return 'http://localhost:9090';
    return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:9090';
  }
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.com';
};

export type LiveStreamPayload = {
  userId?: string;
  livestreamId?: number;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  facing?: string;
  title?: string;
  description?: string;
  status?: string;
};

class LiveStreamService {
  static getLiveStreams(token: string): Promise<LiveStream[]> {
    return LiveStreamService.getLiveStreamsImpl(token);
  }

  static sendLiveStreamData(payload: LiveStreamPayload, token: string): Promise<LiveStream> {
    return LiveStreamService.sendLiveStreamDataImpl(payload, token);
  }

  static updateLiveStream(livestreamId: number, updatePayload: Partial<LiveStream>, token: string): Promise<void> {
    return LiveStreamService.updateLiveStreamImpl(livestreamId, updatePayload, token);
  }

  private static async getLiveStreamsImpl(token: string, baseUrl?: string): Promise<LiveStream[]> {
    const url = baseUrl || getBaseUrl();
    try {
      const response = await fetch(`${url}/api/livestream`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json() as LiveStream[];
    } catch (error) {
      console.error('Get LiveStreams error:', error);
      throw error;
    }
  }

  private static async sendLiveStreamDataImpl(payload: LiveStreamPayload, token: string, baseUrl?: string): Promise<any> {
    const url = baseUrl || getBaseUrl();
    
    // Common logic for start/stop
    const body = {
      userId: payload.userId,
      ...(payload.startedAt && {startedAt: payload.startedAt}),
      ...(payload.endedAt && {endedAt: payload.endedAt}),
      ...(payload.duration !== undefined && {duration: payload.duration}),
      status: payload.status || 'LIVE',
    };
    
    console.log('LiveStream payload:', JSON.stringify(payload, null, 2));
    console.log('LiveStream request body:', JSON.stringify(body, null, 2));
    console.log('LiveStream URL:', `${url}/api/livestream/${payload.livestreamId ? 'update' : 'create'}`);
    
    const endpoint = payload.livestreamId ? `/api/livestream/update` : `/api/livestream/create`;
    const method = payload.livestreamId ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(`${url}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      
      console.log('LiveStream response status:', response.status);
      const responseText = await response.text();
      console.log('LiveStream response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      return JSON.parse(responseText);
    } catch (error) {
      console.error('LiveStreamService error:', error);
      throw error;
    }
  }

  private static async updateLiveStreamImpl(livestreamId: number, updatePayload: Partial<LiveStream>, token: string, baseUrl?: string): Promise<void> {
    const url = baseUrl || getBaseUrl();
    try {
      const response = await fetch(`${url}/api/livestream/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ livestreamId, ...updatePayload }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      await response.json();
    } catch (error) {
      console.error('Update LiveStream error:', error);
      throw error;
    }
  }
}

export default LiveStreamService;

