import { SeverityLevel, ClassificationLevel, OperationalStatus } from './common'

export type IncidentPriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW'
export type IncidentStatus = 'NEW' | 'TRIAGED' | 'DISPATCHED' | 'ON_SCENE' | 'CONTAINED' | 'CLOSED'

export interface IncidentRecord {
  id: string
  trackingNumber: string
  title: string
  type: string
  priority: IncidentPriority
  status: IncidentStatus
  location: {
    address: string
    coordinates: [number, number]
    zone: string
    jurisdiction: string
  }
  agencyId: string
  openedAt: string
  closedAt?: string
  assignedUnits: string[]
  linkedEntities: {
    callSessionId?: string
    cameraIds?: string[]
    pacsEventId?: string
    evidenceIds?: string[]
    socAlertId?: string
  }
  commander: string
  summary: string
  classification: ClassificationLevel
}

export interface OperationalAlert {
  id: string
  title: string
  sourceDomain: 'NG911' | 'VMS' | 'PACS' | 'MANET' | 'SOC' | 'P25' | 'C_UAS'
  severity: SeverityLevel
  timestamp: string
  location: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  description: string
  recommendedPlaybook?: string
}

export interface ServiceHealthItem {
  id: string
  serviceName: string
  subsystem: string
  status: OperationalStatus
  latencyMs: number
  availabilityPct: number
  lastChecked: string
  details: string
}

export interface MissionTask {
  id: string
  taskCode: string
  title: string
  assignedTo: string
  incidentId?: string
  dueDate: string
  priority: SeverityLevel
  status: 'PENDING' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'COMPLETED'
  approverRole?: string
  approvedBy?: string
}

export interface GeofenceZone {
  id: string
  name: string
  type: 'RESTRICTED_AIRSPACE' | 'PERIMETER_SECURITY' | 'EXCLUSION_ZONE' | 'DIGNITARY_ROUTE'
  center: [number, number]
  radiusMeters: number
  active: boolean
  breachPolicy: string
  authorizedAgency: string
}

export interface AIDecisionRecommendation {
  id: string
  incidentId: string
  title: string
  confidenceScore: number // e.g. 94%
  rationale: string
  suggestedAction: string
  affectedAssets: string[]
  advisoryDisclaimer: string
}
