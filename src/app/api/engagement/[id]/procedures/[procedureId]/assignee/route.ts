import { withAccess } from '@/server/middleware/withAccess';
import { updateProcedureAssignee } from '@/server/actions/engagement';

export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { procedureId } = await context.params;
  const body = await req.json();
  const { field, assigneeId } = body as { field: 'performed_by' | 'reviewed_by'; assigneeId: string | null };

  if (!['performed_by', 'reviewed_by'].includes(field)) {
    return Response.json({ error: { code: 'INVALID_FIELD', message: 'Field must be performed_by or reviewed_by' } }, { status: 400 });
  }

  const data = await updateProcedureAssignee(procedureId, field, assigneeId, session.user.id, session.user.name);
  return Response.json({ data });
});
