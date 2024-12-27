import { eq, and, asc, or, like } from "drizzle-orm";
import { parse } from 'csv-parse/sync';

import db from "@/db/db";
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import scorePredictions from "@/db/schema/scorePredictions";
import teams from "@/db/schema/teams";
import users from "@/db/schema/users";
import { Game, Team } from "@/db/types";

interface PickToInsert {
  userId: string;
  gameId: string;
  selectedTeamId: string;
}

interface ScorePredictionToInsert {
  userId: string;
  score: number;
}

export async function ingestPicks({ year, csvContent }: { year: number, csvContent: string }) {
  // Parse CSV content
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Validate CSV structure
  const firstRow = records[0];
  const columnNames = Object.keys(firstRow);
  
  // Ensure first column is for names
  if (columnNames[0] !== 'Name') {
    throw new Error('First column must be "Name"');
  }

  // Separate regular game columns from CFP game columns and score
  const regularGameColumns = columnNames.filter(col => col.includes(' vs '));
  const cfpGameColumns = columnNames.filter(col => col.startsWith('CFP Game '));
  const hasScoreColumn = columnNames.includes('Score');

  if (!hasScoreColumn) {
    throw new Error('CSV must include a "Score" column');
  }

  if (cfpGameColumns.length !== 11) {
    throw new Error('CSV must include exactly 11 CFP Game columns');
  }

  // Pre-fetch all teams for efficient lookups
  const allTeams = await db.select().from(teams).where();
  const teamMap = new Map<string, string>(allTeams.map((team: Team) => [team.name.toLowerCase(), team.id]));

// Fetch CFP games ordered by start time
const cfpGames = await db
  .select()
  .from(games)
  .where(like(games.name, "%College Football Playoff%"))
  .orderBy(asc(games.gameDate));

 if (cfpGames.length !== 11) {
   throw new Error('Database must contain exactly 11 CFP games');
 }
 const cfpGameMap = new Map<number, string>(cfpGames.map((game: Game, index: number) => [index + 1, game.id]));

  // Process each row
  const picksToInsert: PickToInsert[] = [];
  const scoresToInsert: ScorePredictionToInsert[] = [];
  
  for (const row of records) {
    const userName = row['Name'];
    if (!userName) {
      throw new Error('Name column cannot contain empty values');
    }

    // Get or create user
    let user = await db.select().from(users).where(eq(users.name, userName)).limit(1);
    let userId: string;

    if (user.length === 0) {
      const [newUser] = await db.insert(users).values({ name: userName }).returning();
      userId = newUser.id;
    } else {
      userId = user[0].id;
    }

    // Process regular game picks
    for (const gameColumn of regularGameColumns) {
      const [team1, team2] = gameColumn.split(' vs ');
      const selectedTeam = row[gameColumn];

      if (!selectedTeam || ![team1, team2].includes(selectedTeam)) {
        throw new Error(`Invalid pick for ${gameColumn} by ${userName}. Must be either "${team1}" or "${team2}"`);
      }

      const team1Id = teamMap.get(team1.toLowerCase());
      const team2Id = teamMap.get(team2.toLowerCase());

      if (!team1Id || !team2Id) {
        throw new Error(`Could not find teams: ${team1} or ${team2}`);
      }

      // Find the corresponding game
      const game = await db.select().from(games).where(
        and(
          or(eq(games.homeTeamId, team1Id), eq(games.homeTeamId, team2Id)),
          or(eq(games.awayTeamId, team1Id), eq(games.awayTeamId, team2Id))
        )
      ).limit(1);

      if (game.length === 0) {
        throw new Error(`Could not find game for teams: ${team1} vs ${team2}`);
      }

      const selectedTeamId = teamMap.get(selectedTeam.toLowerCase());
      if (!selectedTeamId) {
        throw new Error(`Could not find selected team: ${selectedTeam}`);
      }

      picksToInsert.push({
        userId,
        gameId: game[0].id,
        selectedTeamId
      });
    }

    // Process CFP picks
    for (const cfpColumn of cfpGameColumns) {
      const pickNumber = parseInt(cfpColumn.replace('CFP Game ', ''));
      const teamName = row[cfpColumn];

      if (!teamName) {
        throw new Error(`Missing CFP pick for ${cfpColumn} by ${userName}`);
      }

      const teamId = teamMap.get(teamName.toLowerCase());
      if (!teamId) {
        throw new Error(`Could not find team: ${teamName} for CFP pick`);
      }

      const gameId = cfpGameMap.get(pickNumber);
      if (!gameId) {
        throw new Error(`Could not find CFP game for pick number ${pickNumber}`);
      }

      picksToInsert.push({
        userId,
        gameId,
        selectedTeamId: teamId
      });
    }

    // Validate score
    const score = parseInt(row['Score']);
    if (isNaN(score)) {
      throw new Error(`Invalid score for user ${userName}`);
    }
    scoresToInsert.push({ userId, score });
  }

  // Batch insert all picks
  await db.insert(picks).values(picksToInsert.map(pick => ({
    userId: pick.userId,
    gameId: pick.gameId,
    selectedTeamId: pick.selectedTeamId,
    season: year
  })));

  // Batch insert all scores
  await db.insert(scorePredictions).values(scoresToInsert.map(score => ({
    userId: score.userId,
    score: score.score,
    season: year
  })));

  // For CFP picks, you might want to store them in a separate table
  // Add implementation here based on your schema

  return `Successfully processed ${records.length} entries with ${picksToInsert.length} picks`;
}