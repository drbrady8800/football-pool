import { updateTeams, ingestTeams } from "@/db/scripts/ingest-teams"
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const message = await ingestTeams();
    
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

export async function PUT() {
  try {
    const message = await updateTeams();
    
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
