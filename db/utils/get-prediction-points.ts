import { and, eq, like } from 'drizzle-orm';

import db from '@/db/db';
import games from '@/db/schema/games';
import scorePredictions from '@/db/schema/scorePredictions';
import { type Prediction } from '@/lib/types';

function calculatePoints(predictions: Prediction[], actualTotal: number): Record<string, number> {
  // Calculate differences and find the closest prediction
  const predictionsWithDiff = predictions.map(pred => ({
    userId: pred.userId,
    difference: Math.abs((Number(pred.score) || 0) - actualTotal)
  }));

  // Sort by difference to find closest
  predictionsWithDiff.sort((a, b) => a.difference - b.difference);
  const closestDiff = predictionsWithDiff[0]?.difference;

  // Award points based on prediction accuracy
  return predictionsWithDiff.reduce((acc, pred) => {
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

export async function calculatePredictionPoints(season: number): Promise<Record<string, number>> {
  let predictionPoints: Record<string, number> = {};
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

  if (champGame?.isComplete) {
    const actualTotal = (champGame.homeTeamScore || 0) + (champGame.awayTeamScore || 0);
    
    // Get all predictions for championship game
    const predictions = await db
      .select({
        userId: scorePredictions.userId,
        score: scorePredictions.score,
      })
      .from(scorePredictions)
      .where(
        eq(scorePredictions.season, season),
      );

    predictionPoints = calculatePoints(predictions, actualTotal);
  }
  return predictionPoints;
}