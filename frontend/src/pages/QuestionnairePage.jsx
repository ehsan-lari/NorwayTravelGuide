import { useState } from 'react'
import styles from './QuestionnairePage.module.css'

const MONTHS = [
  { value: 1,  label: 'January',   emoji: '❄️', hint: 'Polar nights, northern lights' },
  { value: 2,  label: 'February',  emoji: '🌨️', hint: 'Winter festivals, dog sleds' },
  { value: 3,  label: 'March',     emoji: '☃️', hint: 'Last great ski season' },
  { value: 4,  label: 'April',     emoji: '🌱', hint: 'Spring arrives, quiet trails' },
  { value: 5,  label: 'May',       emoji: '🌸', hint: 'Blossoms, Constitution Day' },
  { value: 6,  label: 'June',      emoji: '🌞', hint: 'Midnight sun begins' },
  { value: 7,  label: 'July',      emoji: '☀️', hint: 'Peak summer, warmest month' },
  { value: 8,  label: 'August',    emoji: '🏖️', hint: 'Best beach days, long evenings' },
  { value: 9,  label: 'September', emoji: '🍂', hint: 'Autumn colours, fewer crowds' },
  { value: 10, label: 'October',   emoji: '🌊', hint: 'Storm season, dramatic coast' },
  { value: 11, label: 'November',  emoji: '🌑', hint: 'Northern lights return' },
  { value: 12, label: 'December',  emoji: '🎄', hint: 'Christmas markets, deep snow' },
]

const INTERESTS = [
  { id: 'northern_lights', emoji: '🌌', label: 'Northern Lights' },
  { id: 'hiking',          emoji: '🥾', label: 'Hiking' },
  { id: 'fjords',          emoji: '⛴️', label: 'Fjords' },
  { id: 'midnight_sun',    emoji: '🌅', label: 'Midnight Sun' },
  { id: 'skiing',          emoji: '⛷️', label: 'Skiing' },
  { id: 'city',            emoji: '🏙️', label: 'City & Culture' },
  { id: 'food',            emoji: '🍽️', label: 'Food & Dining' },
  { id: 'wildlife',        emoji: '🦌', label: 'Wildlife' },
  { id: 'photography',     emoji: '📸', label: 'Photography' },
  { id: 'beach',           emoji: '🏖️', label: 'Beaches' },
  { id: 'adventure',       emoji: '🧗', label: 'Adventure' },
  { id: 'culture',         emoji: '🏛️', label: 'History & Culture' },
  { id: 'family',          emoji: '👨‍👩‍👧', label: 'Family Fun' },
  { id: 'romantic',        emoji: '💑', label: 'Romantic' },
]

const DEPARTURE_CITIES = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø', 'Bodø', 'Ålesund', 'Kristiansand', 'Abroad (flying in)']
const INITIAL = {
  travel_month: null,
  trip_duration_days: 5,
  departure_city: '',
  budget_level: null,
  interests: [],
  group_type: null,
  weather_preference: null,
  crowd_preference: null,
  transport_preference: 'flexible',
  num_travelers: 1,
}

const STEPS = [
  { id: 'month',     title: 'When are you travelling?',        subtitle: 'The month shapes everything — weather, crowds, daylight.' },
  { id: 'duration',  title: 'How long is your trip?',          subtitle: 'Tell us how many days you have to explore.' },
  { id: 'interests', title: 'What excites you most?',          subtitle: 'Pick everything that sounds great. Select at least one.' },
  { id: 'departure', title: 'Where are you starting from?',    subtitle: 'Your departure city affects travel time and transport options.' },
  { id: 'budget',    title: 'What\'s your daily budget?',      subtitle: 'Per person, including accommodation and food.' },
  { id: 'group',     title: 'Who\'s travelling with you?',     subtitle: 'Group type helps tailor the vibe of each recommendation.' },
  { id: 'weather',   title: 'What weather do you prefer?',     subtitle: 'We\'ll match you with destinations that suit your ideal climate.' },
  { id: 'crowd',     title: 'How do you feel about crowds?',   subtitle: 'Norway has everything from bustling cities to silent wilderness.' },
]

