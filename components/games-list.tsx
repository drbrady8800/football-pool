"use client"
import React from 'react';
import { GameWithTeams } from '@/db/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CarderHeaderWithLink from '@/components/card-header-link';
import { InfoGameCard, GameCardSkeleton, PickableGameCard } from '@/components/game-card';
import ScorePredictionForm from '@/components/score-prediction-form';


interface GamesListProps {
  games: GameWithTeams[];
  isLoading: boolean;
  isInitialized: boolean;
  title: string;
  href?: string;
  predictionMode?: boolean;
  predictions?: Record<string, string>; // gameId -> teamId mapping
  onPredictionSelect?: (gameId: string, teamId: string) => void;
  onScorePrediction?: (gameId: string, scores: { homeScore: number; awayScore: number }) => void;
}

function GamesListSkeleton({ predictionMode = false }: { predictionMode?: boolean }) {
  return (
    <div className={`${!predictionMode ? "xl:grid-cols-2" : ""} grid grid-cols-1 gap-6 justify-items-center`}>
      {[...Array(6)].map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function GamesList({ 
  games,
  isLoading,
  isInitialized,
  title, 
  href,
  predictionMode = false,
  predictions = {},
  onPredictionSelect,
  onScorePrediction,
}: GamesListProps) {
  // Handler for team selection in prediction mode
  const handlePredictionSelect = (gameId: string, teamId: string) => {
    if (predictionMode && onPredictionSelect) {
      onPredictionSelect(gameId, teamId);
    }
  };

  // Sort games by date
  const sortedGames = [...games].sort((a, b) => a.gameDate < b.gameDate ? -1 : 1);
  
  // Get the last game for score predictions
  const lastGame = sortedGames[sortedGames.length - 1];

  return (
    <div className="w-full mx-auto space-y-8">
      <Card>
        {href ? (
          <CarderHeaderWithLink title={title} href={href} />
        ) : (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {isLoading || !isInitialized ? (
            <GamesListSkeleton predictionMode={predictionMode}/>
          ) : (
            <div className="space-y-6">
              <div className={`${!predictionMode ? "xl:grid-cols-2" : ""} grid grid-cols-1 gap-6 justify-items-center`}>
                {sortedGames.map(game => {
                  return predictionMode ? (
                    <div key={game.id} className="w-full">
                      <PickableGameCard
                        game={game}
                        selectedTeamId={predictions[game.id] || undefined}
                        onTeamSelect={(teamId) => handlePredictionSelect(game.id, teamId)}
                      />
                      {game.id === lastGame?.id && onScorePrediction && (
                        <ScorePredictionForm
                          game={game}
                          onScorePrediction={onScorePrediction}
                          selectedTeamId={predictions[game.id]}
                          onTeamSelect={(teamId) => handlePredictionSelect(game.id, teamId)}
                        />
                      )}
                    </div>
                  ) : (
                    <InfoGameCard 
                      game={game} 
                      key={game.id}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
