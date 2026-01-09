
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// In a real app, you'd use a robust library for password hashing like bcrypt
// For this demo, we'll use a simple comparison.
// import bcrypt from 'bcrypt'; 

export async function POST(req: NextRequest) {
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

    // Use iron-session to create a secure, encrypted session
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    
    const { password: userPassword, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
