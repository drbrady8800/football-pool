import { and, eq, sql, desc, isNull, like } from "drizzle-orm";
import { NextRequest } from 'next/server';

import db from "@/db/db";
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import users from "@/db/schema/users";
import scorePredictions from "@/db/schema/scorePredictions";
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

    // Check if championship game is complete and get its scores
    const championshipGame = await db
      .select({
        id: games.id,
        homeTeamScore: games.homeTeamScore,
        awayTeamScore: games.awayTeamScore,
        isComplete: games.isComplete,
      })
      .from(games)
      .where(
        and(
          eq(games.season, season),
          like(games.name, "%National Championship%")
        )
      )
      .limit(1);

    const champGame = championshipGame[0];
    let predictionPoints: Record<string, number> = {};
    
    if (champGame?.isComplete) {
      const actualTotal = (champGame.homeTeamScore || 0) + (champGame.awayTeamScore || 0);
      
      // Get all predictions for championship game
      const predictions: { userId: string, score: number }[] = await db
        .select({
          userId: scorePredictions.userId,
          score: scorePredictions.score,
        })
        .from(scorePredictions)
        .where(
          eq(scorePredictions.season, season),
        );

      // Calculate differences and find the closest prediction
      const predictionsWithDiff = predictions.map(pred => ({
        userId: pred.userId,
        difference: Math.abs((Number(pred.score) || 0) - actualTotal)
      }));

      // Sort by difference to find closest
      predictionsWithDiff.sort((a, b) => a.difference - b.difference);
      const closestDiff = predictionsWithDiff[0]?.difference;

      // Award points based on prediction accuracy
      predictionPoints = predictionsWithDiff.reduce((acc, pred) => {
        if (pred.difference === closestDiff) {
          acc[pred.userId] = 4; // Closest prediction
        } else if (pred.difference <= 5) {
          acc[pred.userId] = 3; // Within 5 points
        } else if (pred.difference <= 10) {
          acc[pred.userId] = 2; // Within 10 points
        } else {
          acc[pred.userId] = 0;
        }
        return acc;
      }, {} as Record<string, number>);
    }
    
    const standings = await db
      .select({
        userId: users.id,
        name: users.name,
        correctPicks: sql<number>`sum(${picks.pointsEarned})`,
        totalPicks: sql<number>`count(*)`,
      })
      .from(users)
      .leftJoin(picks, eq(picks.userId, users.id))
      .leftJoin(games, eq(picks.gameId, games.id))
      .where(
        and(
          gameLimit ? sql`${games.gameDate} <= ${gameLimit}` : undefined,
          eq(games.season, season),
          eq(games.isComplete, true)
        )
      )
      .groupBy(users.id)
      .orderBy(
        desc(sql`sum(${picks.pointsEarned})`),
      );

    return Response.json({
      standings: standings.map((standing: Standing) => ({
        userId: standing.userId,
        name: standing.name,
        correctPicks: Number(standing.correctPicks) || 0,
        totalPicks: Number(standing.totalPicks) || 0,
        points: (Number(standing.correctPicks) || 0) + (predictionPoints[standing.userId] || 0),
        predictionPoints: predictionPoints[standing.userId] || 0
      }))
    });
  } catch (error) {
    console.error('Error calculating standings:', error);
    return Response.json({ error: 'Failed to calculate standings' }, { status: 500 });
  }
}
