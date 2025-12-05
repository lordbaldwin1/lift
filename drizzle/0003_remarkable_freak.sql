ALTER TABLE "personal_record" ADD COLUMN "weight" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_record" ADD COLUMN "reps" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_record" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;