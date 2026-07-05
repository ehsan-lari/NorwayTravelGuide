"""
FastAPI main application entry point.
Run with: uvicorn main:app --reload
"""
import json
import logging
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from models import UserPreferences, RecommendationResponse, DestinationRecommendation, WeatherData, TransportOption
from routers.recommend import rank_destinations, get_user_summary, get_best_for, MONTH_NAMES
from services.forecast_service import get_weather_for_destinations
from services.gemini_service import generate_batch_narrations
from services.entur_service import get_transport_options

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Load destinations database ──────────────────────────────────────────────
DATA_PATH = Path(__file__).parent / "data" / "destinations.json"

def load_destinations() -> List[dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["destinations"]

DESTINATIONS = load_destinations()
logger.info(f"Loaded {len(DESTINATIONS)} destinations.")

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Norway Travel Guide API",
    description="AI-powered travel recommendation engine for Norway",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",   # any Vercel preview/prod URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "destinations_loaded": len(DESTINATIONS),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here"),
        "frost_configured": bool(os.getenv("FROST_CLIENT_ID") and os.getenv("FROST_CLIENT_ID") != "your_frost_client_id_here"),
    }


# ── Get all destinations (for map / browse) ───────────────────────────────────
@app.get("/destinations")
async def list_destinations():
    """Return lightweight destination list for map display."""
    return [
        {
            "id": d["id"],
            "name": d["name"],
            "region": d["region"],
            "lat": d["lat"],
            "lon": d["lon"],
            "short_description": d["short_description"],
            "tags": d.get("tags", []),
            "image_key": d.get("image_key"),
        }
        for d in DESTINATIONS
    ]


# ── Single destination detail ─────────────────────────────────────────────────
@app.get("/destinations/{destination_id}")
async def get_destination(destination_id: str):
    dest = next((d for d in DESTINATIONS if d["id"] == destination_id), None)
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination '{destination_id}' not found")
    return dest


# ── Main recommendation endpoint ──────────────────────────────────────────────
@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(preferences: UserPreferences):
    """
    Core recommendation endpoint.
    Accepts user preferences and returns ranked Norwegian destinations.
    """
    prefs_dict = preferences.model_dump()
    logger.info(f"Recommendation request: month={preferences.travel_month}, budget={preferences.budget_level}")

    # 1. Score and rank all destinations
    ranked = rank_destinations(DESTINATIONS, prefs_dict)
    top_destinations = ranked[:10]  # Work with top 10

    # 2. Fetch live weather for top destinations (async, concurrent)
    weather_map = await get_weather_for_destinations(top_destinations)

    # 3. Generate AI narrations for top 5
    top_5 = top_destinations[:5]
    narrations = await generate_batch_narrations(top_5, prefs_dict, preferences.travel_month)
    narration_map = {dest["id"]: narration for dest, narration in zip(top_5, narrations)}

    # 4. Fetch transport options for top 5 (concurrent)
    import asyncio
    transport_tasks = [
        get_transport_options(preferences.departure_city, dest)
        for dest in top_5
    ]
    transport_results = await asyncio.gather(*transport_tasks, return_exceptions=True)
    transport_map = {}
    for dest, result in zip(top_5, transport_results):
        if isinstance(result, Exception):
            transport_map[dest["id"]] = []
        else:
            transport_map[dest["id"]] = result

    # 5. Build response objects
    recommendations = []
    for dest in top_destinations[:8]:  # Return top 8 to the frontend
        breakdown = dest.get("_breakdown", {})
        score = dest.get("_score", 0)
        dest_id = dest["id"]

        # Budget estimate for user's budget level
        budget_key = {1: "budget", 2: "mid", 3: "premium"}.get(preferences.budget_level, "mid")
        daily_cost = dest.get("daily_cost_nok", {}).get(budget_key, 2000)

        # Weather
        weather_raw = weather_map.get(dest_id)
        weather = WeatherData(**weather_raw) if weather_raw else None

        # Transport
        transport_raw = transport_map.get(dest_id, [])
        transport = [TransportOption(**t) for t in transport_raw[:3]]

        rec = DestinationRecommendation(
            id=dest_id,
            name=dest["name"],
            region=dest["region"],
            lat=dest["lat"],
            lon=dest["lon"],
            score=score,
            match_percentage=min(int(score), 99),
            short_description=dest["short_description"],
            ai_narration=narration_map.get(dest_id),
            highlights=dest.get("highlights", [])[:4],
            activities=dest.get("activities", [])[:6],
            best_for=get_best_for(dest, preferences.interests),
            season_match=breakdown.get("season_match", "ok"),
            season_note=breakdown.get("season_note", ""),
            budget_level=dest.get("budget_level", 2),
            estimated_daily_cost_nok=daily_cost,
            current_weather=weather,
            transport_options=transport,
            crowd_level=dest.get("crowd_level", 2),
            image_key=dest.get("image_key"),
            tags=dest.get("tags", []),
        )
        recommendations.append(rec)

    return RecommendationResponse(
        recommendations=recommendations,
        travel_month_name=MONTH_NAMES[preferences.travel_month - 1],
        total_destinations_evaluated=len(DESTINATIONS),
        user_summary=get_user_summary(prefs_dict),
    )


# ── Weather endpoint ──────────────────────────────────────────────────────────
@app.get("/weather/{destination_id}")
async def get_weather(destination_id: str):
    """Get current weather for a specific destination."""
    from services.forecast_service import get_current_weather
    dest = next((d for d in DESTINATIONS if d["id"] == destination_id), None)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    weather = await get_current_weather(dest["lat"], dest["lon"])
    if not weather:
        raise HTTPException(status_code=503, detail="Weather data temporarily unavailable")
    return weather
