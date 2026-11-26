import { defineConfig, devices } from "@playwright/test";

function serverEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  env.PAYMENTS_ENABLED = "false";
  env.AUTH_SECRET =
    env.AUTH_SECRET || "local-e2e-auth-secret-not-for-production";
  env.AUTH_URL = "http://127.0.0.1:3000";
  env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3000";
  env.CRON_SECRET = env.CRON_SECRET || "local-cron-secret";
  env.ADMIN_SEED_EMAIL = env.ADMIN_SEED_EMAIL || "admin@todassembly.com";
  env.ADMIN_SEED_PASSWORD = env.ADMIN_SEED_PASSWORD || "ChangeMe123!";
  env.YOUTUBE_FEED_FIXTURE = "e2e";
  delete env.YOUTUBE_API_KEY;
  return env;
}

const useProductionServer = process.env.CI === "true" || process.env.CI === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: useProductionServer,
  retries: useProductionServer ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: useProductionServer ? "npm run start" : "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !useProductionServer,
    timeout: 180_000,
    env: serverEnv(),
  },
});
