import {
  pgTable,
  integer,
  timestamp,
  boolean,
  text,
  uuid
} from 'drizzle-orm/pg-core';
import teams from "@/db/schema/teams";

const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  homeTeamId: uuid('home_team_id').references(() => teams.id),
  awayTeamId: uuid('away_team_id').references(() => teams.id),
  gameDate: timestamp('game_date').notNull(),
  winningTeamId: uuid('winning_team_id').references(() => teams.id),
  homeTeamScore: integer('home_team_score'),
  awayTeamScore: integer('away_team_score'),
  isComplete: boolean('is_complete').notNull().default(false),
  season: integer('season').notNull()
});

export default games;