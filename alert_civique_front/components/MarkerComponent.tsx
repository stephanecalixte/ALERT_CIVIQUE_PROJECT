import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PointAnnotation } from '@maplibre/maplibre-react-native';

interface MarkerComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

const MarkerComponent: React.FC<MarkerComponentProps> = ({
  latitude,
  longitude,
  title = 'Marker',
}) => {
  return (
    <PointAnnotation
      id={`marker-${latitude}-${longitude}`}
      coordinate={[longitude, latitude]}
      title={title}
    >
      <View style={styles.marker} />
    </PointAnnotation>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
});

export default MarkerComponent;
