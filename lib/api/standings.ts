import { type Standing, type StandingChartColumn } from "@/lib/types";
import { getApiUrl } from '@/lib/utils';

export async function getStandings({ numGames, year }: { numGames?: number; year?: number }): Promise<Standing[]> {
  const searchParams = new URLSearchParams();
  if (numGames) searchParams.append('numGames', numGames.toString());
  if (year) searchParams.append('year', year.toString());
  
  const queryString = searchParams.toString();
  const response = await fetch(`${getApiUrl()}/standings${queryString ? `?${queryString}` : ''}`, {
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

export async function getStandingsChartData(year?: number): Promise<StandingChartColumn[]> {
  const url = year
    ? `${getApiUrl()}/standings/all?year=${year}`
    : `${getApiUrl()}/standings/all`;
  
  const response = await fetch(url, {
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

export async function getHypotheticalStandings(predictions: Record<string, string>, totalScorePrediction?: number, year?: number): Promise<Standing[]> {
  const response = await fetch(`${getApiUrl()}/standings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ predictions, totalScorePrediction, year }),
  });

  if (!response.ok) {
    console.error(response)
    throw new Error('Failed to fetch hypothetical standings');
  }

  const data = await response.json();
  return data.standings;
}