function StepMonth({ value, onChange }) {
  return (
    <div className={styles.monthGrid}>
      {MONTHS.map(m => (
        <button
          key={m.value}
          id={`month-${m.value}`}
          className={`${styles.monthCard} ${value === m.value ? styles.selected : ''}`}
          onClick={() => onChange(m.value)}
          type="button"
        >
          <span className={styles.monthEmoji}>{m.emoji}</span>
          <span className={styles.monthLabel}>{m.label}</span>
          <span className={styles.monthHint}>{m.hint}</span>
        </button>
      ))}
    </div>
  )
}

function StepDuration({ value, numTravelers, onChange, onTravelersChange }) {
  const durations = [
    { label: 'Weekend', days: 2, emoji: '⚡' },
    { label: 'Long Weekend', days: 4, emoji: '🌤️' },
    { label: '1 Week', days: 7, emoji: '✈️' },
    { label: '2 Weeks', days: 14, emoji: '🧳' },
    { label: '3+ Weeks', days: 21, emoji: '🗺️' },
  ]
  return (
    <div className={styles.durationStep}>
      <div className={styles.optionGrid}>
        {durations.map(d => (
          <button
            key={d.days}
            id={`duration-${d.days}`}
            className={`${styles.optionCard} ${value === d.days ? styles.selected : ''}`}
            onClick={() => onChange(d.days)}
            type="button"
          >
            <span className={styles.optionEmoji}>{d.emoji}</span>
            <span className={styles.optionLabel}>{d.label}</span>
            <span className={styles.optionHint}>{d.days} day{d.days > 1 ? 's' : ''}</span>
          </button>
        ))}
      </div>
      <div className={styles.travelersRow}>
        <label className={styles.travelersLabel}>
          <span>👥</span>
          <span>Number of travellers</span>
        </label>
        <div className={styles.counterRow}>
          <button className={styles.counterBtn} onClick={() => onTravelersChange(Math.max(1, numTravelers - 1))} type="button" aria-label="Decrease">−</button>
          <span className={styles.counterValue}>{numTravelers}</span>
          <button className={styles.counterBtn} onClick={() => onTravelersChange(Math.min(20, numTravelers + 1))} type="button" aria-label="Increase">+</button>
        </div>
      </div>
    </div>
  )
}

function StepInterests({ value, onChange }) {
  const toggle = (id) => {
    const next = value.includes(id) ? value.filter(i => i !== id) : [...value, id]
    onChange(next)
  }
  return (
    <div className={styles.interestsGrid}>
      {INTERESTS.map(i => (
        <button
          key={i.id}
          id={`interest-${i.id}`}
          className={`${styles.interestChip} ${value.includes(i.id) ? styles.selected : ''}`}
          onClick={() => toggle(i.id)}
          type="button"
          aria-pressed={value.includes(i.id)}
        >
          <span className={styles.interestEmoji}>{i.emoji}</span>
          <span>{i.label}</span>
          {value.includes(i.id) && <span className={styles.checkmark}>✓</span>}
        </button>
      ))}
    </div>
  )
}

function StepDeparture({ value, onChange }) {
  return (
    <div className={styles.optionGrid}>
      {DEPARTURE_CITIES.map(city => (
        <button
          key={city}
          id={`city-${city.replace(/[^a-z]/gi, '')}`}
          className={`${styles.optionCard} ${value === city ? styles.selected : ''}`}
          onClick={() => onChange(city)}
          type="button"
        >
          <span className={styles.optionEmoji}>
            {city === 'Oslo' ? '🏛️' : city === 'Bergen' ? '🌧️' : city === 'Tromsø' ? '🌌' : city === 'Stavanger' ? '🛢️' : city === 'Trondheim' ? '⚓' : city === 'Abroad (flying in)' ? '✈️' : '🏙️'}
          </span>
          <span className={styles.optionLabel}>{city}</span>
        </button>
      ))}
    </div>
  )
}

