import db from "@/db/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await db.query.users.findMany();

    return Response.json(
      { users },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { 
        error: 'Getting users failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}