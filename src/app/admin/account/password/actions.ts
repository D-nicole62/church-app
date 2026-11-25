"use server";

import { changeOwnPasswordAction } from "@/lib/admin/user-actions";

export async function changePasswordAction(formData: FormData) {
  await changeOwnPasswordAction(formData);
}
