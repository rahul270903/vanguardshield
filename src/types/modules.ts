import { ClassificationLevel, OperationalStatus, SeverityLevel } from './common'

export interface CallSession {
  id: string
  callerNumber: string
  callerName?: string
  callType: 'E911_VOICE' | 'NG911_TEXT' | 'SIP_EMERGENCY'
  timestamp: string
  locationConfidence: number // percentage e.g. 96%
  locationAddress: string
  coordinates: [number, number]
  jurisdiction: string
  operatorId: string
  durationSec: number
  status: 'RINGING' | 'ACTIVE' | 'ON_HOLD' | 'TRANSFERRED' | 'RELEASED'
  cadIncidentId?: string
  notes?: string
  transcriptSnippet?: string
  psapTarget?: string
  priority?: 'CRITICAL' | 'HIGH' | 'ROUTINE'
}

export interface RoutingRule {
  id: string
  ruleName: string
  priority: number
  condition: string
  primaryPSAP: string
  failoverPSAP: string
  active: boolean
  lastEvaluated: string
}

export interface PSAPEndpoint {
  id: string
  name: string
  jurisdiction: string
  esinetUri: string
  status: OperationalStatus
  queueDepth: number
  avgAnswerSec: number
  failoverActive: boolean
}

export interface OperatorSession {
  id: string
  operatorName: string
  role: 'CALL_TAKER' | 'DISPATCHER' | 'SUPERVISOR'
  state: 'READY' | 'ON_CALL' | 'WRAP_UP' | 'BREAK'
  activeCallId?: string
  handledTodayCount: number
  avgTalkSec: number
}

export interface CallRecording {
  id: string
  callSessionId: string
  callerNumber: string
  durationSec: number
  timestamp: string
  hashSha256: string
  retentionCategory: string
  redactionsCount: number
  hasLegalHold: boolean
}

export interface CameraDevice {
  id: string
  cameraCode: string
  name: string
  facilityId: string
  location: string
  streamUrl: string
  resolution: string
  status: OperationalStatus
  fps: number
  aiAnalyticsActive: boolean
  lastDetection?: string
  ipAddress?: string
  firmwareVersion?: string
  fipsCertificate?: string
  streamCodec?: 'H.265 / HEVC' | 'H.264 / AVC' | 'AV1 / SRTP'
  ptzCapable?: boolean
  ptzPan?: number
  ptzTilt?: number
  ptzZoom?: number
  retentionDays?: number
  storageUsedGb?: number
  privacyMaskActive?: boolean
  incidentLinkedCount?: number
}

export interface VideoAnalyticsDetection {
  id: string
  detectionCode: string
  cameraId: string
  cameraName: string
  timestamp: string
  detectionType: 'HUMAN_INTRUSION' | 'VEHICLE_LPR' | 'UNATTENDED_BAGGAGE' | 'PERIMETER_BREACH' | 'THERMAL_ANOMALY' | 'WEAPON_DETECT'
  confidence: number // percentage e.g. 97%
  modelVersion: string
  boundingBoxLabel: string
  disposition: 'PENDING' | 'CONFIRMED' | 'DISMISSED' | 'ESCALATED'
  dispositionNotes?: string
  correlatedIncidentId?: string
}

export interface PrivacyMaskRule {
  id: string
  cameraId: string
  cameraName: string
  name: string
  maskType: 'PII_FACE_BLUR' | 'BLACKOUT_PROPRIETARY' | 'PUBLIC_SIDEWALK_EXCLUSION'
  zoneCoordinates: string
  active: boolean
  exemptionPermitted: boolean
  approvedBy: string
}

export interface VideoExportJob {
  id: string
  exportCode: string
  cameraIds: string[]
  timeRange: string
  requestedBy: string
  purpose: string
  sha256Hash: string
  fileSizeMb: number
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING'
  legalHoldEnforced: boolean
  caseId?: string
}

export interface VMSHealthMetric {
  id: string
  nodeName: string
  region: string
  status: OperationalStatus
  latencyMs: number
  frameDropPct: number
  storageUsedTb: number
  storageTotalTb: number
  activeRtpStreams: number
  failoverStandbyNode: string
}

export interface PortalDoor {
  id: string
  doorCode: string
  name: string
  facility: string
  zoneId: string
  zoneName: string
  status: 'SECURE' | 'UNLOCKED' | 'FORCED_ALARM' | 'PROPPED_ALARM' | 'LOCKDOWN'
  readerType: 'FIPS_201_PIV_BIO' | 'OSDP_SMART_CARD' | 'HIGH_SECURITY_DUAL'
  controllerId: string
  correlatedCameraId: string
  lastAccessEvent?: string
  fpconLockLevel: 'NORMAL' | 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA'
}

export interface CardholderRecord {
  id: string
  name: string
  agency: string
  agencyCode: string
  clearance: 'UNCLASSIFIED' | 'SECRET' | 'TOP SECRET' | 'TS_SCI'
  pivCardNumber: string
  fascn: string
  expirationDate: string
  certificateStatus: 'VALID' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED'
  pivPinStatus: 'VALID' | 'LOCKED' | 'RESET_REQUIRED'
  assignedZones: string[]
  photoInitials: string
}

