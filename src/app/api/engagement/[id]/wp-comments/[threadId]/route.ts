import { withAccess } from '@/server/middleware/withAccess';
import {
  addCommentToThread,
  updateThreadStatus,
  deleteCommentThread,
} from '@/server/actions/engagement';

// POST /api/engagement/[id]/wp-comments/[threadId] — add reply
// Body: { content }
export const POST = withAccess('engagement:update', async (req, context, session) => {
  const { threadId } = await context.params;
  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== 'string') {
    return Response.json(
      { error: { code: 'INVALID_INPUT', message: 'content is required' } },
      { status: 400 },
    );
  }

  const comment = await addCommentToThread(threadId, content, session.user.id, session.user.name);
  return Response.json({
    data: {
      id: comment.id,
      threadId: comment.thread_id,
      content: comment.content,
      authorId: comment.author_id,
      createdAt: comment.created_at.toISOString(),
      updatedAt: comment.updated_at.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatarUrl: comment.author.avatar_url,
      },
    },
  });
});

// PATCH /api/engagement/[id]/wp-comments/[threadId] — update thread status
// Body: { status: "open" | "resolved" | "detached" }
export const PATCH = withAccess('engagement:update', async (req, context, session) => {
  const { threadId } = await context.params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['open', 'resolved', 'detached'].includes(status)) {
    return Response.json(
      { error: { code: 'INVALID_INPUT', message: 'status must be open, resolved, or detached' } },
      { status: 400 },
    );
  }

  const thread = await updateThreadStatus(threadId, status, session.user.id, session.user.name);
  return Response.json({
    data: {
      id: thread.id,
      status: thread.status,
    },
  });
});

// DELETE /api/engagement/[id]/wp-comments/[threadId] — delete thread
export const DELETE = withAccess('engagement:update', async (_req, context, session) => {
  const { threadId } = await context.params;
  await deleteCommentThread(threadId, session.user.id, session.user.name);
  return Response.json({ data: { success: true } });
});
