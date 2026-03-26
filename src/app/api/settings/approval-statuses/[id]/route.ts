import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getStatus, updateStatus, archiveStatus, restoreStatus } from '@/server/actions/approvalStatus';

export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    const data = await getStatus(id);
    return Response.json({ data });
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      // Support restore action
      if (body.restore === true) {
        const data = await restoreStatus(id);
        return Response.json({ data });
      }
      const data = await updateStatus(id, body);
      return Response.json({ data });
    } catch (error) {
      const err = error as Error & { code?: string };
      const status = err.code === 'SYSTEM_STATUS' ? 403 : 400;
      return Response.json(
        { error: { code: err.code ?? 'VALIDATION_ERROR', message: err.message } },
        { status },
      );
    }
  },
);

export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const data = await archiveStatus(id);
      return Response.json({ data });
    } catch (error) {
      const err = error as Error & { code?: string };
      let status = 400;
      if (err.code === 'SYSTEM_STATUS') status = 403;
      if (err.code === 'STATUS_IN_USE') status = 409;
      if (err.code === 'STATUS_HAS_ENTITIES') status = 409;
      return Response.json(
        { error: { code: err.code ?? 'VALIDATION_ERROR', message: err.message } },
        { status },
      );
    }
  },
);
