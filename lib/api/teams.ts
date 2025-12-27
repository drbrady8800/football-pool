import { getApiUrl } from '@/lib/utils';

export async function ingestTeams(year?: number): Promise<string> {
  const url = year
    ? `${getApiUrl()}/teams?year=${year}`
    : `${getApiUrl()}/teams`;
  
  const response = await fetch(url, {
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

export async function updateTeams(year?: number):  Promise<string> {
  const url = year
    ? `${getApiUrl()}/teams?year=${year}`
    : `${getApiUrl()}/teams`;
  
  const response = await fetch(url, {
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

export async function getEliminatedCFPTeams(year?: number):  Promise<string[]> {
  const url = year
    ? `${getApiUrl()}/games?year=${year}`
    : `${getApiUrl()}/games`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to get games');
  }

  const data = await response.json();

  const eliminatedTeams = [];
  for (const game of data["games"]) {
    if (game.name.includes("College Football Playoff") && game.isComplete) {
      if (game.homeTeamId !== game.winningTeamId) {
        eliminatedTeams.push(game.homeTeamId);
      }
      if (game.awayTeamId !== game.winningTeamId) {
        eliminatedTeams.push(game.awayTeamId);
      }
    }
  }
  
  return eliminatedTeams;
}
