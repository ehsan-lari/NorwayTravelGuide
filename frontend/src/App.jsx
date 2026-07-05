import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ResultsPage from './pages/ResultsPage'
import Navbar from './components/Navbar'
import './App.css'

// In dev, Vite proxy rewrites /api → http://localhost:8000
// In prod, VITE_API_URL is set to the Render backend URL
const API_BASE = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [page, setPage] = useState('landing')     // 'landing' | 'quiz' | 'results'
  const [recommendations, setRecommendations] = useState(null)
  const [userPrefs, setUserPrefs] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const goToQuiz = () => {
    setError(null)
    setPage('quiz')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToLanding = () => {
    setPage('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitPreferences = async (preferences) => {
    setIsLoading(true)
    setError(null)
    setUserPrefs(preferences)

    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${res.status}`)
      }

      const data = await res.json()
      setRecommendations(data)
      setPage('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      {/* Ambient aurora background — always present */}
      <div className="aurora-bg" aria-hidden="true" />

      <Navbar
        currentPage={page}
        onGoHome={goToLanding}
        onGetStarted={goToQuiz}
      />

      <main>
        {page === 'landing' && (
          <LandingPage onGetStarted={goToQuiz} />
        )}
        {page === 'quiz' && (
          <QuestionnairePage
            onSubmit={handleSubmitPreferences}
            onBack={goToLanding}
            isLoading={isLoading}
            error={error}
          />
        )}
        {page === 'results' && recommendations && (
          <ResultsPage
            data={recommendations}
            preferences={userPrefs}
            onStartOver={goToLanding}
            onRestart={goToQuiz}
          />
        )}
      </main>
    </div>
  )
}
