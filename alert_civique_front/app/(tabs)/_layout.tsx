import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 80;

function ShieldLogo({ size = 38 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 100 110">
      <Defs>
        <LinearGradient id="shieldGH" x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%"   stopColor="#1A8FFF" />
          <Stop offset="100%" stopColor="#0044CC" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 4 C50 4 82 15 86 20 L86 54 Q86 82 50 98 Q14 82 14 54 L14 20 C18 15 50 4 50 4 Z"
        fill="url(#shieldGH)"
      />
      <Path
        d="M50 6 C50 6 78 16 82 21 L82 36 Q66 30 50 28 Q34 30 18 36 L18 21 C22 16 50 6 50 6 Z"
        fill="white" fillOpacity={0.10}
      />
      <Rect x={36} y={62} width={28}  height={22} rx={7}   fill="white" fillOpacity={0.97} />
      <Rect x={36} y={38} width={6.5} height={26} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={44} y={33} width={6.5} height={31} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={52} y={34} width={6.5} height={30} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={60} y={40} width={6.5} height={24} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={27} y={55} width={9}   height={16} rx={4.5} fill="white" fillOpacity={0.97} />
      <Path d="M31 34 Q50 20 69 34" fill="none" stroke="#FF6600" strokeWidth={3.8} strokeLinecap="round" />
      <Path d="M38 34 Q50 25 62 34" fill="none" stroke="#FF8833" strokeWidth={2.6} strokeLinecap="round" strokeOpacity={0.72} />
      <Path d="M44 34 Q50 29 56 34" fill="none" stroke="#FFAA66" strokeWidth={2}   strokeLinecap="round" strokeOpacity={0.45} />
      <Circle cx={50} cy={36} r={3.2} fill="#FF6600" />
    </Svg>
  );
}

function TopLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topLayout, { paddingTop: insets.top, height: TAB_BAR_HEIGHT + insets.top }]}>
      <View style={styles.topLeft}>
        <IconSymbol size={22} name="bell.fill" color="white" />
      </View>
      <View style={styles.logoContainer}>
        <ShieldLogo size={44} />
      </View>
      <View style={styles.topRight} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <TopLayout />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: styles.tabBar,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen name="LiveStream" options={{ href: null }} />
        <Tabs.Screen name="Photo"      options={{ href: null }} />
        <Tabs.Screen name="Messages"   options={{ href: null }} />
        <Tabs.Screen name="explore"    options={{ href: null }} />
        <Tabs.Screen
          name="Priority"
          options={{
            title: 'Priorité',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="exclamationmark.triangle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Option"
          options={{
            title: 'Options',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Register"
          options={{
            title: 'Register',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.badge.plus" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  topLayout: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#1a6fd4',
    // Neumorphisme bleu — ombre sombre en bas
    borderTopWidth: 1.5,
    borderTopColor: '#3d94ff',
    borderBottomWidth: 2,
    borderBottomColor: '#0d47a1',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  logoContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#1a6fd4',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#4da3ff',
    borderLeftColor: '#4da3ff',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#0a3a8a',
    borderRightColor: '#0a3a8a',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  topLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  topRight: {
    width: 40,
    alignItems: 'flex-end',
  },

  // Tab bar
  tabBar: {
    backgroundColor: '#1565c0',
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 0,
    // paddingHorizontal: 4,
    // padding: 20,
  },

  // Chaque item — neumorphisme bleu
  tabItem: {
   
    borderRadius: 14,
    // marginHorizontal: 4,
    // marginVertical: 6,
    backgroundColor: '#1a6fd4',
    // Bordure claire haut-gauche (source lumière)
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#4da3ff',
    borderLeftColor: '#4da3ff',
    // Bordure sombre bas-droite (ombre)
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#0a3a8a',
    borderRightColor: '#0a3a8a',
    // Ombre portée
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
});
