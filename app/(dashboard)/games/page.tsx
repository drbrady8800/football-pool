import { fetchGames } from '@/lib/api/games';
import GameCard from '@/components/game-card';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GamesPage() {
  const games = await fetchGames();
  
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
            {activeGames.length > 0 ? (
              activeGames
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => (
                  <GameCard game={game} key={game.id} />
                ))
            ) : (
              <p>No active games available at the moment.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Games Section */}
      {completedGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
              {completedGames
                .sort((a, b) => a.gameDate < b.gameDate ? -1 : 1)
                .map(game => (
                  <GameCard game={game} key={game.id} />
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}