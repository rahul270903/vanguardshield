import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ClassificationLevel } from '../types/common'
import { AgencyTenant, UserPersona } from '../types/tenant'
import { IncidentRecord, OperationalAlert, ServiceHealthItem, MissionTask, GeofenceZone, AIDecisionRecommendation } from '../types/command'
import {
  CallSession,
  CameraDevice,
  AccessEvent,
  EvidenceRecord,
  RadioSubscriber,
  SOCAlert,
  RoutingRule,
  PSAPEndpoint,
  OperatorSession,
  CallRecording,
  VideoAnalyticsDetection,
  PrivacyMaskRule,
  VideoExportJob,
  VMSHealthMetric,
  PortalDoor,
  CardholderRecord,
  AccessZone,
  AccessController,
  TacticalAsset,
  SpatialCorrelationEvent,
  SlewToCueTarget,
  AirspaceRestriction,
  MeshNode,
  MeshLink,
  MissionNetworkProfile,
  MANETSecurityEvent,
  TacticalGateway,
  CustodyEvent,
  EvidenceDerivative,
  DisclosureGrant,
  RetentionPolicy,
  CommSession,
  CommParticipant,
  CommGroup,
  CommUserPresence,
  SIPGatewayTrunk,
  CrossDomainBridgeRequest,
  MassNotificationAlert,
  NotificationTemplate,
  DeliveryChannelStatus,
  EvacuationMusterReport,
  P25TalkgroupConfig,
  OTARKeyRecord,
  P25RepeaterSite,
  RadioInhibitLog,
  BWCDevice,
  BWCRecordingTrigger,
  BWCDockingStation,
  BWCClipMetadata,
  P25CoreSiteController,
  P25ComparatorVoter,
  MicrowaveBackhaulLink,
  MobileEUDDevice,
  ATAKPluginConfig,
  CSfCTunnelGateway,
  CSfCCapabilityPackage,
  DepotDeviceAsset,
  DepotWorkOrder,
  CyberThreatEvent,
  CyberPhysicalSensor,
  CriticalConnectBridgeSession,
  InterAgencyAuthorizationRule,
} from '../types/modules'
import { AuditEvent } from '../types/common'
import {
  SEED_AGENCIES,
  SEED_PERSONAS,
  SEED_INCIDENTS,
  SEED_ALERTS,
  SEED_SERVICE_HEALTH,
  SEED_TASKS,
  SEED_CALL_SESSIONS,
  SEED_CAMERAS,
  SEED_ACCESS_EVENTS,
  SEED_EVIDENCE_RECORDS,
  SEED_RADIOS,
  SEED_SOC_ALERTS,
  SEED_AUDIT_LOGS,
  SEED_GEOFENCES,
  SEED_AI_RECOMMENDATIONS,
  SEED_ROUTING_RULES,
  SEED_PSAP_ENDPOINTS,
  SEED_OPERATOR_SESSIONS,
  SEED_CALL_RECORDINGS,
  SEED_VIDEO_ANALYTICS,
  SEED_PRIVACY_MASKS,
  SEED_VIDEO_EXPORTS,
  SEED_VMS_HEALTH,
  SEED_PORTAL_DOORS,
  SEED_CARDHOLDERS,
  SEED_ACCESS_ZONES,
  SEED_ACCESS_CONTROLLERS,
  SEED_TACTICAL_ASSETS,
  SEED_SPATIAL_CORRELATIONS,
  SEED_SLEW_TARGETS,
  SEED_AIRSPACE_RESTRICTIONS,
  SEED_MESH_NODES,
  SEED_MESH_LINKS,
  SEED_MISSION_PROFILES,
  SEED_MANET_SECURITY_EVENTS,
  SEED_TACTICAL_GATEWAYS,
  SEED_CUSTODY_EVENTS,
  SEED_EVIDENCE_DERIVATIVES,
  SEED_DISCLOSURE_GRANTS,
  SEED_RETENTION_POLICIES,
  SEED_COMM_SESSIONS,
  SEED_COMM_PARTICIPANTS,
  SEED_COMM_GROUPS,
  SEED_COMM_PRESENCE,
  SEED_SIP_TRUNKS,
  SEED_CROSS_DOMAIN_BRIDGES,
  SEED_MASS_NOTIFICATIONS,
  SEED_NOTIFICATION_TEMPLATES,
  SEED_DELIVERY_CHANNELS,
  SEED_MUSTER_REPORTS,
  SEED_P25_TALKGROUPS,
  SEED_OTAR_KEYS,
  SEED_P25_REPEATER_SITES,
  SEED_RADIO_INHIBIT_LOGS,
  SEED_BWC_DEVICES,
  SEED_BWC_TRIGGERS,
  SEED_BWC_DOCKING_STATIONS,
  SEED_BWC_CLIPS,
  SEED_P25_CORE_SITES,
  SEED_P25_COMPARATOR_VOTERS,
  SEED_MICROWAVE_LINKS,
  SEED_MOBILE_EUDS,
  SEED_ATAK_PLUGINS,
  SEED_CSFC_GATEWAYS,
  SEED_CSFC_PACKAGES,
  SEED_DEPOT_ASSETS,
  SEED_DEPOT_WORK_ORDERS,
  SEED_CYBER_THREATS,
  SEED_CYBER_PHYSICAL_SENSORS,
  SEED_CRITICAL_CONNECT_BRIDGES,
  SEED_INTERAGENCY_RULES,
} from './seedData'

export type FontFamilyOption = 'plus-jakarta' | 'inter' | 'public-sans' | 'ibm-plex'

export interface ToastItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  durationMs?: number
}

interface VanguardStoreState {
  // Tenancy, Identity & Theme
  activeAgencyId: string
  activePersonaId: string
  classificationLevel: ClassificationLevel
  activeFont: FontFamilyOption
  sidebarCollapsed: boolean
  omniSearchQuery: string
  isAuthenticated: boolean

  // Domain Datasets
  agencies: AgencyTenant[]
  personas: UserPersona[]
  incidents: IncidentRecord[]
  alerts: OperationalAlert[]
  serviceHealth: ServiceHealthItem[]
  tasks: MissionTask[]
  callSessions: CallSession[]
  routingRules: RoutingRule[]
  psapEndpoints: PSAPEndpoint[]
  operatorSessions: OperatorSession[]
  callRecordings: CallRecording[]
  cameras: CameraDevice[]
  videoAnalytics: VideoAnalyticsDetection[]
  privacyMasks: PrivacyMaskRule[]
  videoExports: VideoExportJob[]
  vmsHealth: VMSHealthMetric[]
  accessEvents: AccessEvent[]
  portalDoors: PortalDoor[]
  cardholders: CardholderRecord[]
  accessZones: AccessZone[]
  accessControllers: AccessController[]
  currentFpconLevel: 'NORMAL' | 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA'
  tacticalAssets: TacticalAsset[]
  spatialCorrelations: SpatialCorrelationEvent[]
  slewTargets: SlewToCueTarget[]
  airspaceRestrictions: AirspaceRestriction[]
  meshNodes: MeshNode[]
  meshLinks: MeshLink[]
  missionProfiles: MissionNetworkProfile[]
  manetSecurityEvents: MANETSecurityEvent[]
  tacticalGateways: TacticalGateway[]
  evidenceRecords: EvidenceRecord[]
  custodyEvents: CustodyEvent[]
  evidenceDerivatives: EvidenceDerivative[]
  disclosureGrants: DisclosureGrant[]
  retentionPolicies: RetentionPolicy[]
  commSessions: CommSession[]
  commParticipants: CommParticipant[]
  commGroups: CommGroup[]
  commPresences: CommUserPresence[]
  sipTrunks: SIPGatewayTrunk[]
  crossDomainBridges: CrossDomainBridgeRequest[]
  massNotifications: MassNotificationAlert[]
  notificationTemplates: NotificationTemplate[]
  deliveryChannels: DeliveryChannelStatus[]
  musterReports: EvacuationMusterReport[]
  p25Talkgroups: P25TalkgroupConfig[]
  otarKeys: OTARKeyRecord[]
  p25RepeaterSites: P25RepeaterSite[]
  radioInhibitLogs: RadioInhibitLog[]
  bwcDevices: BWCDevice[]
  bwcTriggers: BWCRecordingTrigger[]
  bwcDockingStations: BWCDockingStation[]
  bwcClips: BWCClipMetadata[]

  // Module 11: P25 Infrastructure
  p25CoreSites: P25CoreSiteController[]
  p25ComparatorVoters: P25ComparatorVoter[]
  microwaveLinks: MicrowaveBackhaulLink[]

  // Module 12: Mobile MDM
  mobileEUDs: MobileEUDDevice[]
  atakPlugins: ATAKPluginConfig[]

  // Module 13: CSfC Trusted Integration
  csfcGateways: CSfCTunnelGateway[]
  csfcPackages: CSfCCapabilityPackage[]

  // Module 14: Managed Device Operations
  depotAssets: DepotDeviceAsset[]
  depotWorkOrders: DepotWorkOrder[]

  // Module 15: Cybersecurity / SOC
  cyberThreats: CyberThreatEvent[]
  cyberPhysicalSensors: CyberPhysicalSensor[]

  // Module 16: Critical Connect Interop
  criticalConnectBridges: CriticalConnectBridgeSession[]
  interAgencyRules: InterAgencyAuthorizationRule[]

  radios: RadioSubscriber[]
  socAlerts: SOCAlert[]
  auditLogs: AuditEvent[]
  toasts: ToastItem[]
  geofences: GeofenceZone[]
  aiRecommendations: AIDecisionRecommendation[]

  // Actions
  setActiveAgency: (agencyId: string) => void
  setActivePersona: (personaId: string) => void
  setClassificationLevel: (level: ClassificationLevel) => void
  setFont: (font: FontFamilyOption) => void
  toggleSidebar: () => void
  setOmniSearchQuery: (query: string) => void
  login: (personaId?: string, agencyId?: string) => void
  logout: () => void

  // Operational Actions
  acknowledgeAlert: (alertId: string) => void
  resolveTask: (taskId: string, approvedBy?: string) => void
  addIncident: (incident: IncidentRecord) => void
  updateIncidentStatus: (incidentId: string, status: IncidentRecord['status']) => void
  assignUnitToIncident: (incidentId: string, unitName: string) => void
  addGeofence: (zone: GeofenceZone) => void
  toggleGeofence: (id: string) => void
  executePlaybook: (alertId: string, playbookCode: string, justification: string) => void
  simulateFailoverTest: (serviceId: string) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp' | 'hash'>) => void
  resetToFactoryDefaults: () => void

  // NG911 Mission Module Actions
  answerCall: (callId: string) => void
  holdCall: (callId: string) => void
  resumeCall: (callId: string) => void
  releaseCall: (callId: string) => void
  transferCall: (callId: string, targetPsap: string, reason: string) => void
  linkCallToIncident: (callId: string, incidentId: string) => void
  simulateIncomingCall: () => void
  toggleRoutingRule: (ruleId: string) => void
  simulatePsapFailover: (psapId: string) => void
  requestRedaction: (recordingId: string, reason: string, timeRange: string) => void
  updateOperatorState: (operatorId: string, state: OperatorSession['state']) => void
  supervisorBargeIn: (operatorId: string, callId: string) => void

  // VMS Video Intelligence Actions
  ptzSlewCamera: (cameraId: string, pan: number, tilt: number, zoom: number) => void
  toggleCameraAnalytics: (cameraId: string) => void
  updateAnalyticsDisposition: (detectionId: string, disposition: VideoAnalyticsDetection['disposition'], notes?: string) => void
  togglePrivacyMask: (maskId: string) => void
  requestVideoExport: (cameraIds: string[], timeRange: string, purpose: string) => void
  simulateVMSFailover: (nodeId: string) => void

