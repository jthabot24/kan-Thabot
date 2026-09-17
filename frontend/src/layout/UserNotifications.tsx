import { useBootstrap } from '../api/ApiProvider'

export function UserNotifications() {
  const { user, base_url: base } = useBootstrap()
  return <a className="notification-link" href={`${base.replace(/\/?$/, '/')}web-notification/${user.id}`} aria-label="Notifications">♢</a>
}
