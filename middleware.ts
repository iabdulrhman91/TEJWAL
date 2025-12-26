import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './lib/auth'

const protectedRoutes = ['/', '/quotes', '/services', '/users', '/dashboard']
const publicRoutes = ['/login']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(route + '/'))
    const isPublicRoute = publicRoutes.includes(path)

    const cookie = req.cookies.get('session')?.value
    const session = cookie ? await decrypt(cookie).catch(() => null) : null

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (isPublicRoute && session && !path.startsWith('/login')) {
        // This is a bit tricky if we are on /login, we should redirect to /
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    // Specifically handle /login when already logged in
    if (path === '/login' && session) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
