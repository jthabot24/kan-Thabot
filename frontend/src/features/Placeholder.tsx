import { useParams } from 'react-router-dom'

export function Placeholder({ area }: { area: string }) {
  const params = useParams()
  return (
    <div>
      <h2>{area}</h2>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <p>Placeholder — implemented by feature stream</p>
    </div>
  )
}
