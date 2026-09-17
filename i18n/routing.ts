import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Every pathname carries its locale: `/en/login` and `/fr/login`. The
  // alternative, `as-needed`, leaves `en` unprefixed, which makes an
  // unprefixed pathname ambiguous — it is either the `en` route or a route
  // awaiting detection — and hides locale loss in any code that navigates
  // with a bare `next/navigation` helper.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
