import React from 'react';
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
import { useMessages } from '../../hooks/useMessages';
import type { Message } from '../../hooks/useMessages';

export default function MessagesScreen() {
  const {
    messages,
    inputText,
    isConnected,
    user,
    loading,
    flatListRef,
    setInputText,
    sendMessage,
  } = useMessages();

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

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;
    const isSystem = item.type === 'system';
    const isAlert = item.type === 'alert';

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage :
        isSystem ? styles.systemMessage :
        isAlert ? styles.alertMessage :
        styles.otherMessage
      ]}>
        {!isSystem && !isMyMessage && (
          <Text style={styles.sender}>{item.sender}</Text>
        )}
        <Text style={[
          styles.messageText,
          isMyMessage && styles.myMessageText,
          isAlert && styles.alertMessageText,
          isSystem && styles.systemMessageText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isMyMessage && styles.timestampMine,
            isAlert && styles.timestampAlert,
            isSystem && styles.timestampSystem
          ]}>
            {item.timestamp}
          </Text>
          {isMyMessage && isConnected && (
            <Text style={styles.deliveryStatus}>✓</Text>
          )}
        </View>
      </View>
    );
  };

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
  myMessageText: {
    color: '#fff',
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
    color: 'rgba(0, 0, 0, 0.35)',
  },
  timestampMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timestampAlert: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timestampSystem: {
    color: 'rgba(0, 0, 0, 0.3)',
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