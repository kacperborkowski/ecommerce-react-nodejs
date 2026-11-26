import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TextField } from '@/shared/ui/TextField'
import { registerSchema, type RegisterFormValues } from '../schema'
import styles from './AuthForm.module.css'

type RegisterFormProps = {
  onSubmit: (values: RegisterFormValues) => void
  isSubmitting: boolean
  // e.g. "An account with this email already exists"
  serverError?: string
}

export function RegisterForm({ onSubmit, isSubmitting, serverError }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.names}>
        <TextField
          label="First name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
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
        // Tells password managers to suggest a new, strong password
        autoComplete="new-password"
        hint="At least 8 characters"
        error={errors.password?.message}
        {...register('password')}
      />
      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
