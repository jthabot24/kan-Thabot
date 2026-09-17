import { useNavigate } from 'react-router-dom'
import { useMyProjectsList } from '../api/hooks'

export function BoardSelector() {
  const navigate = useNavigate()
  const projects = useMyProjectsList()

  return (
    <select
      aria-label="Display another project"
      defaultValue=""
      onChange={(event) => {
        if (event.target.value) navigate(`/board/${event.target.value}`)
      }}
    >
      <option value="">Display another project</option>
      {Object.entries(projects.data || {}).map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </select>
  )
}
