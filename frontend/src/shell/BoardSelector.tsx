import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApiQuery } from '@/api/hooks'

/** Port of app/Template/header/board_selector.php ("Display another project") */
export function BoardSelector() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { data } = useApiQuery('getMyProjectsList', {}, { staleTime: 60_000 })

  const items = useMemo(() => {
    const entries = Object.entries(data ?? {})
    const q = query.trim().toLowerCase()
    return (q ? entries.filter(([, name]) => name.toLowerCase().includes(q)) : entries).slice(0, 15)
  }, [data, query])

  if (!data || Object.keys(data).length === 0) return null

  return (
    <div className="react-board-selector">
      <input
        type="search"
        placeholder="Display another project"
        aria-label="Display another project"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && items.length > 0 && (
        <ul className="react-board-selector-list" role="listbox">
          {items.map(([id, name]) => (
            <li key={id} role="option" aria-selected={false}>
              <a
                href={`board/${id}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  setQuery('')
                  navigate(`/board/${id}`)
                }}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
