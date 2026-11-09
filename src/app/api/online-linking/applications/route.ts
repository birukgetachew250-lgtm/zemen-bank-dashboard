import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Online Linking feature has been removed.' },
    { status: 410 }
  );
}
