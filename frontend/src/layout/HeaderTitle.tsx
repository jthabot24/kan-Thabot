import { Link } from 'react-router-dom'

export function HeaderTitle({ project, task }: { project?: string; task?: string }) {
  return (
    <Link className="header-title" to="/dashboard">
      <strong>K<span>B</span></strong>
      <span>{project || task || 'Kanboard'}</span>
    </Link>
  )
}
