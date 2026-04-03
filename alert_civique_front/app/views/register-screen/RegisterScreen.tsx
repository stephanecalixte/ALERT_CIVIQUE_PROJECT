import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRegister } from "@/hooks/useRegister";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12 caractères minimum', ok: password.length >= 12 },
    { label: 'Majuscule (A-Z)',        ok: /[A-Z]/.test(password) },
    { label: 'Minuscule (a-z)',        ok: /[a-z]/.test(password) },
    { label: 'Chiffre (0-9)',          ok: /\d/.test(password) },
    { label: 'Caractère spécial',      ok: /[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#dc2626', '#dc2626', '#f97316', '#eab308', '#22c55e'];
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  if (!password) return null;

  return (
    <View style={pwStyles.container}>
      <View style={pwStyles.barRow}>
        {checks.map((_, i) => (
          <View
            key={i}
            style={[pwStyles.bar, { backgroundColor: i < score ? colors[score - 1] : '#e5e7eb' }]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color: colors[score - 1] ?? '#e5e7eb' }]}>
        {labels[score]}
      </Text>
      {checks.map((c, i) => (
        <Text key={i} style={[pwStyles.check, { color: c.ok ? '#22c55e' : '#9ca3af' }]}>
          {c.ok ? '✓' : '○'} {c.label}
        </Text>
      ))}
    </View>
  );
}

const pwStyles = StyleSheet.create({
  container: { marginBottom: 8, paddingHorizontal: 4 },
  barRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  check: { fontSize: 12, marginBottom: 2 },
});

export default function RegisterScreen() {
  const {
    form,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    handleTrustedContactChange,
    register,
  } = useRegister();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== form.password
      ? 'Les mots de passe ne correspondent pas'
      : null;

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        placeholder="Prénom *"
        value={form.firstname}
        onChangeText={(text) => handleChange("firstname" as keyof typeof form, text)}
        style={[styles.input, errors.firstname && styles.inputError]}
        autoCapitalize="words"
      />
      {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}

      <TextInput
        placeholder="Nom *"
        value={form.lastname}
        onChangeText={(text) => handleChange("lastname" as keyof typeof form, text)}
        style={[styles.input, errors.lastname && styles.inputError]}
        autoCapitalize="words"
      />
      {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}

      <TextInput
        placeholder="Email *"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => handleChange("email" as keyof typeof form, text)}
        style={[styles.input, errors.email && styles.inputError]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        placeholder="Téléphone *"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => handleChange("phone" as keyof typeof form, text)}
        style={[styles.input, errors.phone && styles.inputError]}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <TextInput
        placeholder="Date de naissance * (AAAA-MM-JJ, ex: 1990-06-15)"
        value={form.birthdate}
        onChangeText={(text) => handleChange("birthdate" as keyof typeof form, text)}
        style={[styles.input, errors.birthdate && styles.inputError]}
        maxLength={10}
      />
      {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}

      <Text style={styles.sectionTitle}>Personnes de confiance (optionnel)</Text>

      {/* Personne 1 */}
      <Text style={styles.personTitle}>Personne 1</Text>
      <TextInput
        placeholder="Prénom Personne 1"
        value={form.trustedContacts.person1.firstName}
        onChangeText={(text) => handleTrustedContactChange('person1', 'firstName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Nom Personne 1"
        value={form.trustedContacts.person1.lastName}
        onChangeText={(text) => handleTrustedContactChange('person1', 'lastName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email Personne 1"
        keyboardType="email-address"
        value={form.trustedContacts.person1.email}
        onChangeText={(text) => handleTrustedContactChange('person1', 'email', text)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 1"
        keyboardType="phone-pad"
        value={form.trustedContacts.person1.phone}
        onChangeText={(text) => handleTrustedContactChange('person1', 'phone', text)}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 1</Text>
        <Switch
          value={form.trustedContacts.person1.smsEnabled}
          onValueChange={(value) => handleTrustedContactChange('person1', 'smsEnabled', value)}
        />
      </View>

      {/* Personne 2 */}
      <Text style={styles.personTitle}>Personne 2</Text>
      <TextInput
        placeholder="Prénom Personne 2"
        value={form.trustedContacts.person2.firstName}
        onChangeText={(text) => handleTrustedContactChange('person2', 'firstName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Nom Personne 2"
        value={form.trustedContacts.person2.lastName}
        onChangeText={(text) => handleTrustedContactChange('person2', 'lastName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email Personne 2"
        keyboardType="email-address"
        value={form.trustedContacts.person2.email}
        onChangeText={(text) => handleTrustedContactChange('person2', 'email', text)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 2"
        keyboardType="phone-pad"
        value={form.trustedContacts.person2.phone}
        onChangeText={(text) => handleTrustedContactChange('person2', 'phone', text)}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 2</Text>
        <Switch
          value={form.trustedContacts.person2.smsEnabled}
          onValueChange={(value) => handleTrustedContactChange('person2', 'smsEnabled', value)}
        />
      </View>

      {/* Personne 3 */}
      <Text style={styles.personTitle}>Personne 3</Text>
      <TextInput
        placeholder="Prénom Personne 3"
        value={form.trustedContacts.person3.firstName}
        onChangeText={(text) => handleTrustedContactChange('person3', 'firstName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Nom Personne 3"
        value={form.trustedContacts.person3.lastName}
        onChangeText={(text) => handleTrustedContactChange('person3', 'lastName', text)}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email Personne 3"
        keyboardType="email-address"
        value={form.trustedContacts.person3.email}
        onChangeText={(text) => handleTrustedContactChange('person3', 'email', text)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 3"
        keyboardType="phone-pad"
        value={form.trustedContacts.person3.phone}
        onChangeText={(text) => handleTrustedContactChange('person3', 'phone', text)}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 3</Text>
        <Switch
          value={form.trustedContacts.person3.smsEnabled}
          onValueChange={(value) => handleTrustedContactChange('person3', 'smsEnabled', value)}
        />
      </View>

      <View style={styles.passwordRow}>
        <TextInput
          placeholder="Mot de passe * (12+ car., maj, chiffre, symbole)"
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(text) => handleChange("password" as keyof typeof form, text)}
          style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#888" />
        </TouchableOpacity>
      </View>
      <PasswordStrength password={form.password} />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.passwordRow}>
        <TextInput
          placeholder="Confirmer le mot de passe *"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, styles.passwordInput, confirmError ? styles.inputError : null]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
          <Ionicons name={showConfirm ? "eye-off" : "eye"} size={22} color="#888" />
        </TouchableOpacity>
      </View>
      {confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

      {isSuccess && (
        <Text style={styles.successText}>Compte créé avec succès !</Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#2E86DE" style={styles.loading} />
      ) : (
        <TouchableOpacity
          style={[styles.button, (isLoading || !!confirmError || !confirmPassword) && styles.buttonDisabled]}
          onPress={() => {
            if (!confirmPassword) {
              return;
            }
            if (confirmError) {
              return;
            }
            register();
          }}
          disabled={isLoading || !!confirmError || !confirmPassword}
        >
          <Text style={styles.buttonText}>Inscrire</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 25,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 35,
    textAlign: "center",
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 15,
    color: '#333',
  },
  personTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#333',
  },
  smsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    marginBottom: 16,
  },
  smsLabel: {
    fontSize: 16,
    color: '#333',
  },
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#2E86DE",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
  successText: {
    color: '#28a745',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
});
