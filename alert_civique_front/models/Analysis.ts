export interface Analysis {
  analysisId?: number;
  analyse: string;
  reportId: number;
  aiValidationId?: number;
  createdAt?: string; // ISO
  analysisType?: string;
  confidenceScore?: number;
  details?: string;
}

