"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { todo } from "@/db/schema";
import { type CreateTodoInput, createTodoSchema } from "@/lib/schemas/todo";
import { getCurrentUser } from "@/server/users";

export interface ActionResult {
  success: boolean;
  message: string;
}

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
    return {
      success: false,
      message: parsed.error.issues[0].message,
    };
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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }

  // `localePrefix: "always"` means the live paths are `/en/todos` and
  // `/fr/todos`; revalidating the page file covers every locale at once.
  revalidatePath("/[locale]/todos", "page");

  return {
    success: true,
    message: "Todo created.",
  };
};
