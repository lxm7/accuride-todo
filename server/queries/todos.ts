import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { type Todo, todo } from "@/db/schema";
import { getCurrentUser } from "@/server/users";

// Deliberately no `"use server"`. This is read-only data for server
// components, and the directive would publish it as a callable POST endpoint
// for no benefit — server-to-server imports are direct calls either way.
export const getTodos = async (): Promise<Todo[]> => {
  const { currentUser } = await getCurrentUser();

  return await db.query.todo.findMany({
    where: eq(todo.userId, currentUser.id),
    // Outstanding first (`false` sorts before `true` ascending in Postgres),
    // newest first within each group.
    orderBy: [asc(todo.completed), desc(todo.createdAt)],
  });
};
