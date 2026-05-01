import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './types';

const SESSION_COOKIE = 'session';

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET não configurado');
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
  // jose retorna payload como JWTPayload; aqui normalizamos pro shape esperado
  return payload as unknown as SessionPayload;
}

