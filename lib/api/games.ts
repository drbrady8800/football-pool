import { type GameWithTeams } from '@/db/types';
import { getApiUrl } from '@/lib/utils';

export async function fetchGames(): Promise<GameWithTeams[]> {
  console.log(getApiUrl())
  const response = await fetch(`${getApiUrl()}/games`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }

  const data = await response.json();
  return data["games"];
}

export async function fetchGameById(id: string): Promise<GameWithTeams> {
  const response = await fetch(`${getApiUrl()}/games/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch game');
  }

  const data = await response.json();
  return data["games"];
}
