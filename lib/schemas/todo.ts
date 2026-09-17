import { z } from "zod";

// Lives outside `server/todos.ts` because a `"use server"` module may only
// export async functions — a schema exported from there is a build error.
// Both the client form and the server action import this one definition.
export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "A title is required.")
    .max(255, "Titles are limited to 255 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Descriptions are limited to 2000 characters."),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
