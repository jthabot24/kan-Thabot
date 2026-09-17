import { useBootstrap } from '../api/ApiProvider'

function legacy(base: string, path: string) {
  return `${base.replace(/\/?$/, '/')}${path}`
}

export function CreationDropdown() {
  const { base_url: base } = useBootstrap()
  return (
    <details className="menu">
      <summary>Create</summary>
      <nav>
        <a href={legacy(base, 'project/create')}>Project</a>
        <a href={legacy(base, 'project/create/personal')}>Private project</a>
      </nav>
    </details>
  )
}
