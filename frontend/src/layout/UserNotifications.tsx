import { useBootstrap } from '../api/ApiProvider'
import { legacyUrl } from '../api/urls'

export function UserNotifications() {
  const { user, base_url: base } = useBootstrap()
  return <a className="notification-link" href={legacyUrl(base, `user/${user.id}/notifications/web`)} aria-label="Notifications">♢</a>
}
