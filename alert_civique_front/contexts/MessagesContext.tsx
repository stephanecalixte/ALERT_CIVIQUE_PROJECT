import React, { createContext, useContext, ReactNode, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import io from 'socket.io-client';
import * as Location from 'expo-location';
import { NODE_BASE_URL, JAVA_BASE_URL } from '@/lib/config';
import { AlertType, ALERT_CONFIGS, useAlert } from '@/contexts/AlertContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ChatUser {
  id: string;
  name: string;
}

type SocketType = ReturnType<typeof io>;

export interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  type?: 'text' | 'alert' | 'system' | 'report';
  alertType?: AlertType;
}

export interface ActiveIncident {
  alertType: AlertType;
  count: number;
  lat?: number;  // Coordonnées GPS réelles si disponibles
  lon?: number;
}

interface MessagesContextType {
  messages: Message[];
  inputText: string;
  isConnected: boolean;
  user: ChatUser | null;
  loading: boolean;
  region: string;
  flatListRef: React.RefObject<FlatList<Message> | null>;
  setInputText: (text: string) => void;
  sendMessage: () => void;
  sendAlertReport: (type: AlertType) => void;
  unreadIncidentCount: number;
  pendingIncidentCount: number;
  activeIncidents: ActiveIncident[];
  clearIncidentCount: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Détecte la région géographique de l'utilisateur via Nominatim (OpenStreetMap).
 * Format retourné : "fr_75" (France, dép.75), "us_CA" (USA, California), "global" (fallback).
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
      // France → code département (2 chiffres ou 2A/2B pour la Corse)
      const postcode: string = addr.postcode ?? '';
      const dept = postcode.slice(0, 2) || (addr.county ?? '').slice(0, 6).replace(/\s+/g, '_').toLowerCase();
      return dept ? `fr_${dept}` : 'fr';
    }

    // Autres pays → pays_région (20 caractères max pour la région)
    const state = (addr.state ?? addr.region ?? 'unknown')
      .replace(/\s+/g, '_').toLowerCase().slice(0, 20);
    return `${cc}_${state}`;
  } catch {
    return 'global';
  }
}

