import { fetchGameById } from '@/lib/api/games';
import { fetchPicks } from '@/lib/api/picks';
import GameCard from '@/components/game-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function GameIdPage({
  params,
}: {
  params: { gameId: string };
}) {
  const gameId = params.gameId;
  const game = await fetchGameById(gameId);
  const picksForGame = await fetchPicks({ gameId });
  
  const homeTeamPicks = picksForGame.filter(pick => pick.selectedTeamId === game.homeTeam.id);
  const awayTeamPicks = picksForGame.filter(pick => pick.selectedTeamId === game.awayTeam.id);
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
      <Card>
        <CardHeader className="pb-0">
          <GameCard game={game} isHeader={true}/>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Home Team Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: game.homeTeam.primaryColor }}
                  />
                  <h3 className="font-semibold text-lg">{game.homeTeam.name} Picks</h3>
                </div>
                <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                  {homeTeamPicks.length}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {homeTeamPicks.map((pick) => (
                  <Link 
                    key={pick.id}
                    href={`/leaderboard/${pick.userId}`}
                    className={`group relative text-sm py-1 px-2 rounded-md transition-colors ${
                      game.isComplete 
                        ? game.winningTeamId === pick.selectedTeamId 
                          ? 'bg-green-50 hover:bg-green-100 text-green-700' 
                          : 'bg-red-50 hover:bg-red-100 text-red-700'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center justify-between cursor-pointer">
                      {pick.user.name}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Away Team Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: game.awayTeam.primaryColor }}
                  />
                  <h3 className="font-semibold text-lg">{game.awayTeam.name} Picks</h3>
                </div>
                <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                  {awayTeamPicks.length}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {awayTeamPicks.map((pick) => (
                  <Link 
                    key={pick.id}
                    href={`/leaderboard/${pick.userId}`}
                    className={`group relative text-sm py-1 px-2 rounded-md transition-colors ${
                      game.isComplete 
                        ? game.winningTeamId === pick.selectedTeamId 
                          ? 'bg-green-50 hover:bg-green-100 text-green-700' 
                          : 'bg-red-50 hover:bg-red-100 text-red-700'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {pick.user.name}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}