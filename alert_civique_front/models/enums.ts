export enum ReportsStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  RESOLVED = 'RESOLVED',
}

export enum DecisionLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum MediaTypes {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO'
}

export enum MessageType {
  TEXT = 'TEXT',
  SOS = 'SOS',
  ALERT = 'ALERT'
}

