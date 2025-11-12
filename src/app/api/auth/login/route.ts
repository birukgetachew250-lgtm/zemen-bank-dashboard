import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // In a real application, passwords must be hashed and compared securely.
    // For this demo, we are using plain text comparison as per the prompt.
    if (user && user.password === password) {
      const token = crypto.randomUUID();
      const sessionMaxAge = 60 * 60 * 24; // 24 hours

      // In a real app, you would store this session token in the database
      // linked to the user, and validate it on each request.
      
      cookies().set('session', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        path: '/', 
        maxAge: sessionMaxAge 
      });

      return NextResponse.json({ success: true, message: 'Login successful' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred' }, { status: 500 });
  }
}
