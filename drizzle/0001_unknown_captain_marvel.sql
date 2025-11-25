CREATE TABLE "personal_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_selection_id" uuid NOT NULL,
	"set_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_record" ADD CONSTRAINT "personal_record_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_record" ADD CONSTRAINT "personal_record_exercise_selection_id_exercise_selection_id_fk" FOREIGN KEY ("exercise_selection_id") REFERENCES "public"."exercise_selection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_record" ADD CONSTRAINT "personal_record_set_id_set_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint