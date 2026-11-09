import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Online Linking feature has been removed.' },
    { status: 410 }
  );
}
