import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getContactById, updateContact, deleteContact } from '@/server/actions/contact';
import type { UpdateContactInput } from '@/server/actions/contact';

export const GET = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    try {
      const data = await getContactById(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Contact not found') {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 },
        );
      }
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateContactInput;
    try {
      const data = await updateContact(id, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Contact not found') {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 },
        );
      }
      return Response.json(
        { error: { code: 'UPDATE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);

export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const data = await deleteContact(id, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Contact not found') {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 },
        );
      }
      return Response.json(
        { error: { code: 'DELETE_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
