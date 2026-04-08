import { Platform } from 'react-native';
import Constants from 'expo-constants';

const JAVA_PORT = 9090;   // Backend Java Spring Boot (auth, livestream, media…)
const NODE_PORT = 9091;   // Node.js (upload vidéo + Socket.IO chat)

function buildUrl(port: number): string {
  const expoHostUri = Constants.expoConfig?.hostUri;
  if (expoHostUri) {
    const ip = expoHostUri.split(':')[0];
    return `http://${ip}:${port}`;
  }
  if (Platform.OS === 'android') return `http://10.0.2.2:${port}`;
  return `http://localhost:${port}`;
}

// Java – toutes les routes métier
export const JAVA_BASE_URL = buildUrl(JAVA_PORT);

// Node.js – upload vidéo + Socket.IO
export const NODE_BASE_URL = buildUrl(NODE_PORT);

// Alias conservé pour compatibilité (les services qui importent SERVER_BASE_URL)
export const SERVER_BASE_URL = NODE_BASE_URL;

console.log('🟦 JAVA_BASE_URL:', JAVA_BASE_URL);
console.log('🟩 NODE_BASE_URL:', NODE_BASE_URL);
