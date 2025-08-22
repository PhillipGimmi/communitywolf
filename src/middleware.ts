import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect dashboard routes, not the home page
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (!isDashboardRoute) {
    // Allow access to public routes (home page, auth pages, etc.)
    return NextResponse.next();
  }

  // For dashboard routes, we need to check auth server-side to maintain SSR
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, ...options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Check if user is authenticated for dashboard routes
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest file) <- ADDED THIS
     * - sw.js (service worker) <- ADDED THIS
     * - icons/ (icon files) <- ADDED THIS
     * - public folder
     * - api routes (API endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|public|api).*)',
  ],
};
