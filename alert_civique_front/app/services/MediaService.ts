import * as FileSystem from 'expo-file-system';
import { Media } from '../../models/Media';

export class MediaService {
  static async uploadVideo(videoUri: string, reportId?: number) {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'livestream.mp4',
    } as any);
    
    const payload: Partial<Media> = {
      typeMedia: 'VIDEO',
      reportId,
    };

    try {
      const response = await fetch('http://localhost:8082/api/media', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.json();
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
}

export default MediaService;

