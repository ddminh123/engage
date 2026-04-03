import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getRiskCatalogTree, createRiskCatalogCategory } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/categories
export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest) => {
    const data = await getRiskCatalogTree();
    return Response.json({ data });
  },
);

// POST /api/settings/risk-catalog/categories
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createRiskCatalogCategory(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create category';
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
