import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getPlans, createPlan } from '@/server/actions/plan';

export const GET = withAccess(
  'plan:read',
  async (_req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const data = await getPlans();
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'plan:create',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const body = await req.json();
      const data = await createPlan(body, session.user.id, session.user.name);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('required') || message.includes('validation') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
