import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessagesScreen from '@/app/(tabs)/Messages';
import { useAlert } from '@/contexts/AlertContext';

export default function MessageButton() {
  const [showMessages, setShowMessages] = useState(false);
  const { alertType } = useAlert();
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animRef   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }

    if (alertType) {
      // Clignotement rapide de l'icône
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0,   duration: 400, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1,   duration: 400, useNativeDriver: true }),
        ])
      );
      // Pulsation du bouton (scale)
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      );
      animRef.current = Animated.parallel([blink, pulse]);
      animRef.current.start();
    } else {
      blinkAnim.setValue(1);
      pulseAnim.setValue(1);
    }

    return () => { animRef.current?.stop(); };
  }, [alertType]);

  const alertColor = alertType
    ? { agression: '#e53935', accident: '#FF6F00', incendie: '#FF3D00' }[alertType]
    : '#007AFF';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, alertType && { borderColor: alertColor, borderWidth: 2 }]}
          onPress={() => setShowMessages(true)}
          activeOpacity={0.85}
        >
          <Animated.View style={{ opacity: blinkAnim }}>
            <Ionicons name="chatbubble" size={24} color={alertColor} />
          </Animated.View>

          {/* Badge rouge si incident actif */}
          {alertType && <View style={[styles.badge, { backgroundColor: alertColor }]} />}
        </TouchableOpacity>
      </Animated.View>

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
  animWrapper: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: '100%',
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
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
