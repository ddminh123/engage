import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { reorderItems } from '@/server/actions/engagement';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, _context: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const body = await req.json();
      const data = await reorderItems(body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'REORDER_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
