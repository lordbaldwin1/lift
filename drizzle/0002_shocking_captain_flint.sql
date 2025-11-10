ALTER TABLE "set" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise" ADD COLUMN "rep_lower_bound" integer;--> statement-breakpoint
ALTER TABLE "exercise" ADD COLUMN "rep_upper_bound" integer;--> statement-breakpoint
ALTER TABLE "set" ADD COLUMN "target_reps" integer;--> statement-breakpoint
ALTER TABLE "set" ADD COLUMN "target_weight" integer;--> statement-breakpoint
ALTER TABLE "workout" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;