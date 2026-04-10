import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import WebView from 'react-native-webview';
import { useGeolocalisation } from '@/components/GeolocalisationContext';
import { useAlert, ALERT_CONFIGS, AlertType } from '@/contexts/AlertContext';
import { useMessagesContext } from '@/contexts/MessagesContext';

type MapScreenProps = {
  onMapReady: () => void;
};

function buildMapHtml(latitude: number, longitude: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        onerror="this.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          onerror="var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';document.head.appendChild(s);"></script>
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
      position: relative;
    }
    .alert-count-badge {
      position: absolute; top: -6px; right: -6px;
      background: #fff; color: #e53935;
      font-size: 10px; font-weight: 900;
      width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid currentColor;
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

    // ── Marqueur position de l'utilisateur ──────────────────────────────────
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

    // ── Marqueurs d'incidents actifs ─────────────────────────────────────────
    var incidentMarkers = [];

    // Décalages en degrés (~40-60m) autour de la position utilisateur
    var OFFSETS = [
      [ 0.0004,  0.0000 ],  // Nord
      [-0.0004,  0.0000 ],  // Sud
      [ 0.0000,  0.0005 ],  // Est
      [ 0.0000, -0.0005 ],  // Ouest
      [ 0.0003,  0.0003 ],  // Nord-Est
      [-0.0003,  0.0003 ],  // Sud-Est
      [ 0.0003, -0.0003 ],  // Nord-Ouest
      [-0.0003, -0.0003 ],  // Sud-Ouest
    ];

    function buildIncidentIcon(emoji, color, label, count) {
      var badgeHtml = count > 1
        ? '<span class="alert-count-badge" style="color:' + color + '">' + count + '</span>'
        : '';
      return L.divIcon({
        html: '<div class="alert-marker">' +
                '<div class="alert-marker-circle" style="background:' + color + '">' +
                  emoji + badgeHtml +
                '</div>' +
                '<div class="alert-marker-label" style="background:' + color + '">' +
                  label.toUpperCase() + (count > 1 ? ' \u00d7' + count : '') +
                '</div>' +
              '</div>',
        className: '',
        iconSize: [80, 72],
        iconAnchor: [40, 72],
        popupAnchor: [0, -74],
      });
    }

    function setIncidentMarkers(incidents) {
      // Supprimer les anciens marqueurs d'incidents
      incidentMarkers.forEach(function(m) { map.removeLayer(m); });
      incidentMarkers = [];

      incidents.forEach(function(inc, i) {
        var off = OFFSETS[i % OFFSETS.length];
        var iLat = lat + off[0];
        var iLon = lon + off[1];
        var icon = buildIncidentIcon(inc.emoji, inc.color, inc.label, inc.count);
        var m = L.marker([iLat, iLon], { icon: icon }).addTo(map);
        m.bindPopup(
          '<div style="color:' + inc.color + ';font-weight:800;font-size:15px">' +
            inc.emoji + ' ' + inc.label + '</div>' +
          '<div style="margin-top:4px">Signalement en cours</div>' +
          (inc.count > 1 ? '<div style="color:#546e7a;font-size:12px">' + inc.count + ' signalement(s)</div>' : '') +
          '<div class="addr-coords">' + (currentAddress || (lat.toFixed(5) + ', ' + lon.toFixed(5))) + '</div>'
        );
        incidentMarkers.push(m);
      });

      // Centrer la carte pour inclure tous les marqueurs
      if (incidents.length > 0) {
        var allPoints = [[lat, lon]].concat(
          incidents.map(function(_, i) {
            var off = OFFSETS[i % OFFSETS.length];
            return [lat + off[0], lon + off[1]];
          })
        );
        map.fitBounds(allPoints, { padding: [40, 40], maxZoom: 16 });
      }
    }

    // ── Réception des messages React Native ──────────────────────────────
    document.addEventListener('message', handleRNMessage);
    window.addEventListener('message', handleRNMessage);

    function handleRNMessage(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'SET_ALERT') {
          updateMarker(data.alertType, data.emoji, data.color, data.label);
        } else if (data.type === 'RESET_MARKER') {
          resetMarker();
        } else if (data.type === 'SET_INCIDENTS') {
          setIncidentMarkers(data.incidents);
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

    // Signal React Native que Leaflet est prêt (après rendu des tuiles)
    map.whenReady(function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('MAP_READY');
      }
    });
  </script>
