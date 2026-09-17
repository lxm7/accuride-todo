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

export const createTodoSchema = z.object(todoFields);

// Same shape as create today, declared separately so the two can diverge
// without one silently changing the other.
export const updateTodoSchema = z.object(todoFields);

// A malformed id gets the same message as a todo that is not yours, so the
// response never distinguishes "does not exist" from "not yours".
export const todoIdSchema = z.uuid("That todo could not be found.");

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
