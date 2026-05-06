import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { firebase_uid, name, email, avatar_url } = await request.json();

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseKey = serviceRoleKey || anonKey;

    // Debug: log which key is being used (remove after fixing)
    console.log('[Sync API] Using key type:', serviceRoleKey ? 'service_role' : 'anon');
    console.log('[Sync API] Supabase URL:', supabaseUrl ? 'set' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing on server' }, { status: 500 });
    }

    // Create admin client inside the handler to ensure env vars are available
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Sync to Supabase (service role key bypasses RLS)
    const { error } = await supabaseAdmin.from('users').upsert({
      firebase_uid,
      name,
      email,
      avatar_url,
    }, { onConflict: 'firebase_uid' });

    if (error) {
      console.error('[Sync API] Supabase upsert error:', error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Set auth cookie for middleware route protection
    cookies().set('firebase-token', firebase_uid, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    console.log('[Sync API] User synced successfully:', firebase_uid);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Sync API] Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
