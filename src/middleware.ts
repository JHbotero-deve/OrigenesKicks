import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // 1. Proteger rutas de dashboard si no hay token
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string
      const { pathname } = request.nextUrl

      // Redirección Inteligente según Rol
      if (role === 'ADMIN' && (pathname === '/login' || pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }

      if (role === 'SELLER' && (pathname === '/login' || pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard/ventas', request.url))
      }

      // Evitar que CLIENTS entren a rutas de administración
      if (role === 'CLIENT' && pathname.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      // Token inválido, limpiar cookie y redirigir
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
}
