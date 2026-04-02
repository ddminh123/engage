import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { deleteTemplateBinding } from '@/server/actions/template';

export const DELETE = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      const { entityType } = await ctx.params;
      const subType = new URL(req.url).searchParams.get('subType') ?? '';
      await deleteTemplateBinding(entityType, subType);
      return Response.json({ data: { success: true } });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 500;
      return Response.json(
        { error: { code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
