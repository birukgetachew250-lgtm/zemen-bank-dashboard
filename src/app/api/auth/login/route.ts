
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
// In a real app, you'd use a robust library for password hashing like bcrypt
// For this demo, we'll use a simple comparison.
// import bcrypt from 'bcrypt'; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // In a real app, compare hashed passwords:
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // For this demo, we do a simple string comparison:
    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // IMPORTANT: Session Management
    // For this demo, we will set a simple cookie to simulate a session.
    // In a production app, use a secure, signed, HTTP-only cookie with libraries like 'iron-session' or 'next-auth'.
    cookies().set('session_user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    const { password: userPassword, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

    