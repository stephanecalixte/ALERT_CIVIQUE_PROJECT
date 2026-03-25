import * as FileSystem from 'expo-file-system';
// import { Media } from '../../models/Media';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Media } from '@/models/Media';

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:9090';
    if (Platform.OS === 'ios') return 'http://localhost:9090';
    return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:9090';
  }
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.com';
};

export class MediaServiceClass {
  static async uploadVideo(videoUri: string, token: string, reportId?: number, baseUrl?: string) {
    console.log('=== UPLOAD VIDEO DEBUG ===');
    console.log('URI:', videoUri);
    
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: Platform.OS === 'android' ? 'video/mp4' : 'video/quicktime',
      name: `livestream-${Date.now()}.mp4`,
    } as any);
    
    console.log('FormData created');

    const url = baseUrl || getBaseUrl();
    console.log('Upload URL:', `${url}/api/media`);
    
    try {
      const response = await fetch(`${url}/api/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Upload response status:', response.status);
      const responseText = await response.text();
      console.log('Upload response:', responseText);
      
      if (!response.ok) throw new Error(`Upload failed: ${response.status} ${responseText}`);
      const data = JSON.parse(responseText);
      console.log('Upload success:', data);
      return data;
    } catch (error) {
      console.error('Upload FULL ERROR:', error);
      throw error;
    }
  }
}

export default MediaServiceClass;

