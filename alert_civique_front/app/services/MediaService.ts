import * as FileSystem from 'expo-file-system';
import { Media } from '../../models/Media';

const BASE_URL = "http://localhost:8082";
const TOKEN = 'mock-jwt-token';

export class MediaService {
  static async uploadVideo(videoUri: string, reportId?: number) {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: `livestream-${Date.now()}.mp4`,
    } as any);
    
    const payload: Partial<Media> = {
      typeMedia: 'VIDEO',
      reportId,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

export default MediaService;

