import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    // Protect all routes except auth, api/auth, static files, and _next
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
