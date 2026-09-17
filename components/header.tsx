import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getOrganizations } from "@/server/organizations";
import { Logout } from "./logout";
import { ModeSwitcher } from "./mode-switcher";
import { OrganizationSwitcher } from "./organization-switcher";

interface HeaderProps {
  showOrganizations?: boolean;
}

export async function Header({ showOrganizations = true }: HeaderProps) {
  const organizations = showOrganizations ? await getOrganizations() : [];

  return (
    <header className="absolute top-0 right-0 flex w-full items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {showOrganizations ? (
          <OrganizationSwitcher organizations={organizations} />
        ) : (
          <div />
        )}

        {/* `Link` from `@/i18n/navigation`, not `next/link`: the bare one
            drops the locale prefix and sends a French visitor to `/todos`,
            which 404s under `localePrefix: "always"`.

            No active-state highlight, because reading the current pathname
            needs `usePathname`, and that would turn this server component
            into a client one for the sake of a border. */}
        <nav className="flex items-center gap-1">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/todos"
          >
            Todos
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/calendar"
          >
            Calendar
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Logout />
        <ModeSwitcher />
      </div>
    </header>
  );
}
