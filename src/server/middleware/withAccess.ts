import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/server/actions/teams';

// =============================================================================
// SESSION TYPE
// =============================================================================

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string | null;
  };
}

// =============================================================================
// ROUTE HANDLER TYPE
// =============================================================================

export type RouteHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  session: Session
) => Promise<Response> | Response;

// =============================================================================
// WITH ACCESS MIDDLEWARE
// =============================================================================

export function withAccess(permission: string, handler: RouteHandler) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<Response> => {
    const nextAuthSession = await getServerSession(authOptions);

    if (!nextAuthSession?.user?.id) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Verify user still exists and is active in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: nextAuthSession.user.id },
      select: { id: true, status: true },
    });
    if (!dbUser || dbUser.status !== 'active') {
      return Response.json(
        { error: { code: 'SESSION_INVALID', message: 'Session expired or user no longer exists' } },
        { status: 401 }
      );
    }

    const session: Session = {
      user: {
        id: nextAuthSession.user.id,
        name: nextAuthSession.user.name || '',
        email: nextAuthSession.user.email || '',
        role: nextAuthSession.user.role,
        title: nextAuthSession.user.title,
      },
    };

    const allowed = await checkAccess(session.user.id, permission);
    if (!allowed) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'Permission denied' } },
        { status: 403 }
      );
    }

    return handler(req, context, session);
  };
}
