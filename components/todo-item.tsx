"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { startTransition, useOptimistic, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Todo } from "@/db/schema";
import { type UpdateTodoInput, updateTodoSchema } from "@/lib/schemas/todo";
import { deleteTodo, setTodoCompleted, updateTodo } from "@/server/todos";

export function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // The server round trip plus revalidation is visible on a checkbox. The
  // optimistic value is discarded once the re-rendered server component
  // arrives with the real one, so a failed write corrects itself.
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    todo.completed
  );

  const form = useForm<UpdateTodoInput>({
    resolver: zodResolver(updateTodoSchema),
    // `values` rather than `defaultValues`: the dialog outlives a save, so the
    // fields need to track the row after it changes.
    values: {
      title: todo.title,
      description: todo.description ?? "",
    },
  });

  function onCheckedChange(checked: boolean) {
    startTransition(async () => {
      setOptimisticCompleted(checked);

      const result = await setTodoCompleted(todo.id, checked);

      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  async function onSubmit(values: UpdateTodoInput) {
    const result = await updateTodo(todo.id, values);

    if (result.success) {
      toast.success(result.message);
      setIsEditing(false);
      return;
    }

    toast.error(result.message);
  }

  async function onDelete() {
    setIsDeleting(true);

    const result = await deleteTodo(todo.id);

    if (result.success) {
      // The row disappears when the revalidated list arrives, unmounting this
      // component — no need to reset the local state it leaves behind.
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  }

  return (
    <li className="flex items-start gap-3 rounded-md border p-4">
      <Checkbox
        aria-label={`Mark "${todo.title}" as ${optimisticCompleted ? "not done" : "done"}`}
        checked={optimisticCompleted}
        className="mt-1"
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />

      <div className="flex-1">
        <p
          className={
            optimisticCompleted
              ? "text-muted-foreground line-through"
              : "font-medium"
          }
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-1 text-muted-foreground text-sm">
            {todo.description}
          </p>
        )}
      </div>

      <Dialog onOpenChange={setIsEditing} open={isEditing}>
        <DialogTrigger asChild>
          <Button
            aria-label={`Edit "${todo.title}"`}
            size="icon"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit todo</DialogTitle>
            <DialogDescription>
              Change the title or description, then save.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setIsConfirmingDelete}
        open={isConfirmingDelete}
      >
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Delete "${todo.title}"`}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this todo?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{todo.title}&rdquo; will be permanently deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              // Radix closes the dialog on action click; preventing the
              // default keeps it open with a spinner until the row is gone.
              onClick={(event) => {
                event.preventDefault();
                onDelete();
              }}
              variant="destructive"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
