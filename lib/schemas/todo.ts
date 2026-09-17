import { z } from "zod";

// Lives outside `server/todos.ts` because a `"use server"` module may only
// export async functions — a schema exported from there is a build error.
// Both the client forms and the server actions import these definitions.
const todoFields = {
  title: z
    .string()
    .trim()
    .min(1, "A title is required.")
    .max(255, "Titles are limited to 255 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Descriptions are limited to 2000 characters."),
};

// `z.date()` rather than `z.coerce.date()`: a server action serialises `Date`
// across the boundary intact, so the client sends a real one. Coercion would
// widen the schema's *input* type to `unknown`, which infects the form
// generics for the sake of a hand-rolled HTTP caller — who gets a clean
// rejection instead. `nullable` so a todo can be unscheduled, not only moved.
const dueDate = z.date("That due date could not be read.");

export const todoDueDateSchema = dueDate.nullable();

export const createTodoSchema = z.object({
  ...todoFields,
  // Optional on create: a todo added from the list has no due date, one added
  // from a calendar day cell is due on the day that was clicked.
  dueDate: dueDate.optional(),
});

// Deliberately *not* given a `dueDate`. This schema backs the edit dialog,
// which does not show one — an optional field here would make "field absent"
// and "clear the due date" the same payload, so a plain title edit could
// silently unschedule the todo. Rescheduling goes through `setTodoDueDate`,
// which only ever takes an explicit value.
export const updateTodoSchema = z.object(todoFields);

// A malformed id gets the same message as a todo that is not yours, so the
// response never distinguishes "does not exist" from "not yours".
export const todoIdSchema = z.uuid("That todo could not be found.");

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
