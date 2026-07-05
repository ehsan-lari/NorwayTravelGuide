import styles from './Navbar.module.css'

export default function Navbar({ currentPage, onGoHome, onGetStarted }) {
  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <button className={styles.logo} onClick={onGoHome} aria-label="Go to home page">
          <span className={styles.logoIcon}>🏔️</span>
          <span className={styles.logoText}>
            Fjord<span className={styles.logoAccent}>&</span>Beyond
          </span>
        </button>

        {/* Nav links */}
        <nav className={styles.navLinks} aria-label="Main navigation">
          <span className={styles.navTag}>Norway Travel AI</span>
        </nav>

        {/* CTA */}
        {currentPage !== 'quiz' && (
          <button
            id="nav-cta-btn"
            className={`btn btn-primary ${styles.cta}`}
            onClick={onGetStarted}
          >
            <span>Find My Trip</span>
            <span>→</span>
          </button>
        )}
      </div>
    </header>
  )
}
