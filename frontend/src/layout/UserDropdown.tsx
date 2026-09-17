import { useBootstrap } from '../api/ApiProvider'

function legacy(base: string, path: string) {
  return `${base.replace(/\/?$/, '/')}${path}`
}

export function UserDropdown() {
  const { user, base_url: base, links } = useBootstrap()
  const displayName = user.name || user.username

  return (
    <details className="menu">
      <summary>{displayName}</summary>
      <nav>
        <a href={links.legacy_dashboard}>Dashboard</a>
        <a href={legacy(base, `user/profile/${user.id}`)}>My profile</a>
        <a href="/projects">Projects</a>
        {user.role === 'app-admin' && <a href="/settings">Settings</a>}
        <a href={legacy(base, 'documentation')}>Documentation</a>
        <a href={links.logout}>Logout</a>
      </nav>
    </details>
  )
}
