import { type Standing, type StandingChartColumn } from "@/lib/types";
import { getApiUrl } from '@/lib/utils';

export async function getStandings({ numGames }: { numGames?: number }): Promise<Standing[]> {
  const response = await fetch(`${getApiUrl()}/standings${numGames ? `?numGames=${numGames}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch standings');
  }

  const data = await response.json();
  return data["standings"];
}

export async function getStandingsChartData(): Promise<StandingChartColumn[]> {
  const response = await fetch(`${getApiUrl()}/standings/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch standings');
  }

  const data = await response.json();
  return data;
}

export async function getHypotheticalStandings(predictions: Record<string, string>): Promise<Standing[]> {
  const response = await fetch(`${getApiUrl()}/standings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ predictions }),
  });

  if (!response.ok) {
    console.error(response)
    throw new Error('Failed to fetch hypothetical standings');
  }

  const data = await response.json();
  return data.standings;
}