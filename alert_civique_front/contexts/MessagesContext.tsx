import React, { createContext, useContext, ReactNode, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import io from 'socket.io-client';
import { NODE_BASE_URL } from '@/lib/config';
import { AlertType, ALERT_CONFIGS, useAlert } from '@/contexts/AlertContext';
import { detectRegion } from '@/hooks/useGpsRegion';
import { usePersistedReports } from '@/hooks/usePersistedReports';

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
  lat?: number;
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
  const { loadPersistedReports, persistReportToBackend } = usePersistedReports();

  // ── Dérivés ──────────────────────────────────────────────────────────────────
  const pendingIncidentCount = useMemo(
    () => messages.filter(m => m.type === 'report').length,
    [messages]
  );

  const activeIncidents = useMemo((): ActiveIncident[] => {
    const counts = new Map<AlertType, number>();
    messages
      .filter(m => m.type === 'report' && m.alertType)
      .forEach(m => counts.set(m.alertType as AlertType, (counts.get(m.alertType as AlertType) ?? 0) + 1));
    return Array.from(counts.entries()).map(([alertType, count]) => ({ alertType, count }));
  }, [messages]);

  const clearIncidentCount = useCallback(() => setUnreadIncidentCount(0), []);

  // ── Restaure le marqueur carte selon la liste de cartes persistées ──────────
  const restoreAlertMarker = useCallback((cards: Message[]) => {
    const reportCards = cards.filter(c => c.type === 'report' && c.alertType);
    if (reportCards.length > 0) {
      setAlertType(reportCards[reportCards.length - 1].alertType as AlertType);
    }
  }, [setAlertType]);

  // ── Chargement initial des signalements persistés (indépendant du socket) ───
  useEffect(() => {
    loadPersistedReports().then(cards => {
      if (cards.length === 0) return;
      restoreAlertMarker(cards);
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newCards = cards.filter(c => !existingIds.has(c.id));
        return newCards.length > 0 ? [...prev, ...newCards] : prev;
      });
    });
  }, [loadPersistedReports, restoreAlertMarker]);

  // ── Connexion Socket.IO ───────────────────────────────────────────────────────
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
      // restoreAlertMarker appelle setAlertType — ne JAMAIS l'appeler
      // à l'intérieur d'un updater setState (interdit par React).
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newFromSocket = history.filter(m => !existingIds.has(m.id));
        if (newFromSocket.length === 0) return prev;
        return [...prev, ...newFromSocket].sort((a, b) => a.id.localeCompare(b.id));
      });
      restoreAlertMarker(history); // appelé hors du updater
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      if (message.type === 'report' && message.alertType) {
        setAlertType(message.alertType);
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    newSocket.on('userConnected', (userData: ChatUser) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), text: `${userData.name} a rejoint la conversation`,
        sender: 'Système', senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      }]);
    });

    newSocket.on('userDisconnected', (userData: ChatUser) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), text: `${userData.name} a quitté la conversation`,
        sender: 'Système', senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      }]);
    });

    newSocket.on('alertMessage', (alert: { text: string }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), text: `🚨 ALERTE: ${alert.text}`,
        sender: 'Sécurité Civile', senderId: 'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'alert',
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
    socket.emit('sendMessage', {
      id:        Date.now().toString(),
      text:      inputText,
      sender:    user.name,
      senderId:  user.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setInputText('');
  }, [inputText, socket, user, isConnected]);

  // ── Envoi d'une carte de signalement incident ─────────────────────────────
  const sendAlertReport = useCallback((type: AlertType) => {
    const senderName = user?.name ?? 'Citoyen';
    const message: Message = {
      id:        Date.now().toString(),
      text:      ALERT_CONFIGS[type]?.chatLabel ?? type,
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

