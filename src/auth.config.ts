import type { NextAuthConfig } from "next-auth";
import { ensureAuthUrlEnv } from "@/lib/auth-url";

ensureAuthUrlEnv();

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export const authConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    redirect({ url, baseUrl }) {
      // Path-only targets stay on the host the browser is already using.
      // Sign-out was returning http://localhost:3000 while the session cookie
      // lived on http://127.0.0.1:3000, and those hosts do not share cookies.
      if (url.startsWith("/")) return url;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        return baseUrl;
      }
      return baseUrl;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
