import { InferSelectModel } from "drizzle-orm";

import games from '@/db/schema/games';
import picks from '@/db/schema/picks';
import scorePredictions from '@/db/schema/scorePredictions';
import teams from '@/db/schema/teams';
import users from '@/db/schema/users';

// Games
export type Game = InferSelectModel<typeof games>;
export type GameWithTeams = Game & { homeTeam: InferSelectModel<typeof teams>, awayTeam: InferSelectModel<typeof teams> };

// Picks
export type Pick = InferSelectModel<typeof picks>;
export type PickWithGameTeamUser = Pick & { game: GameWithTeams, winningTeam: Team, losingTeam: Team, user: User };

// Score Predictions
export type ScorePrediction = InferSelectModel<typeof scorePredictions>;

// Teams
export type Team = InferSelectModel<typeof teams>;

// Users
export type User = InferSelectModel<typeof users>;