export interface AccessZone {
  id: string
  zoneCode: string
  name: string
  securityLevel: 'LEVEL_1_PUBLIC' | 'LEVEL_2_OFFICE' | 'LEVEL_3_SECURE' | 'LEVEL_4_VAULT' | 'LEVEL_5_SCIF'
  doorsCount: number
  activeOccupants: number
  antiPassbackMode: 'STRICT' | 'SOFT' | 'DISABLED'
  escortRequired: boolean
}

export interface AccessController {
  id: string
  controllerCode: string
  model: string
  ipAddress: string
  firmwareVersion: string
  osdpChannel: string
  tamperStatus: 'NORMAL' | 'TAMPER_ALARM' | 'LOOP_OPEN'
  status: OperationalStatus
  connectedReadersCount: number
}

export interface AccessEvent {
  id: string
  readerId: string
  doorName: string
  facility: string
  cardholderName: string
  pivCardNumber: string
  result: 'GRANTED' | 'DENIED_INVALID_PIN' | 'DENIED_REVOKED' | 'DOOR_FORCED_ALARM'
  timestamp: string
  threatLevel: 'ROUTINE' | 'HIGH' | 'CRITICAL'
  correlatedCameraId?: string
}

export interface EvidenceRecord {
  id: string
  evidenceNumber: string
  title: string
  category: 'BODY_WORN_VIDEO' | 'DISPATCH_AUDIO' | 'FACILITY_CCTV' | 'DIGITAL_FORENSICS' | 'VEHICLE_DASHCAM' | 'INTERVIEW_VIDEO'
  sourceDeviceId: string
  custodian: string
  sha256Hash: string
  ingestedAt: string
  retentionSchedule: string
  legalHold: boolean
  classification: ClassificationLevel
  caseId: string
  fileSizeBytes?: number
  durationSec?: number
  status?: 'INGESTED' | 'UNDER_REVIEW' | 'REDACTED' | 'DISCLOSED' | 'ARCHIVED'
}

export interface CustodyEvent {
  id: string
  evidenceId: string
  evidenceNumber: string
  timestamp: string
  action: 'INGESTION' | 'HASH_VERIFICATION' | 'CUSTODIAL_TRANSFER' | 'PREVIEW_ACCESSED' | 'REDACTION_CREATED' | 'DISCLOSURE_GRANTED' | 'LEGAL_HOLD_APPLIED' | 'LEGAL_HOLD_RELEASED'
  actorName: string
  actorAgency: string
  notes: string
  sha256Seal: string
}

export interface EvidenceDerivative {
  id: string
  originalEvidenceId: string
  evidenceNumber: string
  derivativeTitle: string
  redactionType: 'FACE_BLUR' | 'AUDIO_MUTE' | 'PII_MASK' | 'FULL_COMPOSITE'
  appliedBy: string
  reviewedBy?: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  createdAt: string
  derivativeSha256: string
  reviewNotes?: string
}

export interface DisclosureGrant {
  id: string
  evidenceId: string
  evidenceNumber: string
  caseNumber: string
  recipientAgency: string
  recipientName: string
  purpose: string
  watermarkText: string
  grantedAt: string
  expiresAt: string
  accessStatus: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  downloadCount: number
}

export interface RetentionPolicy {
  id: string
  name: string
  retentionYears: number
  category: string
  autoPurgeEnabled: boolean
  activeEvidenceCount: number
  statutoryBasis: string
}

export interface TacticalAsset {
  id: string
  assetCode: string
  callsign: string
  assetType: 'FOOT_PATROL' | 'VEHICLE' | 'K9_UNIT' | 'UAS_DRONE' | 'MOBILE_COMMAND'
  agency: string
  coordinates: [number, number]
  altitudeFt: number
  velocityMph: number
  headingDeg: number
  batteryPct: number
  p25Talkgroup: string
  status: 'ON_PATROL' | 'DISPATCHED' | 'ON_SCENE' | 'OFFLINE'
  assignedIncidentId?: string
}

export interface SpatialCorrelationEvent {
  id: string
  title: string
  severity: SeverityLevel
  timestamp: string
  coordinates: [number, number]
  correlatedDomains: ('NG911' | 'VMS' | 'PACS' | 'RADAR' | 'P25' | 'CYBER')[]
  summary: string
  confidenceScore: number
  suggestedAction: string
  incidentId?: string
}

export interface SlewToCueTarget {
  id: string
  targetName: string
  coordinates: [number, number]
  linkedCameraId: string
  pan: number
  tilt: number
  zoom: number
  assignedUnit: string
  status: 'SLEWED' | 'ENGAGING' | 'STANDBY'
}

export interface AirspaceRestriction {
  id: string
  designation: string
  type: 'FAA_TFR' | 'PROHIBITED_R4001' | 'SPECIAL_EVENT_NO_FLY'
  floorAltFt: number
  ceilingAltFt: number
  active: boolean
  cbrneSensorStatus: 'NOMINAL' | 'BACKGROUND_CLEAN' | 'TRACE_DETECTED'
}

