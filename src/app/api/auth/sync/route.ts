import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { firebase_uid, name, email, avatar_url } = await request.json();
    if (!firebase_uid) return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });

    // Set cookie FIRST — always, regardless of DB result
    cookies().set('firebase-token', firebase_uid, {
      path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7,
    });

    // Sync to Supabase with admin client (bypasses RLS)
    const { error } = await supabaseAdmin.from('users').upsert(
      { firebase_uid, name, email, avatar_url },
      { onConflict: 'firebase_uid' }
    );
    if (error) console.error('[Sync] Supabase error (non-fatal):', error.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Sync] Fatal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
