import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRegisterRequest } from '@/models/User';
import * as RegisterService from '@/app/lib/services/RegisterService';
import { loginUser } from '@/app/lib/services/LoginService';
import TrustedContactService from '@/app/lib/services/TrustedContactService';

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  phone?: string;
  birthdate?: string;
  contact1Name?: string;
  contact1Phone?: string;
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

const REGEX = {
    name:      /^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/,
    email:     /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    // Java accepte uniquement : 8-20 chiffres, espaces ou +
    phone:     /^[0-9+ ]{8,20}$/,
    birthdate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    // Java ValidPassword : uniquement !@#$%^&*() comme caractères spéciaux
    password:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{12,}$/,
  };

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.firstname.trim()) {
      newErrors.firstname = 'Prénom requis';
    } else if (!REGEX.name.test(form.firstname.trim())) {
      newErrors.firstname = 'Prénom invalide (lettres, tirets, apostrophes uniquement)';
    }

    if (!form.lastname.trim()) {
      newErrors.lastname = 'Nom requis';
    } else if (!REGEX.name.test(form.lastname.trim())) {
      newErrors.lastname = 'Nom invalide (lettres, tirets, apostrophes uniquement)';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!REGEX.email.test(form.email.trim())) {
      newErrors.email = 'Format email invalide (ex: nom@domaine.fr)';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!REGEX.phone.test(form.phone.trim())) {
      newErrors.phone = 'Numéro invalide (9 à 15 chiffres, ex: +33612345678)';
    }

    if (!form.birthdate.trim()) {
      newErrors.birthdate = 'Date de naissance requise';
    } else if (!REGEX.birthdate.test(form.birthdate.trim())) {
      newErrors.birthdate = 'Format invalide (AAAA-MM-JJ, ex: 1990-06-15)';
    }

    if (!form.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (!REGEX.password.test(form.password)) {
      newErrors.password =
        'Minimum 12 caractères avec majuscule, minuscule, chiffre et caractère spécial';
    }

    // Contact de confiance obligatoire (personne 1)
    const p1 = form.trustedContacts.person1;
    if (!p1.firstName.trim() && !p1.lastName.trim()) {
      newErrors.contact1Name = 'Le nom du contact de confiance est obligatoire';
    }
    if (!p1.phone.trim()) {
      newErrors.contact1Phone = 'Le téléphone du contact de confiance est obligatoire';
    } else if (!REGEX.phone.test(p1.phone.trim())) {
      newErrors.contact1Phone = 'Numéro invalide (9 à 15 chiffres, ex: +33612345678)';
    }

    return newErrors;
  }, [form]);

  const handleChange = useCallback((field: keyof UserRegisterRequest, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  }, [errors]);

  const handleTrustedContactChange = useCallback(
    (person: 'person1' | 'person2' | 'person3', field: string, value: string | boolean) => {
      setForm(prev => ({
        ...prev,
        trustedContacts: {
          ...prev.trustedContacts,
          [person]: {
            ...prev.trustedContacts[person],
            [field]: value,
          },
        },
      }));
    },
    []
  );

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
      // 1. Inscription → Java retourne UserResponse (pas de token)
      console.log('📝 Étape 1: inscription...');
      const userResponse = await RegisterService.registerUser(form);
      console.log('✅ Inscription OK, userId:', userResponse.id);

      // 2. Auto-login — userId vient de userResponse.id (source fiable)
      console.log('📝 Étape 2: login...');
      const userId = userResponse.id;
      const loginResponse = await loginUser(form.email, form.password, userId);
      console.log('✅ Login OK, token:', loginResponse.token ? '✅' : '❌');
      const token = loginResponse.token;

      // 3. Sauvegarde les contacts de confiance AVANT d'ouvrir l'app
      const persons = [form.trustedContacts.person1, form.trustedContacts.person2, form.trustedContacts.person3];
      await Promise.allSettled(
        persons
          .filter(p => p.firstName.trim() || p.lastName.trim() || p.phone.trim())
          .map(p =>
            TrustedContactService.create(
              {
                name: `${p.firstName.trim()} ${p.lastName.trim()}`.trim(),
                email: p.email.trim(),
                phone: p.phone.trim(),
                userId,
              },
              token
            )
          )
      );

      // 4. Stocke la session → déclenche la navigation vers l'app
      await login(token, {
        userId,
        name: `${userResponse.firstname} ${userResponse.lastname}`,
        email: userResponse.email,
      });

      setIsSuccess(true);
      Alert.alert('Succès', 'Compte créé avec succès !');
      resetForm();
      return true;
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
    handleTrustedContactChange,
    register,
    resetForm,
  };
}

