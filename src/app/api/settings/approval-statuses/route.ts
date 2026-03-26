import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getStatuses, createStatus } from '@/server/actions/approvalStatus';

export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const data = await getStatuses();
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    try {
      const body = await req.json();
      const data = await createStatus(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const err = error as Error & { code?: string };
      const status = err.code === 'DUPLICATE_KEY' ? 409 : 400;
      return Response.json(
        { error: { code: err.code ?? 'VALIDATION_ERROR', message: err.message } },
        { status },
      );
    }
  },
);
