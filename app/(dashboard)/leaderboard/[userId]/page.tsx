'use client';

import React, { useEffect, useState } from 'react';

import { type PickWithGameTeamUser } from '@/db/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerGameCard, GameCardSkeleton } from '@/components/game-card';

import { getEliminatedCFPTeams } from '@/lib/api/teams';
import { useYear } from '@/lib/contexts/year-context';
import { usePicks } from '@/lib/api/hooks/use-picks';
import { useStandings } from '@/lib/api/hooks/use-standings';
import { isLastPlace, isFirstPlace } from '@/lib/utils'; 

function LoadingState() {
  return (
    <Card>
      <CardHeader className="flex md:flex-row flex-col gap-4 md:items-center justify-between">
        <Skeleton className="h-8 w-48" /> {/* Name */}
        <div className='flex md:flex-row flex-col gap-4'>
          <Skeleton className="h-6 w-20" /> {/* Points Badge */}
          <Skeleton className="h-6 w-24" /> {/* Max Points Badge */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
          {[...Array(6)].map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PersonPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;
  const { year } = useYear();
  const { data: picksData = [], isLoading: picksLoading } = usePicks({ userId, year });
  const { data: standingsData = [], isLoading: standingsLoading } = useStandings(year);
  const [eliminatedTeams, setEliminatedTeams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sort picks by game date
  const picks = React.useMemo(() => {
    return [...picksData].sort((a, b) => {
      return a.game.gameDate < b.game.gameDate ? -1 : 1;
    });
  }, [picksData]);

  const standings = standingsData;

  useEffect(() => {
    const fetchEliminatedTeams = async () => {
      try {
        const eliminatedTeamsData = await getEliminatedCFPTeams();
        setEliminatedTeams(eliminatedTeamsData || []);
      } catch (err) {
        console.error('Error fetching eliminated teams:', err);
      }
    };

    fetchEliminatedTeams();
  }, []);

  const isLoading = picksLoading || standingsLoading;

  const userInfo = standings.find(standing => standing.userId === userId);
  const isInFirstPlace = userInfo ? isFirstPlace(userInfo, standings) : false;
  const isInLastPlace = userInfo ? isLastPlace(userInfo, standings) : false;

  if (error) {
    return (
      <div className="w-full mx-auto px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4 space-y-8">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      <Card>
      <CardHeader>
        <div className="space-y-4">
          {/* Title row */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-4">
              <CardTitle>{userInfo?.name}'s Picks</CardTitle>
              {isInFirstPlace && (
                <span className="text-2xl" role="img" aria-label="Crown">
                  👑
                </span>
              )}
              {isInLastPlace && (
                <span className="text-2xl" role="img" aria-label="Last Place">
                  🚽       
                </span>
              )}
            </div>
            {userInfo && (
              <div className="flex-col sm:flex-row gap-4 hidden sm:flex">
                <Badge className="text-base sm:text-sm w-fit">
                  {userInfo.points} points
                </Badge>
                <Badge variant="secondary" className="text-base sm:text-sm w-fit">
                  Max: {userInfo.maxPoints} points
                </Badge>
              </div>
            )}
          </div>
          
          {/* Points row - stack on mobile, horizontal on desktop */}
          {userInfo && (
            <div className="flex flex-col sm:flex-row gap-4 sm:hidden">
              <Badge className="text-base sm:text-sm w-fit">
                {userInfo.points} points
              </Badge>
              <Badge variant="secondary" className="text-base sm:text-sm w-fit">
                Max: {userInfo.maxPoints} points
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
            {picks && picks.length > 0 ? (
              picks.map(pick => {
                return (
                  <PlayerGameCard
                    game={pick.game} 
                    selectedWinningTeam={pick.winningTeam}
                    selectedLosingTeam={pick.losingTeam}
                    eliminatedTeams={eliminatedTeams}
                    key={pick.id} 
                  />
                );
              })
            ) : (
              <p className="text-muted-foreground">No picks found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
