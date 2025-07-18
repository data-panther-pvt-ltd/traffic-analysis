import { NextResponse } from 'next/server';
import { validCredentials } from '@/../lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username === validCredentials.username &&
    password === validCredentials.password
  ) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth', 'authenticated', {
      httpOnly: true,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
