import { useRoutes, type RouteObject } from 'react-router-dom'
import { BoardSelector } from './BoardSelector'
import { CreationDropdown } from './CreationDropdown'
import { FlashMessages } from './FlashMessages'
import { HeaderTitle } from './HeaderTitle'
import { UserDropdown } from './UserDropdown'
import { UserNotifications } from './UserNotifications'
import './layout.css'

export function AppShell({ routes }: { routes: RouteObject[] }) {
  const content = useRoutes(routes)

  return (
    <>
      <header className="app-header">
        <div className="title-container">
          <HeaderTitle />
        </div>
        <div className="board-selector-container">
          <BoardSelector />
        </div>
        <div className="menus-container">
          <CreationDropdown />
          <UserNotifications />
          <UserDropdown />
        </div>
      </header>
      <section className="page">
        <FlashMessages />
        {content}
      </section>
    </>
  )
}
