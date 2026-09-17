import { CreateTodoForm } from "@/components/forms/create-todo-form";
import { TodoItem } from "@/components/todo-item";
import { getTodos } from "@/server/queries/todos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export async function Todos() {
  const todos = await getTodos();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Todos</CardTitle>
        <CardDescription>
          Everything you still have to get done.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CreateTodoForm />

        <ul className="flex flex-col gap-2">
          {todos.length === 0 ? (
            <li className="rounded-md border p-8 text-center text-muted-foreground text-sm">
              No todos yet.
            </li>
          ) : (
            todos.map((item) => <TodoItem key={item.id} todo={item} />)
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
