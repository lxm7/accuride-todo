import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AuthLayout");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Image
              alt={t("logoAlt")}
              height={50}
              priority
              src={"/better-auth-starter.png"}
              width={50}
            />
          </div>
          {t("brand")}
        </Link>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
