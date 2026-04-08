import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraScreen from '@/components/CameraScreen';
import AlertTypeModal from '@/components/AlertTypeModal';
import { AlertType } from '@/contexts/AlertContext';

interface Props {
  onAlertSelected?: (type: AlertType) => void;
}

export default function PhotoButton({ onAlertSelected }: Props) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPhoto, setShowPhoto]           = useState(false);

  const handlePress = () => setShowAlertModal(true);

  const handleAlertSelect = (type: AlertType) => {
    setShowAlertModal(false);
    onAlertSelected?.(type);
    setShowPhoto(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
        <Ionicons name="camera" size={26} color="#007AFF" />
      </TouchableOpacity>

      <AlertTypeModal
        visible={showAlertModal}
        onSelect={handleAlertSelect}
        onClose={() => setShowAlertModal(false)}
      />

      <Modal
        visible={showPhoto}
        animationType="slide"
        onRequestClose={() => setShowPhoto(false)}
        presentationStyle="pageSheet"
      >
        <CameraScreen onClose={() => setShowPhoto(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    width: '80%', height: '80%', borderRadius: 16,
    backgroundColor: '#e8ecf0', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#a3b1c6', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.7, shadowRadius: 8, elevation: 6,
    borderWidth: 1.5, borderTopColor: '#ffffff', borderLeftColor: '#ffffff',
    borderBottomColor: '#c4cdd8', borderRightColor: '#c4cdd8',
  },
});
