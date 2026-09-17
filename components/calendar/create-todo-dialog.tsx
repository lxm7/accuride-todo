"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CreateTodoForm } from "@/components/forms/create-todo-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateTodoDialogProps = {
  // The clicked day, or `null` for "no day clicked" — which is also the
  // closed state. One value rather than a `date` plus an `open` boolean,
  // so the two can never disagree.
  dueDate: Date | null;
  onClose: () => void;
};

export function CreateTodoDialog({ dueDate, onClose }: CreateTodoDialogProps) {
  const t = useTranslations("Calendar");
  // next-intl's formatter is `Intl.DateTimeFormat` under the active locale —
  // used here rather than date-fns so the prose in the dialog matches the rest
  // of the app's formatting, while the grid keeps the localizer date-fns needs.
  const format = useFormatter();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={dueDate !== null}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dueDate === null
              ? t("createTitle")
              : t("createTitleOn", {
                  date: format.dateTime(dueDate, { dateStyle: "long" }),
                })}
          </DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        {/* Radix unmounts closed content, so each open gets a fresh form
            rather than the previous day's half-typed title. */}
        {dueDate !== null && (
          <CreateTodoForm dueDate={dueDate} onCreated={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
