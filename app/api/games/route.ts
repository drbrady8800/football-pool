import { eq } from "drizzle-orm";

import db from "@/db/db";
import games from "@/db/schema/games";
import { ingestGames, updateGames } from "@/db/utils/ingest-games";
import { getBowlYear } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const year = getBowlYear();
    const gamesResult = await db.query.games.findMany({
      where: eq(games.season, year),
      with: {
        homeTeam: true,
        awayTeam: true
      }
    });
    
    return Response.json(
      { games: gamesResult },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching games:', error);
    return Response.json(
      { 
        error: 'Getting games failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const year = getBowlYear();
    const message = await ingestGames({ year: year});

    return Response.json(
      { message },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during game ingestion:', error);
    return Response.json(
      { 
        error: 'Game ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const year = getBowlYear();
    const message = await updateGames({ year: year });

    return Response.json(
      { message },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during game ingestion:', error);
    return Response.json(
      { 
        error: 'Game ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
