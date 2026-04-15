import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AlertTypeModal from '@/components/AlertTypeModal';
import { AlertType } from '@/contexts/AlertContext';

interface Props {
  onAlertSelected?: (type: AlertType) => void;
  onOpenAudio?: (alertType: AlertType) => void;
}

export default function MicButton({ onAlertSelected, onOpenAudio }: Props) {
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleAlertSelect = (type: AlertType) => {
    setShowAlertModal(false);
    onAlertSelected?.(type);
    onOpenAudio?.(type);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setShowAlertModal(true)} activeOpacity={0.85}>
        <Ionicons name="mic" size={26} color="#007AFF" />
      </TouchableOpacity>

      <AlertTypeModal
        visible={showAlertModal}
        onSelect={handleAlertSelect}
        onClose={() => setShowAlertModal(false)}
      />
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
