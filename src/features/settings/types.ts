export interface Contact {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  unitId: string | null;
  unitName: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInput {
  id?: string;
  name: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  unitId?: string | null;
  status?: 'active' | 'inactive';
}

export interface OrgUnit {
  id: string;
  name: string;
  code: string | null;
  parentId: string | null;
  parentName: string | null;
  leaderId: string | null;
  leader: Contact | null;
  contactPointId: string | null;
  contactPoint: Contact | null;
  description: string | null;
  status: 'active' | 'inactive';
  established: string | null;
  discontinued: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  childrenCount?: number;
  children?: OrgUnitChild[];
}

export interface OrgUnitChild {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface OrgUnitCreateInput {
  name: string;
  code?: string | null;
  parentId?: string | null;
  leader?: ContactInput | null;
  contactPoint?: ContactInput | null;
  description?: string | null;
  status?: 'active' | 'inactive';
  established?: string | null;
  discontinued?: string | null;
}

export type OrgUnitUpdateInput = Partial<OrgUnitCreateInput>;

export interface OrgUnitFilters {
  status?: 'active' | 'inactive';
  search?: string;
  parentId?: string | null;
}

// =============================================================================
// ENTITY TYPE (Loại đối tượng kiểm toán)
// =============================================================================

export interface EntityType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EntityTypeInput {
  name: string;
  code?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

// =============================================================================
// AUDIT AREA (Lĩnh vực kiểm toán)
// =============================================================================

export interface AuditArea {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditAreaInput {
  name: string;
  code?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

// =============================================================================
// TEMPLATE CATEGORY (Danh mục mẫu)
// =============================================================================

export interface TemplateCategoryChild {
  id: string;
  name: string;
  sortOrder: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  templateCount: number;
  children?: TemplateCategoryChild[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategoryInput {
  name: string;
  parent_id?: string | null;
  sort_order?: number;
}

// =============================================================================
// TEMPLATE (Mẫu workpaper)
// =============================================================================

export interface Template {
  id: string;
  name: string;
  description: string | null;
  content: unknown;
  entityType: string;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
  createdBy: string;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateInput {
  name: string;
  description?: string | null;
  content?: unknown;
  entity_type: string;
  category_id?: string | null;
  is_active?: boolean;
}

// =============================================================================
// TEMPLATE ENTITY BINDING (Gán mẫu cho loại thực thể)
// =============================================================================

export interface TemplateEntityBinding {
  id: string;
  entityType: string;
  subType: string;
  templateId: string;
  templateName: string;
  templateEntityType: string;
  templateIsActive: boolean;
}

export interface TemplateEntityBindingInput {
  entityType: string;
  templateId: string;
  subType?: string;
}

export interface TemplateForEntity {
  id: string;
  name: string;
  content: unknown;
}

export interface ApprovalWorkflowTransition {
  id: string;
  workflowId: string;
  fromStatus: string;
  toStatus: string;
  actionLabel: string;
  actionType: 'start' | 'submit' | 'review' | 'approve' | 'reject' | 'revise';
  allowedRoles: string[];
  sortOrder: number;
  generatesSignoff: boolean;
  signoffType: string | null;
}

export interface ApprovalEntityBinding {
  id: string;
  entityType: string;
  subType: string;
  workflowId: string;
  label: string | null;
}

export interface ApprovalWorkflow {
  id: string;
  entityType: string | null;
  name: string;
  allowSelfApproval: boolean;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  transitions: ApprovalWorkflowTransition[];
  entityBindings: ApprovalEntityBinding[];
}

export interface ApprovalWorkflowInput {
  entityType?: string;
  name: string;
  allowSelfApproval?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface EntityBindingInput {
  entityType: string;
  subType?: string;
  workflowId: string;
  label?: string;
}

export interface ApprovalWorkflowUpdateInput {
  name?: string;
  allowSelfApproval?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface ApprovalTransitionInput {
  fromStatus: string;
  toStatus: string;
  actionLabel: string;
  actionType: 'start' | 'submit' | 'review' | 'approve' | 'reject' | 'revise';
  allowedRoles: string[];
  sortOrder?: number;
  generatesSignoff?: boolean;
  signoffType?: string | null;
}

// =============================================================================
// APPROVAL STATUS (Dynamic status definitions)
// =============================================================================

export type StatusCategory = 'open' | 'active' | 'review' | 'done';

export interface ApprovalStatusItem {
  id: string;
  key: string;
  label: string;
  color: string;
  category: StatusCategory;
  isSystem: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStatusInput {
  key: string;
  label: string;
  color: string;
  category: StatusCategory;
  sortOrder?: number;
}

export interface ApprovalStatusUpdateInput {
  label?: string;
  color?: string;
  category?: StatusCategory;
  sortOrder?: number;
}

// =============================================================================
// PLANNING STEP CONFIG (Cấu hình bước kế hoạch)
// =============================================================================

export interface PlanningStepConfig {
  id: string;
  key: string;
  title: string;
  icon: string | null;
  stepType: 'fixed' | 'workpaper';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanningStepConfigInput {
  title: string;
  icon?: string | null;
  step_type?: 'fixed' | 'workpaper';
  is_active?: boolean;
}

export interface PlanningStepConfigUpdateInput {
  title?: string;
  icon?: string | null;
  is_active?: boolean;
  sort_order?: number;
}
