import { type Standing } from "@/lib/types";
import { getApiUrl } from '@/lib/utils';

export async function fetchStandings({ numGames }: { numGames?: number }): Promise<Standing[]> {
  const response = await fetch(`${getApiUrl()}/standings${numGames ? `?numGames=${numGames}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }

  const data = await response.json();
  return data["standings"];
}