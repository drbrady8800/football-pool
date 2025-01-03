"use client"
import React from 'react';

import { getGames } from '@/lib/api/games';
import { GameWithTeams } from '@/db/types';
import GameList from '@/components/games-list';
import { toast } from '@/hooks/use-toast';

export default function GamesPage() {
  const [games, setGames] = React.useState<Array<GameWithTeams>>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [initialized, setInitialized] = React.useState<boolean>(false)

  // Initial load
  React.useEffect(() => {
    const initializeGames = async () => {
      try {
        setLoading(true)
        // Then fetch initial standings
        const initialGames = await getGames()
        setGames(initialGames)
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching games:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching games', variant: 'destructive' })
        }
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    initializeGames()
  }, [])
  
  // Separate active and completed games
  const activeGames = games.filter(game => !game.isComplete);
  const completedGames = games.filter(game => game.isComplete);

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      <GameList games={activeGames} isLoading={loading} isInitialized={initialized} title="Upcoming Games" />
      <GameList games={completedGames} isLoading={loading} isInitialized={initialized} title="Completed Games" />
    </div>
  );
}