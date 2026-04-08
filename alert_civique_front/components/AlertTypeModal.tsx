import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import { AlertType, ALERT_CONFIGS } from '@/contexts/AlertContext';

interface Props {
  visible: boolean;
  onSelect: (type: AlertType) => void;
  onClose: () => void;
}

const CHOICES: AlertType[] = ['agression', 'accident', 'incendie'];

export default function AlertTypeModal({ visible, onSelect, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Fond semi-transparent — clic ferme */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Type de signalement</Text>
          <Text style={styles.subtitle}>Choisissez la nature de l'incident</Text>

          {CHOICES.map((type) => {
            const cfg = ALERT_CONFIGS[type];
            return (
              <TouchableOpacity
                key={type}
                style={[styles.choice, { borderColor: cfg.color }]}
                onPress={() => { onSelect(type); onClose(); }}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: cfg.color }]}>
                  <Text style={styles.emoji}>{cfg.emoji}</Text>
                </View>
                <View style={styles.choiceInfo}>
                  <Text style={[styles.choiceLabel, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                  <Text style={styles.choiceHint}>
                    {type === 'agression' && 'Violence, attaque, menace'}
                    {type === 'accident'  && 'Collision, blessés, danger routier'}
                    {type === 'incendie'  && 'Feu, fumée, explosion'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a237e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#78909c',
    textAlign: 'center',
    marginBottom: 4,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    backgroundColor: '#fafafa',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  choiceInfo: {
    flex: 1,
  },
  choiceLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  choiceHint: {
    fontSize: 12,
    color: '#90a4ae',
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#90a4ae',
    fontSize: 15,
    fontWeight: '600',
  },
});
