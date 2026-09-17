import { useParams } from 'react-router-dom'

import { useSetPageTitle } from '@/shell/PageTitle'

interface PlaceholderProps {
  area: 'dashboard' | 'projects' | 'project' | 'board' | 'task' | 'settings' | 'analytics'
  title: string
  /** Feature stream expected to replace this component */
  stream: string
}

/**
 * Empty routed page. Feature streams replace the component registered in
 * routes/index.tsx for their area; the route itself stays owned by Stream A.
 */
export function Placeholder({ area, title, stream }: PlaceholderProps) {
  const params = useParams()
  useSetPageTitle(title)

  return (
    <div className="react-placeholder" data-area={area} data-testid={`placeholder-${area}`}>
      <h2>{title}</h2>
      <p>
        Route params: <code>{JSON.stringify(params)}</code>
      </p>
      <p>
        Owned by <strong>{stream}</strong> — replace <code>pages/{area}</code> in <code>frontend/src/routes/index.tsx</code>.
      </p>
    </div>
  )
}
