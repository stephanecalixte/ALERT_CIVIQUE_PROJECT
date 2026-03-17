import sendData from './SendData';
import type { LiveStream } from '../../models/LiveStream';

export type LiveStreamPayload = {
  userId: string;
} & Partial<LiveStream>;

class LiveStreamService {
  async sendLiveStreamData(payload: LiveStreamPayload) {
    try {
      const response = await sendData("/api/livestream", payload);
      return response;
    } catch (error) {
      console.error("LiveStreamService error:", error);
      throw error;
    }
  }
}

export default new LiveStreamService();

