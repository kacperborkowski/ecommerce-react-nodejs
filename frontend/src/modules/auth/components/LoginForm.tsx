import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TextField } from '@/shared/ui/TextField'
import { loginSchema, type LoginFormValues } from '../schema'
import styles from './AuthForm.module.css'

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void
  isSubmitting: boolean
  // e.g. "Invalid email or password"
  serverError?: string
}

export function LoginForm({ onSubmit, isSubmitting, serverError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        // Lets password managers fill in the saved password
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
