import { and, eq, sql, desc } from "drizzle-orm";
import { NextRequest } from 'next/server';

import db from "@/db/db";

import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import users from "@/db/schema/users";
import { getBowlYear } from "@/lib/utils";
import { type Standing } from "@/lib/types";

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  const season = getBowlYear();
  const searchParams = request.nextUrl.searchParams;
  const numGames = searchParams.get('numGames') ? parseInt(searchParams.get('numGames')!) : null;

  try {
    // First get the game dates we want to include, add a second to the end date to include the last game
    const gameLimit = numGames ? await db
      .select({ gameDate: games.gameDate })
      .from(games)
      .where(and(eq(games.isComplete, true), eq(games.season, season)))
      .orderBy(games.gameDate)
      .limit(numGames)
      .then((results: Array<{ gameDate: string }>) => {
        const lastDate = results.at(-1)?.gameDate;
        if (!lastDate) return null;
        return new Date(new Date(lastDate).getTime() + 1000).toISOString();
      }) : null;
    
    const standings = await db
      .select({
        userId: users.id,
        name: users.name,
        correctPicks: sql<number>`sum(case when ${picks.selectedTeamId} = ${games.winningTeamId} then 1 else 0 end)`,
        totalPicks: sql<number>`count(*)`,
        accuracy: sql<number>`sum(case when ${picks.selectedTeamId} = ${games.winningTeamId} then 1 else 0 end)::float / count(*) * 100`
      })
      .from(users)
      .leftJoin(picks, eq(picks.userId, users.id))
      .leftJoin(games, eq(picks.gameId, games.id))
      .where(
        and(
          // Only add the date filter if we have a game limit
          gameLimit ? sql`${games.gameDate} <= ${gameLimit}` : undefined,
          eq(games.season, season),
          eq(games.isComplete, true)
        )
      )
      .groupBy(users.id)
      .orderBy(
        desc(sql`sum(case when ${picks.selectedTeamId} = ${games.winningTeamId} then 1 else 0 end)`),
        desc(sql`sum(case when ${picks.selectedTeamId} = ${games.winningTeamId} then 1 else 0 end)::float / count(*) * 100`)
      )

    return Response.json({
      standings: standings.map((standing: Standing) => ({
        userId: standing.userId,
        name: standing.name,
        correctPicks: Number(standing.correctPicks) || 0,
        totalPicks: Number(standing.totalPicks) || 0,
        accuracy: Number(standing.accuracy) || 0,
        points: Number(standing.correctPicks) || 0
      }))
    })
  } catch (error) {
    console.error('Error calculating standings:', error)
    return Response.json({ error: 'Failed to calculate standings' }, { status: 500 })
  }
}
