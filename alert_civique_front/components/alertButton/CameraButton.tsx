import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import LiveStreamScreen from '@/app/views/LiveStreamSreen';

export default function CameraButton() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.buttonText}>📷</Text>
      </TouchableOpacity>

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
        presentationStyle="pageSheet"
      >
        <LiveStreamScreen onClose={() => setShowCamera(false)} autoStart />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: '100%',
    borderRadius: 15,
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
