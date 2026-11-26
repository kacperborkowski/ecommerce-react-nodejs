import { useId, type ComponentProps } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  // Help text under the field, e.g. "At least 8 characters"
  hint?: string
  error?: string
}

// A labelled input with an error message. Works with React Hook Form:
// <TextField label="Email" {...register('email')} />. In React 19 `ref` is
// a normal prop, so the ref from register() reaches the <input>.
export function TextField({ label, hint, error, className, ...inputProps }: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  // The error replaces the hint. Screen readers read it after the label.
  const showHint = Boolean(hint) && !error
  const describedBy = error ? errorId : showHint ? hintId : undefined

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
        aria-describedby={describedBy}
        {...inputProps}
      />
      {showHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
