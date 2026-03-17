import { NextRequest } from 'next/server';
import { checkAccess, DEV_USER } from '@/server/actions/teams';

// =============================================================================
// SESSION TYPE
// =============================================================================

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
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
    // TODO: Replace with getServerSession(authOptions) when NextAuth is set up
    // import { getServerSession } from 'next-auth';
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return Response.json(
    //     { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
    //     { status: 401 }
    //   );
    // }

    // DEV MODE: Use mock user
    const session: Session = { user: DEV_USER };

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
