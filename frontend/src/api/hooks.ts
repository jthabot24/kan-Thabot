import { useQuery } from '@tanstack/react-query'
import { useApi } from './ApiProvider'

export function useMe() {
  const client = useApi()
  return useQuery({ queryKey: ['me'], queryFn: () => client.call('getMe') })
}

export function useMyProjectsList() {
  const client = useApi()
  return useQuery({ queryKey: ['my-projects-list'], queryFn: () => client.call('getMyProjectsList') })
}
