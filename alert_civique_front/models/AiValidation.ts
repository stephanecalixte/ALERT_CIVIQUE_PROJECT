export interface AIValidation {
  aiValidationId?: number;
  reportId: number;
  score: number;
  decisionLevel: string;
  createdAt?: string; // ISO
  modelVersion?: string;
  analysisResult?: string;
  analysesIds?: number[];
}

