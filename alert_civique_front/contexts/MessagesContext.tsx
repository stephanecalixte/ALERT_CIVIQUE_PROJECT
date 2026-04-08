import React, { createContext, useContext, ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import io from 'socket.io-client';
import { NODE_BASE_URL, JAVA_BASE_URL } from '@/lib/config';
import { AlertType, ALERT_CONFIGS } from '@/contexts/AlertContext';

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

interface MessagesContextType {
  messages: Message[];
  inputText: string;
  isConnected: boolean;
  user: ChatUser | null;
  loading: boolean;
  flatListRef: React.RefObject<FlatList<Message> | null>;
  setInputText: (text: string) => void;
  sendMessage: () => void;
  sendAlertReport: (type: AlertType) => void;
  unreadIncidentCount: number;
  clearIncidentCount: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [inputText, setInputText]   = useState('');
  const [socket, setSocket]         = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser]             = useState<ChatUser | null>(null);
  const [loading, setLoading]       = useState(true);
  const [unreadIncidentCount, setUnreadIncidentCount] = useState(0);
  const flatListRef = useRef<FlatList<Message> | null>(null);

  const clearIncidentCount = useCallback(() => setUnreadIncidentCount(0), []);

  // ── Chargement des cartes de signalement persistées (Java backend) ─────────
  const loadPersistedReports = useCallback(async (): Promise<Message[]> => {
    try {
      const res = await fetch(`${JAVA_BASE_URL}/api/reportMessages/chat`);
      if (!res.ok) return [];
      const data: Array<{
        reportMessageId: number;
        alertType: string;
        senderName: string;
        createdAt: string;
      }> = await res.json();
      return data
        .filter(r => r.alertType)
        .map(r => ({
          id:        `report_${r.reportMessageId}`,
          text:      ALERT_CONFIGS[r.alertType as AlertType]?.chatLabel ?? r.alertType,
          sender:    r.senderName ?? 'Citoyen',
          senderId:  `persisted_${r.reportMessageId}`,
          timestamp: r.createdAt
            ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--',
          type:      'report' as const,
          alertType: r.alertType as AlertType,
        }));
    } catch {
      return [];
    }
  }, []);

  // ── Initialisation socket (une seule fois au montage du Provider) ──────────
  useEffect(() => {
    const newSocket = io(NODE_BASE_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setLoading(true);
      newSocket.emit('userConnect', {
        userId:   `temp_${Date.now()}`,
        userName: `Citoyen_${Math.floor(Math.random() * 1000)}`,
      });
      newSocket.emit('getMessageHistory');
    });

    newSocket.on('userInfo', (userData: ChatUser) => {
      setUser(userData);
      setLoading(false);
    });

    newSocket.on('messageHistory', async (history: Message[]) => {
      // Fusionner les messages socket avec les cartes persistées dans le backend Java
      const persistedCards = await loadPersistedReports();
      // Dédupliquer : si un report_X existe déjà dans history (via socket), on le retire
      const historyWithoutDupes = history.filter(
        m => !persistedCards.some(p => p.id === m.id)
      );
      // Mélanger et trier par timestamp (les cartes persistées n'ont pas d'ordre garanti)
      const merged = [...historyWithoutDupes, ...persistedCards].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      setMessages(merged);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
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

    newSocket.on('disconnect', ()       => setIsConnected(false));
    newSocket.on('connect_error', ()    => { setIsConnected(false); setLoading(false); });

    return () => { newSocket.disconnect(); };
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
    // Le serveur broadcast via 'newMessage' → pas d'ajout local pour éviter doublon
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
          createdAt:  new Date().toISOString().split('T')[0], // LocalDate format YYYY-MM-DD
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
    // Persister dans MariaDB via le backend Java
    persistReportToBackend(type, senderName);
    setUnreadIncidentCount(prev => prev + 1);
  }, [socket, user, isConnected, persistReportToBackend]);

  return (
    <MessagesContext.Provider value={{
      messages, inputText, isConnected, user, loading,
      flatListRef, setInputText, sendMessage, sendAlertReport,
      unreadIncidentCount, clearIncidentCount,
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