export interface RadioSubscriber {
  id: string
  radioId: string
  subscriberName: string
  talkgroup: string
  batteryPct: number
  signalDbm: number
  encryptionKeyStatus: 'SYNCED_AES256' | 'PENDING_OTAR' | 'REVOKED'
  status: 'ONLINE' | 'EMERGENCY_PRESSED' | 'OFFLINE'
  lastKnownSite: string
  model?: string
  serialNumber?: string
  unitId?: string
  agency?: string
  assignedOfficer?: string
  firmwareVersion?: string
  inhibitState?: 'ACTIVE_NORMAL' | 'STUNNED' | 'ZEROIZED'
  gpsCoordinates?: [number, number]
  emergencyDeclaredAt?: string
}

export interface P25TalkgroupConfig {
  id: string
  tgid: number
  name: string
  agency: string
  priorityLevel: number
  encryptionRequired: boolean
  activeSubscriberCount: number
  assignedChannel: string
  status: 'ACTIVE' | 'STANDBY' | 'PATCHED'
}

export interface OTARKeyRecord {
  id: string
  keyAlias: string
  keyId: string
  algorithm: 'AES-256' | 'DES-OFB' | 'ADP'
  keysetType: 'TEK' | 'KEK'
  epochExpiration: string
  totalTargetRadios: number
  syncedRadiosCount: number
  status: 'CURRENT_EPOCH' | 'ROTATING' | 'REKID_PENDING' | 'EXPIRED'
}

export interface P25RepeaterSite {
  id: string
  siteCode: string
  name: string
  location: string
  coordinates: [number, number]
  controlChannelMhz: number
  voiceChannelsTotal: number
  voiceChannelsActive: number
  mode: 'SIMULCAST_WIDE' | 'SITE_TRUNKING' | 'FAILSOFT'
  rfBand: '700/800 MHz Public Safety'
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE'
  rssiNoiseFloorDbm: number
}

export interface RadioInhibitLog {
  id: string
  timestamp: string
  radioId: string
  subscriberName: string
  action: 'STUN' | 'REVIVE' | 'ZEROIZE'
  authorizer1: string
  authorizer2?: string
  reason: string
  status: 'EXECUTED_ACK' | 'PENDING_ACK' | 'FAILED'
}

export interface SOCAlert {
  id: string
  alertCode: string
  ruleName: string
  sourceIp: string
  targetAsset: string
  mitreTactic: string
  mitreTechnique: string
  severity: SeverityLevel
  timestamp: string
  analystStatus: 'UNASSIGNED' | 'TRIAGING' | 'CONTAINMENT_IN_PROGRESS' | 'CLOSED_FALSE_POSITIVE'
}

export interface MeshNode {
  id: string
  nodeCode: string
  name: string
  model: string
  role: 'GATEWAY' | 'RELAY' | 'ENDPOINT' | 'AIRBORNE_RELAY'
  ipAddress: string
  macAddress: string
  frequencyMhz: number
  txPowerWatts: number
  batteryPct: number
  status: 'ACTIVE' | 'DEGRADED' | 'QUARANTINED' | 'ZEROIZED' | 'OFFLINE'
  hopCount: number
  snrDb: number
  assignedMission: string
  certificateExpiry: string
  fipsValidated: boolean
  tamperState: 'SECURE' | 'TAMPER_ALERT'
  gatewayUplink?: 'STARLINK_SAT' | 'FIRSTNET_LTE' | 'P25_ISSI_BRIDGE' | 'NONE'
  coordinates: [number, number]
}

export interface MeshLink {
  id: string
  sourceNodeId: string
  targetNodeId: string
  rssiDbm: number
  snrDb: number
  throughputMbps: number
  latencyMs: number
  packetLossPct: number
  status: 'OPTIMAL' | 'DEGRADED' | 'DOWN'
}

export interface MissionNetworkProfile {
  id: string
  profileName: string
  missionCode: string
  rfBand: 'UHF (450-470 MHz)' | 'L-BAND (1350-1390 MHz)' | 'S-BAND (2200-2400 MHz)' | 'ISM (902-928 MHz)' | 'C-BAND (4.4-4.9 GHz Public Safety)'
  bandwidthMhz: number
  qosPriorityClass: 'VOICE_CRITICAL_CLASS_1' | 'TELEMETRY_ATAK_CLASS_2' | 'VIDEO_STREAM_CLASS_3' | 'BULK_SYNC_CLASS_4'
  maxHops: number
  activeNodesCount: number
  keyRotationEpochHours: number
  active: boolean
}

export interface MANETSecurityEvent {
  id: string
  timestamp: string
  nodeId: string
  nodeName: string
  eventType: 'NODE_JOINED' | 'NODE_LEFT' | 'AUTH_FAILURE' | 'KEY_ROTATION' | 'ZEROIZATION' | 'TAMPER_TRIP' | 'FREQUENCY_DRIFT'
  severity: SeverityLevel
  details: string
}

export interface TacticalGateway {
  id: string
  name: string
  gatewayType: 'SATCOM_STARLINK' | 'FIRSTNET_BAND14' | 'P25_DFSI_BRIDGE' | 'ATAK_COT_SERVER'
  ipAddress: string
  status: 'CONNECTED' | 'BACKUP_STANDBY' | 'DEGRADED' | 'FAILED'
  throughputMbps: number
  latencyMs: number
  activeMeshClients: number
  autoFailover: boolean
}

