import {
  adminPassword,
  json,
  readContent,
  signToken,
  verifyToken,
  writeContent,
  type Env,
} from './_lib'

function pathOf(params: { path?: string | string[] }): string {
  const p = params.path
  if (!p) return ''
  return Array.isArray(p) ? p.join('/') : p
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const path = pathOf(params)
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
      return json({ ok: true, runtime: 'cloudflare-pages' })
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
        const saved = await writeContent(env, body)
        return json(saved)
      } catch (e) {
        if (e instanceof Error && e.message === 'KV_NOT_BOUND') {
          return json(
            {
              error:
                '未绑定 KV。请在 Cloudflare Pages → Settings → Bindings 添加 KV，变量名 CONTENT，然后重新部署。',
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
