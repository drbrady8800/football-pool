"use client"
import React from 'react';
import { GameWithTeams } from '@/db/types';
import GameCard, { GameCardSkeleton } from '@/components/game-card';
import CarderHeaderWithLink from './card-header-link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GamesListProps {
  games: GameWithTeams[];
  isLoading: boolean;
  title: string;
  href?: string;
  predictionMode?: boolean;
  predictions?: Record<string, string>; // gameId -> teamId mapping
  onPredictionSelect?: (gameId: string, teamId: string) => void;
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
  title, 
  href,
  predictionMode = false,
  predictions = {},
  onPredictionSelect
}: GamesListProps) {
  // Handler for team selection in prediction mode
  const handlePredictionSelect = (gameId: string, teamId: string) => {
    if (predictionMode && onPredictionSelect) {
      onPredictionSelect(gameId, teamId);
    }
  };

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
          {isLoading || games.length === 0 ? (
            <GamesListSkeleton predictionMode={predictionMode}/>
          ) : (
            <div className={`${!predictionMode ? "xl:grid-cols-2" : ""} grid grid-cols-1 gap-6 justify-items-center`}>
              {games
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => (
                  <GameCard 
                    game={game} 
                    key={game.id}
                    predictionMode={predictionMode}
                    winningTeamId={predictions[game.id]}
                    onPredictionSelect={(teamId) => handlePredictionSelect(game.id, teamId)}
                  />
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
