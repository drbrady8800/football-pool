// export { auth as middleware } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log("HERE");
  
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_VERCEL_URL);
  }
  response.headers.set('Access-Control-Allow-Origin', 'https://football-pool-rho.vercel.app');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