export interface CommSession {
  id: string
  sessionNumber: string
  title: string
  sessionType: 'P25_RADIO_DISPATCH' | 'SECURE_VOIP_CALL' | 'MULTI_PARTY_CONFERENCE' | 'CROSS_DOMAIN_BRIDGE' | 'INTERCOM'
  status: 'ACTIVE' | 'ON_HOLD' | 'RINGING' | 'TERMINATED'
  priority: 'ROUTINE' | 'PRIORITY' | 'EMERGENCY'
  startedAt: string
  durationSec: number
  participantsCount: number
  primaryTalkgroup?: string
  bridgeId?: string
  classification: ClassificationLevel
  sourceEndpoint: string
  targetEndpoint: string
  recordingActive: boolean
  srtpEncrypted: boolean
}

export interface CommParticipant {
  id: string
  sessionId: string
  name: string
  agency: string
  callsign: string
  endpointType: 'P25_RADIO' | 'SOFTPHONE' | 'VRSM_MIC' | 'SIP_DESK'
  status: 'CONNECTED' | 'MUTED' | 'SPEAKING' | 'HOLD'
  joinedAt: string
  audioLevelDb: number
}

export interface CommGroup {
  id: string
  groupCode: string
  name: string
  description: string
  agency: string
  missionScope: string
  membersCount: number
  activeSpeakersCount: number
  classification: ClassificationLevel
  autoExpireHours?: number
  isPatched: boolean
  patchedNetworks: string[]
  status: 'ACTIVE' | 'STANDBY' | 'EXPIRED'
}

export interface CommUserPresence {
  id: string
  name: string
  badgeNumber: string
  agency: string
  role: string
  state: 'AVAILABLE' | 'ON_PATROL' | 'INCIDENT_DISPATCHED' | 'BUSY_CALL' | 'DO_NOT_DISTURB' | 'OFFLINE'
  currentTalkgroup: string
  endpoint: string
  lastActivity: string
  locationContext?: string
}

export interface SIPGatewayTrunk {
  id: string
  trunkName: string
  gatewayType: 'SBC_ESINET' | 'P25_ISSI_GATEWAY' | 'FIRSTNET_PTT_BRIDGE' | 'ENTERPRISE_PBX'
  ipUri: string
  codec: 'AMBE+2' | 'OPUS' | 'G.711u' | 'G.729'
  status: 'OPERATIONAL' | 'DEGRADED' | 'FAILOVER_ACTIVE' | 'DOWN'
  mosScore: number
  latencyMs: number
  activeChannels: number
  maxChannels: number
  srtpStatus: 'FIPS_SRTP_ACTIVE' | 'UNENCRYPTED'
}

export interface CrossDomainBridgeRequest {
  id: string
  requestNumber: string
  title: string
  sourceEnclave: 'CUI_FEDCON' | 'SECRET_NOFORN'
  targetEnclave: 'CUI_FEDCON' | 'SECRET_NOFORN'
  sourceTalkgroup: string
  targetTalkgroup: string
  requestedBy: string
  authorizedBy?: string
  justification: string
  status: 'PENDING_AUTHORIZATION' | 'ACTIVE_GUARDED' | 'TERMINATED' | 'REJECTED'
  expiresAt: string
}

export interface MassNotificationAlert {
  id: string
  alertCode: string
  title: string
  headline: string
  description: string
  instruction: string
  severity: SeverityLevel
  urgency: 'IMMEDIATE' | 'EXPECTED' | 'FUTURE' | 'PAST'
  certainty: 'OBSERVED' | 'LIKELY' | 'POSSIBLE' | 'UNLIKELY'
  category: 'SECURITY' | 'SAFETY' | 'RESCUE' | 'FIRE' | 'HEALTH' | 'ENV' | 'OTHER'
  eventCode: 'ACTIVE_SHOOTER' | 'FACILITY_LOCKDOWN' | 'HAZMAT_EVACUATION' | 'SHELTER_IN_PLACE' | 'SEVERE_WEATHER' | 'ALL_CLEAR'
  status: 'DRAFT' | 'PENDING_TWO_MAN_APPROVAL' | 'TRANSMITTING' | 'BROADCAST_ACTIVE' | 'CANCELLED' | 'EXPIRED'
  channels: Array<'SMS_CELLULAR' | 'TTS_VOICE_CALL' | 'DESKTOP_TAKEOVER' | 'DIGITAL_SIGNAGE_PA' | 'PUSH_MOBILE' | 'IPAWS_WEA' | 'IPAWS_EAS'>
  targetScope: 'ALL_OCCUPANTS' | 'CAMPUS_SECTOR' | 'FIRST_RESPONDERS_ONLY' | 'EXECUTIVE_COMMAND' | 'CUSTOM_POLYGON'
  geofenceAreaName?: string
  authorId: string
  authorName: string
  secondAuthorizerId?: string
  secondAuthorizerName?: string
  authorizedAt?: string
  createdAt: string
  expiresAt: string
  totalRecipients: number
  deliveredCount: number
  acknowledgedSafeCount: number
  acknowledgedAssistanceCount: number
  failedCount: number
}

