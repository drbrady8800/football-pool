import { type PickWithGameTeamUser } from '@/db/types';

interface FetchPicksOptions {
  gameId?: string;
  userId?: string;
};

export async function fetchPicks(options: FetchPicksOptions): Promise<PickWithGameTeamUser[]> {
  const searchParams = new URLSearchParams();
  
  // Add parameters if they exist
  Object.entries(options).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  const requestUrl = `${process.env.VERCEL_URL}/api/picks${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch game');
  }

  const data = await response.json();
  return data["picks"];
}