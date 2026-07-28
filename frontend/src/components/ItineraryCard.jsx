import { useState } from 'react'
import styles from './ItineraryCard.module.css'

export default function ItineraryCard({ itinerary }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.badge}>🗺️ Curated Route Match</span>
          <h3 className={styles.title}>{itinerary.title}</h3>
          <p className={styles.meta}>
            ⏱️ {itinerary.duration_days} Days &nbsp;·&nbsp; 
            💰 {itinerary.budget_level === 1 ? 'Budget' : itinerary.budget_level === 2 ? 'Mid-Range' : 'Premium'}
          </p>
        </div>
        <button className={styles.toggleBtn}>
          {expanded ? 'Hide Details ▲' : 'View Itinerary ▼'}
        </button>
      </div>

      <p className={styles.description}>{itinerary.description}</p>

      {expanded && (
        <div className={styles.timeline}>
          {itinerary.day_by_day.map((day) => (
            <div key={day.day} className={styles.dayRow}>
              <div className={styles.dayNumber}>Day {day.day}</div>
              <div className={styles.dayContent}>
                <h4 className={styles.dayTitle}>{day.title}</h4>
                <p className={styles.dayDesc}>{day.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
