import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      style={[props.style, isSelected ? styles.activeTab : styles.inactiveTab]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#1a6fd4',
    borderRadius: 14,
    margin: 6,
    // Ombre sombre bas-droite
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
    // Bordures neumorphiques
    borderWidth: 1.5,
    borderTopColor: '#4da3ff',
    borderLeftColor: '#4da3ff',
    borderBottomColor: '#0d47a1',
    borderRightColor: '#0d47a1',
  },
  inactiveTab: {
    borderRadius: 14,
    margin: 6,
  },
});
