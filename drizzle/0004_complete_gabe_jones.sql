DO $$ BEGIN
 CREATE TYPE "sentiment" AS ENUM('good', 'medium', 'bad');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "sentiment" SET DEFAULT 'medium';