  // PACS Physical Access Control Actions
  momentaryUnlockDoor: (doorId: string) => void
  lockdownPortal: (doorId: string) => void
  clearDoorAlarm: (doorId: string) => void
  setFpconLevel: (level: 'NORMAL' | 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA') => void
  updateCardholderStatus: (cardholderId: string, certStatus: CardholderRecord['certificateStatus'], pinStatus: CardholderRecord['pivPinStatus']) => void
  toggleAntiPassback: (zoneId: string) => void
  simulateBadgeTap: (doorId: string, cardholderId: string) => void

  // COP Situational Intelligence Actions
  executeSlewToCue: (targetId: string) => void
  toggleAirspaceRestriction: (airspaceId: string) => void
  dispatchAssetToTarget: (assetId: string, coordinates: [number, number], incidentId?: string) => void
  dismissCorrelation: (correlationId: string) => void
  updateAssetStatus: (assetId: string, status: TacticalAsset['status']) => void

  // MANET Tactical Communications Actions
  enrollMeshNode: (node: Omit<MeshNode, 'id'>) => void
  quarantineMeshNode: (nodeId: string, reason: string) => void
  reinstateMeshNode: (nodeId: string) => void
  emergencyZeroizeNode: (nodeId: string) => void
  emergencyZeroizeAllNodes: () => void
  activateMissionProfile: (profileId: string) => void
  simulateLinkBreak: (linkId: string) => void
  toggleGatewayFailover: (gatewayId: string) => void

  // DEMS Digital Evidence Management Actions
  ingestEvidenceItem: (item: Omit<EvidenceRecord, 'id' | 'sha256Hash' | 'ingestedAt'>) => void
  toggleLegalHold: (evidenceId: string, reason: string) => void
  verifyEvidenceHash: (evidenceId: string) => boolean
  createEvidenceDerivative: (derivative: Omit<EvidenceDerivative, 'id' | 'createdAt' | 'derivativeSha256' | 'status'>) => void
  approveDerivative: (derivativeId: string, reviewerNotes?: string) => void
  grantDisclosure: (grant: Omit<DisclosureGrant, 'id' | 'grantedAt' | 'accessStatus' | 'downloadCount'>) => void
  revokeDisclosure: (grantId: string) => void

  // Unified Communications Actions
  createCommSession: (session: Omit<CommSession, 'id' | 'startedAt' | 'durationSec' | 'participantsCount'>) => void
  updateSessionStatus: (sessionId: string, status: CommSession['status']) => void
  toggleParticipantMute: (participantId: string) => void
  createCommGroup: (group: Omit<CommGroup, 'id' | 'membersCount' | 'activeSpeakersCount' | 'status'>) => void
  toggleGroupPatch: (groupId: string) => void
  updateUserPresence: (userId: string, state: CommUserPresence['state']) => void
  toggleTrunkFailover: (trunkId: string) => void
  authorizeCrossDomainBridge: (bridgeId: string) => void
  terminateCrossDomainBridge: (bridgeId: string) => void

  // Mass Notification Actions
  createMassNotification: (alert: Omit<MassNotificationAlert, 'id' | 'alertCode' | 'createdAt' | 'deliveredCount' | 'acknowledgedSafeCount' | 'acknowledgedAssistanceCount' | 'failedCount'>) => void
  authorizeTwoManAlert: (alertId: string) => void
  cancelMassNotification: (alertId: string, reason?: string) => void
  broadcastAlertImmediate: (alertId: string) => void
  acknowledgeAlertSafety: (alertId: string, status: 'SAFE' | 'NEED_ASSISTANCE') => void
  updateMusterReportHeadcount: (musterId: string, safeDelta: number, assistanceDelta: number) => void

  // P25 Smart Radio Fleet Actions
  provisionRadioSubscriber: (radio: Omit<RadioSubscriber, 'id'>) => void
  inhibitRadioUnit: (radioId: string, action: 'STUN' | 'REVIVE' | 'ZEROIZE', reason: string) => void
  initiateOTARekey: (keyId: string) => void
  updateRadioTalkgroup: (radioId: string, talkgroup: string) => void
  toggleSiteTrunkingMode: (siteId: string) => void
  createP25Talkgroup: (tg: Omit<P25TalkgroupConfig, 'id' | 'activeSubscriberCount'>) => void

  // VRSM / Body-Worn Camera Actions
  toggleBWCRecording: (deviceId: string) => void
  requestBWCStream: (deviceId: string) => void
  stopBWCStream: (deviceId: string) => void
  triggerBWCEvent: (deviceId: string, triggerType: BWCRecordingTrigger['triggerType'], notes: string) => void
  offloadClipToDEMS: (clipId: string) => void
  updateClipMetadata: (clipId: string, category: BWCClipMetadata['category'], cadIncident?: string, notes?: string) => void

  // Module 11-16 Operational Actions
  triggerP25FailoverTest: (siteId: string) => void
  toggleP25CoreSiteStatus: (siteId: string) => void
  remoteWipeEUD: (deviceId: string, reason: string) => void
  deployATAKProfile: (deviceId: string, profile: MobileEUDDevice['enrolledMAMProfile']) => void
  rotateCSfCKeys: (gatewayId: string) => void
  toggleCSfCTunnel: (gatewayId: string) => void
  createDepotWorkOrder: (assetTag: string, workType: DepotWorkOrder['workType'], notes: string) => void
  executeCyberContainment: (threatId: string, actionType: 'ISOLATE_HOST' | 'BLOCK_IP' | 'REVOKE_PIV') => void
  toggleCriticalConnectBridge: (bridgeId: string) => void
  createCriticalConnectBridge: (bridge: Omit<CriticalConnectBridgeSession, 'id' | 'establishedAt'>) => void
}

export const useVanguardStore = create<VanguardStoreState>()(
  persist(
    (set, get) => ({
      activeAgencyId: 'agency-fps',
      activePersonaId: 'user-watch-cmd',
      classificationLevel: 'CUI',
      activeFont: 'plus-jakarta',
      sidebarCollapsed: false,
      omniSearchQuery: '',
      isAuthenticated: false,

      agencies: SEED_AGENCIES,
      personas: SEED_PERSONAS,
      incidents: SEED_INCIDENTS,
      alerts: SEED_ALERTS,
      serviceHealth: SEED_SERVICE_HEALTH,
      tasks: SEED_TASKS,
      callSessions: SEED_CALL_SESSIONS,
      routingRules: SEED_ROUTING_RULES,
      psapEndpoints: SEED_PSAP_ENDPOINTS,
      operatorSessions: SEED_OPERATOR_SESSIONS,
      callRecordings: SEED_CALL_RECORDINGS,
      cameras: SEED_CAMERAS,
      videoAnalytics: SEED_VIDEO_ANALYTICS,
      privacyMasks: SEED_PRIVACY_MASKS,
      videoExports: SEED_VIDEO_EXPORTS,
      vmsHealth: SEED_VMS_HEALTH,
      accessEvents: SEED_ACCESS_EVENTS,
      portalDoors: SEED_PORTAL_DOORS,
      cardholders: SEED_CARDHOLDERS,
      accessZones: SEED_ACCESS_ZONES,
      accessControllers: SEED_ACCESS_CONTROLLERS,
      currentFpconLevel: 'BRAVO',
      tacticalAssets: SEED_TACTICAL_ASSETS,
      spatialCorrelations: SEED_SPATIAL_CORRELATIONS,
      slewTargets: SEED_SLEW_TARGETS,
      airspaceRestrictions: SEED_AIRSPACE_RESTRICTIONS,
      meshNodes: SEED_MESH_NODES,
      meshLinks: SEED_MESH_LINKS,
      missionProfiles: SEED_MISSION_PROFILES,
      manetSecurityEvents: SEED_MANET_SECURITY_EVENTS,
      tacticalGateways: SEED_TACTICAL_GATEWAYS,
      evidenceRecords: SEED_EVIDENCE_RECORDS,
      custodyEvents: SEED_CUSTODY_EVENTS,
      evidenceDerivatives: SEED_EVIDENCE_DERIVATIVES,
      disclosureGrants: SEED_DISCLOSURE_GRANTS,
      retentionPolicies: SEED_RETENTION_POLICIES,
      commSessions: SEED_COMM_SESSIONS,
      commParticipants: SEED_COMM_PARTICIPANTS,
      commGroups: SEED_COMM_GROUPS,
      commPresences: SEED_COMM_PRESENCE,
      sipTrunks: SEED_SIP_TRUNKS,
      crossDomainBridges: SEED_CROSS_DOMAIN_BRIDGES,
      massNotifications: SEED_MASS_NOTIFICATIONS,
      notificationTemplates: SEED_NOTIFICATION_TEMPLATES,
      deliveryChannels: SEED_DELIVERY_CHANNELS,
      musterReports: SEED_MUSTER_REPORTS,
      p25Talkgroups: SEED_P25_TALKGROUPS,
      otarKeys: SEED_OTAR_KEYS,
      p25RepeaterSites: SEED_P25_REPEATER_SITES,
      radioInhibitLogs: SEED_RADIO_INHIBIT_LOGS,
      bwcDevices: SEED_BWC_DEVICES,
      bwcTriggers: SEED_BWC_TRIGGERS,
      bwcDockingStations: SEED_BWC_DOCKING_STATIONS,
      bwcClips: SEED_BWC_CLIPS,
      p25CoreSites: SEED_P25_CORE_SITES,
      p25ComparatorVoters: SEED_P25_COMPARATOR_VOTERS,
      microwaveLinks: SEED_MICROWAVE_LINKS,
      mobileEUDs: SEED_MOBILE_EUDS,
      atakPlugins: SEED_ATAK_PLUGINS,
      csfcGateways: SEED_CSFC_GATEWAYS,
      csfcPackages: SEED_CSFC_PACKAGES,
      depotAssets: SEED_DEPOT_ASSETS,
      depotWorkOrders: SEED_DEPOT_WORK_ORDERS,
      cyberThreats: SEED_CYBER_THREATS,
      cyberPhysicalSensors: SEED_CYBER_PHYSICAL_SENSORS,
      criticalConnectBridges: SEED_CRITICAL_CONNECT_BRIDGES,
      interAgencyRules: SEED_INTERAGENCY_RULES,
      radios: SEED_RADIOS,
      socAlerts: SEED_SOC_ALERTS,
      auditLogs: SEED_AUDIT_LOGS,
      geofences: SEED_GEOFENCES,
      aiRecommendations: SEED_AI_RECOMMENDATIONS,
      toasts: [],

      setActiveAgency: (agencyId) => {
        set({ activeAgencyId: agencyId })
        const agency = get().agencies.find((a) => a.id === agencyId)
        if (agency) {
          set({ classificationLevel: agency.defaultClassification })
        }
        get().addToast({
          title: 'Agency Context Switched',
          message: `Active tenant updated to ${agency?.name || agencyId}`,
          type: 'info',
        })
      },

      setActivePersona: (personaId) => {
        set({ activePersonaId: personaId })
        const persona = get().personas.find((p) => p.id === personaId)
        if (persona) {
          get().addToast({
            title: 'Role Impersonated',
            message: `Current operator: ${persona.name} (${persona.roleLabel})`,
            type: 'info',
          })
        }
      },

      setClassificationLevel: (level) => {
        set({ classificationLevel: level })
        get().addToast({
          title: 'Classification Boundary Changed',
          message: `Security enclave updated to: ${level}`,
          type: 'warning',
        })
      },

      setFont: (font) => {
        set({ activeFont: font })
        if (typeof document !== 'undefined') {
          document.body.classList.remove('font-inter', 'font-plus-jakarta', 'font-public-sans', 'font-ibm-plex')
          document.body.classList.add(`font-${font}`)
        }
        const fontNames = {
          'plus-jakarta': 'Plus Jakarta Sans (Tactical Modern)',
          'inter': 'Inter (Defense Tech)',
          'public-sans': 'Public Sans (Federal USWDS)',
          'ibm-plex': 'IBM Plex Sans (Industrial Operations)',
        }
        get().addToast({
          title: 'Font Family Switched',
          message: `Active typeface: ${fontNames[font]}`,
          type: 'info',
        })
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setOmniSearchQuery: (query) => set({ omniSearchQuery: query }),

      login: (personaId?: string, agencyId?: string) => {
        const state = get()
        const selectedPersona = personaId
          ? state.personas.find((p) => p.id === personaId) || state.personas[0]
          : state.personas.find((p) => p.id === state.activePersonaId) || state.personas[0]
        const targetAgencyId = agencyId || selectedPersona.agencyId || state.activeAgencyId
        const targetAgency = state.agencies.find((a) => a.id === targetAgencyId) || state.agencies[0]

        set({
          isAuthenticated: true,
          activePersonaId: selectedPersona.id,
          activeAgencyId: targetAgency.id,
          classificationLevel: selectedPersona.clearanceLevel || targetAgency.defaultClassification,
        })

        get().logAuditEvent({
          agencyId: targetAgency.id,
          actor: selectedPersona.name,
          actorRole: selectedPersona.roleLabel,
          action: 'USER_AUTHENTICATED',
          targetEntity: 'Authentication',
          targetId: selectedPersona.pivCardId,
          outcome: 'SUCCESS',
          purpose: `FIPS 201 Mutual Smartcard PIV authentication successful for ${selectedPersona.name}. Session established.`,
        })

        get().addToast({
          title: 'Authentication Successful',
          message: `Welcome, ${selectedPersona.name} (${selectedPersona.roleLabel}). Session secured.`,
          type: 'success',
        })
      },

      logout: () => {
        const state = get()
        const activePersona = state.personas.find((p) => p.id === state.activePersonaId)
        if (activePersona) {
          get().logAuditEvent({
            agencyId: state.activeAgencyId,
            actor: activePersona.name,
            actorRole: activePersona.roleLabel,
            action: 'USER_LOGOUT',
            targetEntity: 'Authentication',
            targetId: activePersona.pivCardId,
            outcome: 'SUCCESS',
            purpose: `Operator initiated session termination for ${activePersona.name}. Tokens revoked.`,
          })
        }
        set({ isAuthenticated: false })
        get().addToast({
          title: 'Session Terminated',
          message: 'Secure session closed. Re-authentication required.',
          type: 'info',
        })
      },

      acknowledgeAlert: (alertId) => {
        const state = get()
        const activePersona = state.personas.find((p) => p.id === state.activePersonaId)
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  acknowledged: true,
                  acknowledgedBy: activePersona?.name || 'Operator',
                  acknowledgedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
        get().addToast({
          title: 'Alert Acknowledged',
          message: `Alert ${alertId} acknowledged by ${activePersona?.name || 'Operator'}`,
          type: 'success',
        })
      },

      resolveTask: (taskId, approvedBy) => {
        const state = get()
        const activePersona = state.personas.find((p) => p.id === state.activePersonaId)
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'COMPLETED',
                  approvedBy: approvedBy || activePersona?.name || 'Authorized Supervisor',
                }
              : t
          ),
        }))
        get().addToast({
          title: 'Task Approved & Completed',
          message: `Task ${taskId} formally signed off and archived`,
          type: 'success',
        })
      },

      addIncident: (incident) => {
        set((state) => ({
          incidents: [incident, ...state.incidents],
        }))
        get().addToast({
          title: 'New Incident Logged',
          message: `Incident ${incident.trackingNumber} dispatched into COP`,
          type: 'warning',
        })
      },

