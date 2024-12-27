import { count, eq } from 'drizzle-orm';
import fetch from 'node-fetch';

import db from '@/db/db';
import teams from '@/db/schema/teams';

interface VenueLocation {
  venue_id: number;
  name: string;
  city: string;
  state: string;
  zip: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
  elevation: number;
  capacity: number;
  year_constructed: number;
  grass: boolean;
  dome: boolean;
}

interface TeamApiResponse {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  alt_name_1: string;
  alt_name_2: string;
  alt_name_3: string;
  classification: string;
  conference: string;
  division: string;
  color: string;
  alt_color: string;
  logos: string[];
  twitter: string;
  location: VenueLocation;
}

// Function to fetch teams from the API
async function fetchTeams(): Promise<TeamApiResponse[]> {
  const response = await fetch(
    'https://api.collegefootballdata.com/teams/fbs?year=2024',
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.COLLEGE_FOOTBALL_DATA_API_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.statusText}`);
  }

  return response.json() as Promise<TeamApiResponse[]>;
}

// Function to transform API data to match our schema
function transformTeamData(apiTeam: TeamApiResponse) {
  return {
    name: apiTeam.school,
    abbreviation: apiTeam.abbreviation,
    mascot: apiTeam.mascot || 'Unknown',
    conference: apiTeam.conference || "None",
    division: apiTeam.division || "None",
    primaryColor: apiTeam.color || '#000000',
    secondaryColor: apiTeam.alt_color || '#FFFFFF',
    logoUrl: apiTeam.logos?.[0] || '',
    location: apiTeam.location,
  };
}

// Main function to process and insert teams
export async function ingestTeams(): Promise<string> {
  // Make sure the table is empty
  const teamsTableCountResult = await db.select({ count: count() }).from(teams);
  if (teamsTableCountResult[0].count > 0) {
    throw new Error('Teams table is not empty. Please truncate the table before ingesting teams.');
  }

  // Fetch teams from the API
  const apiTeams = await fetchTeams();

  // Transform and insert teams
  const transformedTeams = apiTeams.map(transformTeamData);

  // Insert all teams
  await db.insert(teams).values(transformedTeams);
  return `Successfully inserted ${transformedTeams.length} teams!`;
}

export async function updateTeams(): Promise<string> {
  // Fetch teams from the API
  const apiTeams = await fetchTeams();

  // Transform teams
  const transformedTeams = apiTeams.map(transformTeamData);

  // Update each team
  for (const team of transformedTeams) {
    await db
      .update(teams)
      .set(team)
      .where(eq(teams.name, team.name));
  }

  return `Successfully updated ${transformedTeams.length} teams`;
}
