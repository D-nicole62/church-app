/**
 * Public URLs for social profiles. Prefer NEXT_PUBLIC_FACEBOOK_URL and
 * NEXT_PUBLIC_YOUTUBE_URL in .env.local; otherwise edit the fallbacks below.
 */
export const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ||
  "https://www.facebook.com/your-church-page";

export const YOUTUBE_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() ||
  "https://www.youtube.com/@your-church-channel";
