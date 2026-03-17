export interface PushNotification {
  pushNotificationId?: number;
  userId: number;
  reportId?: number;
  message: string;
  sent_at?: string; // ISO
}

