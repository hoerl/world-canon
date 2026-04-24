import { getRequiredEnv } from '@/lib/env';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'canon_session';
const NONCE_COOKIE = 'canon_wallet_nonce';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AppSession = {
  walletAddress: string;
  username: string | null;
  profilePictureUrl: string | null;
  worldSessionId: `session_${string}` | null;
};

function getSecretKey() {
  return new TextEncoder().encode(getRequiredEnv('AUTH_SECRET'));
}

export async function issueWalletNonce() {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const cookieStore = await cookies();
  cookieStore.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });
  return nonce;
}

export async function consumeWalletNonce() {
  const cookieStore = await cookies();
  const nonce = cookieStore.get(NONCE_COOKIE)?.value ?? null;
  cookieStore.delete(NONCE_COOKIE);
  return nonce;
}

export async function createSessionCookie(session: AppSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getOptionalSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecretKey());
    const payload = verified.payload as Partial<AppSession>;
    if (!payload.walletAddress) {
      return null;
    }

    return {
      walletAddress: payload.walletAddress,
      username: payload.username ?? null,
      profilePictureUrl: payload.profilePictureUrl ?? null,
      worldSessionId:
        typeof payload.worldSessionId === 'string'
          ? (payload.worldSessionId as `session_${string}`)
          : null,
    };
  } catch {
    return null;
  }
}
