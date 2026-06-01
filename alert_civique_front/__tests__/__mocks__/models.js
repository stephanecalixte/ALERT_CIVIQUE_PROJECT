const ReportsStatus = {
  PENDING:   'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  VALIDATED: 'VALIDATED',
  REJECTED:  'REJECTED',
  ARCHIVED:  'ARCHIVED',
  RESOLVED:  'RESOLVED',
}

const DecisionLevel = {
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
}

module.exports = { ReportsStatus, DecisionLevel }
