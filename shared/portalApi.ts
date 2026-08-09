import { seed } from './seed'

export type PortalEnv = {
  CONTENT?: KVNamespace
  ADMIN_PASSWORD?: string
  TOKEN_SECRET?: string
  ASSETS?: Fetcher
}

const CONTENT_KEY = 'site-content'

function json(data: unknown, status = 200): Response {
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

async function signToken(env: PortalEnv): Promise<string> {
  const secret = env.TOKEN_SECRET || env.ADMIN_PASSWORD || 'LuckyPortalToken2026'
  const payload = b64url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 12 })),
  )
  const key = await hmacKey(secret)
  const sig = b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
  return `${payload}.${sig}`
}

async function verifyToken(env: PortalEnv, token: string | null): Promise<boolean> {
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

async function readContent(env: PortalEnv) {
  if (env.CONTENT) {
    const raw = await env.CONTENT.get(CONTENT_KEY, 'json')
    if (raw && typeof raw === 'object') return raw
  }
  return seed
}

async function writeContent(env: PortalEnv, body: Record<string, unknown>) {
  if (!env.CONTENT) throw new Error('KV_NOT_BOUND')
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

function adminPassword(env: PortalEnv): string {
  return env.ADMIN_PASSWORD || 'LuckyAdmin2026'
}

/** Handle /portal-api/* */
export async function handlePortalApi(request: Request, env: PortalEnv): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/portal-api\/?/, '').replace(/\/$/, '')
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    if (path === 'health' && method === 'GET') {
      return json({ ok: true, runtime: 'cloudflare-worker' })
    }

    if (path === 'content' && method === 'GET') {
      return json(await readContent(env))
    }

    if (path === 'login' && method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as { password?: string }
      if (String(body.password || '') !== adminPassword(env)) {
        return json({ error: 'invalid password' }, 401)
      }
      return json({ token: await signToken(env) })
    }

    if (path === 'content' && method === 'PUT') {
      const header = request.headers.get('Authorization') || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : ''
      if (!(await verifyToken(env, token))) {
        return json({ error: 'unauthorized' }, 401)
      }
      const body = (await request.json()) as Record<string, unknown>
      try {
        return json(await writeContent(env, body))
      } catch (e) {
        if (e instanceof Error && e.message === 'KV_NOT_BOUND') {
          return json(
            {
              error:
                '未绑定 KV。请在 Cloudflare → Settings → Bindings 添加 KV，变量名 CONTENT，然后重新部署。',
            },
            503,
          )
        }
        throw e
      }
    }

    return json({ error: 'not found', path }, 404)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'server error' }, 500)
  }
}
