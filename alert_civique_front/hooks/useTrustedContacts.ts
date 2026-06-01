import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import TrustedContactService from '@/app/lib/services/TrustedContactService';
import { TrustedContact } from '@/models';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: ContactForm = { name: '', email: '', phone: '' };

export function useTrustedContacts() {
  const { token, user, isLoaded } = useAuth();
  const userId = user?.userId != null && user.userId !== 0 ? Number(user.userId) : null;
  console.log('🔑 useTrustedContacts — user:', JSON.stringify(user), 'userId calculé:', userId);

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!isLoaded) return;
    if (userId == null) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('👥 Contacts — chargement pour userId:', userId);
      const data = await TrustedContactService.getByUserId(userId, token);
      console.log('👥 Contacts reçus:', data.length, data);
      setContacts(data);
    } catch (e) {
      setError('Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, userId, token]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleChange = useCallback((field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const add = useCallback(async () => {
    if (userId == null) {
      setError('Session non disponible — relancez l\'application');
      return;
    }
    if (!form.name.trim()) {
      setError('Le nom est requis');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const created = await TrustedContactService.create(
        { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), userId },
        token
      );
      if (created) {
        setForm(EMPTY_FORM);
        setShowForm(false);
        await load();
      } else {
        setError('Le serveur n\'a pas enregistré le contact — vérifiez votre connexion');
      }
    } catch (e) {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setIsSaving(false);
    }
  }, [form, userId, token, load]);

  const remove = useCallback(async (id: number) => {
    const ok = await TrustedContactService.delete(id, token);
    if (ok) {
      setContacts(prev => prev.filter(c => c.id !== id));
    } else {
      setError('Échec de la suppression');
    }
  }, [token]);

  const openForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(false);
  }, []);

  return {
    contacts,
    form,
    isLoading,
    isSaving,
    error,
    showForm,
    handleChange,
    add,
    remove,
    openForm,
    closeForm,
    reload: load,
    isLoaded,
    isAuthenticated: isLoaded && userId != null,
  };
}
