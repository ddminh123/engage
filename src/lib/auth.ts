import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// =============================================================================
// Entra ID SSO — PREPARED, NOT ACTIVATED
// To enable:
// 1. Set AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID in .env
// 2. Uncomment the AzureADProvider below
// 3. Set NEXT_PUBLIC_ENABLE_SSO=true to show SSO button on login page
// Callback URL: /api/auth/callback/azure-ad
// =============================================================================
// import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        if (user.status === "locked") {
          throw new Error("ACCOUNT_LOCKED");
        }

        if (user.status === "inactive") {
          throw new Error("ACCOUNT_INACTIVE");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
        };
      },
    }),

    // =========================================================================
    // Entra ID SSO — Uncomment to enable
    // =========================================================================
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID,
    // }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.title = user.title;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.title = token.title;
      }
      return session;
    },

    // Entra ID account linking — ready for SSO activation
    async signIn({ user, account }) {
      if (account?.provider === "azure-ad" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          if (existingUser.status !== "active") {
            return false;
          }
          // Link Entra ID to existing user if not already linked
          if (existingUser.provider === "credentials") {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { provider: "entra_id" },
            });
          }
        } else {
          // Auto-create user from Entra ID (optional — remove if manual creation required)
          return false;
        }
      }
      return true;
    },
  },
};
