# 🇳🇴 Fjord & Beyond — Norway Travel Recommender

> AI-powered travel recommendation system for Norway. Tell us when you're travelling, what excites you, and your budget — we'll find your perfect Norwegian destination.

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Frontend-React+Vite-61dafb?style=flat-square)
![Tech Stack](https://img.shields.io/badge/AI-Gemini-4285f4?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Weather-MET%20Norway-0077b6?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Transport-Entur-ff6b35?style=flat-square)

---

## ✨ Features

- **Smart Recommendation Engine** — Multi-factor scoring across season, activities, budget, weather, transport, and crowd preferences
- **AI Narration** — Google Gemini crafts personalised summaries for your top matches
- **Live Weather** — Real-time forecasts from MET Norway's official API (no key required)
- **Historical Climate** — Monthly climate normals per destination for seasonal planning
- **Transport Options** — Multi-modal routing (train/bus/ferry/flight) via Entur's Journey Planner
- **Interactive Map** — Leaflet map of Norway with colour-coded match markers
- **26 Destinations** — Curated dataset from Lofoten to Svalbard, covering all regions
- **Budget Awareness** — Cost estimates tailored to budget/mid-range/premium preferences

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python + FastAPI |
| AI | Google Gemini 1.5 Flash |
| Weather (live) | MET Norway Locationforecast 2.0 |
| Weather (historical) | MET Norway Frost API |
| Transport | Entur Journey Planner GraphQL v3 |
| Map | Leaflet.js (via CDN) |
| Styling | Vanilla CSS (CSS Modules + CSS Variables) |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+**  (tested with 3.13/3.14)
- **Node.js 18+** (for the React frontend)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/NorwayTravelGuide.git
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

- **Gemini API key** → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)
- **Frost client ID** → [frost.met.no/auth/requestCredentials.html](https://frost.met.no/auth/requestCredentials.html) (free)

> **Note:** Both keys are optional. The app will still work without them — it uses template narration and embedded climate data as fallbacks.

### 3. Start the backend

```bash
cd backend
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

## 📁 Project Structure

```
NorwayTravelGuide/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── .env                       # Your API keys (not committed)
│   ├── .env.example
│   ├── data/
│   │   └── destinations.json      # 26 Norwegian destinations with metadata
│   ├── routers/
│   │   └── recommend.py           # Scoring & ranking engine
│   └── services/
│       ├── gemini_service.py      # AI narration (Gemini 1.5 Flash)
│       ├── forecast_service.py    # MET Norway live weather
│       ├── frost_service.py       # MET Norway historical climate
│       └── entur_service.py       # Entur public transport
│
└── frontend/
    ├── index.html                 # Entry point with SEO meta tags
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                # SPA router
        ├── index.css              # Global design system
        ├── pages/
        │   ├── LandingPage.jsx    # Hero + features + how-it-works
        │   ├── QuestionnairePage.jsx  # 8-step preference wizard
        │   └── ResultsPage.jsx    # Ranked destinations + map
        └── components/
            ├── Navbar.jsx         # Fixed top navigation
            ├── DestinationCard.jsx    # Rich destination result card
            └── NorwayMap.jsx      # Leaflet interactive map
```

---

## 🧠 Recommendation Algorithm

The scoring engine weighs six factors to produce a 0–100 match score:

```
Score = 0.30 × Season Match
      + 0.28 × Activity Match  (Jaccard similarity)
      + 0.20 × Budget Fit
      + 0.10 × Weather Preference
      + 0.07 × Crowd Preference
      + 0.05 × Transport Accessibility
```

Destinations in their avoid months receive a hard cap of 35/100.

---

## 🗺️ Destinations

26 curated destinations across all Norwegian regions:

| Region | Destinations |
|---|---|
| Northern Norway | Lofoten, Tromsø, Alta, Vesterålen, Bodø, Finnmark |
| Western Norway | Flåm & Nærøyfjord, Geirangerfjord, Bergen, Ålesund, Hardangerfjord, Sognefjord, Nordfjord, Stavanger, Preikestolen, Molde, Haugesund |
| Eastern Norway | Oslo, Jotunheimen, Rondane, Lillehammer, Telemark |
| Central Norway | Trondheim, Røros |
| Southern Norway | Kristiansand |
| Arctic | Svalbard |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | System health + config status |
| `/destinations` | GET | All destinations (lightweight, for map) |
| `/destinations/{id}` | GET | Full destination details |
| `/recommend` | POST | Core recommendation engine |
| `/weather/{id}` | GET | Live weather for a destination |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌍 External APIs Used

| API | Purpose | Auth Required |
|---|---|---|
| [MET Norway Locationforecast 2.0](https://api.met.no/weatherapi/locationforecast/2.0/documentation) | Live weather forecasts | No (User-Agent header) |
| [MET Norway Frost API](https://frost.met.no) | Historical climate normals | Yes (free registration) |
| [Entur Journey Planner v3](https://developer.entur.org) | Public transport routing | No (ET-Client-Name header) |
| [Google Gemini API](https://aistudio.google.com) | AI narration generation | Yes (free tier available) |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with passion for Norway and the struggle of "where should I actually go?" 🏔️*