function StepBudget({ value, onChange }) {
  const budgets = [
    { level: 1, label: 'Budget',    sub: 'Under 1 500 NOK/day', emoji: '🎒', hint: 'Hostels, simple meals, buses' },
    { level: 2, label: 'Mid-Range', sub: '1 500 – 3 000 NOK/day', emoji: '🏨', hint: 'Hotels, restaurants, some tours' },
    { level: 3, label: 'Premium',   sub: 'Over 3 000 NOK/day', emoji: '💎', hint: 'Boutique stays, guided experiences' },
  ]
  return (
    <div className={styles.budgetGrid}>
      {budgets.map(b => (
        <button
          key={b.level}
          id={`budget-${b.level}`}
          className={`${styles.budgetCard} ${value === b.level ? styles.selected : ''}`}
          onClick={() => onChange(b.level)}
          type="button"
        >
          <span className={styles.budgetEmoji}>{b.emoji}</span>
          <span className={styles.budgetLabel}>{b.label}</span>
          <span className={styles.budgetSub}>{b.sub}</span>
          <span className={styles.budgetHint}>{b.hint}</span>
        </button>
      ))}
    </div>
  )
}

function StepGroup({ value, onChange }) {
  const groups = [
    { id: 'solo',    emoji: '🧍', label: 'Solo', hint: 'Just me' },
    { id: 'couple',  emoji: '👫', label: 'Couple', hint: 'Two of us' },
    { id: 'family',  emoji: '👨‍👩‍👧‍👦', label: 'Family', hint: 'With children' },
    { id: 'group',   emoji: '👥', label: 'Friend Group', hint: '3+ adults' },
  ]
  return (
    <div className={styles.optionGrid}>
      {groups.map(g => (
        <button
          key={g.id}
          id={`group-${g.id}`}
          className={`${styles.optionCard} ${value === g.id ? styles.selected : ''}`}
          onClick={() => onChange(g.id)}
          type="button"
        >
          <span className={styles.optionEmoji}>{g.emoji}</span>
          <span className={styles.optionLabel}>{g.label}</span>
          <span className={styles.optionHint}>{g.hint}</span>
        </button>
      ))}
    </div>
  )
}

function StepWeather({ value, onChange }) {
  const options = [
    { pref: 1, emoji: '❄️', label: 'Love the Cold',  sub: 'Snow, frost & crisp air', hint: 'Perfect for northern lights & skiing' },
    { pref: 2, emoji: '🌤️', label: 'Mild & Comfortable', sub: '8–16 °C', hint: 'Ideal hiking and sightseeing weather' },
    { pref: 3, emoji: '☀️', label: 'Warm & Sunny',   sub: '16 °C +', hint: 'Beaches, terraces & long evenings' },
  ]
  return (
    <div className={styles.budgetGrid}>
      {options.map(o => (
        <button
          key={o.pref}
          id={`weather-${o.pref}`}
          className={`${styles.budgetCard} ${value === o.pref ? styles.selected : ''}`}
          onClick={() => onChange(o.pref)}
          type="button"
        >
          <span className={styles.budgetEmoji}>{o.emoji}</span>
          <span className={styles.budgetLabel}>{o.label}</span>
          <span className={styles.budgetSub}>{o.sub}</span>
          <span className={styles.budgetHint}>{o.hint}</span>
        </button>
      ))}
    </div>
  )
}

function StepCrowd({ value, onChange }) {
  const options = [
    { pref: 1, emoji: '🏔️', label: 'Off the Beaten Path', sub: 'Remote & untouched', hint: 'I love having places to myself' },
    { pref: 2, emoji: '🚶', label: 'Some Tourists is Fine', sub: 'Moderately visited', hint: 'A good balance of amenities & quiet' },
    { pref: 3, emoji: '🎉', label: 'Popular is Great', sub: 'Buzzing & lively', hint: 'More infrastructure & things to do' },
  ]
  return (
    <div className={styles.budgetGrid}>
      {options.map(o => (
        <button
          key={o.pref}
          id={`crowd-${o.pref}`}
          className={`${styles.budgetCard} ${value === o.pref ? styles.selected : ''}`}
          onClick={() => onChange(o.pref)}
          type="button"
        >
          <span className={styles.budgetEmoji}>{o.emoji}</span>
          <span className={styles.budgetLabel}>{o.label}</span>
          <span className={styles.budgetSub}>{o.sub}</span>
          <span className={styles.budgetHint}>{o.hint}</span>
        </button>
      ))}
    </div>
  )
}

