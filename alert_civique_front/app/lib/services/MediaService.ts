import * as FileSystem from 'expo-file-system';

export class MediaService {
  static async uploadVideo(uri: string, token: string) {
    try {
      console.log('📤 Uploading video from:', uri);
      
      // Lire le fichier
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      // Créer FormData
      const formData = new FormData();
      
      // Extraire le nom du fichier
      const filename = uri.split('/').pop() || 'video.mp4';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : 'video/mp4';
      
      formData.append('video', {
        uri: uri,
        name: filename,
        type: type,
      } as any);
      
      // Upload
      const response = await fetch('http://10.0.2.2:9091/api/upload/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      
      const data = await response.json();
      console.log('✅ Upload success:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Upload video error:', error);
      throw error;
    }
  }
}
