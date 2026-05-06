import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { firebase_uid, name, email, avatar_url } = await request.json();

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
    }

    // Sync to Supabase
    const { error } = await supabase.from('users').upsert({
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

    // Set a cookie for the middleware
    // Note: In a real app, you should verify the Firebase ID token here
    cookies().set('firebase-token', firebase_uid, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth sync API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
