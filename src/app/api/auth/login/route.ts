
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
// In a real app, you'd use a robust library for password hashing like bcrypt
// For this demo, we'll use a simple comparison.
// import bcrypt from 'bcrypt'; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

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
    // In a real production app, you would create a secure, signed, HTTP-only cookie
    // containing session data. Libraries like 'iron-session' or 'next-auth' are ideal for this.
    // For this demonstration, we are just returning a success message. The client-side
    // will redirect, and our layout will use a simulated session check.
    
    const { password: userPassword, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
