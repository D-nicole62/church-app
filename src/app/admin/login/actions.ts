"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import {
  getDatabaseHealth,
  isDatabaseConnectionError,
} from "@/lib/db-health";

function errorText(error: unknown): string {
  if (!error) return "";
  if (error instanceof Error) {
    const cause = "cause" in error ? errorText(error.cause) : "";
    return `${error.message} ${cause}`;
  }
  if (typeof error === "object" && "err" in error) {
    return errorText(error.err);
  }
  return "";
}

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
    const text = errorText(error);
    if (text.includes("ACCOUNT_INACTIVE")) {
      redirect("/admin/login?error=inactive");
    }
    if (text.includes("DATABASE_UNAVAILABLE")) {
      redirect("/admin/login?error=database");
    }
    if (error instanceof AuthError) {
      redirect("/admin/login?error=invalid");
    }
    if (isDatabaseConnectionError(error)) {
      redirect("/admin/login?error=database");
    }
    throw error;
  }
}
