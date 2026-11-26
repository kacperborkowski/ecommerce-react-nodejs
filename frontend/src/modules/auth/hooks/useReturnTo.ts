import { useLocation } from 'react-router'

// Where to go after signing in: the page the user came from (passed by the
// "Sign in" link as router state), or the home page.
//
// Router state isn't part of the URL, so another website can't craft a link
// that sends the user somewhere else after login. We still accept only paths
// inside the shop.
export function useReturnTo(): string {
  const location = useLocation()
  const state: unknown = location.state
  const from =
    state && typeof state === 'object' && 'from' in state ? state.from : undefined

  if (
    typeof from !== 'string' ||
    !from.startsWith('/') ||
    from.startsWith('//') ||
    // Coming back to the login or register page after signing in makes no sense
    /^\/(login|register)\b/.test(from)
  ) {
    return '/'
  }

  return from
}
