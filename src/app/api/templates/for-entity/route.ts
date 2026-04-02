import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getTemplateForEntity } from '@/server/actions/template';

export const GET = withAccess(
  'engagement:view',
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const subType = searchParams.get('subType') ?? '';
    if (!entityType) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'entityType query param is required' } },
        { status: 400 },
      );
    }
    const data = await getTemplateForEntity(entityType, subType);
    return Response.json({ data });
  },
);
