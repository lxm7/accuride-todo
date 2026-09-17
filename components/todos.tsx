import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

export function Todos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Todos</CardTitle>
        <CardDescription>
          Everything you still have to get done.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="flex items-center gap-2">
          <Input name="title" placeholder="Add a todo..." />
          <Button type="submit">Add</Button>
        </form>

        <ul className="flex flex-col gap-2">
          <li className="rounded-md border p-8 text-center text-muted-foreground text-sm">
            No todos yet.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
