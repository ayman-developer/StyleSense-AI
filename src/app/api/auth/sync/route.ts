import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { firebase_uid, name, email, avatar_url } = await request.json();

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
    }

    // ✅ ALWAYS set the auth cookie first — this is what middleware needs
    // Do this BEFORE Supabase sync so login never fails due to DB issues
    cookies().set('firebase-token', firebase_uid, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // 🔄 Attempt Supabase sync (non-blocking — failure won't stop login)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseKey = serviceRoleKey || anonKey;

      console.log('[Sync API] Key type:', serviceRoleKey ? 'service_role ✅' : 'anon ⚠️');

      if (supabaseUrl && supabaseKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });

        const { error } = await supabaseAdmin.from('users').upsert(
          { firebase_uid, name, email, avatar_url },
          { onConflict: 'firebase_uid' }
        );

        if (error) {
          // Log but don't block — user can still login
          console.error('[Sync API] Supabase upsert failed (non-fatal):', error.message);
        } else {
          console.log('[Sync API] Supabase sync successful ✅');
        }
      }
    } catch (dbError: any) {
      // Database errors are non-fatal — user can still use the app
      console.error('[Sync API] Database sync failed (non-fatal):', dbError.message);
    }

    // ✅ Always return success so login can proceed
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Sync API] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
