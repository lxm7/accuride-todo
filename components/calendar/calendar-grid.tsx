"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { endOfDay, startOfDay } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Calendar,
  type SlotInfo,
  type stringOrDate,
  type View,
  Views,
} from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import type { Todo } from "@/db/schema";
import { localizer } from "./localizer";

export type TodoEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: true;
  todo: Todo;
};

type CalendarGridProps = {
  todos: Todo[];
  onCreateAt: (date: Date) => void;
  onReschedule: (todo: Todo, day: Date) => void;
};

const DragAndDropCalendar = withDragAndDrop<TodoEvent>(Calendar);

const VIEWS: View[] = [Views.MONTH, Views.WEEK, Views.DAY];

const toDate = (value: stringOrDate): Date =>
  typeof value === "string" ? new Date(value) : value;

const toEvents = (todos: Todo[]): TodoEvent[] =>
  todos.flatMap((todo) =>
    todo.dueDate === null
      ? []
      : [
          {
            id: todo.id,
            title: todo.title,
            start: startOfDay(todo.dueDate),
            end: endOfDay(todo.dueDate),
            allDay: true as const,
            todo,
          },
        ],
  );

export default function CalendarGrid({
  todos,
  onCreateAt,
  onReschedule,
}: CalendarGridProps) {
  const locale = useLocale();
  const t = useTranslations("Calendar");

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(() => new Date());

  const events = useMemo(() => toEvents(todos), [todos]);

  const messages = useMemo(
    () => ({
      today: t("today"),
      previous: t("previous"),
      next: t("next"),
      month: t("month"),
      week: t("week"),
      day: t("day"),
      allDay: t("allDay"),
      noEventsInRange: t("noEventsInRange"),
      showMore: (count: number) => t("showMore", { count }),
    }),
    [t],
  );

  return (
    // react-big-calendar measures its container; without a height it collapses
    // to nothing.
    <div className="h-[70vh]">
      <DragAndDropCalendar
        culture={locale}
        date={date}
        endAccessor="end"
        events={events}
        eventPropGetter={(event: TodoEvent) =>
          event.todo.completed
            ? { className: "line-through opacity-60" }
            : { className: "" }
        }
        localizer={localizer}
        messages={messages}
        onEventDrop={({ event, start }: EventInteractionArgs<TodoEvent>) =>
          onReschedule(event.todo, startOfDay(toDate(start)))
        }
        onNavigate={setDate}
        // A slot click in the timed area of week/day still means "this day" in
        // an all-day model, so the time component is dropped either way.
        onSelectSlot={(slot: SlotInfo) => onCreateAt(startOfDay(slot.start))}
        onView={setView}
        // Overflowing days open a popup rather than forcing a drilldown.
        popup
        // A single-day all-day event has no edge to drag; only moving it means
        // anything.
        resizable={false}
        selectable
        startAccessor="start"
        view={view}
        views={VIEWS}
      />
    </div>
  );
}
