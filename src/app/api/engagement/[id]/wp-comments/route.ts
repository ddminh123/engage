import { withAccess } from '@/server/middleware/withAccess';
import {
  getCommentThreads,
  createCommentThread,
} from '@/server/actions/engagement';

function mapThread(t: Awaited<ReturnType<typeof getCommentThreads>>[number]) {
  return {
    id: t.id,
    entityType: t.entity_type,
    entityId: t.entity_id,
    threadType: t.thread_type as 'comment' | 'review_note',
    quote: t.quote,
    contentAnchor: t.content_anchor,
    status: t.status,
    createdBy: t.created_by,
    createdAt: t.created_at.toISOString(),
    updatedAt: t.updated_at.toISOString(),
    creator: {
      id: t.creator.id,
      name: t.creator.name,
      avatarUrl: t.creator.avatar_url,
    },
    comments: t.comments.map((c) => ({
      id: c.id,
      threadId: c.thread_id,
      content: c.content,
      authorId: c.author_id,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        avatarUrl: c.author.avatar_url,
      },
    })),
  };
}

// GET /api/engagement/[id]/wp-comments?entityType=procedure&entityId=xxx
export const GET = withAccess('engagement:read', async (req, _context) => {
  const url = new URL(req.url);
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');

  if (!entityType || !entityId) {
    return Response.json(
      { error: { code: 'INVALID_INPUT', message: 'entityType and entityId are required' } },
      { status: 400 },
    );
  }

  const threads = await getCommentThreads(entityType, entityId);
  return Response.json({ data: threads.map(mapThread) });
});

// POST /api/engagement/[id]/wp-comments
// Body: { entityType, entityId, quote?, contentAnchor?, comment }
export const POST = withAccess('engagement:update', async (req, _context, session) => {
  const body = await req.json();

  const thread = await createCommentThread(body, session.user.id, session.user.name);
  return Response.json({ data: mapThread(thread) });
});
