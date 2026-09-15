"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import {
  getDatabaseHealth,
  isDatabaseConnectionError,
} from "@/lib/db-health";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const callbackUrl = formData.get("callbackUrl")?.toString() || "/admin";

  const dbHealth = await getDatabaseHealth();
  if (dbHealth.status !== "ok") {
    redirect("/admin/login?error=database");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=invalid");
    }
    if (
      error instanceof Error &&
      error.message === "DATABASE_UNAVAILABLE"
    ) {
      redirect("/admin/login?error=database");
    }
    if (isDatabaseConnectionError(error)) {
      redirect("/admin/login?error=database");
    }
    throw error;
  }
}