function formatDate(createdAt: string | number[] | undefined): string {
  if (!createdAt) return '--:--';
  try {
    const d = Array.isArray(createdAt)
      ? new Date((createdAt as number[])[0], (createdAt as number[])[1] - 1, (createdAt as number[])[2])
      : new Date(createdAt as string);
    return d.toLocaleDateString('fr-FR');
  } catch { return '--:--'; }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputText, setInputText]     = useState('');
  const [socket, setSocket]           = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser]               = useState<ChatUser | null>(null);
  const [loading, setLoading]         = useState(true);
  const [region, setRegion]           = useState('global');
  const [unreadIncidentCount, setUnreadIncidentCount] = useState(0);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const { setAlertType } = useAlert();

  // Nb d'incidents (type 'report') visibles dans le chat — mis à jour automatiquement
  const pendingIncidentCount = useMemo(
    () => messages.filter(m => m.type === 'report').length,
    [messages]
  );

  // Incidents groupés par type (pour les marqueurs carte)
  const activeIncidents = useMemo((): ActiveIncident[] => {
    const counts = new Map<AlertType, number>();
    messages
      .filter(m => m.type === 'report' && m.alertType)
      .forEach(m => {
        const t = m.alertType as AlertType;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      });
    return Array.from(counts.entries()).map(([alertType, count]) => ({ alertType, count }));
  }, [messages]);

  const clearIncidentCount = useCallback(() => setUnreadIncidentCount(0), []);

  // ── Restaure le marqueur map selon la liste de cartes persistées ─────────────
  const restoreAlertMarker = useCallback((cards: Message[]) => {
    const reportCards = cards.filter(c => c.type === 'report' && c.alertType);
    if (reportCards.length > 0) {
      // Prendre la carte la plus récente (dernière dans la liste triée)
      const mostRecent = reportCards[reportCards.length - 1];
      setAlertType(mostRecent.alertType as AlertType);
    }
  }, [setAlertType]);

  // ── Chargement des cartes de signalement persistées (Java backend) ─────────
  // Fusionne ReportMessages (alertType non null) + Reports PENDING/IN_REVIEW (alertType non null)
  const loadPersistedReports = useCallback(async (): Promise<Message[]> => {
    const [msgRes, rptRes] = await Promise.allSettled([
      fetch(`${JAVA_BASE_URL}/api/reportMessages/chat`),
      fetch(`${JAVA_BASE_URL}/api/report`),
    ]);

    // ── ReportMessages ────────────────────────────────────────────────────────
    let msgCards: Message[] = [];
    const linkedReportIds = new Set<number>(); // reportIds déjà couverts par un ReportMessage

    if (msgRes.status === 'fulfilled' && msgRes.value.ok) {
      try {
        const data: Array<{
          reportMessageId: number;
          alertType: string;
          senderName: string;
          createdAt: string | number[];
          reportId?: number;
        }> = await msgRes.value.json();

        msgCards = data
          .filter(r => r.alertType)
          .map(r => {
            if (r.reportId) linkedReportIds.add(r.reportId);
            const at = r.alertType.toLowerCase() as AlertType;
            return {
              id:        `report_${r.reportMessageId}`,
              text:      ALERT_CONFIGS[at]?.chatLabel ?? r.alertType,
              sender:    r.senderName ?? 'Citoyen',
              senderId:  `persisted_${r.reportMessageId}`,
              timestamp: formatDate(r.createdAt),
              type:      'report' as const,
              alertType: at,
            };
          });
      } catch { /* ignore */ }
    }

    // ── Reports PENDING / IN_REVIEW sans ReportMessage lié ───────────────────
    let rptCards: Message[] = [];
    const ACTIVE_STATUSES = new Set(['PENDING', 'IN_REVIEW', 'VALIDATED']);

    if (rptRes.status === 'fulfilled' && rptRes.value.ok) {
      try {
        const reports: Array<{
          reportId: number;
          alertType: string | null;
          description: string;
          status: string;
          createdAt: string | number[];
          senderName: string | null;
        }> = await rptRes.value.json();

        rptCards = reports
          .filter(r =>
            r.alertType &&
            ACTIVE_STATUSES.has(r.status?.toUpperCase()) &&
            !linkedReportIds.has(r.reportId)
          )
          .map(r => {
            const at = r.alertType!.toLowerCase() as AlertType;
            return {
              id:        `report_r_${r.reportId}`,
              text:      ALERT_CONFIGS[at]?.chatLabel ?? r.alertType!,
              sender:    r.senderName ?? 'Citoyen',
              senderId:  `report_${r.reportId}`,
              timestamp: formatDate(r.createdAt),
              type:      'report' as const,
              alertType: at,
            };
          });
      } catch { /* ignore */ }
    }

    return [...msgCards, ...rptCards];
  }, []);

  // ── Chargement initial des signalements (indépendant du socket) ─────────────
  useEffect(() => {
    loadPersistedReports().then(cards => {
      if (cards.length === 0) return;
      // Restaurer le marqueur carte avec l'alerte la plus récente
      restoreAlertMarker(cards);
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newCards = cards.filter(c => !existingIds.has(c.id));
        return newCards.length > 0 ? [...prev, ...newCards] : prev;
      });
    });
  }, [loadPersistedReports, restoreAlertMarker]);

  // ── Initialisation socket (une seule fois au montage du Provider) ──────────
  useEffect(() => {
    const newSocket = io(NODE_BASE_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', async () => {
      setIsConnected(true);
      setLoading(true);

      // Détection région avant d'émettre userConnect
      const userRegion = await detectRegion();
      setRegion(userRegion);

      newSocket.emit('userConnect', {
        userId:   `temp_${Date.now()}`,
        userName: `Citoyen_${Math.floor(Math.random() * 1000)}`,
        region:   userRegion,
      });
      newSocket.emit('getMessageHistory');
    });

    newSocket.on('userInfo', (userData: ChatUser) => {
      setUser(userData);
      setLoading(false);
    });

    newSocket.on('messageHistory', (history: Message[]) => {
      // Fusionner l'historique socket avec les messages déjà en mémoire
      // (les cartes persistées Java ont été chargées par le useEffect indépendant)
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newFromSocket = history.filter(m => !existingIds.has(m.id));
        if (newFromSocket.length === 0) return prev;
        const merged = [...prev, ...newFromSocket].sort((a, b) => a.id.localeCompare(b.id));
        restoreAlertMarker(merged);
        return merged;
      });
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Si c'est un rapport d'incident temps-réel → mettre à jour le marqueur
      if (message.type === 'report' && message.alertType) {
        setAlertType(message.alertType);
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    newSocket.on('userConnected', (userData: ChatUser) => {
      setMessages(prev => [...prev, {
        id:        Date.now().toString(),
        text:      `${userData.name} a rejoint la conversation`,
        sender:    'Système',
        senderId:  'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type:      'system',
      }]);
    });

    newSocket.on('userDisconnected', (userData: ChatUser) => {
      setMessages(prev => [...prev, {
        id:        Date.now().toString(),
        text:      `${userData.name} a quitté la conversation`,
        sender:    'Système',
        senderId:  'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type:      'system',
      }]);
    });

    newSocket.on('alertMessage', (alert: { text: string }) => {
      setMessages(prev => [...prev, {
        id:        Date.now().toString(),
        text:      `🚨 ALERTE: ${alert.text}`,
        sender:    'Sécurité Civile',
        senderId:  'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type:      'alert',
      }]);
    });

    newSocket.on('disconnect',    () => setIsConnected(false));
    newSocket.on('connect_error', () => { setIsConnected(false); setLoading(false); });

    return () => { newSocket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Envoi d'un message texte ──────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !socket || !user || !isConnected) return;
    const message: Message = {
      id:        Date.now().toString(),
      text:      inputText,
      sender:    user.name,
      senderId:  user.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    socket.emit('sendMessage', message);
    setInputText('');
  }, [inputText, socket, user, isConnected]);

  // ── Persistance du signalement dans le backend Java ──────────────────────
  const persistReportToBackend = useCallback(async (type: AlertType, senderName: string) => {
    try {
      await fetch(`${JAVA_BASE_URL}/api/reportMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType:  type,
          senderName: senderName,
          reason:     ALERT_CONFIGS[type].chatLabel,
          createdAt:  new Date().toISOString().split('T')[0],
        }),
      });
    } catch {
      // Erreur réseau ignorée — le signalement est quand même diffusé via socket
    }
  }, []);

  // ── Envoi d'une carte de signalement incident ─────────────────────────────
  const sendAlertReport = useCallback((type: AlertType) => {
    const cfg = ALERT_CONFIGS[type];
    const senderName = user?.name ?? 'Citoyen';
    const message: Message = {
      id:        Date.now().toString(),
      text:      cfg.chatLabel,
      sender:    senderName,
      senderId:  user?.id ?? 'unknown',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type:      'report',
      alertType: type,
    };
    if (socket && isConnected) {
      socket.emit('sendMessage', message);
    } else {
      setMessages(prev => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
    persistReportToBackend(type, senderName);
    setUnreadIncidentCount(prev => prev + 1);
  }, [socket, user, isConnected, persistReportToBackend]);

  return (
    <MessagesContext.Provider value={{
      messages, inputText, isConnected, user, loading, region,
      flatListRef, setInputText, sendMessage, sendAlertReport,
      unreadIncidentCount, pendingIncidentCount, activeIncidents, clearIncidentCount,
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

// ─── Hook d'accès ─────────────────────────────────────────────────────────────
export const useMessagesContext = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessagesContext must be used within MessagesProvider');
  return ctx;
};
