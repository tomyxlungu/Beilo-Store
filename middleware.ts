import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const adminRoutes = ['/admin'];
const adminApiRoutes = ['/api/admin'];
const publicAdminRoutes = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isAdminApi = adminApiRoutes.some(
    (route) => pathname.startsWith(route)
  );
  const isPublicAdmin = publicAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isAdminPage && !isAdminApi) {
    return;
  }

  if (isAdminApi) {
    return;
  }

  const { supabase, supabaseResponse } = await updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return Response.redirect(url);
  }

  if (user && isPublicAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return Response.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
