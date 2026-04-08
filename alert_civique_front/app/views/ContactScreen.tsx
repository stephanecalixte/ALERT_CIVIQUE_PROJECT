import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrustedContacts } from '@/hooks/useTrustedContacts';
import { TrustedContact } from '@/models';

function ContactCard({
  contact,
  onDelete,
}: {
  contact: TrustedContact;
  onDelete: (id: number) => void;
}) {
  const confirmDelete = () => {
    Alert.alert(
      'Supprimer',
      `Supprimer ${contact.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(contact.id!) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name="person" size={22} color="#fff" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{contact.name}</Text>
        {contact.email ? <Text style={styles.cardSub}>{contact.email}</Text> : null}
        {contact.phone ? <Text style={styles.cardSub}>{contact.phone}</Text> : null}
      </View>
      <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#e53935" />
      </TouchableOpacity>
    </View>
  );
}

export default function ContactScreen() {
  const {
    contacts, form, isLoading, isSaving, error,
    showForm, handleChange, add, remove, openForm, closeForm,
  } = useTrustedContacts();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts de confiance</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openForm}>
          <Ionicons name="person-add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Formulaire d'ajout */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Nouveau contact</Text>

          <TextInput
            style={styles.input}
            placeholder="Nom *"
            placeholderTextColor="#90a4ae"
            value={form.name}
            onChangeText={v => handleChange('name', v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#90a4ae"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#90a4ae"
            value={form.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={add} disabled={isSaving}>
              {isSaving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Liste */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a6fd4" size="large" />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => String(item.id ?? Math.random())}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#90a4ae" />
              <Text style={styles.emptyText}>Aucun contact de confiance</Text>
              <Text style={styles.emptyHint}>Appuyez sur + pour en ajouter un</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ContactCard contact={item} onDelete={remove} />
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e8ecf0',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1565c0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#0d47a1',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a6fd4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4da3ff',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  // Formulaire
  form: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a237e',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cfd8e3',
  },
  errorText: {
    color: '#e53935',
    fontSize: 12,
    marginBottom: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e8ecf0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfd8e3',
  },
  cancelBtnText: {
    color: '#546e7a',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a6fd4',
    alignItems: 'center',
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Liste
  list: {
    padding: 16,
    gap: 10,
  },

  // Carte contact
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0a3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a6fd4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a237e',
  },
  cardSub: {
    fontSize: 12,
    color: '#546e7a',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },

  // État vide
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#546e7a',
  },
  emptyHint: {
    fontSize: 13,
    color: '#90a4ae',
  },
});
