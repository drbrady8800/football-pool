import { type GameWithTeams } from '@/db/types';

export async function fetchGames(): Promise<GameWithTeams[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games`, {
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`, {
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
