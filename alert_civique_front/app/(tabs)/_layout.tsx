import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Hauteur identique à la tab bar
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 60;

function TopLayout() {
  const colorScheme = useColorScheme();
  const bg = Colors[colorScheme ?? 'light'].background;

  return (
    <View style={[styles.topLayout, { backgroundColor: bg, height: TAB_BAR_HEIGHT }]}>
      <View style={styles.topLeft}>
        <IconSymbol size={22} name="bell.fill" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
      <Text style={[styles.topTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        Alert<Text style={{ color: '#FF6600' }}>'</Text>Civique
      </Text>
      <View style={styles.topRight}>
        <IconSymbol size={22} name="magnifyingglass" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
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
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#007AFF',
            height: TAB_BAR_HEIGHT,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
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
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="exclamationmark.triangle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Option"
          options={{
            title: 'Options',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Register"
          options={{
            title: 'Register',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.plus" color={color} />,
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
  topLayout: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  topLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topRight: {
    width: 40,
    alignItems: 'flex-end',
  },
});
