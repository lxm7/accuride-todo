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
      {showOrganizations ? (
        <OrganizationSwitcher organizations={organizations} />
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        <Logout />
        <ModeSwitcher />
      </div>
    </header>
  );
}
