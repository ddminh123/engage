import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { listTemplateCategories, createTemplateCategory } from '@/server/actions/template';

export const GET = withAccess(
  'settings:manage',
  async () => {
    const data = await listTemplateCategories();
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createTemplateCategory(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
