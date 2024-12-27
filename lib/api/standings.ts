import { type Standing } from "@/lib/types";

export async function fetchStandings({ numGames }: { numGames?: number }): Promise<Standing[]> {
  const response = await fetch(`${process.env.VERCEL_URL}/api/standings${numGames ? `?numGames=${numGames}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }

  const data = await response.json();
  return data["standings"];
}