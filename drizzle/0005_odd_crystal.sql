ALTER TABLE "workout" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "completed_at" DROP NOT NULL;