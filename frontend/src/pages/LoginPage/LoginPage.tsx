import { Link, Navigate, useNavigate } from 'react-router'
import {
  LoginForm,
  authErrorMessage,
  useCurrentUser,
  useLogin,
  useReturnTo,
} from '@/modules/auth'
import styles from '../AuthPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { data: user } = useCurrentUser()
  const login = useLogin()

  // Already signed in (e.g. opened /login from a bookmark)
  if (user) {
    return <Navigate to={returnTo} replace />
  }

  return (
    <div className={`container ${styles.page}`}>
      <title>Sign in – Shop</title>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <LoginForm
          onSubmit={(values) =>
            // replace: the back button won't return to the login form
            login.mutate(values, { onSuccess: () => navigate(returnTo, { replace: true }) })
          }
          isSubmitting={login.isPending}
          serverError={authErrorMessage(login.error)}
        />
        <p className={styles.switch}>
          New here?{' '}
          {/* Keep the return address when switching to the other form */}
          <Link to="/register" state={{ from: returnTo }} replace>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
