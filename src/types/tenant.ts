import { ClassificationLevel } from './common'

export interface AgencyTenant {
  id: string
  code: string
  name: string
  subAgency: string
  defaultClassification: ClassificationLevel
  activeIncidentsCount: number
  totalUnits: number
  socHealth: 'NOMINAL' | 'DEGRADED' | 'ELEVATED'
  jurisdiction: string
}

export type UserRole =
  | 'AGENCY_OWNER'
  | 'WATCH_COMMANDER'
  | 'DISPATCHER'
  | 'FIELD_RESPONDER'
  | 'SOC_ANALYST'
  | 'FACILITY_SECURITY_OFFICER'
  | 'EVIDENCE_CUSTODIAN'
  | 'EMERGENCY_MANAGER'
  | 'SYSTEM_ADMIN'
  | 'AUDITOR_PRIVACY'

export interface UserPersona {
  id: string
  name: string
  role: UserRole
  roleLabel: string
  agencyId: string
  pivCardId: string
  clearanceLevel: ClassificationLevel
  department: string
  avatarInitials: string
}
