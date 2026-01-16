import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Not found', { status: 404 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        return NextResponse.json({
            success: false,
            message: 'Missing environment variables',
            config: {
                hasUrl: !!url,
                hasKey: !!key,
                urlPreview: url ? url.substring(0, 20) + '...' : 'N/A'
            }
        }, { status: 500 });
    }

    try {
        const supabase = createClient(url, key);

        // Attempt to connect by doing a lightweight query
        // auth.getSession() is safe and doesn't require RLS permission on tables
        // but without cookies it just returns null session, which is fine, 
        // we want to see if the network request fails.

        // Better: Try to query a public table or just check health check endpoint if possible.
        // "User" table exists in this project, but RLS might block Select.
        // Let's try auth first.

        const start = Date.now();
        const { data, error } = await supabase.auth.getSession();
        const duration = Date.now() - start;

        if (error) {
            throw error;
        }

        // If we got here, connection worked (even if no session)
        return NextResponse.json({
            success: true,
            message: 'Successfully connected to Supabase',
            timing: `${duration}ms`,
            env: {
                url: url,
                keyConfigured: true
            },
            status: 'Connected'
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Failed to connect to Supabase',
            error: error.message || String(error),
            code: error.code,
            details: error,
            env: {
                url: url,
            }
        }, { status: 500 });
    }
}
