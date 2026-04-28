import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { db, users, workspaces, workspaceMembers } from '@forge/db';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function workspaceSlugFor(email: string | null | undefined): string {
  const base = (email ?? 'workspace').split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') ?? 'ws';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'ws'}-${suffix}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  // Explicitly trust the host so Auth.js doesn't reject the request when
  // running behind Vercel's proxy. AUTH_TRUST_HOST=true env also works.
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // OAuth providers. Auth.js auto-reads AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET etc.
    // allowDangerousEmailAccountLinking lets users with a credentials account
    // sign in via the same email on Google/Microsoft (the provider has already
    // verified the email, so this is safe).
    Google({ allowDangerousEmailAccountLinking: true }),
    MicrosoftEntraID({
      allowDangerousEmailAccountLinking: true,
      // Default to /common so personal + work/school accounts both work.
      // Override via env to restrict to a specific tenant.
      issuer:
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ||
        'https://login.microsoftonline.com/common/v2.0',
    }),
  ],
  events: {
    // Fires the first time the adapter creates a user (i.e. OAuth signups).
    // Credentials signups insert the user manually and create their own
    // workspace, so this branch only ever runs for Google/Microsoft.
    async createUser({ user }) {
      if (!user.id) return;
      const existing = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
      });
      if (existing) return;
      const [ws] = await db
        .insert(workspaces)
        .values({
          name: user.name ? `${user.name}'s workspace` : 'My workspace',
          slug: workspaceSlugFor(user.email),
          ownerId: user.id,
        })
        .returning();
      if (ws) {
        await db.insert(workspaceMembers).values({
          workspaceId: ws.id,
          userId: user.id,
          role: 'owner',
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
