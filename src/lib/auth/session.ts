import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './types';

const SESSION_COOKIE = 'session';

function getSecret() {
  const secret = process.env.AUTH_SECRET || 'fallback-secret-para-evitar-crash-em-producao';
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function signSession(payload: SessionPayload, expiresIn: string) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
  return payload as unknown as SessionPayload;
}
