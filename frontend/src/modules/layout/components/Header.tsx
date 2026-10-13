import { Link } from 'react-router'
import { SearchBar } from '@/modules/search'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Shop
        </Link>
        <SearchBar />
      </div>
    </header>
  )
}
