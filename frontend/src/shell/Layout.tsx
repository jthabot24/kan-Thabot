import { Outlet } from 'react-router-dom'

import { FlashMessages } from './FlashMessages'
import { Header } from './Header'

/** Port of app/Template/layout.php body: flash messages, header, page section */
export function Layout() {
  return (
    <>
      <FlashMessages />
      <Header />
      <section className="page">
        <Outlet />
      </section>
    </>
  )
}
