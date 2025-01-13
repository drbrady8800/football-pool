"use client"
import React from 'react';
import { getGames } from '@/lib/api/games';
import { getStandings, getHypotheticalStandings } from '@/lib/api/standings';
import { GameWithTeams } from '@/db/types';
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
  const [games, setGames] = React.useState<Array<GameWithTeams>>([]);
  const [standings, setStandings] = React.useState<Array<Standing>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [predictions, setPredictions] = React.useState<Record<string, string>>({});
  const [scorePredictions, setScorePredictions] = React.useState<Record<string, { homeScore: number; awayScore: number }>>({});
  const [hypotheticalStandings, setHypotheticalStandings] = React.useState<Array<Standing>>([]);

  // Initial load
  React.useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const [initialGames, initialStandings] = await Promise.all([
          getGames(),
          getStandings({})
        ]);
        setGames(initialGames);
        setStandings(initialStandings);
        setHypotheticalStandings(initialStandings);
      } catch (error) {
        if (error instanceof Error) {
          toast({ 
            title: 'Error fetching data:', 
            description: error.message, 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error fetching data', 
            variant: 'destructive' 
          });
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    initialize();
  }, []);

  // Calculate hypothetical standings whenever predictions change
  React.useEffect(() => {
    const updateHypotheticalStandings = async () => {
      if (!standings.length || Object.keys(predictions).length === 0) {
        setHypotheticalStandings(standings);
        return;
      }

      try {
        let newStandings: Standing[] = [];
        let totalScorePrediction: number | undefined;
        if (Object.keys(scorePredictions).length === 1) {
          const scoresObject = Object.values(scorePredictions)[0];
          if (typeof scoresObject?.homeScore === 'number' || typeof scoresObject?.awayScore === 'number') {
            totalScorePrediction = (scoresObject?.homeScore || 0) + (scoresObject?.awayScore || 0);
          }
        }
        newStandings = await getHypotheticalStandings(predictions, totalScorePrediction);
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
  }, [predictions, standings, scorePredictions]);

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
