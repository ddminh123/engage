import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getTemplateById, updateTemplate, deleteTemplate } from '@/server/actions/template';

export const GET = withAccess(
  'settings:manage',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const { id } = await ctx.params;
    try {
      const data = await getTemplateById(id);
      return Response.json({ data });
    } catch {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Template not found' } },
        { status: 404 },
      );
    }
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      const data = await updateTemplate(id, body);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'UPDATE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);

export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const { id } = await ctx.params;
    try {
      await deleteTemplate(id);
      return Response.json({ data: { success: true } });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'DELETE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
