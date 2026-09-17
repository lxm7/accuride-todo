import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Pathnames gated behind a session, written without a locale prefix. */
const PROTECTED_PATHNAMES = ["/todos"];

export async function proxy(request: NextRequest) {
  const [, candidate, ...rest] = request.nextUrl.pathname.split("/");

  // Under `always` every addressable route is prefixed, so an unprefixed
  // pathname is not a route yet: `handleI18nRouting` redirects it to a
  // prefixed one and the gate runs on that second pass. Only a pathname that
  // already carries a locale is worth testing against `PROTECTED_PATHNAMES`.
  if (hasLocale(routing.locales, candidate)) {
    const pathnameWithoutLocale = `/${rest.join("/")}`;

    const isProtected = PROTECTED_PATHNAMES.some(
      (protectedPathname) =>
        pathnameWithoutLocale === protectedPathname ||
        pathnameWithoutLocale.startsWith(`${protectedPathname}/`)
    );

    // Short-circuits ahead of the i18n middleware so an unauthenticated
    // `/fr/todos` reaches `/fr/login` in one hop rather than being handled
    // and then redirected a second time.
    if (isProtected) {
      const sessionCookie = await getSessionCookie(request);

      if (!sessionCookie) {
        // `getPathname` applies the prefix per `localePrefix`, so this yields
        // `/en/login` or `/fr/login` without hardcoding either.
        const pathname = getPathname({ href: "/login", locale: candidate });
        return NextResponse.redirect(new URL(pathname, request.url));
      }
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Everything except API routes, Next internals, Vercel internals, and any
  // pathname containing a dot (static assets such as `/favicon.ico`).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
