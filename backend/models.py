"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import IntEnum


class BudgetLevel(IntEnum):
    BUDGET = 1       # < 1500 NOK/day
    MID = 2          # 1500–3000 NOK/day
    PREMIUM = 3      # > 3000 NOK/day


class CrowdPreference(IntEnum):
    REMOTE = 1       # Off the beaten path
    MODERATE = 2     # Some tourists OK
    POPULAR = 3      # Popular/lively is fine


class WeatherPreference(IntEnum):
    COLD = 1         # Loves cold & snow
    MILD = 2         # Prefers mild temperatures
    WARM = 3         # Prefers warmer weather


class UserPreferences(BaseModel):
    travel_month: int = Field(..., ge=1, le=12, description="Month of travel (1-12)")
    trip_duration_days: int = Field(..., ge=1, le=30, description="Number of days")
    departure_city: str = Field(..., description="Departure city (e.g. Oslo, Bergen)")
    budget_level: BudgetLevel = Field(..., description="Budget level 1-3")
    interests: List[str] = Field(..., min_length=1, description="List of activity interests")
    group_type: str = Field(..., description="solo | couple | family | group")
    weather_preference: WeatherPreference = Field(..., description="1=cold, 2=mild, 3=warm")
    crowd_preference: CrowdPreference = Field(..., description="1=remote, 2=moderate, 3=popular")
    transport_preference: str = Field(default="flexible", description="no_car | car | flexible")
    num_travelers: int = Field(default=1, ge=1, le=20)


class WeatherData(BaseModel):
    temp_c: Optional[float] = None
    precipitation_mm: Optional[float] = None
    symbol: Optional[str] = None
    description: Optional[str] = None
    wind_speed_ms: Optional[float] = None


class TransportOption(BaseModel):
    mode: str
    duration_text: str
    description: str
    operator: Optional[str] = None
    estimated_cost_nok: Optional[int] = None


class DestinationRecommendation(BaseModel):
    id: str
    name: str
    region: str
    lat: float
    lon: float
    score: float
    match_percentage: int
    short_description: str
    ai_narration: Optional[str] = None
    highlights: List[str]
    activities: List[str]
    best_for: List[str]
    season_match: str          # "perfect" | "good" | "ok" | "challenging"
    season_note: str
    budget_level: int
    estimated_daily_cost_nok: int
    current_weather: Optional[WeatherData] = None
    transport_options: List[TransportOption] = []
    crowd_level: int
    image_key: Optional[str] = None
    tags: List[str]


class RecommendationResponse(BaseModel):
    recommendations: List[DestinationRecommendation]
    travel_month_name: str
    total_destinations_evaluated: int
    user_summary: str
