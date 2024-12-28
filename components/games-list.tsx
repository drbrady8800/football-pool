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
}

function GamesListSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
      {[...Array(6)].map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function GamesList({ games, isLoading, title, href }: GamesListProps) {
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
            <GamesListSkeleton />
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
