"use client"
import React from 'react';

import { fetchGames } from '@/lib/api/games';
import { GameWithTeams } from '@/db/types';
import GameCard from '@/components/game-card';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';

export default function GamesPage() {
  const [games, setGames] = React.useState<Array<GameWithTeams>>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  // Initial load
  React.useEffect(() => {
    const initializeGames = async () => {
      try {
        setLoading(true)
        // Then fetch initial standings
        const initialGames = await fetchGames()
        setGames(initialGames)
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching game:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching games', variant: 'destructive' })
        }
      } finally {
        setLoading(false)
      }
    }
    initializeGames()
  }, [])
  
  // Separate active and completed games
  const activeGames = games.filter(game => !game.isComplete);
  const completedGames = games.filter(game => game.isComplete);

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      {/* Active Games Section */}
      <Card>
        <CardHeader>
          <CardTitle>Remaining Games</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No games available</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
              {activeGames
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => (
                  <GameCard game={game} key={game.id} />
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Games</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : games.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No games available</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
                {completedGames
                  .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                  .map(game => (
                    <GameCard game={game} key={game.id} />
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}