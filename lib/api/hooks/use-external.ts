import { useQuery } from '@tanstack/react-query';
import { fetchPostseasonGames, fetchTeams, type GameApiResponse, type TeamApiResponse } from '../external';

export type { GameApiResponse, TeamApiResponse };

export function usePostseasonGames(year: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['external', 'postseason-games', year],
    queryFn: () => fetchPostseasonGames(year),
    enabled: enabled && !!year,
  });
}

export function useExternalTeams(year: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['external', 'teams', year],
    queryFn: () => fetchTeams(year),
    enabled: enabled && !!year,
  });
}