export interface NotificationTemplate {
  id: string
  title: string
  eventCode: MassNotificationAlert['eventCode']
  category: MassNotificationAlert['category']
  defaultHeadline: string
  defaultDescription: string
  defaultInstruction: string
  defaultChannels: Array<'SMS_CELLULAR' | 'TTS_VOICE_CALL' | 'DESKTOP_TAKEOVER' | 'DIGITAL_SIGNAGE_PA' | 'PUSH_MOBILE' | 'IPAWS_WEA' | 'IPAWS_EAS'>
  severity: SeverityLevel
}

export interface DeliveryChannelStatus {
  channelId: string
  name: string
  channelType: 'SMS_CELLULAR' | 'TTS_VOICE_CALL' | 'DESKTOP_TAKEOVER' | 'DIGITAL_SIGNAGE_PA' | 'PUSH_MOBILE' | 'IPAWS_WEA' | 'IPAWS_EAS'
  status: 'ONLINE' | 'THROTTLED' | 'STANDBY' | 'DEGRADED'
  throughputPerSec: number
  queueSize: number
  gatewayProvider: string
  latencyMs: number
}

export interface EvacuationMusterReport {
  id: string
  facilityName: string
  zone: string
  totalHeadcount: number
  safeCount: number
  needAssistanceCount: number
  unaccountedCount: number
  status: 'EVACUATION_IN_PROGRESS' | 'MUSTER_COMPLETE' | 'SEARCH_DISPATCHED'
}

export interface BWCDevice {
  id: string
  deviceCode: string
  deviceType: 'BODY_WORN_CAMERA' | 'IN_CAR_DASHCAM' | 'HELMET_CAM' | 'MOTORCYCLE_CAM'
  model: 'Axon Body 4' | 'Motorola WatchGuard V300' | 'Panasonic Arbitrator BWC'
  serialNumber: string
  assignedOfficer: string
  officerBadge: string
  agency: string
  status: 'RECORDING' | 'BUFFERING_STANDBY' | 'DOCKED_UPLOADING' | 'OFFLINE'
  batteryPct: number
  storageUsedGb: number
  storageCapacityGb: number
  firmwareVersion: string
  liveStreamingActive: boolean
  streamResolution: string
  gpsCoordinates: [number, number]
  lastTriggerSource?: string
  currentRecordingDurationSec?: number
}

export interface BWCRecordingTrigger {
  id: string
  deviceId: string
  deviceCode: string
  officerName: string
  triggerType: 'HOLSTER_DRAW' | 'VEHICLE_CRASH_ACCELEROMETER' | 'LIGHTBAR_SIREN_ENGAGED' | 'TASER_CEW_DISCHARGE' | 'GEOFENCE_BREACH' | 'MANUAL_OFFICER' | 'SUPERVISOR_REMOTE'
  timestamp: string
  preEventBufferSec: number
  cadIncidentNumber?: string
  status: 'RECORDING_ACTIVE' | 'OFFLOADED' | 'DISMISSED'
  notes: string
}

// ==========================================
// Module 11: On-Prem P25 Infrastructure Types
// ==========================================
export interface P25CoreSiteController {
  id: string
  siteId: string
  siteName: string
  role: 'PRIMARY_MASTER_SITE' | 'GEOGRAPHIC_REDUNDANT_CORE' | 'SIMULCAST_PRIME_SITE' | 'REGIONAL_SUB_SITE'
  zone: string
  ipv4Address: string
  status: 'ONLINE' | 'STANDBY_HOT' | 'FAILSOFT' | 'DEGRADED' | 'OFFLINE'
  activeChannels: number
  totalChannels: number
  cpuLoadPct: number
  uptimeDays: number
  softwareVersion: string
  lastFailoverTest: string
}

export interface P25ComparatorVoter {
  id: string
  comparatorCode: string
  subsystemName: string
  talkgroupAssigned: string
  receiverInputsCount: number
  bestVotedSite: string
  votingRatePacketsPerSec: number
  bitErrorRatePct: number
  status: 'VOTING_ACTIVE' | 'STANDBY' | 'MAINTENANCE'
}

export interface MicrowaveBackhaulLink {
  id: string
  linkName: string
  sourceSite: string
  destinationSite: string
  frequencyGhz: number
  capacityMbps: number
  utilizationPct: number
  latencyMs: number
  polarization: 'VERTICAL' | 'HORIZONTAL' | 'DUAL'
  linkStatus: 'LOCKED_OPTIMAL' | 'FADING_ALARM' | 'DEGRADED' | 'DOWN'
}

// ==========================================
// Module 12: Secure Mobile / MDM Types
// ==========================================
export interface MobileEUDDevice {
  id: string
  deviceTag: string
  model: 'Samsung Galaxy S23 Tactical Edition' | 'iPad Pro 11-inch FIPS' | 'Zebra TC58 Rugged Handheld'
  imei: string
  assignedUser: string
  userAgency: string
  osVersion: string
  stigCompliancePct: number
  enrolledMAMProfile: 'FEDERAL_TACTICAL_HIGH' | 'EXECUTIVE_PROTECTION_CUI' | 'DISPATCH_FIELD_AGENT'
  securityPosture: 'COMPLIANT' | 'NON_COMPLIANT' | 'ROOT_DETECTED' | 'QUARANTINED' | 'WIPED'
  atakInstalled: boolean
  atakCallsign?: string
  lastHeartbeat: string
  batteryPct: number
  storageFreeGb: number
  cryptoContainerStatus: 'LOCKED' | 'UNLOCKED_FIPS' | 'ZEROIZED'
}

