import { getApiUrl } from '@/lib/utils';

export async function ingestTeams(): Promise<string> {
  const response = await fetch(`${getApiUrl()}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to ingest teams');
  }
  
  const data = await response.json();
  return data['message'];
}

export async function updateTeams():  Promise<string> {
  const response = await fetch(`${getApiUrl()}/teams`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to update teams');
  }
  
  const data = await response.json();
  return data['message'];
}
