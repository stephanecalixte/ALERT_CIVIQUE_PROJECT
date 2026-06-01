import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
 * Détecte la région géographique de l'utilisateur via Nominatim (OpenStreetMap).
 * Format retourné : "fr_75" (France, dép.75), "us_ca" (USA, California), "global" (fallback).
 */
async function detectRegion(): Promise<string> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return 'global';

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lon } = pos.coords;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'AlertCivique/1.0' } }
    );
    if (!res.ok) return 'global';

    const data = await res.json();
    const addr = data.address ?? {};
    const cc   = (addr.country_code ?? 'xx').toLowerCase();

    if (cc === 'fr') {
      const postcode: string = addr.postcode ?? '';
      const dept = postcode.slice(0, 2) || (addr.county ?? '').slice(0, 6).replace(/\s+/g, '_').toLowerCase();
      return dept ? `fr_${dept}` : 'fr';
    }

    const state = (addr.state ?? addr.region ?? 'unknown')
      .replace(/\s+/g, '_').toLowerCase().slice(0, 20);
    return `${cc}_${state}`;
  } catch {
    return 'global';
  }
}

/**
 * Hook retournant la région géographique détectée.
 * Retourne 'global' par défaut pendant la détection.
 */
export function useGpsRegion(): string {
  const [region, setRegion] = useState('global');

  useEffect(() => {
    detectRegion().then(setRegion);
  }, []);

  return region;
}

/**
 * Retourne l'adresse lisible complète : "Rue de Rivoli, Paris, France"
 * Retourne null si la permission est refusée ou si la géoloc échoue.
 */
export async function getFullAddress(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lon } = pos.coords;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'AlertCivique/1.0' } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address ?? {};

    const parts = [
      addr.road,
      addr.house_number,
      addr.suburb,
      addr.city || addr.town || addr.village || addr.municipality,
      addr.postcode,
      addr.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : (data.display_name ?? null);
  } catch {
    return null;
  }
}

/**
 * Retourne latitude, longitude et adresse lisible en un seul appel GPS.
 */
export async function getLocationData(): Promise<{
  latitude: number | null;
  longitude: number | null;
  locationText: string | null;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { latitude: null, longitude: null, locationText: null };

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = pos.coords;

    let locationText: string | null = null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'User-Agent': 'AlertCivique/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address ?? {};
        const parts = [
          addr.road,
          addr.house_number,
          addr.suburb,
          addr.city || addr.town || addr.village || addr.municipality,
          addr.postcode,
          addr.country,
        ].filter(Boolean);
        locationText = parts.length > 0 ? parts.join(', ') : (data.display_name ?? null);
      }
    } catch { /* adresse non bloquante */ }

    return { latitude, longitude, locationText };
  } catch {
    return { latitude: null, longitude: null, locationText: null };
  }
}

export { detectRegion };
