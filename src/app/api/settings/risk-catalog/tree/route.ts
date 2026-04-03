import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getRiskCatalogTree } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/tree
export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest) => {
    try {
      const data = await getRiskCatalogTree();
      return Response.json({ data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch risk catalog tree';
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
