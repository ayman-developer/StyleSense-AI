import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Use Service Role Key to bypass RLS entirely for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { firebase_uid, name, email, avatar_url } = await request.json();

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
    }

    // Sync to Supabase using admin client (bypasses RLS)
    const { error } = await supabaseAdmin.from('users').upsert({
      firebase_uid,
      name,
      email,
      avatar_url,
      created_at: new Date().toISOString()
    }, { onConflict: 'firebase_uid' });

    if (error) {
      console.error('Supabase sync error:', error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth sync API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
