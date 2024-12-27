import { and, eq } from "drizzle-orm";

import db from "@/db/db";

import games from "@/db/schema/games";
import { getBowlYear } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const year = getBowlYear();
    const game = await db.query.games.findFirst({
      where: and(eq(games.id, params.gameId), eq(games.season, year)),
      with: {
        homeTeam: true,
        awayTeam: true
      }
    });

    return Response.json(
      { games: game },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching game:', error);
    return Response.json(
      { 
        error: 'Getting game failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}