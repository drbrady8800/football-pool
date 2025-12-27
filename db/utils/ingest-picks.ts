import { eq, and, asc, or, like } from "drizzle-orm";
import { parse } from 'csv-parse/sync';

import { getBowlYear } from "@/lib/utils";

import db from "@/db/db";
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import scorePredictions from "@/db/schema/scorePredictions";
import teams from "@/db/schema/teams";
import users from "@/db/schema/users";
import { Game, Team } from "@/db/types";

import { cfpStructureByYear } from "@/db/consts";

interface PickToInsert {
  userId: string;
  gameId: string;
  winningTeamId: string;
  losingTeamId: string;
}

interface ScorePredictionToInsert {
  userId: string;
  score: number;
}

interface PickTracker {
  [gameNumber: number]: {
    winningTeamId: string;
    losingTeamId: string;
  };
}

function processCFPPicks(
  cfpPicksByGame: { [gameNumber: number]: string },
  teamMap: Map<string, string>,
  cfpGames: Game[],
  userName: string,
): { winningTeamId: string; losingTeamId: string; gameId: string }[] {
  const cfpStructure = cfpStructureByYear[String(getBowlYear())];
  const picks: { winningTeamId: string; losingTeamId: string; gameId: string }[] = [];
  const pickTracker: PickTracker = {};

  // Process games in order based on dependencies
  for (const game of cfpStructure) {
    const gameNumber = game.gameNumber;
    const teamName = cfpPicksByGame[gameNumber];
    const winningTeamId = teamMap.get(teamName.toLowerCase());

    if (!winningTeamId) {
      throw new Error(`${userName} Could not find team: ${teamName} for CFP game ${gameNumber}`);
    }

    let losingTeamId: string;

    if (game.dependsOn) {
      // Handle games with dependencies
      if (game.dependsOn.length === 1) {
        // Games with one dependency and possibly a fixed opponent
        const dependency = game.dependsOn[0];
        const previousWinner = pickTracker[dependency.gameNumber].winningTeamId;
        const fixedOpponent = dependency.opponent ? teamMap.get(dependency.opponent.toLowerCase()) : undefined;
        
        // Validate the pick is one of these teams
        if (winningTeamId !== previousWinner && winningTeamId !== fixedOpponent) {
          throw new Error(
            `${userName} Invalid pick for game ${gameNumber}. Team must be either ${dependency.opponent} or the winner of game ${dependency.gameNumber}`
          );
        }
        
        // The losing team is whichever team wasn't picked as the winner
        losingTeamId = winningTeamId === previousWinner ? fixedOpponent! : previousWinner;
      } else {
        // Games between winners of previous games
        const team1 = pickTracker[game.dependsOn[0].gameNumber].winningTeamId;
        const team2 = pickTracker[game.dependsOn[1].gameNumber].winningTeamId;
        
        if (winningTeamId !== team1 && winningTeamId !== team2) {
          throw new Error(
            `${userName} Invalid pick for game ${gameNumber}. Team must be winner of either game ${game.dependsOn[0].gameNumber} or ${game.dependsOn[1].gameNumber}`
          );
        }
        losingTeamId = winningTeamId === team1 ? team2 : team1;
      }
    } else {
      // For initial games, use the game data to determine the losing team
      const game = cfpGames[gameNumber - 1];
      losingTeamId = game.homeTeamId === winningTeamId ? game.awayTeamId! : game.homeTeamId!;
    }

    // Store the pick for future reference
    pickTracker[gameNumber] = { winningTeamId, losingTeamId };
    
    picks.push({
      winningTeamId,
      losingTeamId,
      gameId: cfpGames[gameNumber - 1].id
    });
  }

  return picks;
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
    .where(and(
      like(games.name, "%College Football Playoff%"),
      eq(games.season, getBowlYear())
    ))
    .orderBy(asc(games.gameDate));

  if (cfpGames.length !== 11) {
    throw new Error('Database must contain exactly 11 CFP games');
  }

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
        throw new Error(`${userName} Invalid pick for ${gameColumn} by ${userName}. Must be either "${team1}" or "${team2}"`);
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

      const winningTeamId = teamMap.get(selectedTeam.toLowerCase());
      // Determine losing team
      const losingTeamId = selectedTeam.toLowerCase() === team1.toLowerCase() ? team2Id : team1Id;

      if (!winningTeamId) {
        throw new Error(`Could not find selected team: ${selectedTeam}`);
      }

      picksToInsert.push({
        userId,
        gameId: game[0].id,
        winningTeamId,
        losingTeamId
      });
    }

    
    // Process CFP picks
    const cfpPicksByGame: { [gameNumber: number]: string } = {};
    for (const cfpColumn of cfpGameColumns) {
      const pickNumber = parseInt(cfpColumn.replace('CFP Game ', ''));
      const teamName = row[cfpColumn];

      if (!teamName) {
        throw new Error(`Missing CFP pick for ${cfpColumn} by ${userName}`);
      }

      cfpPicksByGame[pickNumber] = teamName;
    }

    const cfpPicks = processCFPPicks(cfpPicksByGame, teamMap, cfpGames, userName);
    picksToInsert.push(...cfpPicks.map(pick => ({
      userId,
      gameId: pick.gameId,
      winningTeamId: pick.winningTeamId,
      losingTeamId: pick.losingTeamId
    })));

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
    winningTeamId: pick.winningTeamId,
    losingTeamId: pick.losingTeamId,
    season: year
  })));

  // Batch insert all scores
  await db.insert(scorePredictions).values(scoresToInsert.map(score => ({
    userId: score.userId,
    score: score.score,
    season: year
  })));

  return `Successfully processed ${records.length} entries with ${picksToInsert.length} picks`;
}
