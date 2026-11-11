import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getProductionAppUrl } from "@/lib/auth-url";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export function absoluteNotificationImageUrl(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const base = (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    getProductionAppUrl()
  ).replace(/\/$/, "");
  return `${base}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export async function saveUploadedImage(file: File, folder: string) {
  const extension = ALLOWED.get(file.type);
  if (!extension) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const objectPath = `${folder}/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const bucket = process.env.SUPABASE_NOTIFICATION_BUCKET?.trim() || "notification-images";

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.storage.from(bucket).upload(objectPath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (!error) {
      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
      return data.publicUrl;
    }
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Image storage is not ready. Create a public Supabase bucket named notification-images.",
    );
  }

  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}

export async function saveNotificationImage(file: File) {
  return saveUploadedImage(file, "notifications");
}

export async function imageUrlFromForm(formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }
  return saveNotificationImage(file);
}
