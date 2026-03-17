import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WebMap = () => {
  return (
    <View style={styles.container}>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=2.2522,48.8066,2.4522,48.9066&layer=mapnik"
        // style={styles.map}
        title="Carte OpenStreetMap"
      />
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>🗺️ Carte Web</Text>
        <Text style={styles.legendText}>
          Carte interactive utilisant OpenStreetMap. Sur mobile, utilisez une carte native.
        </Text>
      </View>
    </View>
  );
};

export default WebMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  mapContainer: {
    flex: 2,
    padding: 20,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#a4d4ff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4dabf7',
    overflow: 'hidden',
    position: 'relative',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: '50%',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    left: '50%',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff6b6b',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerLabel: {
    position: 'absolute',
    top: 25,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 100,
    alignItems: 'center',
  },
  markerLabelActive: {
    backgroundColor: '#ffeb3b',
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  currentLocation: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationText: {
    marginTop: 5,
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  legend: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  markersList: {
    marginBottom: 20,
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  markerIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
    marginRight: 12,
  },
  markerInfo: {
    flex: 1,
  },
  markerItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  markerItemDescription: {
    fontSize: 12,
    color: '#888',
  },
  controls: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  controlHint: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
});