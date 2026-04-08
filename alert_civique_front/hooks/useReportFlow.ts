import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportService from '@/app/lib/services/ReportService';
import GeolocalisationService from '@/app/lib/services/GeolocalisationService';
import TrustedContactService from '@/app/lib/services/TrustedContactService';
import PushNotificationService from '@/app/lib/services/PushNotificationService';
import EmergenciesAlertService from '@/app/lib/services/EmergenciesAlertService';
import { useAuth } from '@/contexts/AuthContext';

const OFFLINE_QUEUE_KEY = '@report_offline_queue';

// Email des autorités (configurable)
const AUTHORITY_EMAIL = 'autorites@alertcivique.fr';

export interface TrustedContactNotification {
  name: string;
  email: string;
  sent: boolean;
}

export interface ReportFlowResult {
  reportId: number | null;
  geolocalisationId: number | null;
  latitude: number | null;
  longitude: number | null;
  offline: boolean;
  pushNotificationSent: boolean;
  authorityAlertSent: boolean;
  trustedContactsNotified: TrustedContactNotification[];
  error?: 'not_authenticated' | 'server_error';
}

export type ReportFlowState =
  | 'idle'
  | 'locating'
  | 'sending'
  | 'notifying'
  | 'done'
  | 'offline'
  | 'error';

