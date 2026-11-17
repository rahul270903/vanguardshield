export type ClassificationLevel = 'UNCLASSIFIED' | 'CUI' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET'

export type OperationalStatus = 'NOMINAL' | 'ELEVATED' | 'CRITICAL' | 'DEGRADED' | 'OFFLINE'

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface APIEnvelope<T> {
  data: T
  meta: {
    correlationId: string
    version: string
    timestamp: string
    classification: ClassificationLevel
    agencyId: string
  }
}

export interface RFC9457Error {
  type: string
  title: string
  status: number
  code: string
  detail?: string
  correlationId: string
}

export interface AuditEvent {
  id: string
  agencyId: string
  actor: string
  actorRole: string
  action: string
  targetEntity: string
  targetId: string
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED'
  purpose: string
  timestamp: string
  hash: string
}
