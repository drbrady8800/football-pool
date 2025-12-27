import { useQuery } from '@tanstack/react-query';
import { getGames, getGameById } from '../games';
import { type GameWithTeams } from '@/db/types';

export function useGames(year: number) {
  return useQuery<GameWithTeams[]>({
    queryKey: ['games', year],
    queryFn: () => getGames(year),
  });
}

export function useGameById(gameId: string, year: number) {
  return useQuery<GameWithTeams>({
    queryKey: ['games', gameId, year],
    queryFn: () => getGameById(gameId, year),
    enabled: !!gameId,
  });
}

