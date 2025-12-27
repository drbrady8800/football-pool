import { type PickWithGameTeamUser } from '@/db/types';
import { getApiUrl } from '@/lib/utils';

interface FetchPicksOptions {
  gameId?: string;
  userId?: string;
  year?: number;
};

export async function getPicks(options: FetchPicksOptions): Promise<PickWithGameTeamUser[]> {
  const searchParams = new URLSearchParams();
  
  // Add parameters if they exist
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString();
  const requestUrl = `${getApiUrl()}/picks${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch picks');
  }

  const data = await response.json();
  return data["picks"];
}

export async function ingestPicks(file: File, year?: number): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const url = year
    ? `${getApiUrl()}/picks?year=${year}`
    : `${getApiUrl()}/picks`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to ingest picks');
  }
  
  const data = await response.json();
  return data['message'];
}
