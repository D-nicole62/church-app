import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { isDefaultSeedPassword } from "@/lib/auth/password";
import { authConfig } from "@/auth.config";
import {
  getDatabaseErrorMessage,
  isDatabaseConnectionError,
} from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        let user;
        try {
          user = await prisma.adminUser.findUnique({ where: { email } });
        } catch (error) {
          if (isDatabaseConnectionError(error)) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[auth] database unreachable during login:",
                getDatabaseErrorMessage(error),
              );
            }
            throw new Error("DATABASE_UNAVAILABLE");
          }
          throw error;
        }

        if (!user) {
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        if (!user.active) {
          throw new Error("ACCOUNT_INACTIVE");
        }

        const usingDefaultPassword = isDefaultSeedPassword(password);
        if (usingDefaultPassword && !user.mustChangePassword) {
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { mustChangePassword: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword || usingDefaultPassword,
        };
      },
    }),
  ],
});
