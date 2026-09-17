import { Link } from 'react-router-dom'

import { BoardSelector } from './BoardSelector'
import { CreationMenu, UserMenu, UserNotifications } from './UserMenu'
import { usePageTitle } from './PageTitle'

/** Port of app/Template/header.php + header/title.php */
export function Header() {
  const { title, project } = usePageTitle()

  return (
    <header>
      <div className="title-container">
        <h1>
          <span className="logo">
            <Link to="/dashboard" title="Dashboard">
              K<span>B</span>
            </Link>
          </span>
          <span className="title">
            {project ? <Link to={`/board/${project.id}`}>{project.name}</Link> : title}
          </span>
        </h1>
      </div>
      <div className="board-selector-container">
        <BoardSelector />
      </div>
      <div className="menus-container">
        <UserNotifications />
        &nbsp;
        <CreationMenu />
        &nbsp;
        <UserMenu />
      </div>
    </header>
  )
}
