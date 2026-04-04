import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { copyProceduresToEngagement } from '@/server/actions/riskCatalog';

// POST /api/settings/risk-catalog/procedures/copy-to-engagement
export const POST = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { catalogProcedureIds, engagementId, objectiveId } = body;

      if (!Array.isArray(catalogProcedureIds) || !engagementId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'catalogProcedureIds and engagementId are required' } },
          { status: 400 },
        );
      }

      const data = await copyProceduresToEngagement(catalogProcedureIds, engagementId, objectiveId);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to copy procedures';
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
