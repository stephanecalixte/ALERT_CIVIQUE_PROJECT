import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Platform, Text, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAlert, ALERT_CONFIGS } from '@/contexts/AlertContext';
import { useMessagesContext } from '@/contexts/MessagesContext';

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

// ── Bannière incident persistante ─────────────────────────────────────────────
function IncidentBanner() {
  const { alertType } = useAlert();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!alertType) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [alertType]);

  if (!alertType) return null;

  const cfg = ALERT_CONFIGS[alertType];
  return (
    <Animated.View style={[styles.incidentBanner, { backgroundColor: cfg.color, transform: [{ scaleX: pulseAnim }] }]}>
      <Text style={styles.incidentEmoji}>{cfg.emoji}</Text>
      <Text style={styles.incidentLabel}>{cfg.label.toUpperCase()} EN COURS</Text>
      <View style={styles.incidentDot} />
    </Animated.View>
  );
}

// ── Cloche avec badge ─────────────────────────────────────────────────────────
function BellWithBadge() {
  const { unreadIncidentCount } = useMessagesContext();
  return (
    <View>
      <IconSymbol size={22} name="bell.fill" color="white" />
      {unreadIncidentCount > 0 && (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>
            {unreadIncidentCount > 9 ? '9+' : unreadIncidentCount}
          </Text>
        </View>
      )}
    </View>
  );
}

function TopLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: '#1a6fd4' }}>
      <View style={[styles.topLayout, { paddingTop: insets.top, height: TAB_BAR_HEIGHT + insets.top }]}>
        <View style={styles.topLeft}>
          <BellWithBadge />
        </View>
        <View style={styles.logoContainer}>
          <ShieldLogo size={44} />
        </View>
        <View style={styles.topRight} />
      </View>
      <IncidentBanner />
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
          name="Contact"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.2.fill" color={color} />,
          }}
        />
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
          name="Admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="shield.fill" color={color} />,
          }}
        />
        <Tabs.Screen name="Register" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topLayout: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#1a6fd4',
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
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: '#1a6fd4',
    justifyContent: 'center', alignItems: 'center',
    borderTopWidth: 1.5, borderLeftWidth: 1.5,
    borderTopColor: '#4da3ff', borderLeftColor: '#4da3ff',
    borderBottomWidth: 2, borderRightWidth: 2,
    borderBottomColor: '#0a3a8a', borderRightColor: '#0a3a8a',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7, shadowRadius: 6, elevation: 8,
  },
  topLeft:  { width: 40, alignItems: 'flex-start' },
  topRight: { width: 40, alignItems: 'flex-end' },

  // Cloche badge
  bellBadge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: '#e53935',
    minWidth: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5, borderColor: '#1a6fd4',
  },
  bellBadgeText: {
    color: '#fff', fontSize: 9, fontWeight: '800',
  },

  // Bannière incident
  incidentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  incidentEmoji: { fontSize: 16 },
  incidentLabel: {
    color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1,
  },
  incidentDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff',
    opacity: 0.8,
  },

  // Tab bar
  tabBar: {
    backgroundColor: '#1565c0',
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 0,
  },
  tabItem: {
    borderRadius: 14,
    backgroundColor: '#1a6fd4',
    borderTopWidth: 1.5, borderLeftWidth: 1.5,
    borderTopColor: '#4da3ff', borderLeftColor: '#4da3ff',
    borderBottomWidth: 1.5, borderRightWidth: 1.5,
    borderBottomColor: '#0a3a8a', borderRightColor: '#0a3a8a',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6, shadowRadius: 5, elevation: 5,
  },
});
