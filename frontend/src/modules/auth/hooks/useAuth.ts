import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, login, logout, register } from '../api/authApi'
import type { User } from '../types'

const CURRENT_USER_KEY = ['currentUser']

// The logged-in user, or null for a guest. Loaded once per visit: it changes
// only through the login, register and logout hooks below, which update it.
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })
}

function useSetCurrentUser() {
  const queryClient = useQueryClient()
  return (user: User | null) => queryClient.setQueryData(CURRENT_USER_KEY, user)
}

export function useLogin() {
  const setCurrentUser = useSetCurrentUser()
  return useMutation({ mutationFn: login, onSuccess: setCurrentUser })
}

export function useRegister() {
  const setCurrentUser = useSetCurrentUser()
  return useMutation({ mutationFn: register, onSuccess: setCurrentUser })
}

export function useLogout() {
  const setCurrentUser = useSetCurrentUser()
  return useMutation({ mutationFn: logout, onSuccess: () => setCurrentUser(null) })
}
