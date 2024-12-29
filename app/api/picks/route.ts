import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";

import db from "@/db/db";
import picks from "@/db/schema/picks";
import { ingestPicks } from "@/db/scripts/ingest-picks";
import { getBowlYear } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const year = getBowlYear();
    const searchParams = request.nextUrl.searchParams;

    // Build conditions array starting with the base condition
    const conditions = [eq(picks.season, year)];
    
    // Add additional conditions based on search params
    if (searchParams.has('userId')) {
      conditions.push(eq(picks.userId, searchParams.get('userId')!));
    }
    
    if (searchParams.has('gameId')) {
      conditions.push(eq(picks.gameId, searchParams.get('gameId')!));
    }

    const result = await db.query.picks.findMany({
      where: and(...conditions),
      with: {
        game: {
          with: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        winningTeam: true,
        losingTeam: true,
        user: true,
      },
    });
    
    return Response.json(
      { picks: result },
      { status: 200 }
    );
    
  } catch (error) {
    return Response.json(
      { 
        error: 'Pick ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const year = getBowlYear();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json(
        { 
          error: 'File upload failed',
          details: 'No file was provided'
        },
        { status: 400 }
      );
    }

    // Convert the file to text
    const text = await file.text();
    const message = await ingestPicks({ year: year, csvContent: text });
    
    return Response.json(
      { message },
      { status: 200 }
    );
    
  } catch (error) {
    return Response.json(
      { 
        error: 'Pick ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