function isStepValid(stepId, prefs) {
  switch (stepId) {
    case 'month':     return prefs.travel_month !== null
    case 'duration':  return prefs.trip_duration_days > 0
    case 'interests': return prefs.interests.length > 0
    case 'departure': return prefs.departure_city !== ''
    case 'budget':    return prefs.budget_level !== null
    case 'group':     return prefs.group_type !== null
    case 'weather':   return prefs.weather_preference !== null
    case 'crowd':     return prefs.crowd_preference !== null
    default:          return true
  }
}

export default function QuestionnairePage({ onSubmit, onBack, isLoading, error }) {
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState(INITIAL)

  const currentStep = STEPS[step]
  const totalSteps = STEPS.length
  const valid = isStepValid(currentStep.id, prefs)
  const isLastStep = step === totalSteps - 1

  const update = (key, val) => setPrefs(p => ({ ...p, [key]: val }))

  const handleNext = () => {
    if (!valid) return
    if (isLastStep) {
      // Map city "Abroad (flying in)" to "oslo" for API
      const finalPrefs = {
        ...prefs,
        departure_city: prefs.departure_city === 'Abroad (flying in)' ? 'oslo' : prefs.departure_city.toLowerCase(),
      }
      onSubmit(finalPrefs)
    } else {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step === 0) { onBack() } else { setStep(s => s - 1) }
  }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>
        {/* Progress */}
        <div className={styles.progress}>
          <div className={styles.progressMeta}>
            <span className={styles.progressLabel}>Step {step + 1} of {totalSteps}</span>
            <span className={styles.progressPct}>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
          <div className={styles.stepDots} aria-hidden="true">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`${styles.stepDot} ${i < step ? styles.dotDone : ''} ${i === step ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className={`glass-card ${styles.card}`}>
          <h1 className={styles.stepTitle}>{currentStep.title}</h1>
          <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>

          <div className={styles.stepBody}>
            {currentStep.id === 'month'     && <StepMonth     value={prefs.travel_month}       onChange={v => update('travel_month', v)} />}
            {currentStep.id === 'duration'  && <StepDuration  value={prefs.trip_duration_days} numTravelers={prefs.num_travelers} onChange={v => update('trip_duration_days', v)} onTravelersChange={v => update('num_travelers', v)} />}
            {currentStep.id === 'interests' && <StepInterests value={prefs.interests}           onChange={v => update('interests', v)} />}
            {currentStep.id === 'departure' && <StepDeparture value={prefs.departure_city}      onChange={v => update('departure_city', v)} />}
            {currentStep.id === 'budget'    && <StepBudget    value={prefs.budget_level}        onChange={v => update('budget_level', v)} />}
            {currentStep.id === 'group'     && <StepGroup     value={prefs.group_type}           onChange={v => update('group_type', v)} />}
            {currentStep.id === 'weather'   && <StepWeather   value={prefs.weather_preference}  onChange={v => update('weather_preference', v)} />}
            {currentStep.id === 'crowd'     && <StepCrowd     value={prefs.crowd_preference}    onChange={v => update('crowd_preference', v)} />}
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error} role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.navRow}>
            <button className="btn btn-secondary" onClick={handleBack} type="button" id="quiz-back-btn">
              ← Back
            </button>

            <button
              id="quiz-next-btn"
              className={`btn btn-primary ${styles.nextBtn}`}
              onClick={handleNext}
              disabled={!valid || isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  <span>Finding destinations…</span>
                </>
              ) : isLastStep ? (
                <>
                  <span>🔍 Find My Destinations</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
