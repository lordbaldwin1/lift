CREATE TABLE "user_tracked_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exercise_selection_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_tracked_exercise" ADD CONSTRAINT "user_tracked_exercise_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracked_exercise" ADD CONSTRAINT "user_tracked_exercise_exercise_selection_id_exercise_selection_id_fk" FOREIGN KEY ("exercise_selection_id") REFERENCES "public"."exercise_selection"("id") ON DELETE cascade ON UPDATE no action;