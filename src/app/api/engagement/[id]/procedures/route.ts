import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { createProcedure } from '@/server/actions/engagement';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await createProcedure(id, body, session.user.id, session.user.name);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'CREATE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
