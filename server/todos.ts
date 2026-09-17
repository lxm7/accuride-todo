"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { type Todo, todo } from "@/db/schema";
import {
  type CreateTodoInput,
  createTodoSchema,
  todoDueDateSchema,
  todoIdSchema,
  type UpdateTodoInput,
  updateTodoSchema,
} from "@/lib/schemas/todo";
import { getCurrentUser } from "@/server/users";

export type ActionResult<TData = null> =
  | { success: true; message: string; data: TData }
  | { success: false; message: string };

const NOT_FOUND = "That todo could not be found.";

const revalidateTodoViews = () => {
  revalidatePath("/[locale]/todos", "page");
  revalidatePath("/[locale]/calendar", "page");
};

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred.";

export const createTodo = async (
  input: CreateTodoInput
): Promise<ActionResult> => {
  const { currentUser } = await getCurrentUser();

  const parsed = createTodoSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    await db.insert(todo).values({
      userId: currentUser.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ?? null,
    });
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }

  revalidateTodoViews();

  return { success: true, message: "Todo created.", data: null };
};

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
    const [updated] = await db
      .update(todo)
      .set({ completed: parsed.data.completed })
      .where(and(eq(todo.id, parsed.data.id), eq(todo.userId, currentUser.id)))
      .returning();

    if (!updated) {
      return { success: false, message: NOT_FOUND };
    }

    revalidateTodoViews();

    return {
      success: true,
      message: updated.completed ? "Todo completed." : "Todo reopened.",
      data: updated,
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
};

export const setTodoDueDate = async (
  id: string,
  dueDate: Date | null
): Promise<ActionResult<Todo>> => {
  const { currentUser } = await getCurrentUser();

  const parsed = z
    .object({ id: todoIdSchema, dueDate: todoDueDateSchema })
    .safeParse({ id, dueDate });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    const [updated] = await db
      .update(todo)
      .set({ dueDate: parsed.data.dueDate })
      .where(and(eq(todo.id, parsed.data.id), eq(todo.userId, currentUser.id)))
      .returning();

    if (!updated) {
      return { success: false, message: NOT_FOUND };
    }

    revalidateTodoViews();

    return {
      success: true,
      message: updated.dueDate ? "Todo rescheduled." : "Todo unscheduled.",
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

    revalidateTodoViews();

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

    revalidateTodoViews();

    return { success: true, message: "Todo deleted.", data: deleted };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
};