export interface ATAKPluginConfig {
  id: string
  pluginName: string
  version: string
  category: 'NAVIGATION' | 'VIDEO_STREAMING' | 'SENSOR_UAS' | 'BIOMETRICS' | 'COMMUNICATIONS'
  approvedStatus: 'DISA_APPROVED' | 'IN_REVIEW' | 'RESTRICTED'
  activeDeployments: number
}

// ==========================================
// Module 13: CSfC Trusted Integration Types
// ==========================================
export interface CSfCTunnelGateway {
  id: string
  gatewayName: string
  facility: string
  outerTunnelProtocol: 'IPsec IKEv2 Suite B' | 'MACsec IEEE 802.1AE'
  innerTunnelProtocol: 'IPsec ESP AES-256-GCM' | 'TLS 1.3 FIPS'
  outerGatewayVendor: 'Cisco Catalyst 8300 CSfC' | 'Aruba 9004-LTE CSfC'
  innerGatewayVendor: 'PacStar 451 CSfC' | 'Juniper SRX300 CSfC'
  outerTunnelStatus: 'ESTABLISHED' | 'NEGOTIATING' | 'DOWN'
  innerTunnelStatus: 'ESTABLISHED' | 'NEGOTIATING' | 'DOWN'
  postQuantumAlgorithm: 'ML-KEM-768 / Kyber' | 'FrodoKEM-1344' | 'Classic RSA/ECDH'
  packetThroughputMbps: number
  lastRekeyTimestamp: string
  classificationDomain: 'SECRET_REL_FVEY' | 'CUI_FED_ONLY' | 'TOP_SECRET_SCI'
}

export interface CSfCCapabilityPackage {
  id: string
  packageName: string
  version: string
  nistStandard: string
  complianceScorePct: number
  auditDate: string
  status: 'CERTIFIED' | 'ANNUAL_REVIEW_REQUIRED' | 'REAUTHORIZATION'
}

// ==========================================
// Module 14: Managed Device Operations Types
// ==========================================
export interface DepotDeviceAsset {
  id: string
  assetTag: string
  serialNumber: string
  deviceCategory: 'P25_PORTABLE' | 'P25_MOBILE_IN_VEHICLE' | 'BWC_CAMERA' | 'TACTICAL_ROUTER' | 'EUD_HANDHELD'
  manufacturer: 'Motorola Solutions' | 'L3Harris Technologies' | 'Axon Enterprise' | 'Silvus Technologies'
  model: string
  agencyOwner: string
  depotLocation: string
  lifecycleStage: 'ACTIVE_DEPLOYED' | 'DEPOT_MAINTENANCE' | 'CALIBRATION' | 'STAGED_DEPLOYMENT' | 'SURPLUS_DECOMMISSIONED'
  batteryHealthPct: number
  batteryChargeCycles: number
  firmwareVersion: string
  targetFirmwareVersion: string
  lastRfCalibrationDate: string
  nextServiceDueDate: string
}

export interface DepotWorkOrder {
  id: string
  orderNumber: string
  assetTag: string
  technicianName: string
  workType: 'BATTERY_REPLACEMENT' | 'RF_ALIGNMENT' | 'FIRMWARE_FLASH' | 'ANTENNA_REPAIR' | 'ANNUAL_CERTIFICATION'
  priority: 'ROUTINE' | 'EXPEDITED' | 'MISSION_CRITICAL'
  status: 'PENDING_BENCH' | 'IN_PROGRESS' | 'QA_PASSED' | 'CLOSED'
  openedDate: string
  completedDate?: string
  technicianNotes: string
}

// ==========================================
// Module 15: Cybersecurity / SOC Types
// ==========================================
export interface CyberThreatEvent {
  id: string
  eventCode: string
  timestamp: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: 'CREDENTIAL_STUFFING' | 'ANOMALOUS_EXFILTRATION' | 'ICS_PLC_UNAUTHORIZED_WRITE' | 'MITM_RADIO_INTRUSION' | 'RANSOMWARE_BEACON'
  sourceIp: string
  targetAsset: string
  mitreTactic: string
  mitreTechnique: string
  status: 'DETECTED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'
  containmentActionTaken?: string
  confidenceScorePct: number
  rawLogSnippet: string
}

export interface CyberPhysicalSensor {
  id: string
  sensorTag: string
  facility: string
  subsystem: 'HVAC_CHILLER' | 'UPS_BATTERY_BANK' | 'EMERGENCY_GENERATOR' | 'SERVER_RACK_THERMAL' | 'PORTAL_READER_TAMPER'
  currentReading: string
  thresholdLimit: string
  status: 'NORMAL' | 'WARNING_THRESHOLD' | 'CRITICAL_TAMPER' | 'OFFLINE'
  lastTelemetry: string
}

