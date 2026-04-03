import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LiveStreamScreen from '@/app/views/LiveStreamSreen';

export default function CameraButton() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
        activeOpacity={0.85}
      >
        <View>
          <Ionicons name="videocam" size={26} color="#007AFF" />

        </View>
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
