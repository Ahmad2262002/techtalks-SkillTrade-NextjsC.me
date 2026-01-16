import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Force production URL if available, otherwise fallback to request origin (useful for preview deployments)
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

            // Clean up the URL construction to avoid double slashes
            const redirectUrl = new URL(next, baseUrl).toString();

            return NextResponse.redirect(redirectUrl);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