// ==========================================
// Module 16: Critical Connect Interop Types
// ==========================================
export interface CriticalConnectBridgeSession {
  id: string
  bridgeId: string
  bridgeName: string
  localAgency: string
  localTalkgroup: string
  partnerAgency: string
  partnerSystem: string
  partnerTalkgroup: string
  linkType: 'ISSI_P25' | 'CSSI_CONSOLE' | 'BROADBAND_PTT_FIRSTNET' | 'MCX_3GPP'
  encryptionMode: 'END_TO_END_AES256' | 'TRANSCODED_SECURE' | 'CLEARTEXT_INTEROP'
  activeTalkersCount: number
  packetLatencyMs: number
  jitterMs: number
  status: 'PATCH_ACTIVE' | 'CONNECTING' | 'TEARDOWN' | 'SUSPENDED'
  establishedAt: string
}

export interface InterAgencyAuthorizationRule {
  id: string
  ruleName: string
  authorizedAgency: string
  allowedTalkgroups: string[]
  maxDurationHours: number
  mutualApprovalRequired: boolean
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
}


export interface BWCDockingStation {
  id: string
  stationName: string
  facilityLocation: string
  totalBays: number
  occupiedBays: number
  networkSpeedMbps: number
  offloadStatus: 'OFFLOADING_ACTIVE' | 'IDLE' | 'MAINTENANCE'
  pendingUploadCount: number
  lastSyncTimestamp: string
}

export interface BWCClipMetadata {
  id: string
  clipNumber: string
  deviceId: string
  deviceCode: string
  officerName: string
  startTime: string
  durationSec: number
  fileSizeMb: number
  category: 'TRAFFIC_STOP' | 'USE_OF_FORCE' | 'FIELD_INTERVIEW' | 'PURSUIT' | 'SEARCH_WARRANT' | 'ROUTINE_PATROL'
  cadIncidentNumber?: string
  sha256Checksum: string
  ingestedToDems: boolean
  demsEvidenceId?: string
  classification: ClassificationLevel
  notes: string
}

// ==========================================
// Module 11: On-Prem P25 Infrastructure Types
// ==========================================
export interface P25CoreSiteController {
  id: string
  siteId: string
  siteName: string
  role: 'PRIMARY_MASTER_SITE' | 'GEOGRAPHIC_REDUNDANT_CORE' | 'SIMULCAST_PRIME_SITE' | 'REGIONAL_SUB_SITE'
  zone: string
  ipv4Address: string
  status: 'ONLINE' | 'STANDBY_HOT' | 'FAILSOFT' | 'DEGRADED' | 'OFFLINE'
  activeChannels: number
  totalChannels: number
  cpuLoadPct: number
  uptimeDays: number
  softwareVersion: string
  lastFailoverTest: string
}

export interface P25ComparatorVoter {
  id: string
  comparatorCode: string
  subsystemName: string
  talkgroupAssigned: string
  receiverInputsCount: number
  bestVotedSite: string
  votingRatePacketsPerSec: number
  bitErrorRatePct: number
  status: 'VOTING_ACTIVE' | 'STANDBY' | 'MAINTENANCE'
}

export interface MicrowaveBackhaulLink {
  id: string
  linkName: string
  sourceSite: string
  destinationSite: string
  frequencyGhz: number
  capacityMbps: number
  utilizationPct: number
  latencyMs: number
  polarization: 'VERTICAL' | 'HORIZONTAL' | 'DUAL'
  linkStatus: 'LOCKED_OPTIMAL' | 'FADING_ALARM' | 'DEGRADED' | 'DOWN'
}

// ==========================================
// Module 12: Secure Mobile / MDM Types
// ==========================================
export interface MobileEUDDevice {
  id: string
  deviceTag: string
  model: 'Samsung Galaxy S23 Tactical Edition' | 'iPad Pro 11-inch FIPS' | 'Zebra TC58 Rugged Handheld'
  imei: string
  assignedUser: string
  userAgency: string
  osVersion: string
  stigCompliancePct: number
  enrolledMAMProfile: 'FEDERAL_TACTICAL_HIGH' | 'EXECUTIVE_PROTECTION_CUI' | 'DISPATCH_FIELD_AGENT'
  securityPosture: 'COMPLIANT' | 'NON_COMPLIANT' | 'ROOT_DETECTED' | 'QUARANTINED' | 'WIPED'
  atakInstalled: boolean
  atakCallsign?: string
  lastHeartbeat: string
  batteryPct: number
  storageFreeGb: number
  cryptoContainerStatus: 'LOCKED' | 'UNLOCKED_FIPS' | 'ZEROIZED'
}

export interface ATAKPluginConfig {
  id: string
  pluginName: string
  version: string
  category: 'NAVIGATION' | 'VIDEO_STREAMING' | 'SENSOR_UAS' | 'BIOMETRICS' | 'COMMUNICATIONS'
  approvedStatus: 'DISA_APPROVED' | 'IN_REVIEW' | 'RESTRICTED'
  activeDeployments: number
}

