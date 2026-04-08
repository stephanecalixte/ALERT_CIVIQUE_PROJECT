import { useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import WebView from 'react-native-webview';
import { useGeolocalisation } from '@/components/GeolocalisationContext';
import { useAlert, ALERT_CONFIGS, AlertType } from '@/contexts/AlertContext';

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
    .alert-marker {
      display: flex; flex-direction: column; align-items: center;
    }
    .alert-marker-circle {
      width: 48px; height: 48px; border-radius: 50%;
      border: 3px solid #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    }
    .alert-marker-label {
      margin-top: 4px;
      font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
      color: #fff;
      padding: 2px 8px; border-radius: 10px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var lat = ${latitude};
    var lon = ${longitude};

    var map = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap France contributors',
      maxZoom: 20
    }).addTo(map);

    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup('<div class="addr-label">Chargement...</div>').openPopup();

    var currentAddress = '';

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
      currentAddress = line1 + (line2 ? ', ' + line2 : '');
      marker.setPopupContent(
        '<div class="addr-label">📍 Ma position</div>' +
        '<div>' + line1 + '</div>' +
        (line2 ? '<div>' + line2 + '</div>' : '') +
        '<div class="addr-coords">' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</div>'
      );
      marker.openPopup();
    })
    .catch(function() {
      currentAddress = lat.toFixed(5) + ', ' + lon.toFixed(5);
    });

    // ─── Réception des messages React Native ──────────────────────────────
    document.addEventListener('message', handleRNMessage);
    window.addEventListener('message', handleRNMessage);

    function handleRNMessage(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'SET_ALERT') {
          updateMarker(data.alertType, data.emoji, data.color, data.label);
        } else if (data.type === 'RESET_MARKER') {
          resetMarker();
        }
      } catch(e) {}
    }

    function updateMarker(alertType, emoji, color, label) {
      var icon = L.divIcon({
        html: '<div class="alert-marker">' +
                '<div class="alert-marker-circle" style="background:' + color + '">' + emoji + '</div>' +
                '<div class="alert-marker-label" style="background:' + color + '">' + label.toUpperCase() + '</div>' +
              '</div>',
        className: '',
        iconSize: [80, 72],
        iconAnchor: [40, 72],
        popupAnchor: [0, -74],
      });
      marker.setIcon(icon);
      marker.setPopupContent(
        '<div class="addr-label" style="color:' + color + '">' + emoji + ' ' + label + '</div>' +
        '<div>' + (currentAddress || (lat.toFixed(5) + ', ' + lon.toFixed(5))) + '</div>' +
        '<div class="addr-coords">' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</div>'
      );
      marker.openPopup();
    }

    function resetMarker() {
      marker.setIcon(new L.Icon.Default());
      marker.setPopupContent(
        '<div class="addr-label">📍 Ma position</div>' +
        '<div>' + (currentAddress || (lat.toFixed(5) + ', ' + lon.toFixed(5))) + '</div>' +
        '<div class="addr-coords">' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</div>'
      );
      marker.openPopup();
    }

    // Signal React Native that Leaflet is fully initialized
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage('MAP_READY');
    }
  </script>
</body>
</html>`;
}

export default function MapScreen({ onMapReady }: MapScreenProps) {
  const { location, loading } = useGeolocalisation();
  const { alertType } = useAlert();
  const webViewRef    = useRef<any>(null);
  const mapReadyRef   = useRef(false);
  const pendingAlert  = useRef<AlertType | null | 'reset'>(null);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(() => {
        if (typeof onMapReady === 'function') onMapReady();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location, onMapReady]);

  // Inject marker update — deferred until map is ready
  const injectAlert = (type: AlertType | null) => {
    if (!webViewRef.current) return;
    if (type) {
      const cfg = ALERT_CONFIGS[type];
      // Pass data as JSON to avoid any quote/emoji escaping issues
      const payload = JSON.stringify({ color: cfg.markerBg, label: cfg.label, emoji: cfg.emoji });
      webViewRef.current.injectJavaScript(
        `(function(){ var d = ${payload}; updateMarker('${type}', d.emoji, d.color, d.label); })(); true;`
      );
    } else {
      webViewRef.current.injectJavaScript(`resetMarker(); true;`);
    }
  };

  useEffect(() => {
    if (!mapReadyRef.current) {
      // WebView not ready yet — store for when READY signal arrives
      pendingAlert.current = alertType ?? 'reset';
      return;
    }
    injectAlert(alertType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertType]);

  // Reset ready flag when WebView remounts (location key change)
  const locationKey = location ? `${location.latitude}-${location.longitude}` : 'loading';
  useEffect(() => {
    mapReadyRef.current = false;
    pendingAlert.current = alertType ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey]);

  const handleMessage = (event: any) => {
    const msg = event.nativeEvent.data;
    if (msg === 'MAP_READY') {
      mapReadyRef.current = true;
      if (pendingAlert.current !== null) {
        injectAlert(pendingAlert.current === 'reset' ? null : pendingAlert.current as AlertType);
        pendingAlert.current = null;
      }
    }
  };

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
        key={locationKey}
        ref={webViewRef}
        style={styles.map}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        onMessage={handleMessage}
        onLoad={onMapReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
  loader: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loaderText: { fontSize: 15, color: '#666' },
});
