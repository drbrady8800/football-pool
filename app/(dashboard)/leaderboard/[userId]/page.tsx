'use client';

import { useEffect, useState } from 'react';
import { fetchPicks } from '@/lib/api/picks';
import { fetchStandings } from '@/lib/api/standings';
import { isLastPlace, isFirstPlace } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameCard from '@/components/game-card';

export default function PersonPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;
  const [picks, setPicks] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [picksData, standingsData] = await Promise.all([
          fetchPicks({ userId }),
          fetchStandings({})
        ]);

        // Sort picks by game date
        const sortedPicks = picksData?.sort((a, b) => {
          return a.game.gameDate < b.game.gameDate ? -1 : 1;
        });

        setPicks(sortedPicks || []);
        setStandings(standingsData || []);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const userInfo = standings.find(standing => standing.userId === userId);
  const isInFirstPlace = userInfo ? isFirstPlace(userInfo, standings) : false;
  const isInLastPlace = userInfo ? isLastPlace(userInfo, standings) : false;

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      <Card>
        <CardHeader className="flex flex-row gap-4 items-center">
          <CardTitle>{userInfo?.name}'s Picks</CardTitle>
          {userInfo && (
            <Badge className="text-sm">
              {userInfo.points} points
            </Badge>
          )}
          {isInFirstPlace && (
            <span className="text-2xl m-0" role="img" aria-label="Crown">
              👑
            </span>
          )}
          {isInLastPlace && (
            <span className="text-2xl m-0" role="img" aria-label="Last Place">
              🚽       
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
            {picks && picks.length > 0 ? (
              picks.map(pick => (
                <GameCard 
                  game={pick.game} 
                  selectedTeamId={pick.selectedTeamId} 
                  key={pick.id} 
                />
              ))
            ) : (
              <p className="text-muted-foreground">No picks found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}