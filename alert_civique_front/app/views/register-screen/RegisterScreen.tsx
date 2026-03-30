import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterScreen() {
  const {
    form,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    register,
  } = useRegister();
  const [formLocal, setFormLocal] = useState(form);

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
        placeholder="Date de naissance * (YYYY-MM-DD)"
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
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person1: { ...form.trustedContacts.person1, firstName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Nom Personne 1"
        value={form.trustedContacts.person1.lastName}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person1: { ...form.trustedContacts.person1, lastName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Email Personne 1"
        keyboardType="email-address"
        value={form.trustedContacts.person1.email}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person1: { ...form.trustedContacts.person1, email: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 1"
        keyboardType="phone-pad"
        value={form.trustedContacts.person1.phone}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person1: { ...form.trustedContacts.person1, phone: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 1</Text>
        <Switch
          value={form.trustedContacts.person1.smsEnabled}
          onValueChange={(value) => {
            const newForm = {
              ...form,
              trustedContacts: {
                ...form.trustedContacts,
                person1: { ...form.trustedContacts.person1, smsEnabled: value }
              }
            };
            setFormLocal(newForm);
          }}
        />
      </View>

      {/* Personne 2 */}
      <Text style={styles.personTitle}>Personne 2</Text>
      <TextInput
        placeholder="Prénom Personne 2"
        value={form.trustedContacts.person2.firstName}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person2: { ...form.trustedContacts.person2, firstName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Nom Personne 2"
        value={form.trustedContacts.person2.lastName}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person2: { ...form.trustedContacts.person2, lastName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Email Personne 2"
        keyboardType="email-address"
        value={form.trustedContacts.person2.email}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person2: { ...form.trustedContacts.person2, email: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 2"
        keyboardType="phone-pad"
        value={form.trustedContacts.person2.phone}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person2: { ...form.trustedContacts.person2, phone: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 2</Text>
        <Switch
          value={form.trustedContacts.person2.smsEnabled}
          onValueChange={(value) => {
            const newForm = {
              ...form,
              trustedContacts: {
                ...form.trustedContacts,
                person2: { ...form.trustedContacts.person2, smsEnabled: value }
              }
            };
            setFormLocal(newForm);
          }}
        />
      </View>

      {/* Personne 3 */}
      <Text style={styles.personTitle}>Personne 3</Text>
      <TextInput
        placeholder="Prénom Personne 3"
        value={form.trustedContacts.person3.firstName}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person3: { ...form.trustedContacts.person3, firstName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Nom Personne 3"
        value={form.trustedContacts.person3.lastName}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person3: { ...form.trustedContacts.person3, lastName: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Email Personne 3"
        keyboardType="email-address"
        value={form.trustedContacts.person3.email}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person3: { ...form.trustedContacts.person3, email: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Téléphone Personne 3"
        keyboardType="phone-pad"
        value={form.trustedContacts.person3.phone}
        onChangeText={(text) => {
          const newForm = {
            ...form,
            trustedContacts: {
              ...form.trustedContacts,
              person3: { ...form.trustedContacts.person3, phone: text }
            }
          };
          setFormLocal(newForm);
        }}
        style={styles.input}
      />
      <View style={styles.smsRow}>
        <Text style={styles.smsLabel}>SMS Personne 3</Text>
        <Switch
          value={form.trustedContacts.person3.smsEnabled}
          onValueChange={(value) => {
            const newForm = {
              ...form,
              trustedContacts: {
                ...form.trustedContacts,
                person3: { ...form.trustedContacts.person3, smsEnabled: value }
              }
            };
            setFormLocal(newForm);
          }}
        />
      </View>

      <TextInput
        placeholder="Mot de passe * (6+ caractères)"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password" as keyof typeof form, text)}
        style={[styles.input, errors.password && styles.inputError]}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {isSuccess && (
        <Text style={styles.successText}>Compte créé avec succès !</Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#2E86DE" style={styles.loading} />
      ) : (
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={register}
          disabled={isLoading}
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
