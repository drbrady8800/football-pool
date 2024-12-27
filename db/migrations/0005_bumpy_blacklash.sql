CREATE TABLE IF NOT EXISTS "scorePredictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"season" integer NOT NULL,
	"score" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "picks" ADD COLUMN "season" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scorePredictions" ADD CONSTRAINT "scorePredictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
