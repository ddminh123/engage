import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { getWorkflowSignoffTypes } from '@/server/actions/approvalEngine';

export const GET = withAccess(
  'engagement:read',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { entityType } = await context.params;
    try {
      const data = await getWorkflowSignoffTypes(entityType);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 400 });
    }
  },
);
