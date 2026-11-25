import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <title>Page not found – Shop</title>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        The page you’re looking for doesn’t exist. <Link to="/">Go to the home page</Link>
      </p>
    </div>
  )
}
