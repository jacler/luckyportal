import { seed } from './seed'

export type Env = {
  CONTENT?: KVNamespace
  ADMIN_PASSWORD?: string
  TOKEN_SECRET?: string
}

const CONTENT_KEY = 'site-content'

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  for (const b of u8) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromB64url(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signToken(env: Env): Promise<string> {
  const secret = env.TOKEN_SECRET || env.ADMIN_PASSWORD || 'LuckyPortalToken2026'
  const payload = b64url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 12 })),
  )
  const key = await hmacKey(secret)
  const sig = b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
  return `${payload}.${sig}`
}

export async function verifyToken(env: Env, token: string | null): Promise<boolean> {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const secret = env.TOKEN_SECRET || env.ADMIN_PASSWORD || 'LuckyPortalToken2026'
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    fromB64url(sig),
    new TextEncoder().encode(payload),
  )
  if (!ok) return false
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp?: number }
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

export async function readContent(env: Env) {
  if (env.CONTENT) {
    const raw = await env.CONTENT.get(CONTENT_KEY, 'json')
    if (raw && typeof raw === 'object') return raw
  }
  return seed
}

export async function writeContent(env: Env, body: Record<string, unknown>) {
  if (!env.CONTENT) {
    throw new Error('KV_NOT_BOUND')
  }
  const next = {
    brand: String(body.brand || 'LUCKYPORTAL'),
    tagline: String(body.tagline || ''),
    ctaLabel: String(body.ctaLabel || ''),
    ctaHref: String(body.ctaHref || '#work'),
    about: String(body.about || ''),
    skills: Array.isArray(body.skills) ? body.skills.map(String) : [],
    github: String(body.github || ''),
    projects: Array.isArray(body.projects) ? body.projects : [],
  }
  await env.CONTENT.put(CONTENT_KEY, JSON.stringify(next))
  return next
}

export function adminPassword(env: Env): string {
  return env.ADMIN_PASSWORD || 'LuckyAdmin2026'
}
