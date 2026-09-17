import { getTranslations } from "next-intl/server";
import { TodoCalendar } from "@/components/calendar/todo-calendar";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodos } from "@/server/queries/todos";

// Deliberately not calling `setRequestLocale`: `getTodos` reads the session
// from headers, so this page is dynamic either way — the same reason
// `app/[locale]/todos/page.tsx` does not bother with it.
export default async function CalendarPage() {
  const [t, todos] = await Promise.all([
    getTranslations("Calendar"),
    getTodos(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Every todo is handed over and the client filters out the
                undated ones. `Date` survives the server/client boundary
                intact, so the rows need no serialisation shim. */}
            <TodoCalendar todos={todos} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
