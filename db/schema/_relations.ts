
import { relations } from 'drizzle-orm';
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import scorePredictions from "@/db/schema/scorePredictions";
import teams from "@/db/schema/teams";
import users from "@/db/schema/users";

export const teamsRelations = relations(teams, ({ many }) => ({
  homeGames: many(games, { relationName: 'homeTeam' }),
  awayGames: many(games, { relationName: 'awayTeam' }),
  winningGames: many(games, { relationName: 'winningTeam' }),
  picks: many(picks, { relationName: 'selectedTeam' }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  picks: many(picks),
  scorePredictions: many(scorePredictions),
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

export const scorePredictionsRelations = relations(scorePredictions, ({ one }) => ({
  user: one(users, {
    fields: [scorePredictions.userId],
    references: [users.id],
  }),
}));
