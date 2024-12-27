import fetch from 'node-fetch';
import { eq, and } from 'drizzle-orm';

import db from '@/db/db';
import games from '@/db/schema/games';
import teams from '@/db/schema/teams';
import { teamsByYear } from '@/db/consts'
import { parseDate } from '@/lib/utils';

export interface GameApiResponse {
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
        'Authorization': `Bearer ${process.env.COLLEGE_FOOTBALL_DATA_API_KEY}`
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

async function gameExists(homeTeamId: string, awayTeamId: string, gameDate: Date): Promise<boolean> {
  const existingGame = await db.select({ id: games.id })
    .from(games)
    .where(
      and(
        eq(games.homeTeamId, homeTeamId),
        eq(games.awayTeamId, awayTeamId),
        eq(games.gameDate, gameDate)
      )
    )
    .limit(1);

  return existingGame.length > 0;
}

// Main function to process and insert games
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
      const exists = await gameExists(game.homeTeamId, game.awayTeamId, game.gameDate);
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

  return `Operation complete: ${insertedCount} games inserted, ${skippedCount} games skipped (already existed)`;
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
  let updatedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < apiTeamsFiltered.length; i += batchSize) {
    const batch = apiTeamsFiltered.slice(i, i + batchSize);
    const transformedGames = await Promise.all(batch.map(transformGameData));
    
    for (const game of transformedGames) {
      const exists = await gameExists(game.homeTeamId, game.awayTeamId, game.gameDate);
      if (exists) {
        await db
          .update(games)
          .set(game)
          .where(
            and(
              eq(games.homeTeamId, game.homeTeamId),
              eq(games.awayTeamId, game.awayTeamId),
              eq(games.gameDate, game.gameDate)
            )
          );
        updatedCount++;
      } else {
        notFoundCount++;
      }
    }
  }

  return `Operation complete: ${updatedCount} games updated, ${notFoundCount} were unable to be updated (not found)`;
}
