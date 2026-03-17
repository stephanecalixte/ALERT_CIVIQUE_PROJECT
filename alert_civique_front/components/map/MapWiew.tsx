import React from 'react';
import { Platform } from 'react-native';
import NativeMap from './NativeMap';
import WebMap from './WebMap';

const MapWiew = () => {
  // Rendu conditionnel basé sur la plateforme
  return Platform.OS === 'web' ? <WebMap /> : <NativeMap />;
};

export default MapWiew;