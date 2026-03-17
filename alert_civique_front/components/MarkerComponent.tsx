import React from 'react';
import { Marker } from 'react-native-maps';

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
  description = 'A marker on the map',
}) => {
  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      title={title}
      description={description}
    />
  );
};

export default MarkerComponent;
