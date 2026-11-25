"use server";

import { signOut } from "@/auth";
import { changeOwnPasswordAction } from "@/lib/admin/user-actions";

export async function changePasswordAction(formData: FormData) {
  await changeOwnPasswordAction(formData);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
