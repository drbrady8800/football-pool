"use client"
import React from 'react';
import { useYear } from '@/lib/contexts/year-context';
import { useGames } from '@/lib/api/hooks/use-games';
import { useStandings, useHypotheticalStandings } from '@/lib/api/hooks/use-standings';
import { Standing } from '@/lib/types';
import GameList from '@/components/games-list';
import Leaderboard from '@/components/leaderboard';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PredictionsPage() {
  const { year } = useYear()
  const { data: games = [], isLoading: gamesLoading } = useGames(year)
  const { data: standings = [], isLoading: standingsLoading } = useStandings(year)
  const [predictions, setPredictions] = React.useState<Record<string, string>>({});
  const [scorePredictions, setScorePredictions] = React.useState<Record<string, { homeScore: number; awayScore: number }>>({});
  const hypotheticalStandingsMutation = useHypotheticalStandings()
  const [hypotheticalStandings, setHypotheticalStandings] = React.useState<Array<Standing>>([]);

  // Initialize hypothetical standings with current standings
  React.useEffect(() => {
    if (standings.length > 0 && hypotheticalStandings.length === 0) {
      setHypotheticalStandings(standings);
    }
  }, [standings, hypotheticalStandings.length]);

  // Calculate hypothetical standings whenever predictions change
  React.useEffect(() => {
    const updateHypotheticalStandings = async () => {
      if (!standings.length || Object.keys(predictions).length === 0) {
        setHypotheticalStandings(standings);
        return;
      }

      try {
        let totalScorePrediction: number | undefined;
        if (Object.keys(scorePredictions).length === 1) {
          const scoresObject = Object.values(scorePredictions)[0];
          if (typeof scoresObject?.homeScore === 'number' || typeof scoresObject?.awayScore === 'number') {
            totalScorePrediction = (scoresObject?.homeScore || 0) + (scoresObject?.awayScore || 0);
          }
        }
        const newStandings = await hypotheticalStandingsMutation.mutateAsync({
          predictions,
          totalScorePrediction,
          year
        });
        setHypotheticalStandings(newStandings);
      } catch (error) {
        if (error instanceof Error) {
          toast({ 
            title: 'Error calculating standings:', 
            description: error.message, 
            variant: 'destructive' 
          });
        }
        setHypotheticalStandings(standings);
      }
    };

    updateHypotheticalStandings();
  }, [predictions, standings, scorePredictions, year, hypotheticalStandingsMutation]);

  // Handle prediction selection
  const handlePredictionSelect = async (gameId: string, teamId: string) => {
    try {
      // If clicking the same team, remove the prediction
      if (predictions[gameId] === teamId) {
        setPredictions(prev => {
          const newPredictions = { ...prev };
          delete newPredictions[gameId];
          return newPredictions;
        });
      } else {
        // Otherwise, set or update the prediction
        setPredictions(prev => ({
          ...prev,
          [gameId]: teamId
        }));
      }

    } catch (error) {
      // Revert local state if save fails
      setPredictions(prev => {
        const newPredictions = { ...prev };
        delete newPredictions[gameId];
        return newPredictions;
      });

      if (error instanceof Error) {
        toast({ 
          title: 'Error saving prediction:', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error saving prediction', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleScorePrediction = (gameId: string, scores: { homeScore: number; awayScore: number }) => {
    setScorePredictions(prev => ({
      ...prev,
      [gameId]: scores
    }));
  };
  
  const activeGames = games.filter(game => !game.isComplete);
  const loading = gamesLoading || standingsLoading || hypotheticalStandingsMutation.isPending;
  const initialized = !gamesLoading && !standingsLoading;

  return (
    <div className="container mx-auto px-4">
      {/* Desktop Layout */}
      <div className="flex flex-col-reverse lg:flex-row gap-8">
        <GameList 
          games={activeGames}
          isLoading={loading}
          isInitialized={initialized}
          title="Predictions" 
          predictionMode={true}
          predictions={predictions}
          onPredictionSelect={handlePredictionSelect}
          onScorePrediction={handleScorePrediction}
        />
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle>Predicted Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard
              condensed={true}
              standingsOverride={hypotheticalStandings}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
