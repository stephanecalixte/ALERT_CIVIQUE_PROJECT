import { useEffect, useRef, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import io from 'socket.io-client';

export interface User {
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
  type?: 'text' | 'alert' | 'system';
}

const SOCKET_URL = 'http://10.0.2.2:9091';

console.log('🔧 Chat hook loaded, SOCKET_URL:', SOCKET_URL);

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList<Message> | null>(null);

  const initSocket = useCallback(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.io');
      setIsConnected(true);
      setLoading(true);

      newSocket.emit('userConnect', {
        userId: `temp_${Date.now()}`,
        userName: `Citoyen_${Math.floor(Math.random() * 1000)}`
      });

      newSocket.emit('getMessageHistory');
    });

    // ✅ CORRECTION : setLoading(false) après réception de userInfo
    newSocket.on('userInfo', (userData: User) => {
      console.log('👤 Utilisateur enregistré par le serveur:', userData);
      setUser(userData);
      setLoading(false);
    });

    // ✅ CORRECTION : fallback setLoading(false) à la réception de l'historique
    newSocket.on('messageHistory', (history: Message[]) => {
      console.log(`📜 Historique reçu: ${history.length} messages`);
      setMessages(history);
      setLoading(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log(`💬 Nouveau message de ${message.sender}`);
      setMessages((prev: Message[]) => [...prev, message]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    newSocket.on('userConnected', (userData: User) => {
      console.log(`👤 ${userData.name} a rejoint`);
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${userData.name} a rejoint la conversation`,
        sender: 'Système',
        senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      setMessages((prev: Message[]) => [...prev, systemMessage]);
    });

    newSocket.on('userDisconnected', (userData: User) => {
      console.log(`👋 ${userData.name} a quitté`);
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${userData.name} a quitté la conversation`,
        sender: 'Système',
        senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      setMessages((prev: Message[]) => [...prev, systemMessage]);
    });

    newSocket.on('alertMessage', (alert: { text: string; priority: 'high' | 'medium' | 'low' }) => {
      console.log(`🚨 ALERTE reçue: ${alert.text}`);
      const alertMessage: Message = {
        id: Date.now().toString(),
        text: `🚨 ALERTE: ${alert.text}`,
        sender: 'Sécurité Civile',
        senderId: 'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'alert'
      };
      setMessages((prev: Message[]) => [...prev, alertMessage]);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('❌ Erreur de connexion: timeout');
      setIsConnected(false);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = initSocket();
    return cleanup;
  }, [initSocket]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !socket || !user || !isConnected) {
      console.log('❌ Envoi impossible:', {
        textEmpty: !inputText.trim(),
        hasSocket: !!socket,
        hasUser: !!user,
        isConnected
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: user.name,
      senderId: user.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    console.log('📤 Envoi message:', message);
    socket.emit('sendMessage', message);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, socket, user, isConnected]);

  return {
    messages,
    inputText,
    isConnected,
    user,
    loading,
    flatListRef,
    setInputText,
    sendMessage,
  };
}