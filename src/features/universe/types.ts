export interface AuditableEntity {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  entityTypeId: string | null;
  entityType: { id: string; name: string } | null;
  areas: { id: string; name: string }[];
  ownerUnits: { id: string; name: string }[];
  participatingUnits: { id: string; name: string }[];
  status: 'active' | 'inactive' | 'archived';
  auditCycle: string | null;
  riskScore: number | null;
  riskLevel: string | null;
  inherentRiskScore: number | null;
  inherentRiskLevel: string | null;
  auditSponsors: { id: string; name: string; position: string | null }[];
  auditeeReps: { id: string; name: string; position: string | null }[];
  contactPoints: { id: string; name: string; position: string | null }[];
  lastAuditedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Latest risk assessment — source of truth for display
  latestAssessmentId: string | null;
  latestInherentLevel: string | null;
  latestInherentScore: number | null;
  latestInherentImpact: number | null;
  latestInherentLikelihood: number | null;
  latestControlEffectiveness: string | null;
  latestResidualLevel: string | null;
  latestResidualScore: number | null;
}

export interface EntityInput {
  name: string;
  code?: string | null;
  description?: string | null;
  entityTypeId: string;
  areaIds: string[];
  ownerUnitIds: string[];
  participatingUnitIds?: string[];
  status?: 'active' | 'inactive' | 'archived';
  auditCycle?: string | null;
  lastAuditedAt?: string | null;
  auditSponsorIds?: string[];
  auditeeRepIds?: string[];
  contactPointIds?: string[];
}

export interface RiskFactorsByCategory {
  impact: string[];
  likelihood: string[];
  control: string[];
}

export interface RiskAssessment {
  id: string;
  entityId: string;
  // Section 1: Inherent Risk
  inherentScore: number;
  inherentLevel: string;
  inherentImpact: number | null;
  inherentLikelihood: number | null;
  impactRationale: string | null;
  likelihoodRationale: string | null;
  // Section 2: Control Environment
  controlEffectiveness: string | null;
  controlRationale: string | null;
  // Section 3: Assessment Info
  riskFactors: RiskFactorsByCategory;
  assessmentSourceId: string | null;
  note: string | null;
  managementRequest: boolean;
  // Section 4: Residual Risk
  residualScore: number | null;
  residualLevel: string | null;
  conclusion: string | null;
  // Section 5: Metadata
  evaluatedBy: string | null;
  approvedBy: string | null;
  evaluationDate: string;
}

export interface RiskAssessmentInput {
  entityId: string;
  inherentScore: number;
  inherentImpact?: number | null;
  inherentLikelihood?: number | null;
  impactRationale?: string | null;
  likelihoodRationale?: string | null;
  controlEffectiveness?: string | null;
  controlRationale?: string | null;
  riskFactors?: RiskFactorsByCategory;
  assessmentSourceId?: string | null;
  note?: string | null;
  managementRequest?: boolean;
  residualScore?: number | null;
  residualLevel?: string | null;
  conclusion?: string | null;
  evaluatedBy?: string | null;
  approvedBy?: string | null;
  evaluationDate?: string | null;
}

export interface AssessmentSource {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSourceInput {
  name: string;
  code?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface RiskAssessmentFactor {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  relatesTo: 'impact' | 'likelihood' | 'control';
  isPositive: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessmentFactorInput {
  name: string;
  code?: string | null;
  description?: string | null;
  relates_to?: 'impact' | 'likelihood' | 'control';
  is_positive?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

// Backward-compatible aliases
export type RiskFactor = RiskAssessmentFactor;
export type RiskFactorInput = RiskAssessmentFactorInput;
