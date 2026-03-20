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
