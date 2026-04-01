import { withAccess } from '@/server/middleware/withAccess';
import { deleteTemplateBinding } from '@/server/actions/template';

export const DELETE = withAccess(
  'settings:manage',
  async (_req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      const { entityType } = await ctx.params;
      await deleteTemplateBinding(entityType);
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
