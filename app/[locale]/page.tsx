import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

// NOTE: copy on this page is intentionally still hardcoded English — the
// message extraction was scoped to the auth pages. Keys belong in a
// `HomePage` namespace when that follow-up happens.
export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <header className="absolute top-0 right-0 flex items-center justify-end p-4">
        <ModeSwitcher />
      </header>
      <div className="flex h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <Image
          alt="Better Auth"
          className="rounded-lg dark:invert"
          height={100}
          src="/better-auth-starter.png"
          width={100}
        />

        <h1 className="font-bold text-4xl">Better Auth Starter</h1>

        <p className="text-lg">
          This is a starter project for Better Auth. It is a simple project that
          uses Better Auth to authenticate users.
        </p>

        <div className="flex gap-2">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Signup</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
