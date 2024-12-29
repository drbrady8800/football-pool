"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getGameById } from '@/lib/api/games';
import { getPicks } from '@/lib/api/picks';
import GameCard from '@/components/game-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type GameWithTeams, type PickWithGameTeamUser } from '@/db/types';
import { toast } from '@/hooks/use-toast';

export default function GameIdPage({
  params,
}: {
  params: { gameId: string };
}) {
  const [game, setGame] = React.useState<GameWithTeams | null>(null);
  const [picks, setPicks] = React.useState<PickWithGameTeamUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gameData, picksData] = await Promise.all([
          getGameById(params.gameId),
          getPicks({ gameId: params.gameId })
        ]);
        setGame(gameData);
        setPicks(picksData);
      } catch (error) {
        if (error instanceof Error) {
          toast({ 
            title: 'Error fetching game data:', 
            description: error.message, 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error fetching game data', 
            variant: 'destructive' 
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.gameId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[...Array(18)].map((_, i) => (
                      <Skeleton key={`home-${i}`} className="h-6" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[...Array(18)].map((_, i) => (
                      <Skeleton key={`away-${i}`} className="h-6" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Get all unique teams from picks
  const uniqueTeams = Array.from(
    new Set(picks.map(pick => pick.winningTeamId))
  ).map(teamId => {
    const pick = picks.find(p => p.winningTeamId === teamId);
    if (!pick) return null;
    return {
      id: teamId,
      team: pick.winningTeam,
      picks: picks.filter(p => p.winningTeamId === teamId)
    };
  }).filter((team): team is NonNullable<typeof team> => team !== null)
    .sort((a, b) => b.picks.length - a.picks.length);

  // Check if we should use the original two-team layout
  const shouldUseTwoTeamLayout = uniqueTeams.length === 2 && game.homeTeamId && game.awayTeamId && 
    uniqueTeams.every(team => team.id === game.homeTeamId || team.id === game.awayTeamId);

  // Helper function to determine if a pick is valid
  const isValidPick = (pick: PickWithGameTeamUser) => {
    if (!game.homeTeamId || !game.awayTeamId) return true;
    return pick.winningTeamId === game.homeTeamId || pick.winningTeamId === game.awayTeamId;
  };

  // Helper function to get pick status class
  const getPickStatusClass = (pick: PickWithGameTeamUser) => {
    if (!isValidPick(pick)) {
      return 'bg-red-50 hover:bg-red-100 text-red-700';
    }
    
    if (game.isComplete) {
      return game.winningTeamId === pick.winningTeamId 
        ? 'bg-green-50 hover:bg-green-100 text-green-700'
        : 'bg-red-50 hover:bg-red-100 text-red-700';
    }
    
    return 'bg-gray-50 hover:bg-gray-100 text-gray-600';
  };

  if (shouldUseTwoTeamLayout) {
    const homeTeamPicks = picks.filter(pick => pick.winningTeamId === game.homeTeam.id);
    const awayTeamPicks = picks.filter(pick => pick.winningTeamId === game.awayTeam.id);

    return (
      <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
        <Card>
          <CardHeader className="pb-0">
            <GameCard game={game} isHeader={true} />
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
                      className={`group relative text-sm py-1 px-2 rounded-md transition-colors ${getPickStatusClass(pick)}`}
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
                      className={`group relative text-sm py-1 px-2 rounded-md transition-colors ${getPickStatusClass(pick)}`}
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

  // Multi-team layout for bracket scenarios or invalid picks
  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
      <Card>
        <CardHeader className="pb-0">
          <GameCard game={game} isHeader={true} />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {uniqueTeams.map(({ team, picks: teamPicks }) => (
              <div key={team.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.primaryColor }}
                    />
                    <h3 className="font-semibold text-lg truncate">{team.name} Picks</h3>
                  </div>
                  <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                    {teamPicks.length}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  {teamPicks.map((pick) => (
                    <Link 
                      key={pick.id}
                      href={`/leaderboard/${pick.userId}`}
                      className={`group relative text-sm py-1 px-2 rounded-md transition-colors ${getPickStatusClass(pick)}`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="truncate">{pick.user.name}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
