import * as FileSystem from 'expo-file-system';

const BASE_URL = 'http://10.0.2.2:9091';

export interface VideoUploadResponse {
  success: boolean;
  videoId: string;
  url: string;
  filename: string;
  size: number;
}

export interface VideoInfo {
  videoId: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  userId: string;
  livestreamId: number | null;
  uploadedAt: string;
}

export class MediaService {
  static async getFileInfo(uri: string): Promise<{ exists: boolean; size?: number; uri: string }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📁 File info:', fileInfo);
      return {
        exists: fileInfo.exists,
        size: fileInfo.exists ? (fileInfo as any).size : undefined,
        uri
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return { exists: false, uri };
    }
  }

  static async uploadVideo(videoUri: string, token: string, userId?: string): Promise<{ url: string; videoId: string }> {
    try {
      console.log('📤 Uploading video from URI:', videoUri);

      // Check if file exists
      const fileInfo = await this.getFileInfo(videoUri);
      if (!fileInfo.exists) {
        throw new Error(`Video file does not exist at path: ${videoUri}`);
      }

      console.log('📊 File size:', fileInfo.size, 'bytes');

      // Create form data
      const formData = new FormData();

      // Get filename from URI
      const filename = videoUri.split('/').pop() || 'video.mp4';

      // @ts-ignore - React Native FormData expects this structure
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: filename,
      });

      // Add metadata
      formData.append('userId', userId || 'unknown');
      
      console.log('📤 Sending upload request...', {
        filename,
        userId,
        fileSize: fileInfo.size
      });
      
      const response = await fetch(`${BASE_URL}/api/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header, let the browser set it with boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Upload successful:', data);
      
      return {
        url: data.url,
        videoId: data.videoId
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }
  
  static async getVideos(token: string): Promise<VideoInfo[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }
  
  static async getVideoById(videoId: string, token: string): Promise<VideoInfo | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }

}

export default MediaService;