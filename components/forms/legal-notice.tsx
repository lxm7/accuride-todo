import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * The terms/privacy footer shown under every auth card.
 *
 * The sentence is a single ICU message with `<terms>` / `<privacy>` tags rather
 * than four concatenated fragments, because French reorders the clause around
 * the two links — splitting it would force a mistranslation.
 */
export function LegalNotice() {
  const t = useTranslations("Legal");

  return (
    <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
      {t.rich("agreement", {
        terms: (chunks) => <Link href="#">{chunks}</Link>,
        privacy: (chunks) => <Link href="#">{chunks}</Link>,
      })}
    </div>
  );
}
