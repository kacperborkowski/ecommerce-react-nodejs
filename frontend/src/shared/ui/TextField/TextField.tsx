import { useId, type ComponentProps } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

// A labelled input with an error message. Works with React Hook Form:
// <TextField label="Email" {...register('email')} />. In React 19 `ref` is
// a normal prop, so the ref from register() reaches the <input>.
export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        // Screen readers announce the field as invalid and read the message
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
