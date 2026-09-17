import { Link } from 'react-router-dom'
import { useBootstrap } from '../api/ApiProvider'
import { legacyUrl } from '../api/urls'

export function UserDropdown() {
  const { user, base_url: base, links } = useBootstrap()
  const displayName = user.name || user.username

  return (
    <details className="menu">
      <summary>{displayName}</summary>
      <nav>
        <Link to={`/dashboard/${user.id}`}>Dashboard</Link>
        <a href={legacyUrl(base, `user/profile/${user.id}`)}>My profile</a>
        <Link to="/projects">Projects</Link>
        {user.role === 'app-admin' && <Link to="/settings">Settings</Link>}
        <a href={legacyUrl(base, 'documentation')}>Documentation</a>
        <a href={links.logout}>Logout</a>
      </nav>
    </details>
  )
}
