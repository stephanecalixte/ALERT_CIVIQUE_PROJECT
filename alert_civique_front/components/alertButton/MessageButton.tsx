import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessagesScreen from '@/app/(tabs)/Messages';

export default function MessageButton() {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowMessages(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Modal
        visible={showMessages}
        animationType="slide"
        onRequestClose={() => setShowMessages(false)}
        presentationStyle="pageSheet"
      >
        <MessagesScreen />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    height: '80%',
    borderRadius: 16,
    backgroundColor: '#e8ecf0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderBottomColor: '#c4cdd8',
    borderRightColor: '#c4cdd8',
  },
});
