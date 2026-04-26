import { clearSessionCookie } from '@/lib/session';
import { jsonOk } from '@/lib/http';
import { NextResponse } from 'next/server';

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ signedOut: true });
}

export async function GET(request: Request) {
  await clearSessionCookie();
  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
