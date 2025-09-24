import { NextResponse } from 'next/server';
import { validCredentials } from '@/../lib/auth';

export async function POST(req: Request) {
  const acceptLanguage = req.headers.get('accept-language');
  const lang = acceptLanguage && acceptLanguage.startsWith('ar') ? 'ar' : 'en';
  const { username, password } = await req.json();

  if (
    username === validCredentials.username &&
    password === validCredentials.password
  ) {
    const res = NextResponse.json({ success: true, message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully' });
    res.cookies.set('auth', 'authenticated', {
      httpOnly: true,
      path: '/',
    });
    // Persist selected language if provided in body as fallback
    try {
      const maybeLangBody = (await req.clone().json()) as any;
      const bodyLang = maybeLangBody?.language;
      const cookieLang = bodyLang === 'ar' ? 'ar' : bodyLang === 'en' ? 'en' : lang;
      res.cookies.set('lang', cookieLang, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    } catch {}
    return res;
  }

  return NextResponse.json({ error: lang === 'ar' ? 'بيانات الاعتماد غير صحيحة' : 'Invalid credentials' }, { status: 401 });
}
