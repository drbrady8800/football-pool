import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { db } from "@/db/db";
import { createInsertSchema } from 'drizzle-zod';

// Teams table
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  mascot: text('mascot').notNull(),
  conference: text('conference').notNull(),
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color').notNull(),
  logoUrl: text('logo_url').notNull(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
});

// Games table
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeTeamId: uuid('home_team_id').references(() => teams.id).notNull(),
  awayTeamId: uuid('away_team_id').references(() => teams.id).notNull(),
  gameDate: timestamp('game_date').notNull(),
  winningTeamId: uuid('winning_team_id').references(() => teams.id),
  homeTeamScore: integer('home_team_score'),
  awayTeamScore: integer('away_team_score'),
  isComplete: boolean('is_complete').notNull().default(false),
});

// Picks table
export const picks = pgTable('picks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  selectedTeamId: uuid('selected_team_id').references(() => teams.id).notNull(),
  pointsEarned: integer('points_earned'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
});

// Define relationships
export const teamsRelations = relations(teams, ({ many }) => ({
  homeGames: many(games, { relationName: 'homeTeam' }),
  awayGames: many(games, { relationName: 'awayTeam' }),
  winningGames: many(games, { relationName: 'winningTeam' }),
  picks: many(picks, { relationName: 'selectedTeam' }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  picks: many(picks),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.id],
    relationName: 'homeTeam',
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.id],
    relationName: 'awayTeam',
  }),
  winningTeam: one(teams, {
    fields: [games.winningTeamId],
    references: [teams.id],
    relationName: 'winningTeam',
  }),
}));

export const picksRelations = relations(picks, ({ one }) => ({
  user: one(users, {
    fields: [picks.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [picks.gameId],
    references: [games.id],
  }),
  selectedTeam: one(teams, {
    fields: [picks.selectedTeamId],
    references: [teams.id],
    relationName: 'selectedTeam',
  }),
}));
