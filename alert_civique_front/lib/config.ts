import { Platform } from 'react-native';
import Constants from 'expo-constants';

const SERVER_PORT = 9091;

function getServerBaseUrl(): string {
  // Expo expose l'IP de la machine hôte via hostUri (ex: "192.168.1.5:8081")
  // On extrait l'IP pour construire l'URL du serveur Node.js
  const expoHostUri = Constants.expoConfig?.hostUri;
  if (expoHostUri) {
    const ip = expoHostUri.split(':')[0];
    return `http://${ip}:${SERVER_PORT}`;
  }

  // Fallback si hostUri n'est pas disponible (build standalone, etc.)
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${SERVER_PORT}`; // émulateur Android uniquement
  }
  return `http://localhost:${SERVER_PORT}`; // simulateur iOS
}

export const SERVER_BASE_URL = getServerBaseUrl();
