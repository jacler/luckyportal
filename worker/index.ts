import { handlePortalApi, type PortalEnv } from '../shared/portalApi'

export type Env = PortalEnv & {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/portal-api' || url.pathname.startsWith('/portal-api/')) {
      return handlePortalApi(request, env)
    }
    // SPA / 静态资源由 assets 绑定处理（run_worker_first 之外的请求通常到不了这里）
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
