import {
  pgTable,
  integer,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import games from "@/db/schema/games";
import teams from "@/db/schema/teams";
import users from "@/db/schema/users";

const picks = pgTable('picks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  winningTeamId: uuid('winning_team_id').references(() => teams.id).notNull(),
  losingTeamId: uuid('losing_team_id').references(() => teams.id),
  pointsEarned: integer('points_earned'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  season: integer('season').notNull(),
});

export default picks;
