import { Link, useLocation } from 'react-router'
import { useCurrentUser, useLogout } from '../hooks/useAuth'
import styles from './AccountMenu.module.css'

function UserIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  )
}

// "Sign in" for guests; the user's first name and "Log out" when logged in
export function AccountMenu() {
  const location = useLocation()
  const { data: user, isPending } = useCurrentUser()
  const logout = useLogout()

  // Render nothing until we know, so "Sign in" doesn't flash for a logged-in user
  if (isPending) {
    return null
  }

  if (!user) {
    return (
      <Link
        to="/login"
        // After signing in, the login page brings the user back here
        state={{ from: location.pathname + location.search }}
        className={styles.link}
      >
        <UserIcon />
        <span className={styles.label}>Sign in</span>
      </Link>
    )
  }

  return (
    <div className={styles.menu}>
      <span className={styles.user} title={user.email}>
        <UserIcon />
        <span className={styles.label}>{user.firstName}</span>
      </span>
      <button
        className={styles.logout}
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        Log out
      </button>
    </div>
  )
}
