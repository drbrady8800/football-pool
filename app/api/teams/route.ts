import { updateTeams, ingestTeams } from "@/db/utils/ingest-teams"
import { getBowlYear } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : getBowlYear();
    
    if (isNaN(year)) {
      return Response.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }
    
    const message = await ingestTeams(year);
    
    return Response.json(
      { message },
      { status: 200 }
    );
    
  } catch (error) {
    return Response.json(
      { 
        error: 'Team ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : getBowlYear();
    
    if (isNaN(year)) {
      return Response.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }
    
    const message = await updateTeams(year);
    
    return Response.json(
      { message },
      { status: 200 }
    );
    
  } catch (error) {
    return Response.json(
      { 
        error: 'Team ingestion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
