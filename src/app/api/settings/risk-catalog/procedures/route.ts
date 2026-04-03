import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getProcedureCatalogItems, createProcedureCatalogItem } from '@/server/actions/riskCatalog';

// GET /api/settings/risk-catalog/procedures
export const GET = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const procedureType = searchParams.get('procedureType') || undefined;
    const source = searchParams.get('source') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getProcedureCatalogItems({ procedureType, source, search });
    return Response.json({ data });
  },
);

// POST /api/settings/risk-catalog/procedures
export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await createProcedureCatalogItem(body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create procedure';
      const status = message.includes('required') ? 400 : 500;
      return Response.json(
        { error: { code: status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message } },
        { status },
      );
    }
  },
);
