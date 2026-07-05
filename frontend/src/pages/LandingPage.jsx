import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: '🧭', title: 'Smart Matching', desc: 'Multi-factor scoring across season, weather, budget, activities, and transport options.' },
  { icon: '🌦️', title: 'Real Weather Data', desc: 'Live forecasts from MET Norway and historical climate normals — plan with confidence.' },
  { icon: '🤖', title: 'AI Narration', desc: 'Gemini AI crafts personalised summaries explaining why each destination fits you.' },
  { icon: '🚂', title: 'Transport Routes', desc: 'Train, ferry, bus, and flight options from your city via Entur\'s journey planner.' },
  { icon: '🗺️', title: 'Interactive Map', desc: 'Explore all destinations on a live map of Norway with your top matches highlighted.' },
  { icon: '💰', title: 'Budget Aware', desc: 'Cost estimates per destination tailored to your budget — budget, mid-range, or premium.' },
]

const DESTINATIONS_PREVIEW = [
  { emoji: '🏔️', name: 'Lofoten Islands', tag: 'Arctic Drama' },
  { emoji: '🌌', name: 'Tromsø', tag: 'Northern Lights' },
  { emoji: '⛴️', name: 'Geirangerfjord', tag: 'UNESCO Fjord' },
  { emoji: '🌸', name: 'Hardangerfjord', tag: 'Orchard & Glacier' },
  { emoji: '🐻‍❄️', name: 'Svalbard', tag: 'High Arctic' },
  { emoji: '🏰', name: 'Røros', tag: 'UNESCO Town' },
]

export default function LandingPage({ onGetStarted }) {
  return (
    <div className={styles.page}>
      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
          <div className={styles.heroGlow3} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span>26 curated Norwegian destinations</span>
          </div>

          <h1 className={`display-title ${styles.heroTitle}`}>
            Where in Norway<br />
            <span className={styles.heroTitleAccent}>should you travel?</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Answer 8 quick questions. Our AI matches you with the perfect Norwegian destination
            based on your dates, budget, weather preferences, and travel style.
          </p>

          <div className={styles.heroCtas}>
            <button
              id="hero-start-btn"
              className={`btn btn-primary btn-lg ${styles.heroPrimary}`}
              onClick={onGetStarted}
            >
              <span>Find My Perfect Destination</span>
              <span className={styles.btnArrow}>→</span>
            </button>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>26</strong>
                <span>Destinations</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <strong>8</strong>
                <span>Questions</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <strong>~2 min</strong>
                <span>To results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating destination preview cards */}
        <div className={styles.previewStrip} aria-label="Featured destinations">
          <div className={styles.previewTrack}>
            {[...DESTINATIONS_PREVIEW, ...DESTINATIONS_PREVIEW].map((d, i) => (
              <div key={i} className={styles.previewCard}>
                <span className={styles.previewEmoji}>{d.emoji}</span>
                <span className={styles.previewName}>{d.name}</span>
                <span className={`badge badge-teal ${styles.previewTag}`}>{d.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className={styles.features} aria-labelledby="features-heading">
        <div className="container">
          <div className={styles.featuresHeader}>
            <span className="label">Why Fjord &amp; Beyond</span>
            <h2 id="features-heading" className={`section-title ${styles.featuresTitle}`}>
              Travel smarter, not harder
            </h2>
            <p className={styles.featuresSubtitle}>
              We combine live weather data, AI, and Norway-specific knowledge
              so you don't have to spend hours researching.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`glass-card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorks} aria-labelledby="how-heading">
        <div className="container">
          <div className={styles.featuresHeader}>
            <span className="label">Simple Process</span>
            <h2 id="how-heading" className={`section-title ${styles.featuresTitle}`}>
              Three steps to your next adventure
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { num: '01', title: 'Tell us about yourself', desc: 'Share your travel month, budget, interests, and departure city in a guided questionnaire.' },
              { num: '02', title: 'We do the heavy lifting', desc: 'Our engine scores 26 destinations across 6 dimensions and Gemini AI crafts your personalised summaries.' },
              { num: '03', title: 'Explore your matches', desc: 'Browse ranked destinations on an interactive map, with live weather, transport routes, and cost estimates.' },
            ].map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < 2 && <div className={styles.stepConnector} aria-hidden="true" />}
              </div>
            ))}
          </div>
          <div className={styles.howItWorksCta}>
            <button
              id="how-start-btn"
              className="btn btn-primary btn-lg"
              onClick={onGetStarted}
            >
              Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerText}>
            Built with ❤️ using{' '}
            <span className={styles.techTag}>React</span>{' '}
            <span className={styles.techTag}>FastAPI</span>{' '}
            <span className={styles.techTag}>Gemini AI</span>{' '}
            <span className={styles.techTag}>MET Norway</span>{' '}
            <span className={styles.techTag}>Entur</span>
          </p>
          <p className={styles.footerSub}>
            Weather data © <a href="https://www.met.no" target="_blank" rel="noreferrer" className={styles.footerLink}>MET Norway</a> ·
            Transport data © <a href="https://entur.no" target="_blank" rel="noreferrer" className={styles.footerLink}>Entur</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
