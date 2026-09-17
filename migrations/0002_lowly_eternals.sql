ALTER TABLE "todo" ADD COLUMN "due_date" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "todo_user_id_due_date_idx" ON "todo" USING btree ("user_id","due_date");