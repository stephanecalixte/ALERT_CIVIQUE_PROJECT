export interface ReportMessage {
  reportMessageId?: number;
  userId: number;
  reportId: number;
  messageId: number;
  reason: string;
  createdAt?: string; // ISO LocalDate
}

