import { eq } from "drizzle-orm";

import db from "@/db/db";
import users from "@/db/schema/users";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, params.userId)
    });

    return Response.json(
      { user: user },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json(
      { 
        error: 'Getting user failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}