import type { LiveStream } from '../../models/LiveStream';

const BASE_URL = "http://localhost:8082";
const TOKEN = 'mock-jwt-token'; // From AuthContext

export type LiveStreamPayload = {
  userId: string;
} & Partial<LiveStream>;

class LiveStreamService {
  async sendLiveStreamData(payload: LiveStreamPayload) {
    try {
      const response = await fetch(`${BASE_URL}/api/livestream/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("LiveStreamService error:", error);
      throw error;
    }
  }

  async updateLiveStream(livestreamId: number, updatePayload: Partial<LiveStream>) {
    try {
      const response = await fetch(`${BASE_URL}/api/livestream/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ livestreamId, ...updatePayload }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Update LiveStream error:", error);
      throw error;
    }
  }

  async getLiveStreams() {
    try {
      const response = await fetch(`${BASE_URL}/api/livestream`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Get LiveStreams error:", error);
      throw error;
    }
  }
}

export default new LiveStreamService();

