import { and, eq, sql } from "drizzle-orm";
import { alias } from 'drizzle-orm/pg-core';

import db from "@/db/db";
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import users from "@/db/schema/users";
import teams from "@/db/schema/teams";
import { getBowlYear } from "@/lib/utils";
import { type StandingChartColumn } from "@/lib/types";

export const dynamic = 'force-dynamic';

type GameResult = {
  gameId: number;
  gameName: string;
  gameDate: Date;
  userId: string;
  name: string;
  cumulativePoints: number;
};

export async function GET() {
  const season = getBowlYear();

  try {
    // Alias tables for home and away teams
    const homeTeam = alias(teams, 'homeTeam');
    const awayTeam = alias(teams, 'awayTeam');

    // First, get cumulative points for each user after each game
    const results = await db
      .select({
        gameId: games.id,
        gameName: sql<string>`${homeTeam.abbreviation} || ' vs ' || ${awayTeam.abbreviation}`,
        gameDate: games.gameDate,
        userId: users.id,
        name: users.name,
        cumulativePoints: sql<number>`
          sum(case when ${picks.winningTeamId} = ${games.winningTeamId} then 1 else 0 end) 
          over (
            partition by ${users.id} 
            order by ${games.gameDate} 
            rows between unbounded preceding and current row
          )
        `,
      })
      .from(users)
      .leftJoin(picks, eq(picks.userId, users.id))
      .leftJoin(games, eq(picks.gameId, games.id))
      .leftJoin(homeTeam, eq(games.homeTeamId, homeTeam.id))
      .leftJoin(awayTeam, eq(games.awayTeamId, awayTeam.id))
      .where(
        and(
          eq(games.season, season),
          eq(games.isComplete, true)
        )
      )
      .orderBy(games.gameDate, users.id);

    // Transform the data into the desired format
    const gameStandings: StandingChartColumn[] = [];
    let currentGame: string | null = null;
    let currentStanding: StandingChartColumn | null = null;

    results.forEach((row: GameResult) => {
      if (currentGame !== row.gameName) {
        if (currentStanding) {
          gameStandings.push(currentStanding);
        }
        currentGame = row.gameName;
        currentStanding = {
          game: row.gameName,
        };
      }

      if (currentStanding) {
        currentStanding[row.userId] = row.cumulativePoints;
      }
    });

    // Don't forget to push the last standing
    if (currentStanding) {
      gameStandings.push(currentStanding);
    }

    return Response.json(gameStandings);

  } catch (error) {
    console.error('Error calculating standings over time:', error);
    return Response.json({ error: 'Failed to calculate standings over time' }, { status: 500 });
  }
}