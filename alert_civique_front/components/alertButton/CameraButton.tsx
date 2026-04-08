import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LiveStreamScreen from '@/app/views/LiveStreamSreen';
import AlertTypeModal from '@/components/AlertTypeModal';
import { AlertType } from '@/contexts/AlertContext';

interface Props {
  onAlertSelected?: (type: AlertType) => void;
}

export default function CameraButton({ onAlertSelected }: Props) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showCamera, setShowCamera]         = useState(false);
  const [alertType, setAlertType]           = useState<AlertType | null>(null);

  const handlePress = () => {
    setShowAlertModal(true);
  };

  const handleAlertSelect = (type: AlertType) => {
    setAlertType(type);
    onAlertSelected?.(type);   // informe index.tsx → map + chat
    setShowCamera(true);
  };

  const handleClose = () => {
    setShowCamera(false);
    setAlertType(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Ionicons name="videocam" size={26} color="#007AFF" />
      </TouchableOpacity>

      {/* Étape 1 — Choix du type d'alerte */}
      <AlertTypeModal
        visible={showAlertModal}
        onSelect={handleAlertSelect}
        onClose={() => setShowAlertModal(false)}
      />

      {/* Étape 2 — Stream avec alertType dans le payload */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={handleClose}
        presentationStyle="pageSheet"
      >
        <LiveStreamScreen
          onClose={handleClose}
          autoStart
          alertType={alertType ?? undefined}
        />
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
