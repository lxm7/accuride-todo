import { format, getDay, parse, startOfWeek } from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns/locale";
import { enGB, fr } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import type { Locale } from "@/i18n/routing";

// Keyed by the app's locale codes, because the calendar is handed the same
const locales: Record<Locale, DateFnsLocale> = { en: enGB, fr };

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
