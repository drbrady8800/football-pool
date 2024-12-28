"use client"
import React from 'react';

import { GameWithTeams } from '@/db/types';
import GameCard from '@/components/game-card';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GamesListProps {
  games: GameWithTeams[];
  isLoading: boolean;
  title: string;
}

export default function GamesList({ games, isLoading, title }: GamesListProps) {

  return (
    <div className="w-full mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No games available</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
              {games
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => (
                  <GameCard game={game} key={game.id} />
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}