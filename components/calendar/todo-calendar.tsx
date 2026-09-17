"use client";

import {
  getHours,
  getMilliseconds,
  getMinutes,
  getSeconds,
  isSameDay,
  set,
} from "date-fns";
import dynamic from "next/dynamic";
import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";
import type { Todo } from "@/db/schema";
import { setTodoDueDate } from "@/server/todos";
import { CreateTodoDialog } from "./create-todo-dialog";

// `ssr: false` because the grid defaults to `new Date()` at render time: the
// server would pick the day in its zone, the client the day in the viewer's,
// and around midnight the two disagree and React blows up the tree. This also
// keeps react-big-calendar out of the server bundle entirely.
const CalendarGrid = dynamic(() => import("./calendar-grid"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] animate-pulse rounded-md border bg-muted/30" />
  ),
});

interface Reschedule {
  id: string;
  dueDate: Date;
}

export function TodoCalendar({ todos }: { todos: Todo[] }) {
  const [createAt, setCreateAt] = useState<Date | null>(null);

  // Same idiom as `components/todo-item.tsx`: the drop should land instantly,
  // but the server round trip plus revalidation is visible. The optimistic
  // list is discarded when the re-rendered server component arrives, so a
  // rejected write snaps the event back on its own.
  const [optimisticTodos, applyReschedule] = useOptimistic(
    todos,
    (state: Todo[], moved: Reschedule) =>
      state.map((todo) =>
        todo.id === moved.id ? { ...todo, dueDate: moved.dueDate } : todo
      )
  );

  function onReschedule(todo: Todo, day: Date) {
    const previous = todo.dueDate;

    // Only dated todos are on the grid, so `previous` is never null in
    // practice — branching rather than asserting keeps that assumption out of
    // the type system, where it cannot be checked.
    const dueDate =
      previous === null
        ? day
        : // The grid is all-day, so a drag carries no time. Rewriting the day
          // while keeping the stored local time means a todo due at 09:00
          // stays due at 09:00 after being moved.
          set(day, {
            hours: getHours(previous),
            minutes: getMinutes(previous),
            seconds: getSeconds(previous),
            milliseconds: getMilliseconds(previous),
          });

    // A drop back onto the same cell is a no-op; writing it would revalidate
    // both pages for nothing.
    if (previous !== null && isSameDay(previous, dueDate)) {
      return;
    }

    startTransition(async () => {
      applyReschedule({ id: todo.id, dueDate });

      const result = await setTodoDueDate(todo.id, dueDate);

      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <CalendarGrid
        onCreateAt={setCreateAt}
        onReschedule={onReschedule}
        todos={optimisticTodos}
      />
      <CreateTodoDialog dueDate={createAt} onClose={() => setCreateAt(null)} />
    </>
  );
}
