import { NextRequest } from 'next/server';
import { withAccess, Session } from '@/server/middleware/withAccess';
import {
  getOrgUnits,
  createOrgUnit,
  OrgUnitFilters,
  CreateOrgUnitInput,
} from '@/server/actions/orgUnit';

// GET /api/settings/org-units
export const GET = withAccess('settings:read', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const filters: OrgUnitFilters = {};

  const status = searchParams.get('status');
  if (status === 'active' || status === 'inactive') {
    filters.status = status;
  }

  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }

  const parentId = searchParams.get('parentId');
  if (parentId !== null) {
    filters.parentId = parentId === '' ? null : parentId;
  }

  const units = await getOrgUnits(filters);

  return Response.json({ data: units });
});

// POST /api/settings/org-units
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, _context, session: Session) => {
    const body = (await req.json()) as CreateOrgUnitInput;

    if (!body.name?.trim()) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 400 }
      );
    }

    try {
      const unit = await createOrgUnit(
        body,
        session.user.id,
        session.user.name
      );
      return Response.json({ data: unit }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create unit';
      return Response.json(
        { error: { code: 'CREATE_ERROR', message } },
        { status: 400 }
      );
    }
  }
);
