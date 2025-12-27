"use client"
import React from 'react';

import { useYear } from '@/lib/contexts/year-context';
import { useGames } from '@/lib/api/hooks/use-games';
import GameList from '@/components/games-list';

export default function GamesPage() {
  const { year } = useYear()
  const { data: games = [], isLoading, isFetching } = useGames(year)
  
  // Separate active and completed games
  const activeGames = games.filter(game => !game.isComplete);
  const completedGames = games.filter(game => game.isComplete);
  
  const loading = isLoading || isFetching
  const initialized = !isLoading

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      <GameList games={activeGames} isLoading={loading} isInitialized={initialized} title="Upcoming Games" />
      <GameList games={completedGames} isLoading={loading} isInitialized={initialized} title="Completed Games" />
    </div>
  );
}