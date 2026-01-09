
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the session cookie
    cookies().set('session_user_id', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

    