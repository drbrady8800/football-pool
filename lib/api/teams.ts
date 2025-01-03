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

export async function getEliminatedCFPTeams():  Promise<string[]> {
  const response = await fetch(`${getApiUrl()}/games`, {
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
