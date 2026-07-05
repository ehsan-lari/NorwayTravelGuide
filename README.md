# 🇳🇴 Fjord & Beyond — Norway Travel Recommender

> AI-powered travel recommendation system for Norway. Tell us when you're traveling, what excites you, and your budget — we'll mathematically find your perfect Norwegian destination.

**Live Demo:** [https://norway-travel-guide.vercel.app](https://norway-travel-guide.vercel.app)

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Frontend-React+Vite-61dafb?style=flat-square)
![Tech Stack](https://img.shields.io/badge/AI-Gemini-4285f4?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Weather-MET%20Norway-0077b6?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Transport-Entur-ff6b35?style=flat-square)

---

## ✨ Features

- **Smart Recommendation Engine** — Multi-factor scoring across season, activities, budget, weather, transport, and crowd preferences.
- **AI Narration** — Google Gemini crafts personalized summaries explaining exactly *why* a destination matches your specific inputs.
- **Live Weather** — Real-time forecasts pulled dynamically from MET Norway's official API.
- **Historical Climate** — Monthly climate normals per destination to ensure you aren't recommended a hiking trip during peak blizzard season.
- **Transport Options** — Multi-modal routing (train/bus/ferry/flight) via Entur's Journey Planner API.
- **Interactive Map** — Interactive Leaflet map of Norway with color-coded match markers.
- **26 Destinations** — Curated dataset from Svalbard down to Kristiansand, covering all regions.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python 3.12 + FastAPI |
| AI | Google Gemini 1.5 Flash |
| Weather (live) | MET Norway Locationforecast 2.0 |
| Weather (historical) | MET Norway Frost API |
| Transport | Entur Journey Planner GraphQL v3 |
| Map | Leaflet.js |
| Styling | Vanilla CSS (CSS Modules + CSS Variables) |
| Deployment | Vercel (Frontend) & Render (Backend) |

---

## 🧠 Recommendation Algorithm

The backend calculates a 0–100 mathematical match score for all 26 destinations in real time:

```text
Score = 0.30 × Season Match
      + 0.28 × Activity Match  (Jaccard similarity index)
      + 0.20 × Budget Fit
      + 0.10 × Weather Preference
      + 0.07 × Crowd Preference
      + 0.05 × Transport Accessibility
```
*Note: Destinations in their `avoid_months` receive a hard penalty cap of 35/100.*

---

## 🚀 Running it Locally

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** 

### 1. Clone the repo

```bash
git clone https://github.com/ehsan-lari/NorwayTravelGuide.git
cd NorwayTravelGuide
```

### 2. Set up API keys

Copy the example env file and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FROST_CLIENT_ID=your_frost_client_id_here
```

- **Gemini API key** → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (Free)
- **Frost client ID** → [frost.met.no/auth/requestCredentials.html](https://frost.met.no/auth/requestCredentials.html) (Free)

### 3. Start the backend

```bash
cd backend
python -m venv .venv
# Activate venv: `source .venv/bin/activate` (Mac/Linux) or `.\.venv\Scripts\activate` (Windows)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | System health + external API configuration status |
| `/destinations` | GET | Lightweight destination payload for the map |
| `/destinations/{id}` | GET | Full destination metadata |
| `/recommend` | POST | Core recommendation engine execution |
| `/weather/{id}` | GET | Fetches live weather for a destination |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with a passion for Norway and the struggle of answering "where should I actually go?" 🏔️*
