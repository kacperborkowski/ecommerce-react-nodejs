import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SearchBar } from '@/modules/search'
import styles from './Header.module.css'

type HeaderProps = {
  // Extra elements on the right, e.g. the cart link. Passed in by the app,
  // so the layout module doesn't need to know about the cart module.
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Shop
        </Link>
        <div className={styles.search}>
          <SearchBar />
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  )
}
