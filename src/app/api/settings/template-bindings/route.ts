import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { listTemplateBindings, upsertTemplateBinding } from '@/server/actions/template';

export const GET = withAccess(
  'settings:manage',
  async () => {
    const data = await listTemplateBindings();
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { entityType, templateId } = body;
      if (!entityType || !templateId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'entityType and templateId are required' } },
          { status: 400 },
        );
      }
      const data = await upsertTemplateBinding(entityType, templateId);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
