// // export { auth as middleware } from '@/lib/auth';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const response = NextResponse.next();
//   console.log("HERE");
  
//   if (process.env.NODE_ENV === 'development') {
//     response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
//   }
//   if (process.env.NEXT_PUBLIC_VERCEL_URL) {
//     response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_VERCEL_URL);
//   }
//   response.headers.set('Access-Control-Allow-Origin', 'https://football-pool-rho.vercel.app');
//   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//   return response;
// }

// // Don't invoke Middleware on some paths
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
//   runtime: 'nodejs'
// };


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function getAllowedOrigins() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'development') {
    return ['http://localhost:3000', 'http://localhost:3000/']
  }
  
  return [
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`,
    'https://football-pool-rho.vercel.app',
    'https://football-pool-rho.vercel.app/'
  ]
}

async function apiMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const originOrHost = origin ?? host;
  const allowedOrigins = getAllowedOrigins();
  
  // If origin is null, check if it's a same-origin request
  const isSameOrigin = !origin && host && (host === new URL(request.url).host);
  const isAllowedOrigin = (origin && allowedOrigins.includes(origin)) || isSameOrigin;
 
  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'

  console.log(`isAllowedOrigin ${request.url.toString()}`, isAllowedOrigin, isSameOrigin, origin, host, allowedOrigins, isPreflight)

 
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && originOrHost && { 'Access-Control-Allow-Origin': originOrHost }),
      ...corsOptions,
    }
    return new NextResponse(null, { 
      status: 204,
      headers: preflightHeaders 
    })
  }
 
  // Handle simple requests
  const response = NextResponse.next()
 
  if (isAllowedOrigin && originOrHost) {
    response.headers.set('Access-Control-Allow-Origin', originOrHost)
  }
 
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
 
  return response
}

async function authMiddleware(request: NextRequest) {
  return NextResponse.next()
  // Check for auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth'
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === '/'
  )

  // If the path is public or there's a token, allow the request
  if (isPublicPath || token) {
    return NextResponse.next()
  }

  // Redirect unauthenticated requests to login
  const url = new URL('/login', request.url)
  url.searchParams.set('callbackUrl', encodeURI(request.url))
  return NextResponse.redirect(url)
}
 
export async function middleware(request: NextRequest) {
  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return apiMiddleware(request)
  }

  // Handle protected routes
  return authMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs'
}
