import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { saveWorkpaperContent } from '@/server/actions/workpaperContent';

export const PATCH = withAccess(
  'engagement:update',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const { wpId } = await ctx.params;
      const body = await req.json();

      await saveWorkpaperContent(
        'planning_workpaper',
        wpId,
        body.content,
        session.user.id,
        session.user.name,
      );

      return Response.json({ data: { ok: true } });
    } catch (error) {
      return Response.json(
        { error: { code: 'SERVER_ERROR', message: (error as Error).message } },
        { status: 500 },
      );
    }
  },
);
