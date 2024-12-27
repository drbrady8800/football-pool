ALTER TABLE "teams" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "location" json NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "abbreviation" text NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "division" text NOT NULL;