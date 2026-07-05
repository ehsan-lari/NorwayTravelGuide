"""
MET Norway Locationforecast service — live 9-day weather forecasts.
No API key required; just a descriptive User-Agent header.
Docs: https://api.met.no/weatherapi/locationforecast/2.0/documentation
"""
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

BASE_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact"
USER_AGENT = "NorwayTravelGuide/1.0 contact@example.com"

SYMBOL_DESCRIPTIONS = {
    "clearsky": "Clear sky",
    "fair": "Fair",
    "partlycloudy": "Partly cloudy",
    "cloudy": "Cloudy",
    "fog": "Foggy",
    "lightrain": "Light rain",
    "rain": "Rain",
    "heavyrain": "Heavy rain",
    "lightsnow": "Light snow",
    "snow": "Snow",
    "heavysnow": "Heavy snow",
    "sleet": "Sleet",
    "lightrainshowers": "Light rain showers",
    "rainshowers": "Rain showers",
    "snowshowers": "Snow showers",
    "thunderstorm": "Thunderstorm",
}


def _symbol_description(symbol_code: str) -> str:
    """Convert MET symbol code to human-readable description."""
    # Symbol codes can have day/night suffix: "clearsky_day" → "clearsky"
    base = symbol_code.split("_")[0] if "_" in symbol_code else symbol_code
    return SYMBOL_DESCRIPTIONS.get(base, symbol_code.replace("_", " ").title())


async def get_current_weather(lat: float, lon: float) -> Optional[dict]:
    """
    Fetch the current (nearest) weather for a lat/lon point.
    Returns a dict with temp_c, precipitation_mm, symbol, description, wind_speed_ms.
    Returns None if the request fails.
    """
    params = {"lat": round(lat, 4), "lon": round(lon, 4)}
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(BASE_URL, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        timeseries = data.get("properties", {}).get("timeseries", [])
        if not timeseries:
            return None

        # Take the first (most current) forecast entry
        entry = timeseries[0]
        instant = entry.get("data", {}).get("instant", {}).get("details", {})
        next_1h = entry.get("data", {}).get("next_1_hours", {})
        next_6h = entry.get("data", {}).get("next_6_hours", {})

        symbol = None
        precipitation = 0.0

        if next_1h:
            symbol = next_1h.get("summary", {}).get("symbol_code")
            precipitation = next_1h.get("details", {}).get("precipitation_amount", 0.0)
        elif next_6h:
            symbol = next_6h.get("summary", {}).get("symbol_code")
            precipitation = next_6h.get("details", {}).get("precipitation_amount", 0.0)

        return {
            "temp_c": instant.get("air_temperature"),
            "precipitation_mm": precipitation,
            "wind_speed_ms": instant.get("wind_speed"),
            "symbol": symbol,
            "description": _symbol_description(symbol) if symbol else "Unknown",
        }

    except Exception as e:
        logger.warning(f"Weather forecast failed for ({lat}, {lon}): {e}")
        return None


async def get_weather_for_destinations(destinations: list) -> dict:
    """
    Fetch current weather for a list of destination dicts concurrently.
    Returns a dict mapping destination id → weather data.
    """
    import asyncio

    async def fetch_one(dest):
        weather = await get_current_weather(dest["lat"], dest["lon"])
        return dest["id"], weather

    tasks = [fetch_one(d) for d in destinations]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    weather_map = {}
    for r in results:
        if isinstance(r, Exception):
            logger.warning(f"Weather fetch error: {r}")
        else:
            dest_id, weather = r
            weather_map[dest_id] = weather

    return weather_map
