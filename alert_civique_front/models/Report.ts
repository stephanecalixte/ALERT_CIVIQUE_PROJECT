import { ReportsStatus, DecisionLevel } from './enums';

export interface Report {
  reportId?: number;
  description: string;
  createdAt?: string; // ISO LocalDateTime
  latitude?: number;
  longitude?: number;
  locationText?: string;
  status?: ReportsStatus;
  priority?: DecisionLevel;
  anonymous?: boolean;
  userId?: number;
  categoryId?: number;
  geolocalisationId?: number;
  mediaCount?: number;
  aiConfidenceScore?: number;
}

export interface ReportCreate extends Omit<Report, 'reportId' | 'createdAt' | 'status' | 'mediaCount' | 'aiConfidenceScore'> {}

