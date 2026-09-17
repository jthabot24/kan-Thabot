import { Link } from 'react-router-dom'

import { useSetPageTitle } from '@/shell/PageTitle'

export function NotFound() {
  useSetPageTitle('Page not found')
  return (
    <div className="react-placeholder">
      <h2>Page not found</h2>
      <p>
        <Link to="/dashboard">Back to dashboard</Link>
      </p>
    </div>
  )
}
