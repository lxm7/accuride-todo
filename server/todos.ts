"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { type Todo, todo } from "@/db/schema";
import {
  type CreateTodoInput,
  createTodoSchema,
  todoIdSchema,
  type UpdateTodoInput,
  updateTodoSchema,
} from "@/lib/schemas/todo";
import { getCurrentUser } from "@/server/users";

// A discriminated union rather than `{ success: boolean; data?: T }`: reading
// `data` without first narrowing on `success` is then a compile error.
export type ActionResult<TData = null> =
  | { success: true; message: string; data: TData }
  | { success: false; message: string };

// Returned for both "no such todo" and "not your todo" — the caller cannot
// tell them apart, so the action never confirms another user's row exists.
const NOT_FOUND = "That todo could not be found.";

// `localePrefix: "always"` means the live paths are `/en/todos` and
// `/fr/todos`; revalidating the page file covers every locale at once.
const revalidateTodos = () => revalidatePath("/[locale]/todos", "page");

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred.";

export const createTodo = async (
  input: CreateTodoInput
): Promise<ActionResult> => {
  // Outside the `try`: `getCurrentUser` redirects when there is no session,
  // and `redirect` signals that by throwing `NEXT_REDIRECT`. Catching it here
  // would swallow the redirect and hand a logged-out visitor a failed result.
  const { currentUser } = await getCurrentUser();

  // Re-parsed server-side on purpose. A server action compiles to a public
  // HTTP endpoint, so the client-side resolver is a UX affordance rather than
  // a trust boundary — `input` is untrusted regardless of its type.
  const parsed = createTodoSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    await db.insert(todo).values({
      userId: currentUser.id,
      title: parsed.data.title,
      // The column is nullable; storing `""` would make "no description" and
      // "empty description" indistinguishable.
      description: parsed.data.description || null,
    });
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }

  revalidateTodos();

  return { success: true, message: "Todo created.", data: null };
};

// Takes the intended state rather than flipping in SQL: `set` is idempotent,
// so a double-click or a retry converges, where `NOT completed` would land the
// row inverted from what the user is looking at.
export const setTodoCompleted = async (
  id: string,
  completed: boolean
): Promise<ActionResult<Todo>> => {
  const { currentUser } = await getCurrentUser();

  const parsed = z
    .object({ id: todoIdSchema, completed: z.boolean() })
    .safeParse({ id, completed });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    // Ownership is part of the statement, not a `SELECT` above it: no
    // time-of-check/time-of-use window, and one round trip.
    const [updated] = await db
      .update(todo)
      .set({ completed: parsed.data.completed })
      .where(and(eq(todo.id, parsed.data.id), eq(todo.userId, currentUser.id)))
      .returning();

    // No row came back, so the id either does not exist or belongs to someone
    // else. Both are the same answer here.
    if (!updated) {
      return { success: false, message: NOT_FOUND };
    }

    revalidateTodos();

    return {
      success: true,
      message: updated.completed ? "Todo completed." : "Todo reopened.",
      data: updated,
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
};

export const updateTodo = async (
  id: string,
  input: UpdateTodoInput
): Promise<ActionResult<Todo>> => {
  const { currentUser } = await getCurrentUser();

  const parsedId = todoIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, message: parsedId.error.issues[0].message };
  }

  const parsed = updateTodoSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    const [updated] = await db
      .update(todo)
      .set({
        title: parsed.data.title,
        description: parsed.data.description || null,
      })
      .where(and(eq(todo.id, parsedId.data), eq(todo.userId, currentUser.id)))
      .returning();

    if (!updated) {
      return { success: false, message: NOT_FOUND };
    }

    revalidateTodos();

    return { success: true, message: "Todo updated.", data: updated };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
};

export const deleteTodo = async (id: string): Promise<ActionResult<Todo>> => {
  const { currentUser } = await getCurrentUser();

  const parsedId = todoIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, message: parsedId.error.issues[0].message };
  }

  try {
    const [deleted] = await db
      .delete(todo)
      .where(and(eq(todo.id, parsedId.data), eq(todo.userId, currentUser.id)))
      .returning();

    if (!deleted) {
      return { success: false, message: NOT_FOUND };
    }

    revalidateTodos();

    return { success: true, message: "Todo deleted.", data: deleted };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
};
