import { and, eq, sql, desc, like } from "drizzle-orm";
import { NextRequest } from 'next/server';

import db from "@/db/db";
import games from "@/db/schema/games";
import picks from "@/db/schema/picks";
import users from "@/db/schema/users";
import scorePredictions from "@/db/schema/scorePredictions";
import { getBowlYear, getGamePointValue, getMaxPoints } from "@/lib/utils";
import { type Standing } from "@/lib/types";
import { GameWithTeams, PickWithGameTeamUser } from "@/db/types";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const season = getBowlYear();
  const searchParams = request.nextUrl.searchParams;
  const numGames = searchParams.get('numGames') ? parseInt(searchParams.get('numGames')!) : null;

  try {
    // First get the game dates we want to include
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

    // Get championship game info
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
      // Calculate prediction points
      const actualTotal = (champGame.homeTeamScore || 0) + (champGame.awayTeamScore || 0);
      
      // Get all predictions for championship game
      const predictions: { userId: string, score: number }[] = await db
        .select({
          userId: scorePredictions.userId,
          score: scorePredictions.score,
        })
        .from(scorePredictions)
        .where(eq(scorePredictions.season, season));

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
          acc[pred.userId] = 4;
        } else if (pred.difference <= 5) {
          acc[pred.userId] = 3;
        } else if (pred.difference <= 10) {
          acc[pred.userId] = 2;
        } else {
          acc[pred.userId] = 0;
        }
        return acc;
      }, {} as Record<string, number>);
    }


    // Get all remaining games and picks
    const allPicks: PickWithGameTeamUser[] = await db.query.picks.findMany({
      with: {
        game: {
          where: and(
            eq(games.season, season),
            gameLimit ? sql`${games.gameDate} >= ${gameLimit}` : eq(games.isComplete, false),
          ),
          with: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        winningTeam: true,
        losingTeam: true,
        user: true,
      },
    });

    // Get eliminated teams
    const eliminatedTeams = await db
      .select({
        homeTeamId: games.homeTeamId,
        awayTeamId: games.awayTeamId,
        winningTeamId: games.winningTeamId,
      })
      .from(games)
      .where(
        and(
          eq(games.season, season),
          eq(games.isComplete, true),
          like(games.name, "%College Football Playoff%")
        )
      );

    const eliminatedTeamIds = eliminatedTeams.reduce((acc: string[], game: GameWithTeams) => {
      if (game.homeTeamId && game.homeTeamId !== game.winningTeamId) {
        acc.push(game.homeTeamId);
      }
      if (game.awayTeamId && game.awayTeamId !== game.winningTeamId) {
        acc.push(game.awayTeamId);
      }
      return acc;
    }, []);
    
    // Calculate standings with max points
    const standings: Standing[] = await db
      .select({
        userId: users.id,
        name: users.name,
        points: sql<number>`sum(${picks.pointsEarned})`,
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
      .orderBy(desc(sql`sum(${picks.pointsEarned})`));

    return Response.json({
      standings: standings.map((standing) => {
        const userPicks = allPicks.filter(pick => pick.userId === standing.userId);
        const currentPoints = Number(standing.points) + (predictionPoints[standing.userId] || 0) || 0;
        const maxPoints = getMaxPoints({
          currentPoints,
          picks: userPicks,
          eliminatedTeamIds,
        });

        return {
          userId: standing.userId,
          name: standing.name,
          totalPicks: Number(standing.totalPicks) || 0,
          points: currentPoints + (predictionPoints[standing.userId] || 0),
          predictionPoints: predictionPoints[standing.userId] || 0,
          maxPoints,
        };
      })
    });
  } catch (error) {
    console.error('Error calculating standings:', error);
    return Response.json({ error: 'Failed to calculate standings' }, { status: 500 });
  }
}

// Type for the predictions payload
type PredictionsPayload = {
  predictions: Record<string, string>; // gameId -> predictedTeamId
};

export async function POST(request: NextRequest) {
  try {
    const season = getBowlYear();
    const { predictions } = await request.json() as PredictionsPayload;

    // Get the predicted games with their names for point calculation
    const predictedGames: {
      id: string;
      name: string;
    }[] = await db
      .select({
        id: games.id,
        name: games.name,
      })
      .from(games)
      .where(
        sql`${games.id} IN ${Object.keys(predictions)}`
      );

    // Get all users and their current standings
    const baseStandings: {
      userId: string;
      name: string;
      points: number;
      totalPicks: number;
    }[] = await db
      .select({
        userId: users.id,
        name: users.name,
        points: sql<number>`sum(${picks.pointsEarned})`,
        totalPicks: sql<number>`count(*)`,
      })
      .from(users)
      .leftJoin(picks, eq(picks.userId, users.id))
      .leftJoin(games, eq(picks.gameId, games.id))
      .where(
        and(
          eq(games.season, season),
          eq(games.isComplete, true)
        )
      )
      .groupBy(users.id);

    // Get all existing picks for the predicted games
    const existingPicks: {
      userId: string;
      gameId: string;
      winningTeamId: string;
    }[] = await db
      .select({
        userId: picks.userId,
        gameId: picks.gameId,
        winningTeamId: picks.winningTeamId,
      })
      .from(picks)
      .where(
        and(
          eq(picks.season, season),
          sql`${picks.gameId} IN ${Object.keys(predictions)}`
        )
      );

    // Calculate hypothetical points for each user
    const hypotheticalStandings = baseStandings.map((standing) => {
      let hypotheticalPoints = Number(standing.points) || 0;
      let totalPicks = Number(standing.totalPicks) || 0;

      // Check each prediction against user's pick
      Object.entries(predictions).forEach(([gameId, predictedTeamId]) => {
        const userPick = existingPicks.find(
          pick => pick.userId === standing.userId && pick.gameId === gameId
        );
        
        const game = predictedGames.find(g => g.id === gameId);
        if (!game) return;

        const pointValue = getGamePointValue(game.name);

        if (userPick && userPick.winningTeamId === predictedTeamId) {
          hypotheticalPoints += pointValue;
          totalPicks += 1;
        }
      });

      return {
        userId: standing.userId,
        name: standing.name,
        totalPicks,
        points: hypotheticalPoints, // Add any additional scoring logic here
        predictionPoints: 0 // Could be used for championship prediction points
      } as Standing;
    });

    // Sort standings by points
    hypotheticalStandings.sort((a, b) => b.points - a.points);

    return Response.json({ standings: hypotheticalStandings });
  } catch (error) {
    console.error('Error calculating hypothetical standings:', error);
    return Response.json(
      { error: 'Failed to calculate hypothetical standings' }, 
      { status: 500 }
    );
  }
}
