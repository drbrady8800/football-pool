import { type GameWithTeams } from '@/db/types';
import { getApiUrl } from '@/lib/utils';

export async function getGames(): Promise<GameWithTeams[]> {
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

export async function getGameById(id: string): Promise<GameWithTeams> {
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

export async function ingestGames(): Promise<string> {
  const response = await fetch(`${getApiUrl()}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to ingest games');
  }
  
  const data = await response.json();
  return data['message'];
}

export async function updateGames(): Promise<string> {
  const response = await fetch(`${getApiUrl()}/games`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to update games');
  }
  
  const data = await response.json();
  console.log(data);
  return data['message'];
}
