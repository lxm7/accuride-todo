import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function resolveAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_URL: resolveAppUrl() },
};

// Resolves `./i18n/request.ts` by convention.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
