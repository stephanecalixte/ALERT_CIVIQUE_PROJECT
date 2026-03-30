import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import OptionService, { UserOptions } from '@/app/lib/services/OptionService';
import { useAuth } from '@/contexts/AuthContext';

export function useOptions() {
  const { token } = useAuth();
  const [options, setOptions] = useState<UserOptions>({
    pushNotifications: true,
    locationPrecision: 'high',
    darkMode: false,
    language: 'fr',
    sosContactsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from SecureStore/local first
  useEffect(() => {
    loadLocalOptions();
  }, []);

  // Sync with server when auth changes
  useEffect(() => {
    if (token) {
      loadServerOptions();
    }
  }, [token]);

  const loadLocalOptions = async () => {
    try {
      const localData = await SecureStore.getItemAsync('user_options');
      if (localData) {
        const localOptions = JSON.parse(localData) as UserOptions;
        setOptions(localOptions);
      }
    } catch (error) {
      console.error('Local options load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServerOptions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const serverOptions = await OptionService.getUserOptions(token);
      setOptions(prev => ({ ...prev, ...serverOptions }));
      await saveLocalOptions(serverOptions);
    } catch (error) {
      console.error('Server options load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocalOptions = async (newOptions: UserOptions) => {
    try {
      await SecureStore.setItemAsync('user_options', JSON.stringify(newOptions));
    } catch (error) {
      console.error('Local save error:', error);
    }
  };

  const updateOption = useCallback(async (key: keyof UserOptions, value: UserOptions[keyof UserOptions]) => {
    if (!token) {
      // Offline update
      const newOptions = { ...options, [key]: value };
      setOptions(newOptions);
      await saveLocalOptions(newOptions);
      return;
    }

    try {
      setSaving(true);
      const updated = await OptionService.updateOption(key as string, value, token);
      
      const newOptions = { ...options, [key]: value };
      setOptions(newOptions);
      await saveLocalOptions(newOptions);
      
      console.log(`Option ${key} updated:`, updated);
    } catch (error) {
      console.error(`Update ${key} error:`, error);
      Alert.alert('Erreur', `Impossible de sauvegarder ${key}`);
    } finally {
      setSaving(false);
    }
  }, [options, token]);

  const updateMultiple = useCallback(async (updates: Partial<UserOptions>) => {
    if (!token) {
      const newOptions = { ...options, ...updates };
      setOptions(newOptions);
      await saveLocalOptions(newOptions);
      return;
    }

    try {
      setSaving(true);
      const serverOptions = await OptionService.updateMultipleOptions(updates, token);
      const newOptions = { ...options, ...updates, ...serverOptions };
      setOptions(newOptions);
      await saveLocalOptions(newOptions);
    } catch (error) {
      console.error('Batch update error:', error);
    } finally {
      setSaving(false);
    }
  }, [options, token]);

  return {
    options,
    loading,
    saving,
    updateOption,
    updateMultiple,
    refresh: loadServerOptions,
  };
}

