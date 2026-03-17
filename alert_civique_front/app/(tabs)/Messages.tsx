import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import io from 'socket.io-client';

// Types des messages
interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  type?: 'text' | 'alert' | 'system';
}

interface User {
  id: string;
  name: string;
}

// Définir le type pour socket
type SocketType = ReturnType<typeof io>;

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<SocketType | null>(null); // CORRIGÉ ICI
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  // URL de votre serveur Socket.io
  const SOCKET_URL = 'http://192.168.1.66:3000'; // Changez par votre IP

  // Générer un utilisateur aléatoire
  useEffect(() => {
    const generateUser = () => {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userNames = ['Citoyen', 'Agent', 'Observateur', 'Rapporteur', 'Volontaire'];
      const randomName = userNames[Math.floor(Math.random() * userNames.length)];

      const newUser: User = {
        id: userId,
        name: `${randomName}#${Math.floor(Math.random() * 1000)}`,
      };

      setUser(newUser);
    };

    generateUser();
  }, []);

  // Initialiser Socket.io
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        userId: user.id,
        userName: user.name
      }
    });

    setSocket(newSocket);

    // Événements Socket.io
    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.io');
      setIsConnected(true);
      setLoading(false);
      
      // Charger l'historique des messages
      newSocket.emit('getMessageHistory');
    });

    newSocket.on('messageHistory', (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    newSocket.on('userConnected', (userData: User) => {
      // Notification d'utilisateur connecté
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${userData.name} a rejoint la conversation`,
        sender: 'Système',
        senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('userDisconnected', (userData: User) => {
      // Notification d'utilisateur déconnecté
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${userData.name} a quitté la conversation`,
        sender: 'Système',
        senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('alertMessage', (alert: { text: string; priority: 'high' | 'medium' | 'low' }) => {
      // Message d'alerte spécial
      const alertMessage: Message = {
        id: Date.now().toString(),
        text: `🚨 ALERTE: ${alert.text}`,
        sender: 'Sécurité Civile',
        senderId: 'alert_system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'alert'
      };
      setMessages(prev => [...prev, alertMessage]);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Erreur de connexion:', error);
      setLoading(false);
    });

    // Nettoyage
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Envoyer un message
  const sendMessage = () => {
    if (!inputText.trim() || !socket || !user || !isConnected) return;

    const message: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: user.name,
      senderId: user.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Émettre au serveur
    socket.emit('sendMessage', message);
    
    // Ajouter localement (optimistic update)
    setMessages(prev => [...prev, message]);
    setInputText('');
    
    // Scroll vers le bas
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Envoyer avec Enter
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && Platform.OS === 'web') {
      sendMessage();
    }
  };

  // Rendu d'un message
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer, 
      item.senderId === user?.id ? styles.myMessage : 
      item.type === 'system' ? styles.systemMessage :
      item.type === 'alert' ? styles.alertMessage : 
      styles.otherMessage
    ]}>
      {item.type !== 'system' && item.senderId !== user?.id && (
        <Text style={styles.sender}>{item.sender}</Text>
      )}
      <Text style={[
        styles.messageText,
        item.type === 'alert' && styles.alertMessageText,
        item.type === 'system' && styles.systemMessageText
      ]}>
        {item.text}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.senderId === user?.id && isConnected && (
          <Text style={styles.deliveryStatus}>✓</Text>
        )}
      </View>
    </View>
  );

  // Rendu de l'en-tête
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Chat Alerte Civique</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>
            {isConnected ? 'En ligne' : 'Hors ligne'} • {user?.name}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connexion au serveur...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}
      
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Vous êtes hors ligne. Reconnexion en cours...
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isConnected 
                ? 'Aucun message. Soyez le premier à parler !'
                : 'Connexion au serveur...'
              }
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, !isConnected && styles.disabledInput]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isConnected ? "Tapez votre message..." : "Connexion en cours..."}
          placeholderTextColor="#999"
          onSubmitEditing={sendMessage}
          onKeyPress={handleKeyPress}
          editable={isConnected}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!isConnected || !inputText.trim()) && styles.disabledButton]} 
          onPress={sendMessage}
          disabled={!isConnected || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connected: {
    backgroundColor: '#4CD964',
  },
  disconnected: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  offlineBanner: {
    backgroundColor: '#FFCC00',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 12,
    marginVertical: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    maxWidth: '95%',
  },
  alertMessage: {
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    maxWidth: '95%',
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  sender: {
    fontWeight: '600',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  alertMessageText: {
    color: '#fff',
    fontWeight: '600',
  },
  systemMessageText: {
    color: '#666',
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  deliveryStatus: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    height: 40,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});