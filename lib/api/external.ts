const COLLEGE_FOOTBALL_API_URL = process.env.NEXT_PUBLIC_COLLEGE_FOOTBALL_API_URL || 'https://api.collegefootballdata.com';
const API_KEY = process.env.NEXT_PUBLIC_COLLEGE_FOOTBALL_DATA_API_KEY || '';

export interface GameApiResponse {
  id: number;
  season: number;
  week: number;
  seasonType: string;
  startDate: string;
  startTimeTBD: boolean;
  completed: boolean;
  neutralSite: boolean;
  conferenceGame: boolean;
  attendance: number;
  venueId: number;
  venue: string;
  homeId: number;
  homeTeam: string;
  homeConference: string;
  homeClassification: string;
  homePoints: number;
  homeLineScores: number[];
  homePostgameWinProbability: number;
  homePregameElo: number;
  homePostgameElo: number;
  awayId: number;
  awayTeam: string;
  awayConference: string;
  awayPoints: number;
  awayLineScores: number[];
  awayPostgameWinProbability: number;
  awayPregameElo: number;
  awayPostgameElo: number;
  excitementIndex: number;
  highlights: string;
  notes: string;
}

export interface TeamApiResponse {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  alternateNames: string[];
  classification: string;
  conference: string;
  division: string;
  color: string;
  alternateColor: string;
  logos: string[];
  twitter: string;
  location: {
    venue_id: number;
    name: string;
    city: string;
    state: string;
    zip: string;
    countryCode: string;
    timezone: string;
    latitude: number;
    longitude: number;
    elevation: string;
    capacity: number;
    constructionYear: number;
    grass: boolean;
    dome: boolean;
  };
}

/**
 * Fetch postseason games from the external College Football Data API
 */
export async function fetchPostseasonGames(year: number): Promise<GameApiResponse[]> {
  const url = `${COLLEGE_FOOTBALL_API_URL}/games?year=${year}&seasonType=postseason&classification=fbs`;
  
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  return response.json() as Promise<GameApiResponse[]>;
}

/**
 * Fetch teams from the external College Football Data API
 */
export async function fetchTeams(year: number): Promise<TeamApiResponse[]> {
  const url = `${COLLEGE_FOOTBALL_API_URL}/teams/fbs?year=${year}`;
  
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.statusText}`);
  }

  return response.json() as Promise<TeamApiResponse[]>;
}

