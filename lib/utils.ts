import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { type Standing } from "@/lib/types"

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
  let baseUrl = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl ? `${baseUrl}/api` : 'http://localhost:3000/api';
}