// ==========================================
// Module 13: CSfC Trusted Integration Types
// ==========================================
export interface CSfCTunnelGateway {
  id: string
  gatewayName: string
  facility: string
  outerTunnelProtocol: 'IPsec IKEv2 Suite B' | 'MACsec IEEE 802.1AE'
  innerTunnelProtocol: 'IPsec ESP AES-256-GCM' | 'TLS 1.3 FIPS'
  outerGatewayVendor: 'Cisco Catalyst 8300 CSfC' | 'Aruba 9004-LTE CSfC'
  innerGatewayVendor: 'PacStar 451 CSfC' | 'Juniper SRX300 CSfC'
  outerTunnelStatus: 'ESTABLISHED' | 'NEGOTIATING' | 'DOWN'
  innerTunnelStatus: 'ESTABLISHED' | 'NEGOTIATING' | 'DOWN'
  postQuantumAlgorithm: 'ML-KEM-768 / Kyber' | 'FrodoKEM-1344' | 'Classic RSA/ECDH'
  packetThroughputMbps: number
  lastRekeyTimestamp: string
  classificationDomain: 'SECRET_REL_FVEY' | 'CUI_FED_ONLY' | 'TOP_SECRET_SCI'
}

export interface CSfCCapabilityPackage {
  id: string
  packageName: string
  version: string
  nistStandard: string
  complianceScorePct: number
  auditDate: string
  status: 'CERTIFIED' | 'ANNUAL_REVIEW_REQUIRED' | 'REAUTHORIZATION'
}

// ==========================================
// Module 14: Managed Device Operations Types
// ==========================================
export interface DepotDeviceAsset {
  id: string
  assetTag: string
  serialNumber: string
  deviceCategory: 'P25_PORTABLE' | 'P25_MOBILE_IN_VEHICLE' | 'BWC_CAMERA' | 'TACTICAL_ROUTER' | 'EUD_HANDHELD'
  manufacturer: 'Motorola Solutions' | 'L3Harris Technologies' | 'Axon Enterprise' | 'Silvus Technologies'
  model: string
  agencyOwner: string
  depotLocation: string
  lifecycleStage: 'ACTIVE_DEPLOYED' | 'DEPOT_MAINTENANCE' | 'CALIBRATION' | 'STAGED_DEPLOYMENT' | 'SURPLUS_DECOMMISSIONED'
  batteryHealthPct: number
  batteryChargeCycles: number
  firmwareVersion: string
  targetFirmwareVersion: string
  lastRfCalibrationDate: string
  nextServiceDueDate: string
}

export interface DepotWorkOrder {
  id: string
  orderNumber: string
  assetTag: string
  technicianName: string
  workType: 'BATTERY_REPLACEMENT' | 'RF_ALIGNMENT' | 'FIRMWARE_FLASH' | 'ANTENNA_REPAIR' | 'ANNUAL_CERTIFICATION'
  priority: 'ROUTINE' | 'EXPEDITED' | 'MISSION_CRITICAL'
  status: 'PENDING_BENCH' | 'IN_PROGRESS' | 'QA_PASSED' | 'CLOSED'
  openedDate: string
  completedDate?: string
  technicianNotes: string
}

// ==========================================
// Module 15: Cybersecurity / SOC Types
// ==========================================
export interface CyberThreatEvent {
  id: string
  eventCode: string
  timestamp: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: 'CREDENTIAL_STUFFING' | 'ANOMALOUS_EXFILTRATION' | 'ICS_PLC_UNAUTHORIZED_WRITE' | 'MITM_RADIO_INTRUSION' | 'RANSOMWARE_BEACON'
  sourceIp: string
  targetAsset: string
  mitreTactic: string
  mitreTechnique: string
  status: 'DETECTED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'
  containmentActionTaken?: string
  confidenceScorePct: number
  rawLogSnippet: string
}

export interface CyberPhysicalSensor {
  id: string
  sensorTag: string
  facility: string
  subsystem: 'HVAC_CHILLER' | 'UPS_BATTERY_BANK' | 'EMERGENCY_GENERATOR' | 'SERVER_RACK_THERMAL' | 'PORTAL_READER_TAMPER'
  currentReading: string
  thresholdLimit: string
  status: 'NORMAL' | 'WARNING_THRESHOLD' | 'CRITICAL_TAMPER' | 'OFFLINE'
  lastTelemetry: string
}

// ==========================================
// Module 16: Critical Connect Interop Types
// ==========================================
export interface CriticalConnectBridgeSession {
  id: string
  bridgeId: string
  bridgeName: string
  localAgency: string
  localTalkgroup: string
  partnerAgency: string
  partnerSystem: string
  partnerTalkgroup: string
  linkType: 'ISSI_P25' | 'CSSI_CONSOLE' | 'BROADBAND_PTT_FIRSTNET' | 'MCX_3GPP'
  encryptionMode: 'END_TO_END_AES256' | 'TRANSCODED_SECURE' | 'CLEARTEXT_INTEROP'
  activeTalkersCount: number
  packetLatencyMs: number
  jitterMs: number
  status: 'PATCH_ACTIVE' | 'CONNECTING' | 'TEARDOWN' | 'SUSPENDED'
  establishedAt: string
}

export interface InterAgencyAuthorizationRule {
  id: string
  ruleName: string
  authorizedAgency: string
  allowedTalkgroups: string[]
  maxDurationHours: number
  mutualApprovalRequired: boolean
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
}

