import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { api, apiQueryKey, getSession } from './client'
import type { ApiMethodName, ApiParams, ApiResult, SessionBootstrap } from './types'

type QueryOptions<M extends ApiMethodName> = Omit<
  UseQueryOptions<ApiResult<M>, Error, ApiResult<M>, ReturnType<typeof apiQueryKey<M>>>,
  'queryKey' | 'queryFn'
>

/** `useApiQuery('getAllProjects', {})` — cached JSON-RPC read */
export function useApiQuery<M extends ApiMethodName>(method: M, params: ApiParams<M>, options?: QueryOptions<M>) {
  return useQuery({
    queryKey: apiQueryKey(method, params),
    queryFn: () => api(method, params),
    ...options,
  })
}

type MutationOptions<M extends ApiMethodName> = Omit<
  UseMutationOptions<ApiResult<M>, Error, ApiParams<M>>,
  'mutationFn'
> & {
  /** Query key prefixes to invalidate on success, e.g. [['jsonrpc', 'getAllTasks']] */
  invalidates?: readonly (readonly unknown[])[]
}

/** `useApiMutation('updateTask', { invalidates: [['jsonrpc', 'getTask']] })` */
export function useApiMutation<M extends ApiMethodName>(method: M, options?: MutationOptions<M>) {
  const queryClient = useQueryClient()
  const { invalidates, onSuccess, ...rest } = options ?? {}

  return useMutation<ApiResult<M>, Error, ApiParams<M>>({
    mutationFn: (params) => api(method, params),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all((invalidates ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })))
      await onSuccess?.(data, variables, onMutateResult, context)
    },
    ...rest,
  })
}

export function useSession(): SessionBootstrap {
  return getSession()
}
