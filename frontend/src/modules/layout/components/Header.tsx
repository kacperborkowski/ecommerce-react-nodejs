import { SearchBar } from '@/modules/search'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo}>
          Shop
        </a>
        <SearchBar />
      </div>
    </header>
  )
}
