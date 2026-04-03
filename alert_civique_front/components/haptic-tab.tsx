import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;

  return (
    <View style={[styles.wrapper, isSelected ? styles.active : styles.inactive]}>
      <PlatformPressable
        {...props}
        style={styles.pressable}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}

const BASE = '#1a6fd4';
const LIGHT = '#4da3ff';
const DARK  = '#0a3a8a';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 14,
    marginHorizontal: 4,
    marginVertical: 6,
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Onglet actif — extrudé
  active: {
    backgroundColor: BASE,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: LIGHT,
    borderLeftColor: LIGHT,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: DARK,
    borderRightColor: DARK,
    shadowColor: DARK,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 6,
  },
  // Onglet inactif — légèrement enfoncé
  inactive: {
    backgroundColor: '#1565c0',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: DARK,
    borderLeftColor: DARK,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: LIGHT,
    borderRightColor: LIGHT,
  },
});
