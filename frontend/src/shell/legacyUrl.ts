import { getSession } from '@/api/client'

/** Build a URL to a legacy PHP controller/action, honouring ENABLE_URL_REWRITE */
export function legacyUrl(controller: string, action: string, params: Record<string, string | number> = {}): string {
  const { baseUrl, urlRewrite } = getSession()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => query.set(k, String(v)))

  if (!urlRewrite) {
    query.set('controller', controller)
    query.set('action', action)
    return `${baseUrl}?${query.toString()}`
  }

  const rewritten = rewrite(controller, action, params)
  if (rewritten !== null) {
    Object.keys(params).forEach((k) => {
      if (rewritten.includes(`/${params[k]}`)) query.delete(k)
    })
    const qs = query.toString()
    return `${baseUrl}${rewritten}${qs ? `?${qs}` : ''}`
  }

  query.set('controller', controller)
  query.set('action', action)
  return `${baseUrl}?${query.toString()}`
}

/** Subset of RouteProvider patterns needed by the shell */
function rewrite(controller: string, action: string, p: Record<string, string | number>): string | null {
  const key = `${controller}:${action}`
  switch (key) {
    case 'DashboardController:show':
      return p.user_id !== undefined ? `dashboard/${p.user_id}` : 'dashboard'
    case 'ProjectListController:show':
      return 'projects'
    case 'ProjectViewController:show':
      return `project/${p.project_id}`
    case 'BoardViewController:show':
      return `board/${p.project_id}`
    case 'TaskViewController:show':
      return `task/${p.task_id}`
    case 'UserViewController:show':
      return `user/${p.user_id}`
    case 'UserListController:show':
      return 'users'
    case 'GroupListController:index':
      return 'groups'
    case 'PluginController:show':
      return 'extensions'
    case 'ConfigController:index':
      return 'settings'
    case 'WebNotificationController:show':
      return `web-notifications/${p.user_id}`
    case 'ProjectCreationController:create':
      return 'project/create'
    case 'ProjectCreationController:createPrivate':
      return 'project/create/personal'
    default:
      return null
  }
}
