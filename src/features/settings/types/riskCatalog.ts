export interface RiskCatalogDomain {
  id: string;
  name: string;
  code: string;
  framework: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  categories: RiskCatalogCategory[];
}

export interface RiskCatalogCategory {
  id: string;
  domainId: string;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { risks: number };
  domain?: { id: string; name: string; code: string };
}

export interface RiskCatalogItem {
  id: string;
  categoryId: string;
  name: string;
  code: string | null;
  description: string | null;
  riskType: string | null;
  riskRating: string | null;
  likelihood: string | null;
  impact: string | null;
  frameworkRef: string | null;
  source: string;
  isActive: boolean;
  sortOrder: number;
  category?: RiskCatalogCategory & { domain?: RiskCatalogDomain };
  controlRefs?: { control: ControlCatalogItem }[];
}

export interface ControlCatalogItem {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  controlType: string | null;
  controlNature: string | null;
  frequency: string | null;
  frameworkRef: string | null;
  source: string;
  isActive: boolean;
  sortOrder: number;
  riskRefs?: { risk: RiskCatalogItem }[];
  procedureRefs?: { procedure: ProcedureCatalogItem }[];
}

export interface ProcedureCatalogItem {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  procedureType: string | null;
  procedureCategory: string | null;
  frameworkRef: string | null;
  source: string;
  isActive: boolean;
  sortOrder: number;
  controlRefs?: { control: ControlCatalogItem }[];
}

export interface RiskCatalogItemFilters {
  categoryId?: string;
  domainId?: string;
  source?: string;
  riskType?: string;
  search?: string;
}

export interface ControlCatalogItemFilters {
  source?: string;
  controlType?: string;
  search?: string;
}

export interface ProcedureCatalogItemFilters {
  source?: string;
  procedureType?: string;
  search?: string;
}

export interface CopyRisksToEngagementInput {
  catalogRiskIds: string[];
  engagementId: string;
  rcmObjectiveId?: string;
}

export interface CopyControlsToEngagementInput {
  catalogControlIds: string[];
  engagementId: string;
}