      updateIncidentStatus: (incidentId, status) => {
        set((state) => ({
          incidents: state.incidents.map((inc) =>
            inc.id === incidentId ? { ...inc, status } : inc
          ),
        }))
        const state = get()
        const inc = state.incidents.find((i) => i.id === incidentId)
        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'WATCH_COMMANDER',
          action: 'INCIDENT_STATUS_CHANGE',
          targetEntity: 'IncidentRecord',
          targetId: incidentId,
          outcome: 'SUCCESS',
          purpose: `Transitioned incident ${inc?.trackingNumber || incidentId} status to ${status}`,
        })
      },

      assignUnitToIncident: (incidentId, unitName) => {
        set((state) => ({
          incidents: state.incidents.map((inc) =>
            inc.id === incidentId && !inc.assignedUnits.includes(unitName)
              ? { ...inc, assignedUnits: [...inc.assignedUnits, unitName] }
              : inc
          ),
        }))
        const state = get()
        get().addToast({
          title: 'Unit Dispatched',
          message: `${unitName} assigned to incident ${incidentId}`,
          type: 'success',
        })
        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Dispatcher',
          actorRole: 'DISPATCHER',
          action: 'CAD_UNIT_DISPATCH',
          targetEntity: 'IncidentRecord',
          targetId: incidentId,
          outcome: 'SUCCESS',
          purpose: `Assigned tactical unit ${unitName} under mutual dispatch rules`,
        })
      },

      addGeofence: (zone) => {
        set((state) => ({
          geofences: [...state.geofences, zone],
        }))
        get().addToast({
          title: 'Geofence Perimeter Created',
          message: `${zone.name} (${zone.radiusMeters}m) activated in COP`,
          type: 'info',
        })
      },

      toggleGeofence: (id) => {
        set((state) => ({
          geofences: state.geofences.map((g) =>
            g.id === id ? { ...g, active: !g.active } : g
          ),
        }))
      },

      executePlaybook: (alertId, playbookCode, justification) => {
        const state = get()
        const alert = state.alerts.find((a) => a.id === alertId)
        const activePersona = state.personas.find((p) => p.id === state.activePersonaId)
        
        // Acknowledge alert and log audit
        state.acknowledgeAlert(alertId)
        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PLAYBOOK_EXECUTE',
          targetEntity: 'OperationalAlert',
          targetId: alertId,
          outcome: 'SUCCESS',
          purpose: `Executed ${playbookCode}: ${justification}`,
        })
        get().addToast({
          title: 'Playbook Executed & Logged',
          message: `${playbookCode} deployed with signed justification`,
          type: 'success',
        })
      },

      simulateFailoverTest: (serviceId) => {
        set((state) => ({
          serviceHealth: state.serviceHealth.map((item) =>
            item.id === serviceId
              ? {
                  ...item,
                  status: 'NOMINAL',
                  latencyMs: Math.floor(10 + Math.random() * 15),
                  lastChecked: new Date().toISOString(),
                  details: 'Failover test successful. Backup node healthy; 0 packet loss.',
                }
              : item
          ),
        }))
        get().addToast({
          title: 'Failover Verification Complete',
          message: `Secondary cluster verified for ${serviceId}`,
          type: 'success',
        })
      },

      addToast: (toast) => {
        const id = 'toast-' + Math.random().toString(36).substr(2, 9)
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }))
        setTimeout(() => {
          get().removeToast(id)
        }, toast.durationMs || 4000)
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      logAuditEvent: (event) => {
        const id = 'aud-' + Math.random().toString(36).substr(2, 9)
        const timestamp = new Date().toISOString()
        const hash = Math.random().toString(16).substr(2, 40)
        set((state) => ({
          auditLogs: [{ ...event, id, timestamp, hash }, ...state.auditLogs],
        }))
      },

      // NG911 Mission Module Actions
      answerCall: (callId) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, status: 'ACTIVE' } : c
          ),
          operatorSessions: state.operatorSessions.map((op) =>
            op.id === 'op-01' ? { ...op, state: 'ON_CALL', activeCallId: callId } : op
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'CALL_ANSWER',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: '911 Emergency Line Connected & Leg Established',
        })
        get().addToast({
          title: '911 Call Answered',
          message: `Live session active for Call ${callId}`,
          type: 'success',
        })
      },

      holdCall: (callId) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, status: 'ON_HOLD' } : c
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'CALL_HOLD',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: 'Emergency Call Placed on Tactical Hold',
        })
        get().addToast({
          title: 'Emergency Call On Hold',
          message: `Session ${callId} audio muted / line held`,
          type: 'warning',
        })
      },

      resumeCall: (callId) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, status: 'ACTIVE' } : c
          ),
        }))
        get().addToast({
          title: 'Call Resumed',
          message: `Two-way audio re-established for ${callId}`,
          type: 'info',
        })
      },

      releaseCall: (callId) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, status: 'RELEASED' } : c
          ),
          operatorSessions: state.operatorSessions.map((op) =>
            op.activeCallId === callId ? { ...op, state: 'WRAP_UP', activeCallId: undefined, handledTodayCount: op.handledTodayCount + 1 } : op
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'CALL_RELEASE',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: 'Session terminated by call taker. Transcript archived to WORM storage.',
        })
        get().addToast({
          title: 'Call Released',
          message: `Session ${callId} closed and marked for quality review`,
          type: 'info',
        })
      },

      transferCall: (callId, targetPsap, reason) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, status: 'TRANSFERRED', psapTarget: targetPsap } : c
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'INTER_AGENCY_PSAP_TRANSFER',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: `Transferred to ${targetPsap}. Reason: ${reason}`,
        })
        get().addToast({
          title: 'Call Transferred',
          message: `Routing bridge dispatched to ${targetPsap}`,
          type: 'success',
        })
      },

      linkCallToIncident: (callId, incidentId) => {
        set((state) => ({
          callSessions: state.callSessions.map((c) =>
            c.id === callId ? { ...c, cadIncidentId: incidentId } : c
          ),
          incidents: state.incidents.map((inc) =>
            inc.id === incidentId
              ? {
                  ...inc,
                  linkedEntities: {
                    ...inc.linkedEntities,
                    callSessionId: callId,
                  },
                }
              : inc
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'CAD_CALL_ASSOCIATION',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: `Linked emergency call ${callId} to CAD record ${incidentId}`,
        })
        get().addToast({
          title: 'CAD Link Established',
          message: `Call ${callId} associated with Incident ${incidentId}`,
          type: 'success',
        })
      },

      simulateIncomingCall: () => {
        const idNum = Math.floor(1000 + Math.random() * 9000)
        const newCall: CallSession = {
          id: `call-911-${idNum}`,
          callerNumber: `+1 (202) 555-0${Math.floor(100 + Math.random() * 899)}`,
          callerName: 'Federal Plaza Security Kiosk',
          callType: 'E911_VOICE',
          timestamp: new Date().toISOString(),
          locationConfidence: 97,
          locationAddress: '1200 Pennsylvania Ave NW, Federal Triangle Entrance',
          coordinates: [38.8938, -77.0284],
          jurisdiction: 'DHS-FPS NCR',
          operatorId: 'Sarah Jenkins',
          durationSec: 8,
          status: 'RINGING',
          notes: 'Simulated priority caller incoming via ESInet border gateway controller.',
          transcriptSnippet: '[INCOMING RINGING] ESInet geodetic location confidence 97% verified.',
          psapTarget: 'FPS-NCR-PRIMARY',
          priority: 'CRITICAL',
        }
        set((state) => ({
          callSessions: [newCall, ...state.callSessions],
        }))
        get().addToast({
          title: '🚨 Inbound 911 Emergency Call',
          message: `ESInet Alert: New ringing call ${newCall.id} from Federal Plaza`,
          type: 'warning',
        })
      },

      toggleRoutingRule: (ruleId) => {
        set((state) => ({
          routingRules: state.routingRules.map((r) =>
            r.id === ruleId
              ? {
                  ...r,
                  active: !r.active,
                  lastEvaluated: new Date().toISOString(),
                }
              : r
          ),
        }))
        get().addToast({
          title: 'ESInet Rule Updated',
          message: `Routing policy ${ruleId} status toggled`,
          type: 'info',
        })
      },

      simulatePsapFailover: (psapId) => {
        set((state) => ({
          psapEndpoints: state.psapEndpoints.map((p) =>
            p.id === psapId
              ? {
                  ...p,
                  failoverActive: !p.failoverActive,
                  status: p.failoverActive ? 'NOMINAL' : 'DEGRADED',
                }
              : p
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PSAP_FAILOVER_INVOCATION',
          targetEntity: 'PSAPEndpoint',
          targetId: psapId,
          outcome: 'SUCCESS',
          purpose: `Triggered emergency failover toggle for ${psapId}`,
        })
        get().addToast({
          title: 'PSAP Failover Triggered',
          message: `ESInet route diverter toggled for ${psapId}`,
          type: 'warning',
        })
      },

      requestRedaction: (recordingId, reason, timeRange) => {
        set((state) => ({
          callRecordings: state.callRecordings.map((rec) =>
            rec.id === recordingId
              ? { ...rec, redactionsCount: (rec.redactionsCount || 0) + 1 }
              : rec
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Officer',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'CJIS_REDACTION_REQUEST',
          targetEntity: 'CallRecording',
          targetId: recordingId,
          outcome: 'SUCCESS',
          purpose: `Redaction filed: ${reason} [Segment: ${timeRange}]`,
        })
        get().addToast({
          title: 'CJIS Redaction Filed',
          message: `Redaction request queued for recording ${recordingId}`,
          type: 'success',
        })
      },

      updateOperatorState: (operatorId, operatorState) => {
        set((state) => ({
          operatorSessions: state.operatorSessions.map((op) =>
            op.id === operatorId ? { ...op, state: operatorState } : op
          ),
        }))
        get().addToast({
          title: 'Operator State Changed',
          message: `Operator ${operatorId} presence set to ${operatorState}`,
          type: 'info',
        })
      },

      supervisorBargeIn: (operatorId, callId) => {
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'SUPERVISOR_CALL_INTERVENTION',
          targetEntity: 'EmergencySession',
          targetId: callId,
          outcome: 'SUCCESS',
          purpose: `Supervisor barged in on Operator ${operatorId} during Call ${callId}`,
        })
        get().addToast({
          title: 'Supervisor Audio Bridge Active',
          message: `Three-way monitoring bridge connected to Call ${callId}`,
          type: 'warning',
        })
      },

      // VMS Video Intelligence Actions
      ptzSlewCamera: (cameraId, pan, tilt, zoom) => {
        set((state) => ({
          cameras: state.cameras.map((cam) =>
            cam.id === cameraId
              ? {
                  ...cam,
                  ptzPan: pan,
                  ptzTilt: tilt,
                  ptzZoom: zoom,
                }
              : cam
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_PTZ_SLEW_COMMAND',
          targetEntity: 'CameraDevice',
          targetId: cameraId,
          outcome: 'SUCCESS',
          purpose: `PTZ Slew: Pan ${pan}°, Tilt ${tilt}°, Zoom ${zoom}x`,
        })
        get().addToast({
          title: 'Camera PTZ Position Locked',
          message: `${cameraId}: Pan ${pan}° | Tilt ${tilt}° | Zoom ${zoom}x`,
          type: 'info',
        })
      },

      toggleCameraAnalytics: (cameraId) => {
        let nowActive = false
        set((state) => ({
          cameras: state.cameras.map((cam) => {
            if (cam.id === cameraId) {
              nowActive = !cam.aiAnalyticsActive
              return { ...cam, aiAnalyticsActive: nowActive }
            }
            return cam
          }),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_ANALYTICS_TOGGLE',
          targetEntity: 'CameraDevice',
          targetId: cameraId,
          outcome: 'SUCCESS',
          purpose: `AI Vision analytics ${nowActive ? 'enabled' : 'disabled'} for ${cameraId}`,
        })
        get().addToast({
          title: 'AI Analytics Stream Toggled',
          message: `Camera ${cameraId} analytics state: ${nowActive ? 'ACTIVE' : 'MUTED'}`,
          type: 'info',
        })
      },

      updateAnalyticsDisposition: (detectionId, disposition, notes) => {
        set((state) => ({
          videoAnalytics: state.videoAnalytics.map((det) =>
            det.id === detectionId
              ? {
                  ...det,
                  disposition,
                  dispositionNotes: notes || det.dispositionNotes,
                }
              : det
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_ANALYTICS_DISPOSITION',
          targetEntity: 'VideoAnalyticsDetection',
          targetId: detectionId,
          outcome: 'SUCCESS',
          purpose: `AI detection classified as ${disposition}: ${notes || 'Verified'}`,
        })
        get().addToast({
          title: 'AI Detection Triaged',
          message: `${detectionId} updated to ${disposition}`,
          type: disposition === 'ESCALATED' ? 'warning' : 'success',
        })
      },

      togglePrivacyMask: (maskId) => {
        set((state) => ({
          privacyMasks: state.privacyMasks.map((mask) =>
            mask.id === maskId ? { ...mask, active: !mask.active } : mask
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_PRIVACY_MASK_TOGGLE',
          targetEntity: 'PrivacyMaskRule',
          targetId: maskId,
          outcome: 'SUCCESS',
          purpose: `Privacy masking zone ${maskId} status toggled`,
        })
        get().addToast({
          title: 'Privacy Mask Policy Updated',
          message: `Dynamic masking state updated for Rule ${maskId}`,
          type: 'info',
        })
      },

      requestVideoExport: (cameraIds, timeRange, purpose) => {
        const idNum = Math.floor(1000 + Math.random() * 9000)
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        const newExport: VideoExportJob = {
          id: `vexp-${idNum}`,
          exportCode: `VEXP-2026-${idNum}-SEC`,
          cameraIds,
          timeRange,
          requestedBy: activePersona?.name || 'Watch Commander',
          purpose,
          sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          fileSizeMb: Math.floor(400 + Math.random() * 800),
          status: 'COMPLETED',
          legalHoldEnforced: true,
          caseId: 'CASE-2026-EXPORT',
        }
        set((state) => ({
          videoExports: [newExport, ...state.videoExports],
        }))
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_EVIDENCE_EXPORT_GENERATED',
          targetEntity: 'VideoExportJob',
          targetId: newExport.id,
          outcome: 'SUCCESS',
          purpose: `Tamper-evident video package generated: ${purpose}`,
        })
        get().addToast({
          title: 'Evidence Video Package Ready',
          message: `Export ${newExport.exportCode} signed with SHA-256`,
          type: 'success',
        })
      },

      simulateVMSFailover: (nodeId) => {
        set((state) => ({
          vmsHealth: state.vmsHealth.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  status: node.status === 'NOMINAL' ? 'DEGRADED' : 'NOMINAL',
                  latencyMs: node.status === 'NOMINAL' ? 42 : 14,
                }
              : node
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'VMS_NODE_FAILOVER_INVOCATION',
          targetEntity: 'VMSHealthMetric',
          targetId: nodeId,
          outcome: 'SUCCESS',
          purpose: `Simulated failover test triggered for VMS cluster node ${nodeId}`,
        })
        get().addToast({
          title: 'VMS Failover Test Triggered',
          message: `Cluster redundancy diversion verified for ${nodeId}`,
          type: 'warning',
        })
      },

      // PACS Physical Access Control Actions
      momentaryUnlockDoor: (doorId) => {
        set((state) => ({
          portalDoors: state.portalDoors.map((d) =>
            d.id === doorId ? { ...d, status: 'UNLOCKED' } : d
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PACS_PORTAL_MOMENTARY_UNLOCK',
          targetEntity: 'PortalDoor',
          targetId: doorId,
          outcome: 'SUCCESS',
          purpose: 'Authorized supervisory momentary door pulse (5 seconds)',
        })
        get().addToast({
          title: 'Portal Momentary Unlock',
          message: `Electric strike energized for ${doorId} (Auto-relock in 5s)`,
          type: 'info',
        })

        // Auto relock after 5 seconds
        setTimeout(() => {
          set((state) => ({
            portalDoors: state.portalDoors.map((d) =>
              d.id === doorId && d.status === 'UNLOCKED' ? { ...d, status: 'SECURE' } : d
            ),
          }))
        }, 5000)
      },

      lockdownPortal: (doorId) => {
        let isLockdown = false
        set((state) => ({
          portalDoors: state.portalDoors.map((d) => {
            if (d.id === doorId) {
              isLockdown = d.status !== 'LOCKDOWN'
              return { ...d, status: isLockdown ? 'LOCKDOWN' : 'SECURE' }
            }
            return d
          }),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PACS_PORTAL_LOCKDOWN',
          targetEntity: 'PortalDoor',
          targetId: doorId,
          outcome: 'SUCCESS',
          purpose: `Portal lockdown state: ${isLockdown ? 'ENFORCED' : 'RELEASED'}`,
        })
        get().addToast({
          title: 'Portal Lockdown State Updated',
          message: `${doorId}: ${isLockdown ? 'EMERGENCY LOCKDOWN ACTIVE' : 'SECURE / NORMAL'}`,
          type: isLockdown ? 'error' : 'success',
        })
      },

      clearDoorAlarm: (doorId) => {
        set((state) => ({
          portalDoors: state.portalDoors.map((d) =>
            d.id === doorId ? { ...d, status: 'SECURE' } : d
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PACS_DOOR_ALARM_ACKNOWLEDGE',
          targetEntity: 'PortalDoor',
          targetId: doorId,
          outcome: 'SUCCESS',
          purpose: 'Intrusion alarm acknowledged and portal secured',
        })
        get().addToast({
          title: 'Door Alarm Acknowledged',
          message: `Sensor contact secured for ${doorId}`,
          type: 'success',
        })
      },

      setFpconLevel: (level) => {
        set({ currentFpconLevel: level })
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PACS_FPCON_THREAT_SHIFT',
          targetEntity: 'FacilitySecurityState',
          targetId: 'FPCON',
          outcome: 'SUCCESS',
          purpose: `Facility FPCON threat condition transitioned to ${level}`,
        })
        get().addToast({
          title: `FPCON Condition: ${level}`,
          message: `Access authorization matrix adjusted for FPCON ${level}`,
          type: level === 'CHARLIE' || level === 'DELTA' ? 'warning' : 'info',
        })
      },

      updateCardholderStatus: (cardholderId, certStatus, pinStatus) => {
        set((state) => ({
          cardholders: state.cardholders.map((c) =>
            c.id === cardholderId ? { ...c, certificateStatus: certStatus, pivPinStatus: pinStatus } : c
          ),
        }))
        const activePersona = get().personas.find((p) => p.id === get().activePersonaId)
        get().logAuditEvent({
          agencyId: get().activeAgencyId,
          actor: activePersona?.name || 'Watch Commander',
          actorRole: activePersona?.role || 'WATCH_COMMANDER',
          action: 'PACS_PIV_CREDENTIAL_MUTATION',
          targetEntity: 'CardholderRecord',
          targetId: cardholderId,
          outcome: 'SUCCESS',
          purpose: `PIV credential status updated: Cert ${certStatus}, PIN ${pinStatus}`,
        })
        get().addToast({
          title: 'PIV Credential Updated',
          message: `${cardholderId}: Certificate ${certStatus}`,
          type: 'info',
        })
      },

      toggleAntiPassback: (zoneId) => {
        set((state) => ({
          accessZones: state.accessZones.map((z) =>
            z.id === zoneId
              ? { ...z, antiPassbackMode: z.antiPassbackMode === 'STRICT' ? 'SOFT' : 'STRICT' }
              : z
          ),
        }))
        get().addToast({
          title: 'Anti-Passback Policy Updated',
          message: `Zone ${zoneId} anti-passback rule updated`,
          type: 'info',
        })
      },

      simulateBadgeTap: (doorId, cardholderId) => {
        const state = get()
        const cardholder = state.cardholders.find((c) => c.id === cardholderId) || state.cardholders[0]
        const door = state.portalDoors.find((d) => d.id === doorId) || state.portalDoors[0]

        const isGranted = cardholder.certificateStatus === 'VALID' && cardholder.pivPinStatus === 'VALID'
        const result = isGranted ? 'GRANTED' : cardholder.certificateStatus === 'SUSPENDED' ? 'DENIED_REVOKED' : 'DENIED_INVALID_PIN'

        const newEvent: AccessEvent = {
          id: `pacs-evt-${Math.floor(1000 + Math.random() * 9000)}`,
          readerId: `RDR-${door.doorCode}`,
          doorName: door.name,
          facility: door.facility,
          cardholderName: cardholder.name,
          pivCardNumber: cardholder.pivCardNumber,
          result,
          timestamp: new Date().toISOString(),
          threatLevel: isGranted ? 'ROUTINE' : 'HIGH',
          correlatedCameraId: door.correlatedCameraId,
        }

        set((s) => ({
          accessEvents: [newEvent, ...s.accessEvents],
          portalDoors: s.portalDoors.map((d) =>
            d.id === doorId ? { ...d, lastAccessEvent: `${result} [${cardholder.name}]` } : d
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: cardholder.name,
          actorRole: 'PIV_CARDHOLDER',
          action: 'PACS_CARD_READ_TRANSACTION',
          targetEntity: 'PortalDoor',
          targetId: doorId,
          outcome: isGranted ? 'SUCCESS' : 'DENIED',
          purpose: `Card read result: ${result} at ${door.name}`,
        })

        get().addToast({
          title: `PIV Access: ${result}`,
          message: `${cardholder.name} at ${door.doorCode}`,
          type: isGranted ? 'success' : 'error',
        })
      },

      // COP Situational Intelligence Actions
      executeSlewToCue: (targetId: string) => {
        const state = get()
        const target = state.slewTargets.find(t => t.id === targetId)
        if (!target) return

        set(s => ({
          slewTargets: s.slewTargets.map(t =>
            t.id === targetId ? { ...t, status: 'SLEWED' as const } : t
          ),
        }))

        if (target.linkedCameraId) {
          get().ptzSlewCamera(target.linkedCameraId, target.pan, target.tilt, target.zoom)
        }

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COP_TACTICAL_CONTROLLER',
          action: 'COP_SLEW_TO_CUE_ENGAGED',
          targetEntity: 'SlewToCueTarget',
          targetId,
          outcome: 'SUCCESS',
          purpose: `Automated PTZ slew & cue lock onto ${target.targetName} [Pan: ${target.pan}°, Tilt: ${target.tilt}°, Zoom: ${target.zoom}x]`,
        })

        get().addToast({
          title: 'Slew-to-Cue Locked',
          message: `${target.targetName} linked to ${target.linkedCameraId} at ${target.coordinates.join(', ')}`,
          type: 'success',
        })
      },

      toggleAirspaceRestriction: (airspaceId: string) => {
        const state = get()
        const item = state.airspaceRestrictions.find(a => a.id === airspaceId)
        if (!item) return
        const newActive = !item.active

        set(s => ({
          airspaceRestrictions: s.airspaceRestrictions.map(a =>
            a.id === airspaceId ? { ...a, active: newActive } : a
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'AIRSPACE_COORDINATOR',
          action: newActive ? 'AIRSPACE_TFR_ENFORCED' : 'AIRSPACE_TFR_SUSPENDED',
          targetEntity: 'AirspaceRestriction',
          targetId: airspaceId,
          outcome: 'SUCCESS',
          purpose: `FAA/DoD Airspace Restriction ${item.designation} set to ${newActive ? 'ACTIVE' : 'INACTIVE'}`,
        })

        get().addToast({
          title: `Airspace ${newActive ? 'Activated' : 'Suspended'}`,
          message: `${item.designation} (${item.floorAltFt}-${item.ceilingAltFt} ft AGL)`,
          type: newActive ? 'warning' : 'info',
        })
      },

      dispatchAssetToTarget: (assetId: string, coordinates: [number, number], incidentId?: string) => {
        const state = get()
        const asset = state.tacticalAssets.find(a => a.id === assetId)
        if (!asset) return

        set(s => ({
          tacticalAssets: s.tacticalAssets.map(a =>
            a.id === assetId
              ? { ...a, status: 'DISPATCHED' as const, coordinates, assignedIncidentId: incidentId || a.assignedIncidentId }
              : a
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COP_TACTICAL_CONTROLLER',
          action: 'COP_ASSET_VECTOR_DISPATCHED',
          targetEntity: 'TacticalAsset',
          targetId: assetId,
          outcome: 'SUCCESS',
          purpose: `Tactical asset ${asset.callsign} (${asset.assetCode}) vectored to ${coordinates.join(', ')}`,
        })

        get().addToast({
          title: `Asset Vectored: ${asset.callsign}`,
          message: `Dispatched to coordinates ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`,
          type: 'info',
        })
      },

      dismissCorrelation: (correlationId: string) => {
        const state = get()
        const corr = state.spatialCorrelations.find(c => c.id === correlationId)
        if (!corr) return

        set(s => ({
          spatialCorrelations: s.spatialCorrelations.filter(c => c.id !== correlationId),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COP_TACTICAL_CONTROLLER',
          action: 'COP_CORRELATION_RESOLVED',
          targetEntity: 'SpatialCorrelationEvent',
          targetId: correlationId,
          outcome: 'SUCCESS',
          purpose: `Correlation event ${corr.title} marked resolved and archived`,
        })

        get().addToast({
          title: 'Correlation Resolved',
          message: `${corr.title} acknowledged and cleared from tactical COP cue`,
          type: 'info',
        })
      },

      updateAssetStatus: (assetId: string, status: TacticalAsset['status']) => {
        const state = get()
        const asset = state.tacticalAssets.find(a => a.id === assetId)
        if (!asset) return

        set(s => ({
          tacticalAssets: s.tacticalAssets.map(a =>
            a.id === assetId ? { ...a, status } : a
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COP_TACTICAL_CONTROLLER',
          action: 'COP_ASSET_STATUS_UPDATED',
          targetEntity: 'TacticalAsset',
          targetId: assetId,
          outcome: 'SUCCESS',
          purpose: `Asset ${asset.callsign} status changed to ${status}`,
        })

        get().addToast({
          title: `Asset Status: ${status}`,
          message: `${asset.callsign} (${asset.assetCode}) is now ${status.replace('_', ' ')}`,
          type: 'info',
        })
      },

      // MANET Tactical Communications Actions
      enrollMeshNode: (nodeData: Omit<MeshNode, 'id'>) => {
        const state = get()
        const newNode: MeshNode = {
          ...nodeData,
          id: `node-${Date.now()}`,
        }

        set(s => ({
          meshNodes: [newNode, ...s.meshNodes],
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: newNode.id,
              nodeName: newNode.name,
              eventType: 'NODE_JOINED',
              severity: 'LOW',
              details: `Node ${newNode.nodeCode} (${newNode.model}) successfully enrolled via mutual X.509 cert and admitted to ${newNode.assignedMission}.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_NETWORK_CONTROLLER',
          action: 'MANET_NODE_ENROLLED',
          targetEntity: 'MeshNode',
          targetId: newNode.id,
          outcome: 'SUCCESS',
          purpose: `Enrolled mesh node ${newNode.name} [IP: ${newNode.ipAddress}, MAC: ${newNode.macAddress}, FIPS: ${newNode.fipsValidated}]`,
        })

        get().addToast({
          title: 'Mesh Node Enrolled',
          message: `${newNode.nodeCode} (${newNode.name}) joined tactical mesh network`,
          type: 'success',
        })
      },

      quarantineMeshNode: (nodeId: string, reason: string) => {
        const state = get()
        const node = state.meshNodes.find(n => n.id === nodeId)
        if (!node) return

        set(s => ({
          meshNodes: s.meshNodes.map(n =>
            n.id === nodeId ? { ...n, status: 'QUARANTINED' as const } : n
          ),
          meshLinks: s.meshLinks.map(l =>
            l.sourceNodeId === nodeId || l.targetNodeId === nodeId
              ? { ...l, status: 'DOWN' as const }
              : l
          ),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.name,
              eventType: 'AUTH_FAILURE',
              severity: 'CRITICAL',
              details: `Node quarantined: ${reason}. Cryptographic mesh routes severed.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_SECURITY_OFFICER',
          action: 'MANET_NODE_QUARANTINED',
          targetEntity: 'MeshNode',
          targetId: nodeId,
          outcome: 'SUCCESS',
          purpose: `Node ${node.nodeCode} placed in tactical quarantine. Reason: ${reason}`,
        })

        get().addToast({
          title: 'Node Quarantined',
          message: `${node.nodeCode} isolated from mission mesh network`,
          type: 'error',
        })
      },

      reinstateMeshNode: (nodeId: string) => {
        const state = get()
        const node = state.meshNodes.find(n => n.id === nodeId)
        if (!node) return

        set(s => ({
          meshNodes: s.meshNodes.map(n =>
            n.id === nodeId ? { ...n, status: 'ACTIVE' as const } : n
          ),
          meshLinks: s.meshLinks.map(l =>
            l.sourceNodeId === nodeId || l.targetNodeId === nodeId
              ? { ...l, status: 'OPTIMAL' as const }
              : l
          ),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.name,
              eventType: 'NODE_JOINED',
              severity: 'LOW',
              details: `Node reinstated to active status after posture validation.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_NETWORK_CONTROLLER',
          action: 'MANET_NODE_REINSTATED',
          targetEntity: 'MeshNode',
          targetId: nodeId,
          outcome: 'SUCCESS',
          purpose: `Reinstated mesh node ${node.nodeCode} to active status`,
        })

        get().addToast({
          title: 'Node Reinstated',
          message: `${node.nodeCode} re-admitted to tactical mesh network`,
          type: 'success',
        })
      },

      emergencyZeroizeNode: (nodeId: string) => {
        const state = get()
        const node = state.meshNodes.find(n => n.id === nodeId)
        if (!node) return

        set(s => ({
          meshNodes: s.meshNodes.map(n =>
            n.id === nodeId ? { ...n, status: 'ZEROIZED' as const, fipsValidated: false } : n
          ),
          meshLinks: s.meshLinks.map(l =>
            l.sourceNodeId === nodeId || l.targetNodeId === nodeId
              ? { ...l, status: 'DOWN' as const }
              : l
          ),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.name,
              eventType: 'ZEROIZATION',
              severity: 'CRITICAL',
              details: `FIPS 140-3 Emergency Cryptographic Zeroization executed on ${node.nodeCode}. All TEKs and certs wiped.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'SECURITY_OFFICER',
          action: 'MANET_EMERGENCY_ZEROIZE_SINGLE',
          targetEntity: 'MeshNode',
          targetId: nodeId,
          outcome: 'SUCCESS',
          purpose: `Emergency zeroization of cryptographic material on ${node.nodeCode} (${node.name})`,
        })

        get().addToast({
          title: 'Node Zeroized',
          message: `${node.nodeCode}: Cryptographic keys purged under FIPS 140-3 zeroize protocol`,
          type: 'error',
        })
      },

      emergencyZeroizeAllNodes: () => {
        const state = get()
        set(s => ({
          meshNodes: s.meshNodes.map(n => ({
            ...n,
            status: 'ZEROIZED' as const,
            fipsValidated: false,
          })),
          meshLinks: s.meshLinks.map(l => ({ ...l, status: 'DOWN' as const })),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: 'ALL',
              nodeName: 'All Mesh Nodes',
              eventType: 'ZEROIZATION',
              severity: 'CRITICAL',
              details: `FLEET-WIDE ZEROIZATION COMMAND EXECUTED. All mission network nodes zeroized.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'SECURITY_OFFICER',
          action: 'MANET_FLEET_WIDE_ZEROIZATION',
          targetEntity: 'MeshNode',
          targetId: 'ALL_NODES',
          outcome: 'SUCCESS',
          purpose: 'Fleet-wide cryptographic zeroization across all deployable tactical mesh nodes.',
        })

        get().addToast({
          title: 'FLEET ZEROIZED',
          message: 'All tactical mesh nodes wiped. Network collapsed under emergency policy.',
          type: 'error',
        })
      },

      activateMissionProfile: (profileId: string) => {
        const state = get()
        const prof = state.missionProfiles.find(p => p.id === profileId)
        if (!prof) return

        set(s => ({
          missionProfiles: s.missionProfiles.map(p => ({
            ...p,
            active: p.id === profileId,
          })),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: prof.id,
              nodeName: prof.profileName,
              eventType: 'KEY_ROTATION',
              severity: 'LOW',
              details: `Mission profile ${prof.profileName} [${prof.rfBand}] activated across mesh network.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_NETWORK_CONTROLLER',
          action: 'MANET_MISSION_PROFILE_ACTIVATED',
          targetEntity: 'MissionNetworkProfile',
          targetId: profileId,
          outcome: 'SUCCESS',
          purpose: `Activated mission profile ${prof.profileName} (${prof.rfBand}, BW: ${prof.bandwidthMhz}MHz)`,
        })

        get().addToast({
          title: 'Mission Profile Activated',
          message: `${prof.profileName} applied to tactical mesh`,
          type: 'success',
        })
      },

      simulateLinkBreak: (linkId: string) => {
        const state = get()
        const link = state.meshLinks.find(l => l.id === linkId)
        if (!link) return
        const newStatus = link.status === 'DOWN' ? 'OPTIMAL' : 'DOWN'

        set(s => ({
          meshLinks: s.meshLinks.map(l =>
            l.id === linkId ? { ...l, status: newStatus } : l
          ),
          manetSecurityEvents: [
            {
              id: `msec-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: link.sourceNodeId,
              nodeName: `Link ${link.sourceNodeId} <-> ${link.targetNodeId}`,
              eventType: newStatus === 'DOWN' ? 'FREQUENCY_DRIFT' : 'NODE_JOINED',
              severity: newStatus === 'DOWN' ? 'MEDIUM' : 'LOW',
              details: newStatus === 'DOWN'
                ? `RF Link disruption detected between ${link.sourceNodeId} and ${link.targetNodeId}. Mesh initiating self-healing re-route.`
                : `RF Link restored between ${link.sourceNodeId} and ${link.targetNodeId}. Optimal route established.`,
            },
            ...s.manetSecurityEvents,
          ],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_OPERATOR',
          action: newStatus === 'DOWN' ? 'MANET_LINK_SEVERED' : 'MANET_LINK_RESTORED',
          targetEntity: 'MeshLink',
          targetId: linkId,
          outcome: 'SUCCESS',
          purpose: `Simulated RF link state transition: ${newStatus}`,
        })

        get().addToast({
          title: `Link ${newStatus === 'DOWN' ? 'Severed (Self-Healing Active)' : 'Restored'}`,
          message: `${link.sourceNodeId} ↔ ${link.targetNodeId} is now ${newStatus}`,
          type: newStatus === 'DOWN' ? 'warning' : 'success',
        })
      },

      toggleGatewayFailover: (gatewayId: string) => {
        const state = get()
        const gw = state.tacticalGateways.find(g => g.id === gatewayId)
        if (!gw) return
        const newStatus = gw.status === 'CONNECTED' ? 'FAILED' : 'CONNECTED'

        set(s => ({
          tacticalGateways: s.tacticalGateways.map(g =>
            g.id === gatewayId ? { ...g, status: newStatus } : g
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Tactical Network Lead',
          actorRole: 'MANET_OPERATOR',
          action: 'MANET_GATEWAY_FAILOVER_TOGGLE',
          targetEntity: 'TacticalGateway',
          targetId: gatewayId,
          outcome: 'SUCCESS',
          purpose: `Tactical gateway ${gw.name} set to ${newStatus}`,
        })

        get().addToast({
          title: `Gateway ${newStatus}`,
          message: `${gw.name}: Automated failover ${gw.autoFailover ? 'engaged' : 'idle'}`,
          type: newStatus === 'CONNECTED' ? 'success' : 'warning',
        })
      },

      // DEMS Digital Evidence Management Actions
      ingestEvidenceItem: (itemData: Omit<EvidenceRecord, 'id' | 'sha256Hash' | 'ingestedAt'>) => {
        const state = get()
        const newId = `evd-${Date.now()}`
        const generatedHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        const timestamp = new Date().toISOString()

        const newRecord: EvidenceRecord = {
          ...itemData,
          id: newId,
          sha256Hash: generatedHash,
          ingestedAt: timestamp,
          status: 'INGESTED',
        }

        const newCustodyEvent: CustodyEvent = {
          id: `cust-${Date.now()}`,
          evidenceId: newId,
          evidenceNumber: itemData.evidenceNumber,
          timestamp,
          action: 'INGESTION',
          actorName: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorAgency: 'DHS-FPS Evidence Management',
          notes: `Direct intake and cryptographic registration of ${itemData.title}. Category: ${itemData.category}.`,
          sha256Seal: generatedHash,
        }

        set(s => ({
          evidenceRecords: [newRecord, ...s.evidenceRecords],
          custodyEvents: [newCustodyEvent, ...s.custodyEvents],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorRole: 'EVIDENCE_CUSTODIAN',
          action: 'DEMS_EVIDENCE_INGESTED',
          targetEntity: 'EvidenceRecord',
          targetId: newId,
          outcome: 'SUCCESS',
          purpose: `Ingested evidence ${itemData.evidenceNumber} [SHA-256: ${generatedHash.slice(0, 16)}...]`,
        })

        get().addToast({
          title: 'Evidence Ingested',
          message: `${itemData.evidenceNumber} recorded with immutable SHA-256 seal`,
          type: 'success',
        })
      },

      toggleLegalHold: (evidenceId: string, reason: string) => {
        const state = get()
        const evidence = state.evidenceRecords.find(e => e.id === evidenceId)
        if (!evidence) return
        const newHold = !evidence.legalHold
        const timestamp = new Date().toISOString()

        const newCustodyEvent: CustodyEvent = {
          id: `cust-${Date.now()}`,
          evidenceId,
          evidenceNumber: evidence.evidenceNumber,
          timestamp,
          action: newHold ? 'LEGAL_HOLD_APPLIED' : 'LEGAL_HOLD_RELEASED',
          actorName: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorAgency: 'DHS-FPS Office of General Counsel',
          notes: newHold ? `Preservation legal hold enforced: ${reason}` : `Legal hold released: ${reason}`,
          sha256Seal: evidence.sha256Hash,
        }

        set(s => ({
          evidenceRecords: s.evidenceRecords.map(e =>
            e.id === evidenceId ? { ...e, legalHold: newHold } : e
          ),
          custodyEvents: [newCustodyEvent, ...s.custodyEvents],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorRole: 'LEGAL_COUNSEL',
          action: newHold ? 'DEMS_LEGAL_HOLD_APPLIED' : 'DEMS_LEGAL_HOLD_RELEASED',
          targetEntity: 'EvidenceRecord',
          targetId: evidenceId,
          outcome: 'SUCCESS',
          purpose: `Legal hold status changed to ${newHold ? 'ACTIVE' : 'RELEASED'}. Reason: ${reason}`,
        })

        get().addToast({
          title: `Legal Hold ${newHold ? 'Enforced' : 'Released'}`,
          message: `${evidence.evidenceNumber}: Preservation hold status updated`,
          type: newHold ? 'warning' : 'info',
        })
      },

      verifyEvidenceHash: (evidenceId: string) => {
        const state = get()
        const evidence = state.evidenceRecords.find(e => e.id === evidenceId)
        if (!evidence) return false
        const timestamp = new Date().toISOString()

        const newCustodyEvent: CustodyEvent = {
          id: `cust-${Date.now()}`,
          evidenceId,
          evidenceNumber: evidence.evidenceNumber,
          timestamp,
          action: 'HASH_VERIFICATION',
          actorName: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorAgency: 'DHS-FPS Evidence Section',
          notes: `Cryptographic SHA-256 recalculation matches original ingestion seal: ${evidence.sha256Hash}`,
          sha256Seal: evidence.sha256Hash,
        }

        set(s => ({
          custodyEvents: [newCustodyEvent, ...s.custodyEvents],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorRole: 'EVIDENCE_CUSTODIAN',
          action: 'DEMS_HASH_VERIFIED',
          targetEntity: 'EvidenceRecord',
          targetId: evidenceId,
          outcome: 'SUCCESS',
          purpose: `Integrity check: SHA-256 seal verified against immutable ledger`,
        })

        get().addToast({
          title: 'Hash Verified: 100% Match',
          message: `${evidence.evidenceNumber}: SHA-256 hash valid, no bit rot or tampering detected`,
          type: 'success',
        })

        return true
      },

      createEvidenceDerivative: (derivData: Omit<EvidenceDerivative, 'id' | 'createdAt' | 'derivativeSha256' | 'status'>) => {
        const state = get()
        const newId = `drv-${Date.now()}`
        const derivativeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        const timestamp = new Date().toISOString()

        const newDerivative: EvidenceDerivative = {
          ...derivData,
          id: newId,
          status: 'PENDING_APPROVAL',
          createdAt: timestamp,
          derivativeSha256: derivativeHash,
        }

        const newCustodyEvent: CustodyEvent = {
          id: `cust-${Date.now()}`,
          evidenceId: derivData.originalEvidenceId,
          evidenceNumber: derivData.evidenceNumber,
          timestamp,
          action: 'REDACTION_CREATED',
          actorName: derivData.appliedBy,
          actorAgency: 'DHS-FPS Evidence Section',
          notes: `Derivative working copy generated [${derivData.redactionType}]: ${derivData.derivativeTitle}`,
          sha256Seal: derivativeHash,
        }

        set(s => ({
          evidenceDerivatives: [newDerivative, ...s.evidenceDerivatives],
          custodyEvents: [newCustodyEvent, ...s.custodyEvents],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: derivData.appliedBy,
          actorRole: 'EVIDENCE_REVIEWER',
          action: 'DEMS_DERIVATIVE_CREATED',
          targetEntity: 'EvidenceDerivative',
          targetId: newId,
          outcome: 'SUCCESS',
          purpose: `Created redaction derivative for ${derivData.evidenceNumber} [Type: ${derivData.redactionType}]`,
        })

        get().addToast({
          title: 'Redaction Derivative Created',
          message: `${derivData.derivativeTitle} queued for supervisor review`,
          type: 'info',
        })
      },

      approveDerivative: (derivativeId: string, reviewerNotes?: string) => {
        const state = get()
        const deriv = state.evidenceDerivatives.find(d => d.id === derivativeId)
        if (!deriv) return

        set(s => ({
          evidenceDerivatives: s.evidenceDerivatives.map(d =>
            d.id === derivativeId
              ? { ...d, status: 'APPROVED' as const, reviewedBy: 'Morgan Bennett', reviewNotes: reviewerNotes || 'Approved for disclosure' }
              : d
          ),
          evidenceRecords: s.evidenceRecords.map(e =>
            e.id === deriv.originalEvidenceId ? { ...e, status: 'REDACTED' as const } : e
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: 'Morgan Bennett',
          actorRole: 'SUPERVISOR_REVIEWER',
          action: 'DEMS_DERIVATIVE_APPROVED',
          targetEntity: 'EvidenceDerivative',
          targetId: derivativeId,
          outcome: 'SUCCESS',
          purpose: `Supervisor approval granted for derivative copy ${deriv.derivativeTitle}`,
        })

        get().addToast({
          title: 'Redaction Approved',
          message: `${deriv.derivativeTitle} certified for legal disclosure`,
          type: 'success',
        })
      },

      grantDisclosure: (grantData: Omit<DisclosureGrant, 'id' | 'grantedAt' | 'accessStatus' | 'downloadCount'>) => {
        const state = get()
        const newId = `disc-${Date.now()}`
        const timestamp = new Date().toISOString()

        const newGrant: DisclosureGrant = {
          ...grantData,
          id: newId,
          grantedAt: timestamp,
          accessStatus: 'ACTIVE',
          downloadCount: 0,
        }

        const newCustodyEvent: CustodyEvent = {
          id: `cust-${Date.now()}`,
          evidenceId: grantData.evidenceId,
          evidenceNumber: grantData.evidenceNumber,
          timestamp,
          action: 'DISCLOSURE_GRANTED',
          actorName: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorAgency: 'DHS-FPS Evidence Section',
          notes: `Disclosure discovery grant issued to ${grantData.recipientAgency} (${grantData.recipientName}) for ${grantData.caseNumber}. Watermark: "${grantData.watermarkText}".`,
          sha256Seal: 'DISCLOSURE_PERMIT_SEAL_AUTHENTICATED',
        }

        set(s => ({
          disclosureGrants: [newGrant, ...s.disclosureGrants],
          custodyEvents: [newCustodyEvent, ...s.custodyEvents],
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorRole: 'EVIDENCE_CUSTODIAN',
          action: 'DEMS_DISCLOSURE_GRANTED',
          targetEntity: 'DisclosureGrant',
          targetId: newId,
          outcome: 'SUCCESS',
          purpose: `Authorized disclosure of ${grantData.evidenceNumber} to ${grantData.recipientAgency}`,
        })

        get().addToast({
          title: 'Disclosure Access Granted',
          message: `Package shared with ${grantData.recipientAgency} under forensic watermark`,
          type: 'success',
        })
      },

      revokeDisclosure: (grantId: string) => {
        const state = get()
        const grant = state.disclosureGrants.find(g => g.id === grantId)
        if (!grant) return

        set(s => ({
          disclosureGrants: s.disclosureGrants.map(g =>
            g.id === grantId ? { ...g, accessStatus: 'REVOKED' as const } : g
          ),
        }))

        get().logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find(p => p.id === state.activePersonaId)?.name || 'Evidence Custodian',
          actorRole: 'EVIDENCE_CUSTODIAN',
          action: 'DEMS_DISCLOSURE_REVOKED',
          targetEntity: 'DisclosureGrant',
          targetId: grantId,
          outcome: 'SUCCESS',
          purpose: `Revoked discovery access for ${grant.caseNumber} (${grant.recipientAgency})`,
        })

        get().addToast({
          title: 'Disclosure Access Revoked',
          message: `External access terminated for ${grant.recipientAgency}`,
          type: 'warning',
        })
      },

      // Unified Communications Actions
      createCommSession: (sessionData) => {
        const id = `cs-${Date.now()}`
        const sessionNumber = `COMM-2026-${Math.floor(1000 + Math.random() * 9000)}`
        const newSession: CommSession = {
          ...sessionData,
          id,
          sessionNumber,
          startedAt: new Date().toISOString(),
          durationSec: 0,
          participantsCount: 1,
        }

        const state = get()
        set((s) => ({
          commSessions: [newSession, ...s.commSessions],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Dispatcher',
          actorRole: 'DISPATCHER',
          action: 'COMM_SESSION_INITIATED',
          targetEntity: 'CommSession',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Initiated ${newSession.sessionType} (${newSession.title})`,
        })

        get().addToast({
          title: 'Communication Session Started',
          message: `${newSession.title} established on ${newSession.sourceEndpoint}`,
          type: 'success',
        })
      },

      updateSessionStatus: (sessionId: string, status: CommSession['status']) => {
        const state = get()
        const session = state.commSessions.find((s) => s.id === sessionId)
        if (!session) return

        set((s) => ({
          commSessions: s.commSessions.map((cs) =>
            cs.id === sessionId ? { ...cs, status } : cs
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Comm Operator',
          actorRole: 'COMM_OPERATOR',
          action: 'COMM_SESSION_STATUS_CHANGED',
          targetEntity: 'CommSession',
          targetId: sessionId,
          outcome: 'SUCCESS',
          purpose: `Set session ${session.sessionNumber} status to ${status}`,
        })

        get().addToast({
          title: 'Session Status Updated',
          message: `${session.title} is now ${status}`,
          type: status === 'TERMINATED' ? 'warning' : 'info',
        })
      },

      toggleParticipantMute: (participantId: string) => {
        const state = get()
        const p = state.commParticipants.find((item) => item.id === participantId)
        if (!p) return

        const newStatus = p.status === 'MUTED' ? 'CONNECTED' : 'MUTED'

        set((s) => ({
          commParticipants: s.commParticipants.map((item) =>
            item.id === participantId ? { ...item, status: newStatus } : item
          ),
        }))

        get().addToast({
          title: newStatus === 'MUTED' ? 'Participant Muted' : 'Participant Unmuted',
          message: `${p.name} (${p.callsign}) audio feed ${newStatus.toLowerCase()}`,
          type: 'info',
        })
      },

      createCommGroup: (groupData) => {
        const id = `cg-${Date.now()}`
        const newGroup: CommGroup = {
          ...groupData,
          id,
          membersCount: 1,
          activeSpeakersCount: 0,
          status: 'ACTIVE',
        }

        const state = get()
        set((s) => ({
          commGroups: [newGroup, ...s.commGroups],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Communications Admin',
          actorRole: 'COMMUNICATIONS_ADMIN',
          action: 'COMM_TALKGROUP_CREATED',
          targetEntity: 'CommGroup',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Created talkgroup ${newGroup.groupCode} (${newGroup.name})`,
        })

        get().addToast({
          title: 'Mission Talkgroup Provisioned',
          message: `${newGroup.name} (${newGroup.groupCode}) is now online`,
          type: 'success',
        })
      },

      toggleGroupPatch: (groupId: string) => {
        const state = get()
        const g = state.commGroups.find((group) => group.id === groupId)
        if (!g) return

        const newPatched = !g.isPatched

        set((s) => ({
          commGroups: s.commGroups.map((group) =>
            group.id === groupId ? { ...group, isPatched: newPatched } : group
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Communications Admin',
          actorRole: 'COMMUNICATIONS_ADMIN',
          action: newPatched ? 'TALKGROUP_PATCH_ENGAGED' : 'TALKGROUP_PATCH_DISENGAGED',
          targetEntity: 'CommGroup',
          targetId: groupId,
          outcome: 'SUCCESS',
          purpose: `${newPatched ? 'Engaged' : 'Disengaged'} interoperability patch on ${g.name}`,
        })

        get().addToast({
          title: newPatched ? 'Interoperability Patch Active' : 'Patch Disengaged',
          message: `Talkgroup ${g.name} ${newPatched ? 'bridged to' : 'isolated from'} external networks`,
          type: newPatched ? 'success' : 'warning',
        })
      },

      updateUserPresence: (userId: string, stateStatus: CommUserPresence['state']) => {
        set((s) => ({
          commPresences: s.commPresences.map((cp) =>
            cp.id === userId
              ? { ...cp, state: stateStatus, lastActivity: 'Just now' }
              : cp
          ),
        }))

        const state = get()
        const user = state.commPresences.find((cp) => cp.id === userId)
        if (user) {
          get().addToast({
            title: 'Presence Updated',
            message: `${user.name} is now ${stateStatus.replace(/_/g, ' ')}`,
            type: 'info',
          })
        }
      },

      toggleTrunkFailover: (trunkId: string) => {
        const state = get()
        const trunk = state.sipTrunks.find((t) => t.id === trunkId)
        if (!trunk) return

        const newStatus = trunk.status === 'FAILOVER_ACTIVE' ? 'OPERATIONAL' : 'FAILOVER_ACTIVE'

        set((s) => ({
          sipTrunks: s.sipTrunks.map((t) =>
            t.id === trunkId ? { ...t, status: newStatus } : t
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Network Engineer',
          actorRole: 'NETWORK_ENGINEER',
          action: 'SIP_TRUNK_FAILOVER_TOGGLED',
          targetEntity: 'SIPGatewayTrunk',
          targetId: trunkId,
          outcome: 'SUCCESS',
          purpose: `Toggled failover routing for ${trunk.trunkName}: ${newStatus}`,
        })

        get().addToast({
          title: 'Gateway Trunk Routing Toggled',
          message: `${trunk.trunkName} status shifted to ${newStatus}`,
          type: newStatus === 'FAILOVER_ACTIVE' ? 'warning' : 'success',
        })
      },

      authorizeCrossDomainBridge: (bridgeId: string) => {
        const state = get()
        const bridge = state.crossDomainBridges.find((b) => b.id === bridgeId)
        if (!bridge) return

        const approverName = state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Designated Security Officer'

        set((s) => ({
          crossDomainBridges: s.crossDomainBridges.map((b) =>
            b.id === bridgeId
              ? { ...b, status: 'ACTIVE_GUARDED' as const, authorizedBy: approverName }
              : b
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: approverName,
          actorRole: 'DESIGNATED_SECURITY_OFFICER',
          action: 'CDS_BRIDGE_AUTHORIZED',
          targetEntity: 'CrossDomainBridgeRequest',
          targetId: bridgeId,
          outcome: 'SUCCESS',
          purpose: `Authorized cross-domain voice bridge ${bridge.requestNumber} (${bridge.sourceEnclave} <-> ${bridge.targetEnclave})`,
        })

        get().addToast({
          title: 'Cross-Domain Bridge Authorized',
          message: `Hardware CDS Guard active between ${bridge.sourceEnclave} and ${bridge.targetEnclave}`,
          type: 'warning',
        })
      },

      terminateCrossDomainBridge: (bridgeId: string) => {
        const state = get()
        const bridge = state.crossDomainBridges.find((b) => b.id === bridgeId)
        if (!bridge) return

        set((s) => ({
          crossDomainBridges: s.crossDomainBridges.map((b) =>
            b.id === bridgeId ? { ...b, status: 'TERMINATED' as const } : b
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Security Officer',
          actorRole: 'SECURITY_OFFICER',
          action: 'CDS_BRIDGE_TERMINATED',
          targetEntity: 'CrossDomainBridgeRequest',
          targetId: bridgeId,
          outcome: 'SUCCESS',
          purpose: `Terminated cross-domain guard filter ${bridge.requestNumber}`,
        })

        get().addToast({
          title: 'Cross-Domain Bridge Severed',
          message: `Classification boundary isolation restored for ${bridge.requestNumber}`,
          type: 'info',
        })
      },

      // Mass Notification Actions
      createMassNotification: (alertData) => {
        const id = `notif-${Date.now()}`
        const alertCode = `CAP-2026-${Math.floor(1000 + Math.random() * 9000)}`
        const newAlert: MassNotificationAlert = {
          ...alertData,
          id,
          alertCode,
          createdAt: new Date().toISOString(),
          deliveredCount: 0,
          acknowledgedSafeCount: 0,
          acknowledgedAssistanceCount: 0,
          failedCount: 0,
        }

        const state = get()
        set((s) => ({
          massNotifications: [newAlert, ...s.massNotifications],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: alertData.authorName,
          actorRole: 'AUTHORING_OFFICER',
          action: 'MASS_NOTIFICATION_COMPOSED',
          targetEntity: 'MassNotificationAlert',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Composed CAP v1.2 alert ${alertCode} (${newAlert.eventCode}) - Status: ${newAlert.status}`,
        })

        get().addToast({
          title: newAlert.status === 'PENDING_TWO_MAN_APPROVAL' ? 'Alert Staged for Two-Man Authorization' : 'Alert Broadcast Queued',
          message: `${alertCode}: ${newAlert.headline}`,
          type: newAlert.severity === 'CRITICAL' ? 'error' : 'warning',
        })
      },

      authorizeTwoManAlert: (alertId: string) => {
        const state = get()
        const alert = state.massNotifications.find((a) => a.id === alertId)
        if (!alert) return

        const approver = state.personas.find((p) => p.id === state.activePersonaId)
        const approverName = approver ? `${approver.name} (${approver.roleLabel})` : 'Incident Commander'

        set((s) => ({
          massNotifications: s.massNotifications.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status: 'BROADCAST_ACTIVE' as const,
                  secondAuthorizerId: state.activePersonaId,
                  secondAuthorizerName: approverName,
                  authorizedAt: new Date().toISOString(),
                  deliveredCount: Math.floor(a.totalRecipients * 0.96),
                  acknowledgedSafeCount: Math.floor(a.totalRecipients * 0.88),
                  acknowledgedAssistanceCount: Math.floor(a.totalRecipients * 0.02),
                  failedCount: Math.floor(a.totalRecipients * 0.04),
                }
              : a
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: approverName,
          actorRole: 'INCIDENT_COMMANDER',
          action: 'MASS_NOTIFICATION_DUAL_AUTHORIZED',
          targetEntity: 'MassNotificationAlert',
          targetId: alertId,
          outcome: 'SUCCESS',
          purpose: `Dual-custody Two-Man Rule authorized for ${alert.alertCode}. Disseminated across ${alert.channels.join(', ')}`,
        })

        get().addToast({
          title: 'Two-Man Rule Dual Authorization Verified',
          message: `${alert.alertCode} broadcast active across all designated channels`,
          type: 'success',
        })
      },

      cancelMassNotification: (alertId: string, reason?: string) => {
        const state = get()
        const alert = state.massNotifications.find((a) => a.id === alertId)
        if (!alert) return

        set((s) => ({
          massNotifications: s.massNotifications.map((a) =>
            a.id === alertId ? { ...a, status: 'CANCELLED' as const } : a
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'WATCH_COMMANDER',
          action: 'MASS_NOTIFICATION_CANCELLED',
          targetEntity: 'MassNotificationAlert',
          targetId: alertId,
          outcome: 'SUCCESS',
          purpose: `Cancelled broadcast ${alert.alertCode}: ${reason || 'Command termination'}`,
        })

        get().addToast({
          title: 'Alert Broadcast Cancelled',
          message: `${alert.alertCode} transmission stopped`,
          type: 'info',
        })
      },

      broadcastAlertImmediate: (alertId: string) => {
        const state = get()
        const alert = state.massNotifications.find((a) => a.id === alertId)
        if (!alert) return

        set((s) => ({
          massNotifications: s.massNotifications.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status: 'BROADCAST_ACTIVE' as const,
                  deliveredCount: a.totalRecipients,
                  acknowledgedSafeCount: Math.floor(a.totalRecipients * 0.92),
                  acknowledgedAssistanceCount: Math.floor(a.totalRecipients * 0.03),
                }
              : a
          ),
        }))

        get().addToast({
          title: 'Instant Multi-Channel Alert Disseminated',
          message: `${alert.alertCode} live on IPAWS, SMS, Desktop HUD & Signage`,
          type: 'warning',
        })
      },

      acknowledgeAlertSafety: (alertId: string, status: 'SAFE' | 'NEED_ASSISTANCE') => {
        set((s) => ({
          massNotifications: s.massNotifications.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  acknowledgedSafeCount: status === 'SAFE' ? a.acknowledgedSafeCount + 1 : a.acknowledgedSafeCount,
                  acknowledgedAssistanceCount: status === 'NEED_ASSISTANCE' ? a.acknowledgedAssistanceCount + 1 : a.acknowledgedAssistanceCount,
                }
              : a
          ),
        }))

        get().addToast({
          title: status === 'SAFE' ? 'Muster Acknowledged: Marked SAFE' : 'Assistance Requested: Field Dispatched',
          message: status === 'SAFE' ? 'Accountability logged in federal muster record' : 'Emergency medical & extraction priority queue updated',
          type: status === 'SAFE' ? 'success' : 'error',
        })
      },

      updateMusterReportHeadcount: (musterId: string, safeDelta: number, assistanceDelta: number) => {
        set((s) => ({
          musterReports: s.musterReports.map((m) =>
            m.id === musterId
              ? {
                  ...m,
                  safeCount: Math.max(0, m.safeCount + safeDelta),
                  needAssistanceCount: Math.max(0, m.needAssistanceCount + assistanceDelta),
                  unaccountedCount: Math.max(0, m.unaccountedCount - safeDelta - assistanceDelta),
                }
              : m
          ),
        }))
      },

      // P25 Smart Radio Fleet Actions
      provisionRadioSubscriber: (radioData) => {
        const id = `rad-${Date.now()}`
        const newRadio: RadioSubscriber = {
          ...radioData,
          id,
        }

        const state = get()
        set((s) => ({
          radios: [newRadio, ...s.radios],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Fleet Manager',
          actorRole: 'FLEET_MANAGER',
          action: 'P25_SUBSCRIBER_PROVISIONED',
          targetEntity: 'RadioSubscriber',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Provisioned subscriber ${newRadio.radioId} (${newRadio.subscriberName}) on ${newRadio.talkgroup}`,
        })

        get().addToast({
          title: 'P25 Subscriber Enrolled',
          message: `${newRadio.radioId} (${newRadio.model || 'P25 Subscriber'}) provisioned on fleetmap`,
          type: 'success',
        })
      },

      inhibitRadioUnit: (radioId: string, action: 'STUN' | 'REVIVE' | 'ZEROIZE', reason: string) => {
        const state = get()
        const radio = state.radios.find((r) => r.radioId === radioId || r.id === radioId)
        if (!radio) return

        const activeUser = state.personas.find((p) => p.id === state.activePersonaId)
        const authorizer = activeUser ? `${activeUser.name} (${activeUser.roleLabel})` : 'Watch Commander'

        const newInhibitState = action === 'STUN' ? 'STUNNED' : action === 'REVIVE' ? 'ACTIVE_NORMAL' : 'ZEROIZED'
        const newStatus = action === 'REVIVE' ? 'ONLINE' : 'OFFLINE'
        const newKeyStatus = action === 'ZEROIZE' ? 'REVOKED' : radio.encryptionKeyStatus

        const logId = `inh-${Date.now()}`
        const newLog: RadioInhibitLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          radioId: radio.radioId,
          subscriberName: radio.subscriberName,
          action,
          authorizer1: authorizer,
          reason,
          status: 'EXECUTED_ACK',
        }

        set((s) => ({
          radios: s.radios.map((r) =>
            r.id === radio.id || r.radioId === radio.radioId
              ? {
                  ...r,
                  inhibitState: newInhibitState,
                  status: newStatus,
                  encryptionKeyStatus: newKeyStatus,
                }
              : r
          ),
          radioInhibitLogs: [newLog, ...s.radioInhibitLogs],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: authorizer,
          actorRole: 'WATCH_COMMANDER',
          action: `P25_OTA_${action}`,
          targetEntity: 'RadioSubscriber',
          targetId: radio.radioId,
          outcome: 'SUCCESS',
          purpose: `Over-the-Air ${action} transmitted to ${radio.radioId} (${radio.subscriberName}): ${reason}`,
        })

        get().addToast({
          title: `Over-The-Air ${action} Executed`,
          message: `${radio.radioId} ${action === 'STUN' ? 'inhibited from transmitting/receiving' : action === 'REVIVE' ? 'revived to active fleet service' : 'cryptographically zeroized and flash-wiped'}`,
          type: action === 'ZEROIZE' ? 'error' : action === 'STUN' ? 'warning' : 'success',
        })
      },

      initiateOTARekey: (keyId: string) => {
        const state = get()
        const key = state.otarKeys.find((k) => k.id === keyId)
        if (!key) return

        set((s) => ({
          otarKeys: s.otarKeys.map((k) =>
            k.id === keyId
              ? { ...k, status: 'ROTATING' as const, syncedRadiosCount: k.totalTargetRadios }
              : k
          ),
          radios: s.radios.map((r) =>
            r.status === 'ONLINE' ? { ...r, encryptionKeyStatus: 'SYNCED_AES256' as const } : r
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Crypto Officer',
          actorRole: 'CRYPTO_OFFICER',
          action: 'P25_OTAR_KEY_ROTATION',
          targetEntity: 'OTARKeyRecord',
          targetId: keyId,
          outcome: 'SUCCESS',
          purpose: `Initiated TIA-102.AACA OTAR rekey for ${key.keyAlias} (${key.keyId})`,
        })

        get().addToast({
          title: 'OTAR Rekey Epoch Broadcasted',
          message: `${key.keyAlias} rekey completed across ${key.totalTargetRadios} subscribers`,
          type: 'success',
        })
      },

      updateRadioTalkgroup: (radioId: string, talkgroup: string) => {
        set((s) => ({
          radios: s.radios.map((r) =>
            r.id === radioId || r.radioId === radioId ? { ...r, talkgroup } : r
          ),
        }))

        const state = get()
        const radio = state.radios.find((r) => r.id === radioId || r.radioId === radioId)
        if (radio) {
          get().addToast({
            title: 'Dynamic Regrouping Command Sent',
            message: `${radio.radioId} regrouped to ${talkgroup}`,
            type: 'info',
          })
        }
      },

      toggleSiteTrunkingMode: (siteId: string) => {
        const state = get()
        const site = state.p25RepeaterSites.find((s) => s.id === siteId)
        if (!site) return

        const newMode = site.mode === 'SIMULCAST_WIDE' ? 'SITE_TRUNKING' : 'SIMULCAST_WIDE'

        set((s) => ({
          p25RepeaterSites: s.p25RepeaterSites.map((item) =>
            item.id === siteId ? { ...item, mode: newMode } : item
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'RF Engineer',
          actorRole: 'RF_ENGINEER',
          action: 'P25_SITE_MODE_CHANGED',
          targetEntity: 'P25RepeaterSite',
          targetId: siteId,
          outcome: 'SUCCESS',
          purpose: `Toggled repeater ${site.siteCode} mode to ${newMode}`,
        })

        get().addToast({
          title: 'Repeater Mode Toggled',
          message: `${site.name} switched to ${newMode}`,
          type: newMode === 'SITE_TRUNKING' ? 'warning' : 'success',
        })
      },

      createP25Talkgroup: (tgData) => {
        const id = `tg-${Date.now()}`
        const newTg: P25TalkgroupConfig = {
          ...tgData,
          id,
          activeSubscriberCount: 0,
        }

        const state = get()
        set((s) => ({
          p25Talkgroups: [newTg, ...s.p25Talkgroups],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Fleet Administrator',
          actorRole: 'FLEET_ADMINISTRATOR',
          action: 'P25_TALKGROUP_CREATED',
          targetEntity: 'P25TalkgroupConfig',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Provisioned talkgroup TGID ${newTg.tgid} (${newTg.name})`,
        })

        get().addToast({
          title: 'P25 Talkgroup Created',
          message: `${newTg.name} (TGID ${newTg.tgid}) registered on P25 core`,
          type: 'success',
        })
      },

      // VRSM / Body-Worn Camera Actions
      toggleBWCRecording: (deviceId: string) => {
        const state = get()
        const dev = state.bwcDevices.find((d) => d.id === deviceId)
        if (!dev) return

        const newStatus = dev.status === 'RECORDING' ? 'BUFFERING_STANDBY' : 'RECORDING'

        set((s) => ({
          bwcDevices: s.bwcDevices.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  status: newStatus,
                  currentRecordingDurationSec: newStatus === 'RECORDING' ? 1 : 0,
                  lastTriggerSource: newStatus === 'RECORDING' ? 'MANUAL_OFFICER' : d.lastTriggerSource,
                }
              : d
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: dev.assignedOfficer,
          actorRole: 'BWC_OPERATOR',
          action: newStatus === 'RECORDING' ? 'BWC_RECORDING_ENGAGED' : 'BWC_RECORDING_STANDBY',
          targetEntity: 'BWCDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Manual BWC recording state changed to ${newStatus} for ${dev.deviceCode} (${dev.officerBadge})`,
        })

        get().addToast({
          title: `BWC ${dev.deviceCode}: ${newStatus === 'RECORDING' ? 'Recording Active' : 'Buffering Standby'}`,
          message: `Officer: ${dev.assignedOfficer} (${dev.officerBadge})`,
          type: newStatus === 'RECORDING' ? 'warning' : 'info',
        })
      },

      requestBWCStream: (deviceId: string) => {
        const state = get()
        const dev = state.bwcDevices.find((d) => d.id === deviceId)
        if (!dev) return

        set((s) => ({
          bwcDevices: s.bwcDevices.map((d) =>
            d.id === deviceId ? { ...d, liveStreamingActive: true } : d
          ),
        }))

        const supervisorName = state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander'

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: supervisorName,
          actorRole: 'WATCH_COMMANDER',
          action: 'BWC_SUPERVISOR_LIVE_STREAM_REQUESTED',
          targetEntity: 'BWCDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Tactical supervisor live video request initiated per CJIS compliance for camera ${dev.deviceCode}. Officer alerted.`,
        })

        get().addToast({
          title: `Live Stream Connected: ${dev.deviceCode}`,
          message: `Live WebRTC tactical stream feed established (${dev.streamResolution})`,
          type: 'success',
        })
      },

      stopBWCStream: (deviceId: string) => {
        const state = get()
        const dev = state.bwcDevices.find((d) => d.id === deviceId)
        if (!dev) return

        set((s) => ({
          bwcDevices: s.bwcDevices.map((d) =>
            d.id === deviceId ? { ...d, liveStreamingActive: false } : d
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'WATCH_COMMANDER',
          action: 'BWC_SUPERVISOR_LIVE_STREAM_TERMINATED',
          targetEntity: 'BWCDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Live supervisor stream session terminated for camera ${dev.deviceCode}`,
        })

        get().addToast({
          title: `Stream Terminated: ${dev.deviceCode}`,
          message: `Live supervisor viewing closed for officer ${dev.assignedOfficer}`,
          type: 'info',
        })
      },

      triggerBWCEvent: (deviceId: string, triggerType: BWCRecordingTrigger['triggerType'], notes: string) => {
        const state = get()
        const dev = state.bwcDevices.find((d) => d.id === deviceId)
        if (!dev) return

        const newTrigger: BWCRecordingTrigger = {
          id: `trig-${Date.now()}`,
          deviceId,
          deviceCode: dev.deviceCode,
          officerName: dev.assignedOfficer,
          triggerType,
          timestamp: new Date().toISOString(),
          preEventBufferSec: 30,
          cadIncidentNumber: 'CAD-2026-8812',
          status: 'RECORDING_ACTIVE',
          notes,
        }

        set((s) => ({
          bwcTriggers: [newTrigger, ...s.bwcTriggers],
          bwcDevices: s.bwcDevices.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  status: 'RECORDING',
                  currentRecordingDurationSec: (d.currentRecordingDurationSec || 0) + 1,
                  lastTriggerSource: triggerType,
                }
              : d
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: 'AUTOMATED_SENSOR_NETWORK',
          actorRole: 'TELEMETRY_ENGINE',
          action: 'BWC_SENSOR_TRIGGER_TRIPPED',
          targetEntity: 'BWCDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Sensor trigger [${triggerType}] tripped on ${dev.deviceCode}. Pre-event buffer (30s) committed and recording forced.`,
        })

        get().addToast({
          title: `SENSOR TRIGGER: ${triggerType.replace(/_/g, ' ')}`,
          message: `Camera ${dev.deviceCode} (${dev.assignedOfficer}) automatically forced to RECORD`,
          type: 'warning',
        })
      },

      offloadClipToDEMS: (clipId: string) => {
        const state = get()
        const clip = state.bwcClips.find((c) => c.id === clipId)
        if (!clip) return

        const evidenceId = clip.demsEvidenceId || `EV-BWC-${Date.now()}`

        const newRecord: EvidenceRecord = {
          id: evidenceId,
          evidenceNumber: `DEMS-${clip.clipNumber}`,
          title: `BWC Video: ${clip.category} - ${clip.deviceCode}`,
          category: clip.deviceCode.includes('CAR') ? 'VEHICLE_DASHCAM' : 'BODY_WORN_VIDEO',
          sourceDeviceId: clip.deviceCode,
          custodian: clip.officerName,
          sha256Hash: clip.sha256Checksum,
          ingestedAt: new Date().toISOString(),
          retentionSchedule: '3_YEAR_STATUTORY',
          legalHold: clip.category === 'USE_OF_FORCE' || clip.category === 'PURSUIT',
          classification: clip.classification,
          caseId: clip.cadIncidentNumber || 'CASE-2026-9041',
          fileSizeBytes: Math.round(clip.fileSizeMb * 1024 * 1024),
          durationSec: clip.durationSec,
          status: 'INGESTED',
        }

        set((s) => ({
          bwcClips: s.bwcClips.map((c) =>
            c.id === clipId ? { ...c, ingestedToDems: true, demsEvidenceId: evidenceId } : c
          ),
          evidenceRecords: s.evidenceRecords.some((e) => e.id === evidenceId)
            ? s.evidenceRecords
            : [newRecord, ...s.evidenceRecords],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'DEMS Custodian',
          actorRole: 'EVIDENCE_CUSTODIAN',
          action: 'BWC_DEMS_INGESTION_COMPLETED',
          targetEntity: 'BWCClipMetadata',
          targetId: clipId,
          outcome: 'SUCCESS',
          purpose: `Clip ${clip.clipNumber} ingested into Module 06 DEMS as ${evidenceId}. SHA256 verified.`,
        })

        get().addToast({
          title: 'Clip Ingested to DEMS',
          message: `${clip.clipNumber} ingested into Digital Evidence Management (${evidenceId})`,
          type: 'success',
        })
      },

      updateClipMetadata: (clipId: string, category: BWCClipMetadata['category'], cadIncident?: string, notes?: string) => {
        const state = get()
        const clip = state.bwcClips.find((c) => c.id === clipId)
        if (!clip) return

        set((s) => ({
          bwcClips: s.bwcClips.map((c) =>
            c.id === clipId
              ? {
                  ...c,
                  category,
                  cadIncidentNumber: cadIncident !== undefined ? cadIncident : c.cadIncidentNumber,
                  notes: notes !== undefined ? notes : c.notes,
                }
              : c
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Investigator',
          actorRole: 'INVESTIGATOR',
          action: 'BWC_CLIP_METADATA_UPDATED',
          targetEntity: 'BWCClipMetadata',
          targetId: clipId,
          outcome: 'SUCCESS',
          purpose: `Updated metadata for clip ${clip.clipNumber}: Category -> ${category}, CAD -> ${cadIncident || 'N/A'}`,
        })

        get().addToast({
          title: 'Clip Metadata Updated',
          message: `${clip.clipNumber} classified as ${category.replace(/_/g, ' ')}`,
          type: 'success',
        })
      },

      // Module 11: P25 Infrastructure Actions
      triggerP25FailoverTest: (siteId: string) => {
        const state = get()
        const site = state.p25CoreSites.find((s) => s.id === siteId)
        if (!site) return

        const timestamp = new Date().toISOString()
        set((s) => ({
          p25CoreSites: s.p25CoreSites.map((cs) =>
            cs.id === siteId ? { ...cs, lastFailoverTest: timestamp } : cs
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'RF Systems Engineer',
          actorRole: 'SYSTEM_ADMIN',
          action: 'P25_CORE_FAILOVER_TEST_EXECUTED',
          targetEntity: 'P25CoreSiteController',
          targetId: siteId,
          outcome: 'SUCCESS',
          purpose: `Simulated geographical failover test between ${site.siteName} and Disaster Recovery Core. Switchover latency < 25ms.`,
        })

        get().addToast({
          title: `Failover Test Passed: ${site.siteId}`,
          message: `Zero packet loss during automated TIA-102 core switchover verification`,
          type: 'success',
        })
      },

      toggleP25CoreSiteStatus: (siteId: string) => {
        const state = get()
        const site = state.p25CoreSites.find((s) => s.id === siteId)
        if (!site) return

        const newStatus = site.status === 'ONLINE' ? 'FAILSOFT' : 'ONLINE'
        set((s) => ({
          p25CoreSites: s.p25CoreSites.map((cs) =>
            cs.id === siteId ? { ...cs, status: newStatus } : cs
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'RF Systems Engineer',
          actorRole: 'SYSTEM_ADMIN',
          action: 'P25_SITE_STATUS_CHANGED',
          targetEntity: 'P25CoreSiteController',
          targetId: siteId,
          outcome: 'SUCCESS',
          purpose: `Site ${site.siteId} manually transitioned to ${newStatus}`,
        })

        get().addToast({
          title: `Site Status: ${newStatus}`,
          message: `${site.siteName} is now in ${newStatus} mode`,
          type: newStatus === 'ONLINE' ? 'success' : 'warning',
        })
      },

      // Module 12: Secure Mobile / MDM Actions
      remoteWipeEUD: (deviceId: string, reason: string) => {
        const state = get()
        const dev = state.mobileEUDs.find((d) => d.id === deviceId)
        if (!dev) return

        set((s) => ({
          mobileEUDs: s.mobileEUDs.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  securityPosture: 'WIPED',
                  cryptoContainerStatus: 'ZEROIZED',
                }
              : d
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Security Officer',
          actorRole: 'SECURITY_OFFICER',
          action: 'EUD_REMOTE_WIPE_EXECUTED',
          targetEntity: 'MobileEUDDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Remote cryptographic wipe dispatched to ${dev.deviceTag} (${dev.assignedUser}): ${reason}`,
        })

        get().addToast({
          title: `Device Wiped: ${dev.deviceTag}`,
          message: `Zeroization command confirmed by Knox / DualDAR agent`,
          type: 'error',
        })
      },

      deployATAKProfile: (deviceId: string, profile: MobileEUDDevice['enrolledMAMProfile']) => {
        const state = get()
        const dev = state.mobileEUDs.find((d) => d.id === deviceId)
        if (!dev) return

        set((s) => ({
          mobileEUDs: s.mobileEUDs.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  enrolledMAMProfile: profile,
                  securityPosture: 'COMPLIANT',
                  cryptoContainerStatus: 'UNLOCKED_FIPS',
                }
              : d
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'MDM Administrator',
          actorRole: 'SYSTEM_ADMIN',
          action: 'EUD_MAM_PROFILE_DEPLOYED',
          targetEntity: 'MobileEUDDevice',
          targetId: deviceId,
          outcome: 'SUCCESS',
          purpose: `Deployed ${profile} MAM profile to ${dev.deviceTag}`,
        })

        get().addToast({
          title: `MAM Profile Deployed`,
          message: `${dev.deviceTag} enrolled in ${profile}`,
          type: 'success',
        })
      },

      // Module 13: CSfC Trusted Integration Actions
      rotateCSfCKeys: (gatewayId: string) => {
        const state = get()
        const gw = state.csfcGateways.find((g) => g.id === gatewayId)
        if (!gw) return

        const timestamp = new Date().toISOString()
        set((s) => ({
          csfcGateways: s.csfcGateways.map((g) =>
            g.id === gatewayId ? { ...g, lastRekeyTimestamp: timestamp } : g
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Crypto Custodian',
          actorRole: 'CRYPTO_OFFICER',
          action: 'CSFC_POST_QUANTUM_REKEY_EXECUTED',
          targetEntity: 'CSfCTunnelGateway',
          targetId: gatewayId,
          outcome: 'SUCCESS',
          purpose: `Rotated ML-KEM-768 Kyber post-quantum keypair for CSfC dual-tunnel gateway ${gw.gatewayName}`,
        })

        get().addToast({
          title: `CSfC Rekey Completed: ${gw.gatewayName}`,
          message: `Dual-tunnel Post-Quantum IKEv2 / ESP keys successfully re-negotiated`,
          type: 'success',
        })
      },

      toggleCSfCTunnel: (gatewayId: string) => {
        const state = get()
        const gw = state.csfcGateways.find((g) => g.id === gatewayId)
        if (!gw) return

        const newOuter = gw.outerTunnelStatus === 'ESTABLISHED' ? 'DOWN' : 'ESTABLISHED'
        const newInner = newOuter === 'ESTABLISHED' ? 'ESTABLISHED' : 'DOWN'

        set((s) => ({
          csfcGateways: s.csfcGateways.map((g) =>
            g.id === gatewayId
              ? {
                  ...g,
                  outerTunnelStatus: newOuter,
                  innerTunnelStatus: newInner,
                }
              : g
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Crypto Custodian',
          actorRole: 'CRYPTO_OFFICER',
          action: 'CSFC_TUNNEL_STATE_TOGGLED',
          targetEntity: 'CSfCTunnelGateway',
          targetId: gatewayId,
          outcome: 'SUCCESS',
          purpose: `Dual-tunnel gateway ${gw.gatewayName} set to Outer:${newOuter} / Inner:${newInner}`,
        })

        get().addToast({
          title: `CSfC Tunnel ${newOuter}`,
          message: `${gw.gatewayName} outer & inner encryption status updated`,
          type: newOuter === 'ESTABLISHED' ? 'success' : 'warning',
        })
      },

      // Module 14: Managed Device Operations Actions
      createDepotWorkOrder: (assetTag: string, workType: DepotWorkOrder['workType'], notes: string) => {
        const state = get()
        const newOrder: DepotWorkOrder = {
          id: `wo-${Date.now()}`,
          orderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          assetTag,
          technicianName: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Depot Tech',
          workType,
          priority: 'EXPEDITED',
          status: 'IN_PROGRESS',
          openedDate: new Date().toISOString(),
          technicianNotes: notes,
        }

        set((s) => ({
          depotWorkOrders: [newOrder, ...s.depotWorkOrders],
          depotAssets: s.depotAssets.map((a) =>
            a.assetTag === assetTag ? { ...a, lifecycleStage: 'DEPOT_MAINTENANCE' } : a
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: newOrder.technicianName,
          actorRole: 'DEPOT_TECHNICIAN',
          action: 'DEPOT_WORK_ORDER_CREATED',
          targetEntity: 'DepotWorkOrder',
          targetId: newOrder.id,
          outcome: 'SUCCESS',
          purpose: `Created depot work order ${newOrder.orderNumber} for asset ${assetTag} [${workType}]`,
        })

        get().addToast({
          title: `Work Order Created: ${newOrder.orderNumber}`,
          message: `Asset ${assetTag} queued for ${workType.replace(/_/g, ' ')}`,
          type: 'success',
        })
      },

      // Module 15: Cybersecurity / SOC Actions
      executeCyberContainment: (threatId: string, actionType: 'ISOLATE_HOST' | 'BLOCK_IP' | 'REVOKE_PIV') => {
        const state = get()
        const threat = state.cyberThreats.find((t) => t.id === threatId)
        if (!threat) return

        const actionText =
          actionType === 'ISOLATE_HOST'
            ? `Isolated host ${threat.targetAsset} from federal network backbone`
            : actionType === 'BLOCK_IP'
            ? `Blocked source IP ${threat.sourceIp} at edge firewall / WAF`
            : `Revoked compromised PIV certificates for correlated user account`

        set((s) => ({
          cyberThreats: s.cyberThreats.map((t) =>
            t.id === threatId
              ? {
                  ...t,
                  status: 'CONTAINED',
                  containmentActionTaken: actionText,
                }
              : t
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'SOC Analyst',
          actorRole: 'SECURITY_OFFICER',
          action: 'CYBER_CONTAINMENT_EXECUTED',
          targetEntity: 'CyberThreatEvent',
          targetId: threatId,
          outcome: 'SUCCESS',
          purpose: `Threat ${threat.eventCode} contained via ${actionType}. ${actionText}`,
        })

        get().addToast({
          title: `Containment Executed: ${threat.eventCode}`,
          message: actionText,
          type: 'warning',
        })
      },

      // Module 16: Critical Connect Interop Actions
      toggleCriticalConnectBridge: (bridgeId: string) => {
        const state = get()
        const bridge = state.criticalConnectBridges.find((b) => b.id === bridgeId)
        if (!bridge) return

        const newStatus = bridge.status === 'PATCH_ACTIVE' ? 'SUSPENDED' : 'PATCH_ACTIVE'
        set((s) => ({
          criticalConnectBridges: s.criticalConnectBridges.map((b) =>
            b.id === bridgeId ? { ...b, status: newStatus } : b
          ),
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COMM_DISPATCHER',
          action: 'CRITICAL_CONNECT_BRIDGE_TOGGLED',
          targetEntity: 'CriticalConnectBridgeSession',
          targetId: bridgeId,
          outcome: 'SUCCESS',
          purpose: `Cross-agency bridge ${bridge.bridgeId} (${bridge.localAgency} <-> ${bridge.partnerAgency}) set to ${newStatus}`,
        })

        get().addToast({
          title: `Interop Bridge ${newStatus === 'PATCH_ACTIVE' ? 'Engaged' : 'Suspended'}`,
          message: `${bridge.localTalkgroup} <-> ${bridge.partnerTalkgroup}`,
          type: newStatus === 'PATCH_ACTIVE' ? 'success' : 'info',
        })
      },

      createCriticalConnectBridge: (bridgeData) => {
        const state = get()
        const id = `cc-${Date.now()}`
        const newBridge: CriticalConnectBridgeSession = {
          ...bridgeData,
          id,
          establishedAt: new Date().toISOString(),
        }

        set((s) => ({
          criticalConnectBridges: [newBridge, ...s.criticalConnectBridges],
        }))

        state.logAuditEvent({
          agencyId: state.activeAgencyId,
          actor: state.personas.find((p) => p.id === state.activePersonaId)?.name || 'Watch Commander',
          actorRole: 'COMM_DISPATCHER',
          action: 'CRITICAL_CONNECT_BRIDGE_PROVISIONED',
          targetEntity: 'CriticalConnectBridgeSession',
          targetId: id,
          outcome: 'SUCCESS',
          purpose: `Provisioned cross-agency patch ${newBridge.bridgeId} via ${newBridge.linkType}`,
        })

        get().addToast({
          title: 'Cross-Agency Interop Bridge Established',
          message: `${newBridge.localTalkgroup} linked to ${newBridge.partnerTalkgroup}`,
          type: 'success',
        })
      },

      resetToFactoryDefaults: () => {
        set({
          activeAgencyId: 'agency-fps',
          activePersonaId: 'user-watch-cmd',
          classificationLevel: 'CUI',
          omniSearchQuery: '',
          agencies: SEED_AGENCIES,
          personas: SEED_PERSONAS,
          incidents: SEED_INCIDENTS,
          alerts: SEED_ALERTS,
          serviceHealth: SEED_SERVICE_HEALTH,
          tasks: SEED_TASKS,
          callSessions: SEED_CALL_SESSIONS,
          routingRules: SEED_ROUTING_RULES,
          psapEndpoints: SEED_PSAP_ENDPOINTS,
          operatorSessions: SEED_OPERATOR_SESSIONS,
          callRecordings: SEED_CALL_RECORDINGS,
          cameras: SEED_CAMERAS,
          videoAnalytics: SEED_VIDEO_ANALYTICS,
          privacyMasks: SEED_PRIVACY_MASKS,
          videoExports: SEED_VIDEO_EXPORTS,
          vmsHealth: SEED_VMS_HEALTH,
          accessEvents: SEED_ACCESS_EVENTS,
          portalDoors: SEED_PORTAL_DOORS,
          cardholders: SEED_CARDHOLDERS,
          accessZones: SEED_ACCESS_ZONES,
          accessControllers: SEED_ACCESS_CONTROLLERS,
          currentFpconLevel: 'BRAVO',
          tacticalAssets: SEED_TACTICAL_ASSETS,
          spatialCorrelations: SEED_SPATIAL_CORRELATIONS,
          slewTargets: SEED_SLEW_TARGETS,
          airspaceRestrictions: SEED_AIRSPACE_RESTRICTIONS,
          meshNodes: SEED_MESH_NODES,
          meshLinks: SEED_MESH_LINKS,
          missionProfiles: SEED_MISSION_PROFILES,
          manetSecurityEvents: SEED_MANET_SECURITY_EVENTS,
          tacticalGateways: SEED_TACTICAL_GATEWAYS,
          evidenceRecords: SEED_EVIDENCE_RECORDS,
          custodyEvents: SEED_CUSTODY_EVENTS,
          evidenceDerivatives: SEED_EVIDENCE_DERIVATIVES,
          disclosureGrants: SEED_DISCLOSURE_GRANTS,
          retentionPolicies: SEED_RETENTION_POLICIES,
          commSessions: SEED_COMM_SESSIONS,
          commParticipants: SEED_COMM_PARTICIPANTS,
          commGroups: SEED_COMM_GROUPS,
          commPresences: SEED_COMM_PRESENCE,
          sipTrunks: SEED_SIP_TRUNKS,
          crossDomainBridges: SEED_CROSS_DOMAIN_BRIDGES,
          massNotifications: SEED_MASS_NOTIFICATIONS,
          notificationTemplates: SEED_NOTIFICATION_TEMPLATES,
          deliveryChannels: SEED_DELIVERY_CHANNELS,
          musterReports: SEED_MUSTER_REPORTS,
          p25Talkgroups: SEED_P25_TALKGROUPS,
          otarKeys: SEED_OTAR_KEYS,
          p25RepeaterSites: SEED_P25_REPEATER_SITES,
          radioInhibitLogs: SEED_RADIO_INHIBIT_LOGS,
          radios: SEED_RADIOS,
          bwcDevices: SEED_BWC_DEVICES,
          bwcTriggers: SEED_BWC_TRIGGERS,
          bwcDockingStations: SEED_BWC_DOCKING_STATIONS,
          bwcClips: SEED_BWC_CLIPS,
          p25CoreSites: SEED_P25_CORE_SITES,
          p25ComparatorVoters: SEED_P25_COMPARATOR_VOTERS,
          microwaveLinks: SEED_MICROWAVE_LINKS,
          mobileEUDs: SEED_MOBILE_EUDS,
          atakPlugins: SEED_ATAK_PLUGINS,
          csfcGateways: SEED_CSFC_GATEWAYS,
          csfcPackages: SEED_CSFC_PACKAGES,
          depotAssets: SEED_DEPOT_ASSETS,
          depotWorkOrders: SEED_DEPOT_WORK_ORDERS,
          cyberThreats: SEED_CYBER_THREATS,
          cyberPhysicalSensors: SEED_CYBER_PHYSICAL_SENSORS,
          criticalConnectBridges: SEED_CRITICAL_CONNECT_BRIDGES,
          interAgencyRules: SEED_INTERAGENCY_RULES,
          socAlerts: SEED_SOC_ALERTS,
          auditLogs: SEED_AUDIT_LOGS,
          geofences: SEED_GEOFENCES,
          aiRecommendations: SEED_AI_RECOMMENDATIONS,
          toasts: [],
        })
        get().addToast({
          title: 'System Factory Reset',
          message: 'Synthetic demonstration state restored to default federal baseline',
          type: 'info',
        })
      },
    }),
    {
      name: 'vanguard-shield-ufsos-state',
      storage: createJSONStorage(() => localStorage),
      version: 13,
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState
        return {
          ...persistedState,
          callSessions: persistedState.callSessions?.some((c: any) => !c.coordinates)
            ? SEED_CALL_SESSIONS
            : (persistedState.callSessions || SEED_CALL_SESSIONS),
          routingRules: persistedState.routingRules || SEED_ROUTING_RULES,
          psapEndpoints: persistedState.psapEndpoints || SEED_PSAP_ENDPOINTS,
          operatorSessions: persistedState.operatorSessions || SEED_OPERATOR_SESSIONS,
          callRecordings: persistedState.callRecordings || SEED_CALL_RECORDINGS,
          cameras: persistedState.cameras?.some((c: any) => !c.streamCodec)
            ? SEED_CAMERAS
            : (persistedState.cameras || SEED_CAMERAS),
          videoAnalytics: persistedState.videoAnalytics || SEED_VIDEO_ANALYTICS,
          privacyMasks: persistedState.privacyMasks || SEED_PRIVACY_MASKS,
          videoExports: persistedState.videoExports || SEED_VIDEO_EXPORTS,
          vmsHealth: persistedState.vmsHealth || SEED_VMS_HEALTH,
          portalDoors: persistedState.portalDoors || SEED_PORTAL_DOORS,
          cardholders: persistedState.cardholders || SEED_CARDHOLDERS,
          accessZones: persistedState.accessZones || SEED_ACCESS_ZONES,
          accessControllers: persistedState.accessControllers || SEED_ACCESS_CONTROLLERS,
          currentFpconLevel: persistedState.currentFpconLevel || 'BRAVO',
          accessEvents: persistedState.accessEvents?.length >= 4 ? persistedState.accessEvents : SEED_ACCESS_EVENTS,
          tacticalAssets: persistedState.tacticalAssets || SEED_TACTICAL_ASSETS,
          spatialCorrelations: persistedState.spatialCorrelations || SEED_SPATIAL_CORRELATIONS,
          slewTargets: persistedState.slewTargets || SEED_SLEW_TARGETS,
          airspaceRestrictions: persistedState.airspaceRestrictions || SEED_AIRSPACE_RESTRICTIONS,
          meshNodes: persistedState.meshNodes || SEED_MESH_NODES,
          meshLinks: persistedState.meshLinks || SEED_MESH_LINKS,
          missionProfiles: persistedState.missionProfiles || SEED_MISSION_PROFILES,
          manetSecurityEvents: persistedState.manetSecurityEvents || SEED_MANET_SECURITY_EVENTS,
          tacticalGateways: persistedState.tacticalGateways || SEED_TACTICAL_GATEWAYS,
          evidenceRecords: persistedState.evidenceRecords || SEED_EVIDENCE_RECORDS,
          custodyEvents: persistedState.custodyEvents || SEED_CUSTODY_EVENTS,
          evidenceDerivatives: persistedState.evidenceDerivatives || SEED_EVIDENCE_DERIVATIVES,
          disclosureGrants: persistedState.disclosureGrants || SEED_DISCLOSURE_GRANTS,
          retentionPolicies: persistedState.retentionPolicies || SEED_RETENTION_POLICIES,
          commSessions: persistedState.commSessions || SEED_COMM_SESSIONS,
          commParticipants: persistedState.commParticipants || SEED_COMM_PARTICIPANTS,
          commGroups: persistedState.commGroups || SEED_COMM_GROUPS,
          commPresences: persistedState.commPresences || SEED_COMM_PRESENCE,
          sipTrunks: persistedState.sipTrunks || SEED_SIP_TRUNKS,
          crossDomainBridges: persistedState.crossDomainBridges || SEED_CROSS_DOMAIN_BRIDGES,
          massNotifications: persistedState.massNotifications || SEED_MASS_NOTIFICATIONS,
          notificationTemplates: persistedState.notificationTemplates || SEED_NOTIFICATION_TEMPLATES,
          deliveryChannels: persistedState.deliveryChannels || SEED_DELIVERY_CHANNELS,
          musterReports: persistedState.musterReports || SEED_MUSTER_REPORTS,
          p25Talkgroups: persistedState.p25Talkgroups || SEED_P25_TALKGROUPS,
          otarKeys: persistedState.otarKeys || SEED_OTAR_KEYS,
          p25RepeaterSites: persistedState.p25RepeaterSites || SEED_P25_REPEATER_SITES,
          radioInhibitLogs: persistedState.radioInhibitLogs || SEED_RADIO_INHIBIT_LOGS,
          radios: persistedState.radios || SEED_RADIOS,
          bwcDevices: persistedState.bwcDevices || SEED_BWC_DEVICES,
          bwcTriggers: persistedState.bwcTriggers || SEED_BWC_TRIGGERS,
          bwcDockingStations: persistedState.bwcDockingStations || SEED_BWC_DOCKING_STATIONS,
          bwcClips: persistedState.bwcClips || SEED_BWC_CLIPS,
          p25CoreSites: persistedState.p25CoreSites || SEED_P25_CORE_SITES,
          p25ComparatorVoters: persistedState.p25ComparatorVoters || SEED_P25_COMPARATOR_VOTERS,
          microwaveLinks: persistedState.microwaveLinks || SEED_MICROWAVE_LINKS,
          mobileEUDs: persistedState.mobileEUDs || SEED_MOBILE_EUDS,
          atakPlugins: persistedState.atakPlugins || SEED_ATAK_PLUGINS,
          csfcGateways: persistedState.csfcGateways || SEED_CSFC_GATEWAYS,
          csfcPackages: persistedState.csfcPackages || SEED_CSFC_PACKAGES,
          depotAssets: persistedState.depotAssets || SEED_DEPOT_ASSETS,
          depotWorkOrders: persistedState.depotWorkOrders || SEED_DEPOT_WORK_ORDERS,
          cyberThreats: persistedState.cyberThreats || SEED_CYBER_THREATS,
          cyberPhysicalSensors: persistedState.cyberPhysicalSensors || SEED_CYBER_PHYSICAL_SENSORS,
          criticalConnectBridges: persistedState.criticalConnectBridges || SEED_CRITICAL_CONNECT_BRIDGES,
          interAgencyRules: persistedState.interAgencyRules || SEED_INTERAGENCY_RULES,
        }
      },
    }
  )
)
