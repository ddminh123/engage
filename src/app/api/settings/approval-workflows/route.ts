import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getWorkflows, createWorkflow } from '@/server/actions/approvalWorkflow';

export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const data = await getWorkflows();
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    try {
      const body = await req.json();
      const data = await createWorkflow(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('already exists') ? 409 : 400;
      return Response.json(
        { error: { code: status === 409 ? 'CONFLICT' : 'VALIDATION_ERROR', message } },
        { status },
      );
    }
  },
);
