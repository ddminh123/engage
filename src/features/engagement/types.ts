// =============================================================================
// ENGAGEMENT MEMBER
// =============================================================================

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  title: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface EngagementMember {
  userId: string;
  role: string;
  joinedAt: string;
  user: MemberUser;
}

// =============================================================================
// WP ASSIGNMENT (multi-assignee for work program items)
// =============================================================================

export interface WpAssignment {
  id: string;
  userId: string;
  entityType: 'section' | 'objective' | 'procedure';
  entityId: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string | null;
    avatarUrl: string | null;
  };
}

// =============================================================================
// WP COMMENTS (inline document comments)
// =============================================================================

export interface WpCommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface WpComment {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: WpCommentAuthor;
}

export type WpThreadType = 'comment' | 'review_note';

export interface WpCommentThread {
  id: string;
  entityType: string;
  entityId: string;
  threadType: WpThreadType;
  quote: string | null;
  contentAnchor: string | null;
  status: 'open' | 'resolved' | 'detached';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: WpCommentAuthor;
  comments: WpComment[];
}

// =============================================================================
// ENGAGEMENT
// =============================================================================

export interface EngagementEntity {
  id: string;
  name: string;
  code: string | null;
  entityType: { id: string; name: string } | null;
}

export interface EngagementEntityDetail extends EngagementEntity {
  riskLevel: string | null;
  inherentRiskLevel: string | null;
  ownerUnits: { id: string; name: string }[];
  areas: { id: string; name: string }[];
}

export interface EngagementSummary {
  id: string;
  title: string;
  entityId: string;
  plannedAuditId: string | null;
  status: string;
  objective: string | null;
  startDate: string;
  endDate: string;
  estimatedDays: number | null;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
  entity: EngagementEntity | null;
  plannedAudit: { id: string; planId: string } | null;
  counts: {
    sections: number;
    procedures: number;
    findings: number;
  };
}

export interface ContactRef {
  id: string;
  name: string;
  position: string | null;
}

export interface EngagementDetail {
  id: string;
  title: string;
  entityId: string;
  plannedAuditId: string | null;
  status: string;
  objective: string | null;
  scope: string | null;
  startDate: string;
  endDate: string;
  estimatedDays: number | null;
  priority: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  entity: EngagementEntityDetail | null;
  plannedAudit: {
    id: string;
    planId: string;
    plan: { id: string; title: string } | null;
  } | null;
  understanding: string | null;
  wpApprovalStatus: string;
  wpApprovedBy: string | null;
  wpApprovedAt: string | null;
  wpApprovedVersion: number | null;
  members: EngagementMember[];
  ownerUnits: { id: string; name: string }[];
  participatingUnits: { id: string; name: string }[];
  contactPoints: ContactRef[];
  auditeeReps: ContactRef[];
  sections: EngagementSection[];
  standaloneObjectives: EngagementObjective[];
  ungroupedProcedures: EngagementProcedure[];
  findings: DraftFinding[];
  auditObjectives: AuditObjective[];
  rcmObjectives: RcmObjective[];
  risks: EngagementRisk[];
}

export interface EngagementInput {
  title: string;
  entityId: string;
  plannedAuditId?: string | null;
  objective?: string | null;
  scope?: string | null;
  startDate: string;
  endDate: string;
  estimatedDays?: number | null;
  priority?: string | null;
  notes?: string | null;
  ownerUnitIds?: string[];
  participatingUnitIds?: string[];
  contactPointIds?: string[];
  auditeeRepIds?: string[];
}

export interface EngagementUpdateInput {
  title?: string;
  objective?: string | null;
  scope?: string | null;
  understanding?: string | null;
  startDate?: string;
  endDate?: string;
  estimatedDays?: number | null;
  priority?: string | null;
  notes?: string | null;
  status?: string;
  ownerUnitIds?: string[];
  participatingUnitIds?: string[];
  contactPointIds?: string[];
  auditeeRepIds?: string[];
}

// =============================================================================
// WORK PROGRAM
// =============================================================================

export interface EngagementSection {
  id: string;
  engagementId: string;
  title: string;
  description: string | null;
  status: string;
  addedFrom: string;
  phase: string;
  planningRefId: string | null;
  source: string;
  sortOrder: number;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  objectives: EngagementObjective[];
  procedures: EngagementProcedure[]; // procedures directly under section
}

export interface EngagementObjective {
  id: string;
  sectionId: string | null;
  title: string;
  description: string | null;
  status: string;
  addedFrom: string;
  phase: string;
  planningRefId: string | null;
  source: string;
  sortOrder: number;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  procedures: EngagementProcedure[];
}

export interface EngagementProcedure {
  id: string;
  engagementId: string;
  sectionId: string | null;
  objectiveId: string | null;
  title: string;
  description: string | null;
  procedures: string | null;
  procedureType: string | null;
  procedureCategory: string | null;
  status: string;
  approvalStatus: string;
  currentVersion: number;
  approvedBy: string | null;
  approvedAt: string | null;
  approvedVersion: number | null;
  addedFrom: string;
  phase: string;
  planningRefId: string | null;
  source: string;
  observations: string | null;
  conclusion: string | null;
  effectiveness: string | null;
  sampleSize: number | null;
  exceptions: number | null;
  sortOrder: number;
  priority: string | null;
  content: unknown | null;
  reviewNotes: string | null;
  performedBy: string | null;
  reviewedBy: string | null;
  performedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  linkedFindings: { id: string; title: string }[];
  linkedControls: { id: string; description: string }[];
  linkedRisks: { id: string; riskDescription: string }[];
  linkedObjectives: { id: string; title: string }[];
}

