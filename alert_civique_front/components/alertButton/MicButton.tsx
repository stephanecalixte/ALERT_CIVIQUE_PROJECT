import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioRecordScreen from '@/components/AudioRecordScreen';
import AlertTypeModal from '@/components/AlertTypeModal';
import { AlertType } from '@/contexts/AlertContext';

interface Props {
  onAlertSelected?: (type: AlertType) => void;
}

export default function MicButton({ onAlertSelected }: Props) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAudio, setShowAudio]           = useState(false);

  const handlePress = () => setShowAlertModal(true);

  const handleAlertSelect = (type: AlertType) => {
    setShowAlertModal(false);
    onAlertSelected?.(type);
    setShowAudio(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
        <Ionicons name="mic" size={26} color="#007AFF" />
      </TouchableOpacity>

      <AlertTypeModal
        visible={showAlertModal}
        onSelect={handleAlertSelect}
        onClose={() => setShowAlertModal(false)}
      />

      <Modal
        visible={showAudio}
        animationType="slide"
        onRequestClose={() => setShowAudio(false)}
        presentationStyle="pageSheet"
      >
        <AudioRecordScreen onClose={() => setShowAudio(false)} />
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
