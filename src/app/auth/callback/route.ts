import { createRouteHandler } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // const next = searchParams.get('next') ?? '/dashboard'; // Removed unused variable

  if (code) {
    const supabase = await createRouteHandler();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Email confirmed successfully
      return NextResponse.redirect(`${origin}/auth/login?message=Email confirmed successfully! You can now sign in.`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?message=Email confirmation failed. Please try again or contact support.`);
}
