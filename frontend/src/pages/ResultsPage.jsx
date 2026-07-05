import DestinationCard from '../components/DestinationCard'
import NorwayMap from '../components/NorwayMap'
import styles from './ResultsPage.module.css'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export default function ResultsPage({ data, preferences, onStartOver, onRestart }) {
  const { recommendations, travel_month_name, total_destinations_evaluated, user_summary } = data

  const top = recommendations[0]
  const monthName = travel_month_name || MONTH_NAMES[(preferences?.travel_month || 7) - 1]

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        {/* ── Results Header ── */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className="label">Your personalised results</span>
            <div className={styles.headerStats}>
              <span className={styles.statPill}>
                📅 {monthName}
              </span>
              <span className={styles.statPill}>
                🔍 {total_destinations_evaluated} destinations scored
              </span>
              <span className={styles.statPill}>
                🏆 {recommendations.length} top matches
              </span>
            </div>
          </div>

          <h1 className={styles.heading}>
            Your Top Picks for <span className={styles.headingAccent}>{monthName}</span>
          </h1>

          {user_summary && (
            <p className={styles.userSummary}>
              <span className={styles.userSummaryIcon}>🧭</span>
              {user_summary}
            </p>
          )}

          {top && (
            <div className={styles.topPick}>
              <span className={styles.topPickLabel}>⭐ Top recommendation</span>
              <span className={styles.topPickName}>{top.name}</span>
              <span className={styles.topPickMatch}>{top.match_percentage}% match</span>
            </div>
          )}
        </header>

        {/* ── Main Layout: Map + Cards ── */}
        <div className={styles.layout}>
          {/* Left: Map */}
          <aside className={styles.mapPanel}>
            <div className={`glass-card ${styles.mapCard}`}>
              <NorwayMap recommendations={recommendations} />
            </div>

            {/* Summary stats */}
            <div className={`glass-card ${styles.summaryCard}`}>
              <h3 className={styles.summaryTitle}>Trip Summary</h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>📅</span>
                  <div>
                    <div className={styles.summaryVal}>{monthName}</div>
                    <div className={styles.summaryLabel}>Travel month</div>
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>⏱️</span>
                  <div>
                    <div className={styles.summaryVal}>{preferences?.trip_duration_days} days</div>
                    <div className={styles.summaryLabel}>Trip duration</div>
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>🏙️</span>
                  <div>
                    <div className={styles.summaryVal}>{preferences?.departure_city || 'Oslo'}</div>
                    <div className={styles.summaryLabel}>Departure city</div>
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>👥</span>
                  <div>
                    <div className={styles.summaryVal}>{preferences?.group_type || '—'}</div>
                    <div className={styles.summaryLabel}>Group type</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Cards */}
          <section className={styles.cardsPanel} aria-label="Destination recommendations">
            <div className={styles.cardsHeader}>
              <h2 className={styles.cardsTitle}>Ranked Destinations</h2>
              <p className={styles.cardsSubtitle}>
                Scored across season, activities, budget, weather, transport, and crowd preferences.
              </p>
            </div>

            <div className={styles.cardsList}>
              {recommendations.map((rec, i) => (
                <DestinationCard key={rec.id} rec={rec} rank={i + 1} />
              ))}
            </div>
          </section>
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button
            id="results-restart-btn"
            className="btn btn-primary btn-lg"
            onClick={onRestart}
          >
            🔄 Refine My Search
          </button>
          <button
            id="results-home-btn"
            className="btn btn-secondary btn-lg"
            onClick={onStartOver}
          >
            🏠 Start Over
          </button>
        </div>

        {/* ── Data attribution ── */}
        <footer className={styles.attribution}>
          <p>
            Weather data: <a href="https://api.met.no" target="_blank" rel="noreferrer">MET Norway</a> ·
            Transport: <a href="https://entur.no" target="_blank" rel="noreferrer">Entur</a> ·
            AI narration: <a href="https://aistudio.google.com" target="_blank" rel="noreferrer">Google Gemini</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
