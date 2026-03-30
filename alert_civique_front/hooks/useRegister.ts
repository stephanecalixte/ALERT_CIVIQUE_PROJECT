import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRegisterRequest } from '@/models/User';
import * as RegisterService from '@/app/lib/services/RegisterService';

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  phone?: string;
  birthdate?: string;
}

export function useRegister() {
  const { login } = useAuth();
  
  const [form, setForm] = useState<UserRegisterRequest>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    trustedContacts: {
      person1: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        smsEnabled: false
      },
      person2: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        smsEnabled: false
      },
      person3: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        smsEnabled: false
      }
    }
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.firstname.trim()) newErrors.firstname = 'Prénom requis';
    if (!form.lastname.trim()) newErrors.lastname = 'Nom requis';
    if (!form.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Mot de passe (6+ caractères) requis';
    }
    if (!form.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!form.birthdate.trim()) {
      newErrors.birthdate = 'Date de naissance requise (YYYY-MM-DD)';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthdate)) {
      newErrors.birthdate = 'Format date: YYYY-MM-DD';
    }
    // Validate trusted contacts optional
    return newErrors;
  }, [form]);

  const handleChange = useCallback((field: keyof UserRegisterRequest, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  }, [errors]);

  const register = useCallback(async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Alert.alert('Erreur', 'Veuillez corriger les champs indiqués');
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await RegisterService.registerUser(form);
      
      // Assume backend returns { token: string, user: { userId: number, name: string, email: string } }
      if (response?.token && response.user) {
        await login(response.token, response.user);
        setIsSuccess(true);
        Alert.alert('Succès', 'Compte créé ! Redirection...');
        resetForm();
        return true;
      } else {
        throw new Error('Réponse serveur invalide');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Échec de l\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [form, validateForm, login]);

  const resetForm = useCallback(() => {
    setForm({
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      phone: '',
      birthdate: '',
      trustedContacts: {
        person1: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          smsEnabled: false
        },
        person2: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          smsEnabled: false
        },
        person3: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          smsEnabled: false
        }
      }
    });
    setErrors({});
    setIsSuccess(false);
  }, []);

  return {
    form,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    register,
    resetForm,
  };
}

