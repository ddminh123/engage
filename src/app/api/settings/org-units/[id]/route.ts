import { NextRequest } from 'next/server';
import { withAccess, Session } from '@/server/middleware/withAccess';
import {
  getOrgUnitById,
  updateOrgUnit,
  deleteOrgUnit,
  UpdateOrgUnitInput,
} from '@/server/actions/orgUnit';

// GET /api/settings/org-units/[id]
export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params;

    const unit = await getOrgUnitById(id);

    if (!unit) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Unit not found' } },
        { status: 404 }
      );
    }

    return Response.json({ data: unit });
  }
);

// PATCH /api/settings/org-units/[id]
export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateOrgUnitInput;

    try {
      const unit = await updateOrgUnit(
        id,
        body,
        session.user.id,
        session.user.name
      );
      return Response.json({ data: unit });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update unit';

      if (message === 'Unit not found') {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 }
        );
      }

      return Response.json(
        { error: { code: 'UPDATE_ERROR', message } },
        { status: 400 }
      );
    }
  }
);

// DELETE /api/settings/org-units/[id]
export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;

    try {
      await deleteOrgUnit(id, session.user.id, session.user.name);
      return Response.json({ data: { success: true } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete unit';

      if (message === 'Unit not found') {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 }
        );
      }

      return Response.json(
        { error: { code: 'DELETE_ERROR', message } },
        { status: 400 }
      );
    }
  }
);