export interface ProcedureInput {
  title: string;
  description?: string | null;
  procedures?: string | null;
  procedureType?: string | null;
  procedureCategory?: string | null;
  sectionId?: string | null;
  objectiveId?: string | null;
  priority?: string | null;
  addedFrom?: string;
  sortOrder?: number;
  controlRefIds?: string[];
  riskRefIds?: string[];
  objectiveRefIds?: string[];
}

export interface ProcedureUpdateInput {
  title?: string;
  description?: string | null;
  procedures?: string | null;
  procedureType?: string | null;
  procedureCategory?: string | null;
  priority?: string | null;
  sortOrder?: number;
  status?: string;
  observations?: string | null;
  conclusion?: string | null;
  effectiveness?: string | null;
  sampleSize?: number | null;
  exceptions?: number | null;
  reviewNotes?: string | null;
  controlRefIds?: string[];
  riskRefIds?: string[];
  objectiveRefIds?: string[];
  sectionId?: string | null;
  objectiveId?: string | null;
}

export interface SectionInput {
  title: string;
  description?: string | null;
  addedFrom?: string;
  sortOrder?: number;
}

export interface SectionUpdateInput extends Partial<SectionInput> {
  status?: string;
  reviewNotes?: string | null;
}

export interface ObjectiveInput {
  title: string;
  description?: string | null;
  addedFrom?: string;
  sortOrder?: number;
}

export interface ObjectiveUpdateInput extends Partial<ObjectiveInput> {
  status?: string;
  reviewNotes?: string | null;
  sectionId?: string | null;
}

// =============================================================================
// DRAFT FINDING
// =============================================================================

export interface DraftFinding {
  id: string;
  engagementId: string;
  title: string;
  description: string | null;
  riskRating: string | null;
  status: string;
  recommendation: string | null;
  managementResponse: string | null;
  rootCause: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  linkedProcedures: { id: string; title: string }[];
  riskOwners: ContactRef[];
  unitOwners: { id: string; name: string }[];
}

export interface FindingInput {
  title: string;
  description?: string | null;
  riskRating?: string | null;
  recommendation?: string | null;
  managementResponse?: string | null;
  rootCause?: string | null;
  procedureIds?: string[];
  riskOwnerIds?: string[];
  unitOwnerIds?: string[];
}

export interface FindingUpdateInput extends Partial<FindingInput> {
  status?: string;
  riskOwnerIds?: string[];
  unitOwnerIds?: string[];
}

// =============================================================================
// AUDIT OBJECTIVE (Planning-level)
// =============================================================================

export interface AuditObjective {
  id: string;
  engagementId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface AuditObjectiveInput {
  title: string;
  description?: string | null;
  sortOrder?: number;
}

export interface AuditObjectiveUpdateInput extends Partial<AuditObjectiveInput> {}

// =============================================================================
// ENGAGEMENT RISK (RACM light)
// =============================================================================

export interface EngagementRisk {
  id: string;
  engagementId: string;
  rcmObjectiveId: string | null;
  riskDescription: string;
  riskRating: string | null;
  sortOrder: number;
  rcmObjective: { id: string; title: string } | null;
  controls: EngagementControl[];
}

export interface EngagementRiskInput {
  rcmObjectiveId?: string | null;
  riskDescription: string;
  riskRating?: string | null;
  sortOrder?: number;
}

export interface EngagementRiskUpdateInput extends Partial<EngagementRiskInput> {}

// =============================================================================
// RCM OBJECTIVE (detached copy of AuditObjective for independent RCM editing)
// =============================================================================

export interface RcmObjective {
  id: string;
  engagementId: string;
  auditObjectiveId: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
  risks: EngagementRisk[];
}

export interface RcmObjectiveInput {
  auditObjectiveId?: string | null;
  title: string;
  description?: string | null;
  sortOrder?: number;
}

export interface RcmObjectiveUpdateInput {
  title?: string;
  description?: string | null;
  sortOrder?: number;
}

// =============================================================================
// ENGAGEMENT CONTROL (under a risk)
// =============================================================================

export interface EngagementControl {
  id: string;
  riskId: string;
  description: string;
  effectiveness: string | null;
  sortOrder: number;
}

export interface EngagementControlInput {
  description: string;
  effectiveness?: string | null;
  sortOrder?: number;
}

export interface EngagementControlUpdateInput extends Partial<EngagementControlInput> {}

// =============================================================================
// ENTITY VERSIONING
// =============================================================================

export interface EntityVersionSummary {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  comment: string | null;
  publishedBy: string;
  publishedAt: string;
  publisher: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface EntityVersionDetail extends EntityVersionSummary {
  snapshot: Record<string, unknown>;
}

// =============================================================================
// APPROVAL TRANSITIONS
// =============================================================================

export interface AvailableTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
  actionLabel: string;
  actionType: string;
}
