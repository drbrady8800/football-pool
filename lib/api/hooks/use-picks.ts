import { useQuery } from '@tanstack/react-query';
import { getPicks } from '../picks';
import { type PickWithGameTeamUser } from '@/db/types';

interface UsePicksOptions {
  gameId?: string;
  userId?: string;
  year: number;
  enabled?: boolean;
}

export function usePicks({ gameId, userId, year, enabled = true }: UsePicksOptions) {
  return useQuery<PickWithGameTeamUser[]>({
    queryKey: ['picks', { gameId, userId, year }],
    queryFn: () => getPicks({ gameId, userId, year }),
    enabled: enabled && !!year,
  });
}