export function useReportFlow() {
  const { token, user } = useAuth();

  const numericUserId = user?.userId ? Number(user.userId) : undefined;
  const [state, setState] = useState<ReportFlowState>('idle');
  const [result, setResult] = useState<ReportFlowResult | null>(null);

  const saveOffline = async (payload: any) => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: any[] = raw ? JSON.parse(raw) : [];
      queue.push({ ...payload, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('💾 Signalement sauvegardé hors ligne');
    } catch (e) {
      console.error('Erreur sauvegarde offline:', e);
    }
  };

  const retryOfflineQueue = useCallback(async () => {
    if (!token || !numericUserId) return;
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return;
      const queue: any[] = JSON.parse(raw);
      if (!queue.length) return;

      
      const validItems = queue.filter((item) => item.userId);
      // Items sans userId : non renvoyables, on les conserve dans la queue
      const unattemptedItems = queue.filter((item) => !item.userId);

      const failed: any[] = [...unattemptedItems];
      for (const item of validItems) {
        try {
          await ReportService.createReport(item, token);
          console.log('✅ Signalement offline renvoyé');
        } catch {
          failed.push(item);
        }
      }
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
    } catch (e) {
      console.error('Erreur retry offline:', e);
    }
  }, [token, numericUserId]);

  /**
   * Flux principal SOS :
   * 1. Récupère la position GPS
   * 2. Crée le report + la géolocalisation en parallèle
   * 3. Envoie la push notification à l'utilisateur
   * 4. Alerte les autorités via EmergenciesAlert
   * 5. Notifie les contacts de confiance via EmergenciesAlert
   * 6. Mode offline si pas de réseau
   */
  const triggerSos = useCallback(async (): Promise<ReportFlowResult> => {
    if (!numericUserId || !token) {
      setState('error');
      const noAuthResult: ReportFlowResult = {
        reportId: null,
        geolocalisationId: null,
        latitude: null,
        longitude: null,
        offline: false,
        pushNotificationSent: false,
        authorityAlertSent: false,
        trustedContactsNotified: [],
        error: 'not_authenticated',
      };
      setResult(noAuthResult);
      return noAuthResult;
    }

    setState('locating');

    // ── 1. GPS ──────────────────────────────────────────────────────────────
    let latitude: number | null = null;
    let longitude: number | null = null;
    let locationText: string | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;

        try {
          const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geo) {
            locationText = [geo.street, geo.city, geo.region].filter(Boolean).join(', ');
          }
        } catch {
          // non bloquant
        }
      }
    } catch (e) {
      console.warn('GPS non disponible:', e);
    }

    setState('sending');

    const effectiveToken = token || '';
    const userId = numericUserId;

    const reportPayload = {
      description: 'Signalement SOS',
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      locationText,
      anonymous: !userId,
      ...(userId && { userId }),
    };

    const geoPayload = latitude !== null && longitude !== null
      ? { latitude, longitude, timestamp: new Date().toISOString().split('T')[0] }
      : null;

    // ── 2. Report + Géolocalisation en parallèle ─────────────────────────────
    let reportId: number | null = null;
    let geolocalisationId: number | null = null;
    let isOffline = false;

    try {
      const [reportRes, geoRes] = await Promise.all([
        ReportService.createReport(reportPayload, effectiveToken),
        geoPayload !== null
          ? GeolocalisationService.create(geoPayload, effectiveToken)
          : Promise.resolve(null),
      ]);
      reportId = reportRes.reportId ?? null;
      geolocalisationId = geoRes?.geolocalisationId ?? null;
      console.log('✅ Report créé:', reportId, '| Géoloc:', geolocalisationId);
    } catch (e) {
      console.error('❌ Envoi signalement échoué, sauvegarde offline:', e);
      await saveOffline(reportPayload);
      isOffline = true;
    }

    // ── 3. Notifications (non bloquantes) ────────────────────────────────────
    setState('notifying');

    let pushNotificationSent = false;
    let authorityAlertSent = false;
    let trustedContactsNotified: TrustedContactNotification[] = [];

    if (!isOffline && userId) {
      const locationInfo = locationText
        ? `Localisation : ${locationText}`
        : latitude
        ? `Coordonnées : ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}`
        : 'Localisation non disponible';

      const sosMessage = `🚨 Alerte SOS déclenchée${locationInfo ? ` — ${locationInfo}` : ''}`;

      // 3a. Push notification à l'utilisateur
      try {
        const notif = await PushNotificationService.send(
          {
            userId,
            reportId: reportId ?? undefined,
            message: sosMessage,
          },
          effectiveToken
        );
        pushNotificationSent = notif !== null;
        console.log('🔔 Push notification envoyée:', pushNotificationSent);
      } catch (e) {
        console.warn('Push notification échouée:', e);
      }

      // 3b. Alerte aux autorités
      try {
        const alert = await EmergenciesAlertService.create(
          AUTHORITY_EMAIL,
          sosMessage,
          effectiveToken
        );
        authorityAlertSent = alert !== null;
        console.log('🏛️ Alerte autorités envoyée:', authorityAlertSent);
      } catch (e) {
        console.warn('Alerte autorités échouée:', e);
      }

      // 3c. Contacts de confiance
      try {
        const contacts = await TrustedContactService.getByUserId(userId, effectiveToken);
        if (contacts.length > 0) {
          const contactResults = await EmergenciesAlertService.notifyTrustedContacts(
            contacts.map((c) => ({ email: c.email, name: c.name })),
            sosMessage,
            effectiveToken
          );
          trustedContactsNotified = contacts.map((c, i) => ({
            name: c.name,
            email: c.email,
            sent: contactResults[i]?.sent ?? false,
          }));
          console.log('👥 Contacts de confiance notifiés:', trustedContactsNotified);
        }
      } catch (e) {
        console.warn('Notification contacts de confiance échouée:', e);
      }
    }

    // ── 4. Résultat final ────────────────────────────────────────────────────
    const flowResult: ReportFlowResult = {
      reportId,
      geolocalisationId,
      latitude,
      longitude,
      offline: isOffline,
      pushNotificationSent,
      authorityAlertSent,
      trustedContactsNotified,
    };

    setResult(flowResult);
    setState(isOffline ? 'offline' : 'done');
    return flowResult;
  }, [token, numericUserId]);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
  }, []);

  return {
    state,
    result,
    triggerSos,
    retryOfflineQueue,
    reset,
  };
}
