import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // `/login` serves `en`, `/fr/login` serves `fr`. Keeps existing hrefs and
  // better-auth's `callbackURL` / `redirectTo` working without a redirect hop.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
