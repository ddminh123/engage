import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getRiskCatalogTree, createRiskCatalogDomain } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/domains
export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest) => {
    const data = await getRiskCatalogTree();
    return Response.json({ data });
  },
);

// POST /api/settings/risk-catalog/domains
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createRiskCatalogDomain(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create domain';
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
