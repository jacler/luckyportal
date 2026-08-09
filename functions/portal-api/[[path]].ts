import { handlePortalApi, type PortalEnv } from '../../shared/portalApi'

export const onRequest: PagesFunction<PortalEnv> = async (context) => {
  return handlePortalApi(context.request, context.env)
}
