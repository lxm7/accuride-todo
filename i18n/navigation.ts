import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for the `next/navigation` and `next/link`
// exports. Importing `Link`/`useRouter` from here keeps the active locale on
// client-side navigations; the bare `next/link` would drop it.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
