import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { listRiskAssessmentFactors, createRiskAssessmentFactor } from '@/server/actions/risk-factors';

export const GET = withAccess(
  'settings:manage',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const data = await listRiskAssessmentFactors(includeInactive);
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const body = await req.json();
      const data = await createRiskAssessmentFactor(body, session.user.id, session.user.name);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('required') || message.includes('parse') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