</body>
</html>`;
}

const FALLBACK_LOCATION = { latitude: 48.8566, longitude: 2.3522 };
const GEO_TIMEOUT_MS = 10_000;

export default function MapScreen({ onMapReady }: MapScreenProps) {
  const { location, loading } = useGeolocalisation();
  const { alertType }         = useAlert();
  const { activeIncidents }   = useMessagesContext();
  const webViewRef    = useRef<any>(null);
  const mapReadyRef   = useRef(false);
  const pendingAlert  = useRef<AlertType | null | 'reset'>(null);
  const pendingIncidents = useRef<typeof activeIncidents | null>(null);
  const [fallback, setFallback] = useState(false);

  // Timeout géolocalisation → fallback Paris après 10s
  useEffect(() => {
    if (location) return;
    const timer = setTimeout(() => setFallback(true), GEO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(() => {
        if (typeof onMapReady === 'function') onMapReady();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location, onMapReady]);

  // ── Injecter le marqueur utilisateur ──────────────────────────────────────
  const injectAlert = (type: AlertType | null) => {
    if (!webViewRef.current) return;
    if (type) {
      const cfg = ALERT_CONFIGS[type];
      const payload = JSON.stringify({ color: cfg.markerBg, label: cfg.label, emoji: cfg.emoji });
      webViewRef.current.injectJavaScript(
        `(function(){ var d = ${payload}; updateMarker('${type}', d.emoji, d.color, d.label); })(); true;`
      );
    } else {
      webViewRef.current.injectJavaScript(`resetMarker(); true;`);
    }
  };

  // ── Injecter les marqueurs d'incidents ────────────────────────────────────
  const injectIncidents = (incidents: typeof activeIncidents) => {
    if (!webViewRef.current) return;
    const mapped = incidents.map(inc => ({
      emoji: ALERT_CONFIGS[inc.alertType].emoji,
      color: ALERT_CONFIGS[inc.alertType].markerBg,
      label: ALERT_CONFIGS[inc.alertType].label,
      count: inc.count,
    }));
    const payload = JSON.stringify(mapped);
    webViewRef.current.injectJavaScript(
      `setIncidentMarkers(${payload}); true;`
    );
  };

  // Réagir aux changements d'alertType
  useEffect(() => {
    if (!mapReadyRef.current) {
      pendingAlert.current = alertType ?? 'reset';
      return;
    }
    injectAlert(alertType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertType]);

  // Réagir aux changements d'incidents actifs
  useEffect(() => {
    if (!mapReadyRef.current) {
      pendingIncidents.current = activeIncidents;
      return;
    }
    injectIncidents(activeIncidents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIncidents]);

  // Reset ready flag quand la WebView remonte (changement de position)
  const locationKey = location ? `${location.latitude}-${location.longitude}` : 'loading';
  useEffect(() => {
    mapReadyRef.current = false;
    pendingAlert.current    = alertType ?? null;
    pendingIncidents.current = activeIncidents;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey]);

  const handleMessage = (event: any) => {
    const msg = event.nativeEvent.data;
    if (msg === 'MAP_READY') {
      mapReadyRef.current = true;
      // Appliquer tous les pendants
      if (pendingAlert.current !== null) {
        injectAlert(pendingAlert.current === 'reset' ? null : pendingAlert.current as AlertType);
        pendingAlert.current = null;
      }
      if (pendingIncidents.current !== null && pendingIncidents.current.length > 0) {
        injectIncidents(pendingIncidents.current);
        pendingIncidents.current = null;
      }
    }
  };

  if (loading && !fallback && !location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text style={styles.loaderText}>Localisation en cours...</Text>
      </View>
    );
  }

  const coords = location ?? FALLBACK_LOCATION;
  const html = buildMapHtml(coords.latitude, coords.longitude);

  return (
    <View style={styles.container}>
      <WebView
        key={locationKey}
        ref={webViewRef}
        style={styles.map}
        source={{ html, baseUrl: 'https://unpkg.com' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
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
