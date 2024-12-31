import fetch from 'node-fetch';
import { eq, and, or, sql } from 'drizzle-orm';

import db from '@/db/db';
import games from '@/db/schema/games';
import picks from '@/db/schema/picks';
import teams from '@/db/schema/teams';
import { teamsByYear } from '@/db/consts'
import { parseDate, getGamePointValue } from '@/lib/utils';
import { Game } from '../types';

interface GameApiResponse {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  start_time_tbd: boolean;
  completed: boolean;
  neutral_site: boolean;
  conference_game: boolean;
  attendance: number;
  venue_id: number;
  venue: string;
  
  // Home team data
  home_id: number;
  home_team: string;
  home_conference: string;
  home_division: string;
  home_points: number;
  home_line_scores: number[];
  home_post_win_prob: number;
  home_pregame_elo: number;
  home_postgame_elo: number;
  
  // Away team data
  away_id: number;
  away_team: string;
  away_conference: string;
  away_division: string;
  away_points: number;
  away_line_scores: number[];
  away_post_win_prob: number;
  away_pregame_elo: number;
  away_postgame_elo: number;
  
  // Game metadata
  excitement_index: number;
  highlights: string;
  notes: string;
}

interface GameApiTransformed {
  name: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: Date;
  winningTeamId: string | null;
  homeTeamScore: number;
  awayTeamScore: number;
  isComplete: boolean;
  season: number;
}

// Modify the team lookup function to be more efficient
async function getTeamId(teamName: string): Promise<string> {
  const result = await db.select({ id: teams.id })
    .from(teams)
    .where(eq(teams.name, teamName))
    .limit(1);
  
  if (!result.length) {
    throw new Error(`Team not found: ${teamName}`);
  }
  
  return result[0].id;
}

// Function to fetch teams from the API
async function fetchPostseasonGames(year: number): Promise<GameApiResponse[]> {
  const response = await fetch(
    `https://api.collegefootballdata.com/games?year=${year}&seasonType=postseason`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COLLEGE_FOOTBALL_DATA_API_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.statusText}`);
  }

  return response.json() as Promise<GameApiResponse[]>;
}

// Function to transform API data to match our schema
async function transformGameData(apiGame: GameApiResponse) {
  // Get team IDs concurrently
  const [homeTeamId, awayTeamId] = await Promise.all([
    getTeamId(apiGame.home_team),
    getTeamId(apiGame.away_team)
  ]);

  // Determine winning team
  let winningTeamId = null;
  if (apiGame.home_points > apiGame.away_points) {
    winningTeamId = homeTeamId;
  } else if (apiGame.home_points < apiGame.away_points) {
    winningTeamId = awayTeamId;
  }

  // Parse the date string into a proper Date object
  const gameDate = parseDate(apiGame.start_date);

  return {
    name: apiGame.notes,
    homeTeamId,
    awayTeamId,
    gameDate,
    winningTeamId,
    homeTeamScore: apiGame.home_points,
    awayTeamScore: apiGame.away_points,
    isComplete: apiGame.completed,
    season: apiGame.season,
  };
}

async function getExistingGame(homeTeamId: string, awayTeamId: string, gameDate: Date, name: string): Promise<Game | null> {
  const [existingGame] = await db
    .select()
    .from(games)
    .where(
      or(
        and(
          eq(games.homeTeamId, homeTeamId),
          eq(games.awayTeamId, awayTeamId),
          eq(games.gameDate, gameDate)
        ),
        and(
          eq(games.name, name),
          eq(games.gameDate, gameDate)
        )
      )
    )
    .limit(1);

  return existingGame;
}

export async function ingestGames({ year }: {year: number }): Promise<string> {
  if (!(String(year) in teamsByYear)) {
    return `No teams found for year ${year}`;
  }

  // Fetch games from the API
  const apiGames = await fetchPostseasonGames(year);
  const teamsForGivenYear = teamsByYear[String(year) as keyof typeof teamsByYear];
  
  // Filter relevant games
  const apiTeamsFiltered = apiGames.filter(game => 
    teamsForGivenYear.includes(game.home_team) && 
    teamsForGivenYear.includes(game.away_team)
  );

  // Process games in smaller batches
  const batchSize = 10;
  let insertedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < apiTeamsFiltered.length; i += batchSize) {
    const batch = apiTeamsFiltered.slice(i, i + batchSize);
    const transformedGames = await Promise.all(batch.map(transformGameData));
    
    // Filter out existing games
    const newGames = [];
    for (const game of transformedGames) {
      const exists = await getExistingGame(game.homeTeamId, game.awayTeamId, game.gameDate, game.name);
      if (!exists) {
        newGames.push(game);
      } else {
        skippedCount++;
      }
    }

    // Insert new games
    if (newGames.length > 0) {
      await db.insert(games).values(newGames);
      insertedCount += newGames.length;
    }
  }

  return `Operation complete: ${insertedCount} games inserted, ${skippedCount} games skipped`;
}

async function updatePicksPoints(apiGame: GameApiTransformed, dbGame: Game): Promise<void> {
  const pointsValue = getGamePointValue(apiGame.name);
  // If the game has a winner, update related picks
  if (apiGame.winningTeamId !== null) {
    await db
      .update(picks)
      .set({ 
        pointsEarned: sql`CASE WHEN winning_team_id = ${apiGame.winningTeamId} THEN ${pointsValue} ELSE 0 END` 
      })
      .where(eq(picks.gameId, dbGame.id));
  }
}

export async function updateGames({ year }: {year: number }): Promise<string> {
  if (!(String(year) in teamsByYear)) {
    return `No teams found for year ${year}`;
  }

  // Fetch games from the API
  const apiGames = await fetchPostseasonGames(year);
  const teamsForGivenYear = teamsByYear[String(year) as keyof typeof teamsByYear];
  
  // Filter relevant games
  const apiTeamsFiltered = apiGames.filter(game => 
    teamsForGivenYear.includes(game.home_team) && 
    teamsForGivenYear.includes(game.away_team)
  );

  // Process games in smaller batches
  const batchSize = 10;
  let foundCount = 0;
  let changedCount = 0;

  for (let i = 0; i < apiTeamsFiltered.length; i += batchSize) {
    const batch = apiTeamsFiltered.slice(i, i + batchSize);
    const transformedGames = await Promise.all(batch.map(transformGameData));
    
    for (const game of transformedGames) {
      // Find matching game either by teams+date or by name
      const currentGame = await getExistingGame(game.homeTeamId, game.awayTeamId, game.gameDate, game.name);

      if (currentGame) {
        foundCount++;
        
        // Check if any fields are actually different
        const hasChanges = Object.keys(game).some(key => {
          const k = key as keyof typeof game;
          // Special handling for date comparison
          if (k === 'gameDate') {
            const date1 = new Date(game[k]);
            const date2 = new Date(currentGame[k]);
            return date1.toISOString().split('T')[0] !== date2.toISOString().split('T')[0];
          }
          return game[k] !== currentGame[k];
        });

        if (hasChanges) {
          await db
            .update(games)
            .set(game)
            .where(eq(games.id, currentGame.id)); // Update by ID instead of composite key
          changedCount++;
        }

        await updatePicksPoints(game, currentGame);
      }
    }
  }

  return `Operation complete: ${foundCount} games found, ${changedCount} ${changedCount === 1 ? 'game' : 'games'} had changes`;
}
