import { handlePortalApi, type PortalEnv } from './shared/portalApi'

export type Env = PortalEnv & {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/portal-api' || url.pathname.startsWith('/portal-api/')) {
      return handlePortalApi(request, env)
    }
    return env.ASSETS.fetch(request)
  },
}
