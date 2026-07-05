import { useState } from 'react'
import styles from './DestinationCard.module.css'

const TRANSPORT_ICONS = {
  flight: '✈️', train: '🚂', ferry: '⛴️', car: '🚗', public_transport: '🚌', bus: '🚌', info: 'ℹ️',
}

const CROWD_LABELS = { 1: 'Remote',   2: 'Moderate', 3: 'Popular' }
const CROWD_COLORS = { 1: 'badge-teal', 2: 'badge-blue', 3: 'badge-yellow' }
const BUDGET_LABELS = { 1: 'Budget',   2: 'Mid-range', 3: 'Premium' }
const WEATHER_ICONS = {
  clearsky: '☀️', fair: '🌤️', partlycloudy: '⛅', cloudy: '☁️', fog: '🌫️',
  lightrain: '🌧️', rain: '🌧️', heavyrain: '⛈️',
  lightsnow: '🌨️', snow: '❄️', heavysnow: '☃️', sleet: '🌧️',
  lightrainshowers: '🌦️', rainshowers: '🌧️', snowshowers: '🌨️', thunderstorm: '⛈️',
}

function getWeatherIcon(symbol) {
  if (!symbol) return '🌡️'
  const base = symbol.split('_')[0]
  return WEATHER_ICONS[base] || '🌡️'
}

function formatCost(nok) {
  return `${nok.toLocaleString('nb-NO')} NOK`
}

export default function DestinationCard({ rec, rank }) {
  const [showTransport, setShowTransport] = useState(false)
  const [showFull, setShowFull] = useState(false)

  const matchColor =
    rec.match_percentage >= 75 ? '#00c9a7' :
    rec.match_percentage >= 55 ? '#4dabf7' :
    rec.match_percentage >= 35 ? '#ffd43b' : '#ff6b6b'

  return (
    <article className={`glass-card ${styles.card}`} id={`dest-card-${rec.id}`}>
      {/* ── Rank badge ── */}
      <div className={styles.rankBadge} aria-label={`Rank ${rank}`}>
        #{rank}
      </div>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.destName}>{rec.name}</h2>
          <p className={styles.destRegion}>
            <span className={styles.regionDot} />
            {rec.region}
          </p>
        </div>

        {/* Match ring */}
        <div className={styles.matchRing} aria-label={`${rec.match_percentage}% match`}>
          <svg viewBox="0 0 44 44" className={styles.matchSvg} aria-hidden="true">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke={matchColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - rec.match_percentage / 100)}`}
              transform="rotate(-90 22 22)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className={styles.matchNum}>
            <span style={{ color: matchColor }}>{rec.match_percentage}%</span>
            <span className={styles.matchLabel}>match</span>
          </div>
        </div>
      </div>

      {/* ── Season badge ── */}
      <div className={styles.seasonRow}>
        <span className={`season-badge season-${rec.season_match}`}>
          {rec.season_match === 'perfect' ? '⭐ Perfect season' :
           rec.season_match === 'good'    ? '✓ Good season' :
           rec.season_match === 'ok'      ? '~ Decent season' : '⚠ Off-season'}
        </span>
        <span className={styles.seasonNote}>{rec.season_note}</span>
      </div>

      {/* ── AI Narration ── */}
      {rec.ai_narration && (
        <blockquote className={styles.narration}>
          <span className={styles.narrationIcon}>✨</span>
          <p>{rec.ai_narration}</p>
        </blockquote>
      )}

      {/* ── Short description (if no narration) ── */}
      {!rec.ai_narration && (
        <p className={styles.shortDesc}>{rec.short_description}</p>
      )}

      {/* ── Highlights ── */}
      <div className={styles.highlights}>
        <span className="label">Top Highlights</span>
        <ul className={styles.highlightList}>
          {rec.highlights.map((h, i) => (
            <li key={i} className={styles.highlightItem}>
              <span className={styles.highlightDot}>▸</span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Tags Row ── */}
      <div className={styles.tagsRow}>
        {rec.best_for.map((t, i) => (
          <span key={i} className="badge badge-teal">{t}</span>
        ))}
        <span className={`badge ${CROWD_COLORS[rec.crowd_level]}`}>
          {CROWD_LABELS[rec.crowd_level]} crowds
        </span>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        {/* Weather */}
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            {rec.current_weather ? getWeatherIcon(rec.current_weather.symbol) : '🌡️'}
          </span>
          <div className={styles.statBody}>
            <span className={styles.statValue}>
              {rec.current_weather?.temp_c != null
                ? `${rec.current_weather.temp_c.toFixed(1)}°C`
                : '—'}
            </span>
            <span className={styles.statLabel}>
              {rec.current_weather?.description || 'Live weather'}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div className={styles.stat}>
          <span className={styles.statIcon}>💰</span>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{formatCost(rec.estimated_daily_cost_nok)}</span>
            <span className={styles.statLabel}>{BUDGET_LABELS[rec.budget_level]} · per day</span>
          </div>
        </div>
      </div>

      {/* ── Transport toggle ── */}
      {rec.transport_options.length > 0 && (
        <div className={styles.transportSection}>
          <button
            className={styles.transportToggle}
            onClick={() => setShowTransport(v => !v)}
            id={`transport-toggle-${rec.id}`}
            aria-expanded={showTransport}
          >
            <span>🚂 Getting there</span>
            <span className={showTransport ? styles.chevronUp : styles.chevronDown}>▾</span>
          </button>

          {showTransport && (
            <div className={styles.transportList}>
              {rec.transport_options.map((t, i) => (
                <div key={i} className={styles.transportItem}>
                  <span className={styles.transportIcon}>{TRANSPORT_ICONS[t.mode] || '🚌'}</span>
                  <div className={styles.transportBody}>
                    <div className={styles.transportDuration}>{t.duration_text}</div>
                    <div className={styles.transportDesc}>{t.description}</div>
                    {t.estimated_cost_nok && (
                      <div className={styles.transportCost}>
                        ~{t.estimated_cost_nok.toLocaleString()} NOK
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Coordinates (dev info) ── */}
      <div className={styles.coords} aria-label="GPS coordinates">
        📍 {rec.lat.toFixed(2)}°N, {rec.lon.toFixed(2)}°E
      </div>
    </article>
  )
}
