import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { listRiskAssessments, createRiskAssessment } from '@/server/actions/universe';

export const GET = withAccess(
  'universe:view',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    const data = await listRiskAssessments(id);
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'universe:edit',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await createRiskAssessment(
        { ...body, entityId: id },
        session.user.id,
        session.user.name,
      );
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
