import { fetchPicks } from '@/lib/api/picks';
import { fetchStandings } from '@/lib/api/standings';
import { isLastPlace, isFirstPlace } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameCard from '@/components/game-card';

export default async function PersonPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;
  const picks = await fetchPicks({ userId });
  const standings = await fetchStandings({});
  // sort the picks by game date
  const sortedPicks = picks?.sort((a, b) => {
    return a.game.gameDate < b.game.gameDate ? -1 : 1;
  });

  const userInfo = standings.find(standing => standing.userId === userId);
  const isInFirstPlace = userInfo ? isFirstPlace(userInfo, standings) : false;
  const isInLastPlace = userInfo ? isLastPlace(userInfo, standings) : false;

  return (
    <div className="w-full mx-auto px-4 space-y-8">
      <Card>
        <CardHeader className='flex flex-row gap-4 items-center'>
          <CardTitle>{userInfo?.name}'s Picks</CardTitle>
          {userInfo && (
            <Badge 
              className="text-sm"
            >
              {userInfo.points} points
            </Badge>
          )}
          {isInFirstPlace && (
            <span className="text-2xl m-0" role="img" aria-label="Crown">
              👑
            </span>
          )}
          {isInLastPlace && (
            <span className="text-2xl m-0" role="img" aria-label="Crown">
              🚽       
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
            {sortedPicks && sortedPicks.length > 0 ? (
              sortedPicks.map(pick => (
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