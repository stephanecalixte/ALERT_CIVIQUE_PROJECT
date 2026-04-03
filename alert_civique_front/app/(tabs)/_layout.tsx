import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Hauteur identique à la tab bar
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 60;

function TopLayout() {
  return (
    <View style={[styles.topLayout, { backgroundColor: '#1a6fd4', height: TAB_BAR_HEIGHT }]}>
      <View style={styles.topLeft}>
        <IconSymbol size={22} name="bell.fill" color="white" />
      </View>
      <Text style={[styles.topTitle, { color: 'white' }]}>
        Alert<Text style={{ color: '#FF6600' }}>&apos;</Text>Civique
      </Text>
      <View style={styles.topRight}>
        <IconSymbol size={22} name="magnifyingglass" color="white" />
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
          tabBarLabelStyle: { color: '#FFFFFF' },
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#1a6fd4',
            height: TAB_BAR_HEIGHT,
            borderTopWidth: 0,
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
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
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
    borderTopWidth: 1.5,
    borderTopColor: '#3d94ff',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0d47a1',
    shadowColor: '#0d47a1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
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
