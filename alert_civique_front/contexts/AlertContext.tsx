import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertType = 'agression' | 'accident' | 'incendie' | 'sos';

export interface AlertConfig {
  label: string;
  emoji: string;
  color: string;
  markerBg: string;
  chatLabel: string;
}

export const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  agression: {
    label:     'Agression',
    emoji:     '🚨',
    color:     '#e53935',
    markerBg:  '#e53935',
    chatLabel: '🚨 AGRESSION signalée',
  },
  accident: {
    label:     'Accident',
    emoji:     '🚗',
    color:     '#FF6F00',
    markerBg:  '#FF6F00',
    chatLabel: '🚗 ACCIDENT signalé',
  },
  incendie: {
    label:     'Incendie',
    emoji:     '🔥',
    color:     '#FF3D00',
    markerBg:  '#FF3D00',
    chatLabel: '🔥 INCENDIE signalé',
  },
  sos: {
    label:     'SOS',
    emoji:     '🆘',
    color:     '#b71c1c',
    markerBg:  '#b71c1c',
    chatLabel: '🆘 SOS déclenché',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AlertContextType {
  alertType: AlertType | null;
  setAlertType: (type: AlertType) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertType, setAlertTypeState] = useState<AlertType | null>(null);

  const setAlertType = (type: AlertType) => setAlertTypeState(type);
  const clearAlert   = () => setAlertTypeState(null);

  return (
    <AlertContext.Provider value={{ alertType, setAlertType, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};
