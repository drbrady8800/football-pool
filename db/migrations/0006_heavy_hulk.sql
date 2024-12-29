ALTER TABLE "picks" RENAME COLUMN "selected_team_id" TO "winning_team_id";--> statement-breakpoint
ALTER TABLE "picks" DROP CONSTRAINT "picks_selected_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "picks" ADD COLUMN "losing_team_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "picks" ADD CONSTRAINT "picks_winning_team_id_teams_id_fk" FOREIGN KEY ("winning_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "picks" ADD CONSTRAINT "picks_losing_team_id_teams_id_fk" FOREIGN KEY ("losing_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
