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
  const { token, user } = useAuth();
  const userId = user?.userId ? Number(user.userId) : null;

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await TrustedContactService.getByUserId(userId, token);
      setContacts(data);
    } catch (e) {
      setError('Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleChange = useCallback((field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const add = useCallback(async () => {
    if (!userId || !token) return;
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
        setContacts(prev => [...prev, created]);
        setForm(EMPTY_FORM);
        setShowForm(false);
      } else {
        setError('Échec de l\'ajout du contact');
      }
    } catch (e) {
      setError('Erreur lors de l\'ajout');
    } finally {
      setIsSaving(false);
    }
  }, [form, userId, token]);

  const remove = useCallback(async (id: number) => {
    if (!token) return;
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
  };
}
