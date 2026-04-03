import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getControlCatalogItems, createControlCatalogItem } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/controls
export const GET = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const controlType = searchParams.get('controlType') || undefined;
    const source = searchParams.get('source') || undefined;
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const domainId = searchParams.get('domainId') || undefined;

    const data = await getControlCatalogItems({ controlType, source, search, categoryId, domainId });
    return Response.json({ data });
  },
);

// POST /api/settings/risk-catalog/controls
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createControlCatalogItem(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create control';
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
