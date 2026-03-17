export interface EmergenciesAlert {
  emergencyAlertId?: number;
  email: string;
  sentAt?: string; // ISO
  messages?: { messageId: number; message: string; createdAt: string }[]; // Simplified Messages
}

