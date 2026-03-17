export interface History {
  historiqueId?: number;
  analyse: string;
  reportId: number;
  userId: number;
  action: string;
  createdAt?: string; // ISO
  details?: string;
}

