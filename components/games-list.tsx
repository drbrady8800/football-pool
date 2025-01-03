"use client"
import React from 'react';
import { GameWithTeams } from '@/db/types';
import { InfoGameCard, GameCardSkeleton, PickableGameCard } from '@/components/game-card';
import CarderHeaderWithLink from './card-header-link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GamesListProps {
  games: GameWithTeams[];
  isLoading: boolean;
  isInitialized: boolean;
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
  isInitialized,
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
          {isLoading || !isInitialized ? (
            <GamesListSkeleton predictionMode={predictionMode}/>
          ) : (
            <div className={`${!predictionMode ? "xl:grid-cols-2" : ""} grid grid-cols-1 gap-6 justify-items-center`}>
              {games
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => {
                  return predictionMode ? (
                    <PickableGameCard
                      game={game}
                      key={game.id}
                      selectedTeamId={predictions[game.id] || undefined}
                      onTeamSelect={(teamId) => handlePredictionSelect(game.id, teamId)}
                    />
                  ) : (
                    <InfoGameCard 
                      game={game} 
                      key={game.id}
                    />
                  )}
                )
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
