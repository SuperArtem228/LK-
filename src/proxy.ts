import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_PATHS = ['/login', '/welcome']
const APP_PATHS = [
  '/dashboard',
  '/profile',
  '/jobs',
  '/applications',
  '/messages',
  '/interviews',
  '/notifications',
  '/subscription',
  '/hh-connect',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('hhlab-session')?.value

  // Redirect root
  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.url))
  }

  const isAppPath = APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPath = AUTH_PATHS.includes(pathname)

  // Protect app routes — redirect to login if no session
  if (isAppPath && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect already-authenticated users away from login/welcome
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
