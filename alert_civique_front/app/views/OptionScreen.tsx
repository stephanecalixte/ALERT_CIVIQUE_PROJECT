import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOptions } from '@/hooks/useOptions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

const APP_VERSION = '1.0.0';

export default function OptionScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { options, updateOption, loading: optionsLoading } = useOptions();
  const colorScheme = useColorScheme();
  const themeColor = useThemeColor({}, 'tint');
  const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.replace('/(tabs)/Register');
  //   }
  // }, [isAuthenticated]);

  const togglePushNotifications = () => {
    updateOption('pushNotifications', !options.pushNotifications);
  };

  const toggleLocationPrecision = () => {
    const newPrecision = options.locationPrecision === 'high' ? 'low' : 'high';
    updateOption('locationPrecision', newPrecision as any);
  };

  const toggleDarkMode = () => {
    updateOption('darkMode', !options.darkMode);
  };

  const changeLanguage = (lang: 'fr' | 'en') => {
    updateOption('language', lang as any);
  };

  const toggleSosContacts = () => {
    updateOption('sosContactsEnabled', !options.sosContactsEnabled);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@alertcivique.com');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section Compte */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Compte</ThemedText>
          
          <View style={styles.settingRow}>
            <ThemedText>Nom utilisateur</ThemedText>
            <ThemedText>{user?.name || user?.email || 'N/A'}</ThemedText>
          </View>
          
          <View style={styles.settingRow}>
            <ThemedText>ID</ThemedText>
            <ThemedText>{user?.userId}</ThemedText>
          </View>
          
          <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4444' }]} onPress={handleLogout}>
            <ThemedText style={styles.buttonText}>Déconnexion</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Notifications</ThemedText>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingRow}>
              <ThemedText>Notifications push</ThemedText>
              <Switch value={options.pushNotifications === true} onValueChange={togglePushNotifications} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Vie Privée */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Vie Privée</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingRow}>
              <ThemedText>Précision GPS</ThemedText>
              <ThemedText style={styles.accent}>{options.locationPrecision === 'high' ? 'Haute' : 'Basse'}</ThemedText>
            </View>
            <TouchableOpacity style={styles.switchButton}>
              <ThemedText>Changer</ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <ThemedText>Contacts SOS</ThemedText>
            <ThemedText style={styles.caption}>Gérer vos contacts d&apos;urgence</ThemedText>
            <View style={styles.rightArrow} />
          </TouchableOpacity>
        </View>

        {/* Section Application */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Application</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingRow}>
              <ThemedText>Mode sombre</ThemedText>
              <Switch value={options.darkMode} onValueChange={toggleDarkMode} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingRow}>
              <ThemedText>Langue</ThemedText>
              <ThemedText style={styles.accent}>{options.language === 'fr' ? 'Français' : 'English'}</ThemedText>
            </View>
            <TouchableOpacity style={styles.switchButton}>
              <ThemedText>Changer</ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>À propos</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingRow}>
              <ThemedText>Version</ThemedText>
              <ThemedText>{APP_VERSION}</ThemedText>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={openPrivacyPolicy}>
            <ThemedText style={styles.buttonText}>Politique de confidentialité</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={openSupport}>
            <ThemedText style={styles.buttonText}>Contacter le support</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  accent: {
    fontWeight: '600',
    color: '#0a7ea4',
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  rightArrow: {
    width: 20,
    height: 20,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    transform: [{ rotate: '45deg' }],
  },
  switchButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(10,126,164,0.1)',
  },
  button: {
    backgroundColor: '#2E86DE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

