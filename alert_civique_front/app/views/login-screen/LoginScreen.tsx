import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/app/lib/services/LoginService';

interface Props {
  onGoToRegister: () => void;
}

export default function LoginScreen({ onGoToRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loginUser(email.trim().toLowerCase(), password);
      await login(
        res.token,
        { userId: res.userId, name: `${res.firstname} ${res.lastname}`, email: res.email, isAdmin: res.isAdmin },
        { email: email.trim().toLowerCase(), password },
      );
    } catch (e) {
      Alert.alert('Connexion échouée', e instanceof Error ? e.message : 'Vérifiez vos identifiants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Alert Civique</Text>

        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor="#90a4ae"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.pwdRow}>
          <TextInput
            style={[styles.input, styles.pwdInput]}
            placeholder="Mot de passe *"
            placeholderTextColor="#90a4ae"
            secureTextEntry={!showPwd}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(v => !v)}>
            <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color="#90a4ae" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1a6fd4" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>Se connecter</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.toggleBtn} onPress={onGoToRegister}>
          <Text style={styles.toggleText}>
            Pas encore de compte ?{' '}
            <Text style={styles.toggleLink}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e8ecf0',
  },
  container: {
    padding: 28,
    paddingBottom: 60,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a237e',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#cfd8e3',
  },
  pwdRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  pwdInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  btn: {
    backgroundColor: '#1a6fd4',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginTop: 16,
  },
  toggleBtn: {
    marginTop: 28,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#546e7a',
  },
  toggleLink: {
    color: '#1a6fd4',
    fontWeight: '700',
  },
});
