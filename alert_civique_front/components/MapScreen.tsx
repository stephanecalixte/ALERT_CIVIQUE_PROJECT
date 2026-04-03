import { useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import WebView from 'react-native-webview';
import { useGeolocalisation } from '@/components/GeolocalisationContext';

type MapScreenProps = {
  onMapReady: () => void;
};

function buildMapHtml(latitude: number, longitude: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-popup-content { font-size: 14px; line-height: 1.5; min-width: 180px; }
    .addr-label { font-weight: bold; color: #333; margin-bottom: 4px; }
    .addr-coords { font-size: 11px; color: #888; margin-top: 4px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var lat = ${latitude};
    var lon = ${longitude};

    var map = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> contributors',
      maxZoom: 20
    }).addTo(map);

    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup('<div class="addr-label">Chargement de l\\'adresse...</div>').openPopup();

    fetch('https://nominatim.openstreetmap.org/reverse?format=json&accept-language=fr&lat=' + lat + '&lon=' + lon, {
      headers: { 'User-Agent': 'AlertCivique/1.0' }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var a = data.address || {};
      var road     = a.road || a.pedestrian || a.path || a.quarter || '';
      var number   = a.house_number ? a.house_number + ' ' : '';
      var city     = a.city || a.town || a.village || a.municipality || a.suburb || '';
      var postcode = a.postcode || '';

      var line1 = (number + road).trim() || data.display_name.split(',')[0];
      var line2 = [postcode, city].filter(Boolean).join(' ');

      marker.setPopupContent(
        '<div class="addr-label">📍 Ma position</div>' +
        '<div>' + line1 + '</div>' +
        (line2 ? '<div>' + line2 + '</div>' : '') +
        '<div class="addr-coords">' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</div>'
      );
      marker.openPopup();
    })
    .catch(function() {
      marker.setPopupContent(
        '<div class="addr-label">📍 Ma position</div>' +
        '<div class="addr-coords">' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</div>'
      );
    });
  </script>
</body>
</html>`;
}

export default function MapScreen({ onMapReady }: MapScreenProps) {
  const { location, loading } = useGeolocalisation();
  const webViewRef = useRef(null);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(() => {
        if (typeof onMapReady === 'function') onMapReady();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location, onMapReady]);

  if (loading || !location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text style={styles.loaderText}>Localisation en cours...</Text>
      </View>
    );
  }

  const html = buildMapHtml(location.latitude, location.longitude);

  return (
    <View style={styles.container}>
      <WebView
        key={`${location.latitude}-${location.longitude}`}
        ref={webViewRef}
        style={styles.map}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        onLoad={onMapReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 15,
    color: '#666',
  },
});
