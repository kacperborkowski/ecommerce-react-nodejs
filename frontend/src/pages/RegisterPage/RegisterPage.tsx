import { Link, Navigate, useNavigate } from 'react-router'
import {
  RegisterForm,
  authErrorMessage,
  useCurrentUser,
  useRegister,
  useReturnTo,
} from '@/modules/auth'
import styles from '../AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { data: user } = useCurrentUser()
  const registerUser = useRegister()

  if (user) {
    return <Navigate to={returnTo} replace />
  }

  return (
    <div className={`container ${styles.page}`}>
      <title>Create an account – Shop</title>
      <div className={styles.card}>
        <h1 className={styles.title}>Create an account</h1>
        <RegisterForm
          onSubmit={(values) =>
            // The server logs the new user in straight away
            registerUser.mutate(values, {
              onSuccess: () => navigate(returnTo, { replace: true }),
            })
          }
          isSubmitting={registerUser.isPending}
          serverError={authErrorMessage(registerUser.error)}
        />
        <p className={styles.switch}>
          Already have an account?{' '}
          <Link to="/login" state={{ from: returnTo }} replace>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
