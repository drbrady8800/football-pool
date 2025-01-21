import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { type Standing } from "@/lib/types"
import { type GameWithTeams, type PickWithGameTeamUser } from "@/db/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the year from ten months ago
export function getBowlYear() {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() < 10) {
    year -= 1;
  }
  return year;
}

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

export function isLastPlace(standing: Standing, standings: Standing[]): boolean {
  const lowestPoints = Math.min(...standings.map(s => s.points))
  return standing.points === lowestPoints;
}

export function isFirstPlace(standing: Standing, standings: Standing[]): boolean {
  const highestPoints = Math.max(...standings.map(s => s.points))
  return standing.points === highestPoints;
}

export function getApiUrl(): string {
  let baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (typeof window !== 'undefined') {
    baseUrl = window?.location?.origin;
  }
  
  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl ? `${baseUrl}/api` : 'http://localhost:3000/api';
}

export const getGamePointValue = (gameName: string | null): number => {
  if (!gameName) return 1;
  
  if (gameName.includes('National Championship')) {
    return 4;
  } else if (gameName.includes('Semifinal')) {
    return 3;
  } else if (gameName.includes('Quarterfinal')) {
    return 2;
  }
  return 1;
}; 

export const getMaxPoints = ({ currentPoints, picks, eliminatedTeamIds }: { currentPoints: number, picks: PickWithGameTeamUser[], eliminatedTeamIds: string[] }): number => {
  if (!picks || !eliminatedTeamIds) return currentPoints;
  let maxPoints = currentPoints;
  // Add 4 points for the National Championship score tiebreaker if it hasn't been played yet
  if (eliminatedTeamIds.length < 11) {
    maxPoints += 4;
  }
  for (const pick of picks) {
    if (!pick.game) {
      continue;
    }
    const gameName = pick.game.name;
    const gamePointValue = getGamePointValue(gameName);
    if (!eliminatedTeamIds.includes(pick.winningTeam.id)) {
      maxPoints += gamePointValue;
    }
  }
  return maxPoints;
}
