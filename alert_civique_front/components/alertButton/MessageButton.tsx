import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import MessagesScreen from '@/app/(tabs)/MessagesScreen';

export default function MessageButton() {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowMessages(true)}
      >
        <Text style={styles.buttonText}>💬</Text>
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
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 28,
  },
});
