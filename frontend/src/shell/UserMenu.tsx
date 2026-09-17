import { Link } from 'react-router-dom'

import { useSession } from '@/api/hooks'
import { Dropdown } from './Dropdown'
import { legacyUrl } from './legacyUrl'

function Icon({ name }: { name: string }) {
  return <i className={`fa fa-fw fa-${name}`} aria-hidden="true" />
}

/** Port of app/Template/header/user_notifications.php */
export function UserNotifications() {
  const { user } = useSession()
  return (
    <span className="notification">
      <a
        href={legacyUrl('WebNotificationController', 'show', { user_id: user.id })}
        title={user.has_notifications ? 'Unread notifications' : 'My notifications'}
        aria-label={user.has_notifications ? 'Unread notifications' : 'My notifications'}
      >
        <i className={`fa fa-bell${user.has_notifications ? ' web-notification-icon' : ''}`} aria-hidden="true" />
      </a>
    </span>
  )
}

/** Port of app/Template/header/creation_dropdown.php */
export function CreationMenu() {
  const { permissions } = useSession()
  if (!permissions.create_project && !permissions.create_private_project) return null

  return (
    <Dropdown
      className="header-creation-menu"
      ariaLabel="Create"
      trigger={
        <>
          <i className="fa fa-plus fa-fw" aria-hidden="true" />
          <i className="fa fa-caret-down" aria-hidden="true" />
        </>
      }
    >
      {permissions.create_project && (
        <li>
          <a href={legacyUrl('ProjectCreationController', 'create')}>
            <Icon name="plus" /> New project
          </a>
        </li>
      )}
      {permissions.create_private_project && (
        <li>
          <a href={legacyUrl('ProjectCreationController', 'createPrivate')}>
            <Icon name="lock" /> New personal project
          </a>
        </li>
      )}
    </Dropdown>
  )
}

/** Port of app/Template/header/user_dropdown.php */
export function UserMenu() {
  const { user, permissions, logoutUrl, documentationUrl } = useSession()
  const avatar = user.avatar_path ? (
    <img
      className="avatar-inline avatar-20"
      src={legacyUrl('AvatarFileController', 'image', { user_id: user.id, size: 20 })}
      alt={user.name || user.username}
    />
  ) : (
    <span className="avatar avatar-inline avatar-20 avatar-letter" style={{ display: 'inline-block' }}>
      {(user.name || user.username).charAt(0).toUpperCase()}
    </span>
  )

  return (
    <Dropdown
      ariaLabel="User menu"
      trigger={
        <>
          {avatar}
          <i className="fa fa-caret-down" aria-hidden="true" />
        </>
      }
    >
      <li className="no-hover">
        <strong>{user.name || user.username}</strong>
      </li>
      <li>
        <Link to={`/dashboard/${user.id}`}>
          <Icon name="tachometer" /> My dashboard
        </Link>
      </li>
      <li>
        <a href={legacyUrl('UserViewController', 'show', { user_id: user.id })}>
          <Icon name="home" /> My profile
        </a>
      </li>
      <li>
        <Link to="/projects">
          <Icon name="folder" /> Projects management
        </Link>
      </li>
      {permissions.manage_users && (
        <>
          <li>
            <a href={legacyUrl('UserListController', 'show')}>
              <Icon name="user" /> Users management
            </a>
          </li>
          <li>
            <a href={legacyUrl('GroupListController', 'index')}>
              <Icon name="group" /> Groups management
            </a>
          </li>
        </>
      )}
      {permissions.manage_plugins && (
        <li>
          <a href={legacyUrl('PluginController', 'show')}>
            <Icon name="cubes" /> Plugins
          </a>
        </li>
      )}
      {permissions.manage_settings && (
        <li>
          <Link to="/settings">
            <Icon name="cog" /> Settings
          </Link>
        </li>
      )}
      <li>
        <a href={documentationUrl} target="_blank" rel="noreferrer">
          <Icon name="life-ring" /> Documentation
        </a>
      </li>
      {logoutUrl && (
        <li>
          <a href={logoutUrl}>
            <Icon name="sign-out" /> Logout
          </a>
        </li>
      )}
    </Dropdown>
  )
}
