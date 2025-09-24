import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.set('auth', '', { maxAge: 0 });
  res.cookies.set('lang', '', { maxAge: 0 });
  return res;
}
