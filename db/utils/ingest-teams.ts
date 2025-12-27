import { count, eq } from 'drizzle-orm';
import fetch from 'node-fetch';

import db from '@/db/db';
import teams from '@/db/schema/teams';

import { fetchTeams } from '@/lib/api/external';

interface VenueLocation {
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
}

// Import the type from external module
type TeamApiResponse = Awaited<ReturnType<typeof fetchTeams>>[number];

// Function to transform API data to match our schema
function transformTeamData(apiTeam: TeamApiResponse) {
  return {
    name: apiTeam.school,
    abbreviation: apiTeam.abbreviation,
    mascot: apiTeam.mascot || 'Unknown',
    conference: apiTeam.conference || "None",
    division: apiTeam.division || "None",
    primaryColor: apiTeam.color || '#000000',
    secondaryColor: apiTeam.alternateColor || '#FFFFFF',
    logoUrl: apiTeam.logos?.[0] || '',
    location: apiTeam.location,
  };
}

// Main function to process and insert teams
export async function ingestTeams(year: number): Promise<string> {
  // Make sure the table is empty
  const teamsTableCountResult = await db.select({ count: count() }).from(teams);
  if (teamsTableCountResult[0].count > 0) {
    throw new Error('Teams table is not empty. Please truncate the table before ingesting teams.');
  }

  // Fetch teams from the API
  const apiTeams = await fetchTeams(year);

  // Transform and insert teams
  const transformedTeams = apiTeams.map(transformTeamData);

  // Insert all teams
  await db.insert(teams).values(transformedTeams);
  return `Successfully inserted ${transformedTeams.length} teams!`;
}

export async function updateTeams(year: number): Promise<string> {
  // Fetch teams from the API
  const apiTeams = await fetchTeams(year);

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
