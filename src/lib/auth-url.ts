/** Public site URL (production). Override with NEXT_PUBLIC_APP_URL. */
export function getProductionAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://church-app-ashy.vercel.app"
  );
}

function isLocalAuthUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * NextAuth reads AUTH_URL from the environment. Ensures production never keeps
 * a copied local value (http://localhost:3000) on Vercel.
 */
export function ensureAuthUrlEnv() {
  const explicit = process.env.AUTH_URL?.trim();
  const vercelHost = process.env.VERCEL_URL?.trim();
  const productionUrl = getProductionAppUrl();

  if (process.env.VERCEL === "1") {
    if (!explicit || isLocalAuthUrl(explicit)) {
      process.env.AUTH_URL = vercelHost
        ? `https://${vercelHost}`
        : productionUrl;
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    if (!explicit) {
      process.env.AUTH_URL = "http://127.0.0.1:3000";
    }
    return;
  }

  if (!explicit || isLocalAuthUrl(explicit)) {
    process.env.AUTH_URL = productionUrl;
  }
}
