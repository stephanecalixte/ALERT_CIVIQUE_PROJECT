export interface Message {
  messageId?: number;
  reportId?: number;
  emergenciesAlertId?: number;
  message: string;
  createdAt?: string; // ISO
  senderEmail?: string;
  isRead?: boolean;
}

