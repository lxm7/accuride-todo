"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    // Locale-aware `useRouter`: the bare `next/navigation` one would push the
    // unprefixed `/`, where the middleware re-runs detection and can land a
    // French user on `/en`.
    router.push("/");
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout <LogOut className="size-4" />
    </Button>
  );
}
