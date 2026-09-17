import { useBootstrap } from '../api/ApiProvider'
import { legacyUrl } from '../api/urls'

export function CreationDropdown() {
  const { base_url: base } = useBootstrap()
  return (
    <details className="menu">
      <summary>Create</summary>
      <nav>
        <a href={legacyUrl(base, 'project/create')}>Project</a>
        <a href={legacyUrl(base, 'project/create/personal')}>Private project</a>
      </nav>
    </details>
  )
}
