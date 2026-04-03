import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getRiskCatalogItems, createRiskCatalogItem } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/risks
export const GET = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const domainId = searchParams.get('domainId') || undefined;
    const riskType = searchParams.get('riskType') || undefined;
    const source = searchParams.get('source') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getRiskCatalogItems({ categoryId, domainId, riskType, source, search });
    return Response.json({ data });
  },
);

// POST /api/settings/risk-catalog/risks
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createRiskCatalogItem(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create risk';
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
