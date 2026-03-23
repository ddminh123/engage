import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { listTemplates, createTemplate } from '@/server/actions/template';

export const GET = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const isActive = searchParams.has('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;
    const data = await listTemplates({ entity_type: entityType, category_id: categoryId, is_active: isActive });
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, _ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const body = await req.json();
      const data = await createTemplate(body, session.user.id);
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
