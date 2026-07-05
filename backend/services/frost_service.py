"""
MET Norway Frost API service — historical climate normals.
Requires a free Frost API client ID from https://frost.met.no
Docs: https://frost.met.no/howto.html
"""
import os
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

FROST_BASE_URL = "https://frost.met.no/observations/v0.jsonld"
FROST_SOURCES_URL = "https://frost.met.no/sources/v0.jsonld"


def _get_client_id() -> Optional[str]:
    client_id = os.getenv("FROST_CLIENT_ID")
    if not client_id or client_id == "your_frost_client_id_here":
        return None
    return client_id


async def get_climate_normal(lat: float, lon: float, month: int) -> Optional[dict]:
    """
    Fetch historical climate normals for a location and month.
    Uses the embedded monthly climate data from the destinations JSON as primary source,
    and optionally enriches it from the Frost API if a client ID is available.

    Returns dict with avg_temp_c, precipitation_mm, or None on failure.
    """
    client_id = _get_client_id()
    if not client_id:
        # No Frost credentials — caller should use embedded weather data
        return None

    try:
        # Find the nearest weather station
        sources_params = {
            "geometry": f"nearest(POINT({lon} {lat}))",
            "elements": "mean(air_temperature P1M),sum(precipitation_amount P1M)",
            "validtime": "1991-01-01/2020-12-31",
        }
        auth = (client_id, "")

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(FROST_SOURCES_URL, params=sources_params, auth=auth)
            if resp.status_code != 200:
                logger.warning(f"Frost sources API returned {resp.status_code}")
                return None

            sources_data = resp.json()
            sources = sources_data.get("data", [])
            if not sources:
                return None

            source_id = sources[0]["id"]

            # Fetch observations for the specific month
            obs_params = {
                "sources": source_id,
                "elements": "mean(air_temperature P1M),sum(precipitation_amount P1M)",
                "referencetime": f"1991-{month:02d}-01/2020-{month:02d}-01",
                "timeresolutions": "P1M",
            }
            obs_resp = await client.get(FROST_BASE_URL, params=obs_params, auth=auth)
            if obs_resp.status_code != 200:
                return None

            obs_data = obs_resp.json()
            observations = obs_data.get("data", [])

            if not observations:
                return None

            # Average the observations
            temps = []
            precips = []
            for obs in observations:
                for elem in obs.get("observations", []):
                    if "air_temperature" in elem.get("elementId", ""):
                        temps.append(elem.get("value", 0))
                    elif "precipitation" in elem.get("elementId", ""):
                        precips.append(elem.get("value", 0))

            return {
                "avg_temp_c": round(sum(temps) / len(temps), 1) if temps else None,
                "precipitation_mm": round(sum(precips) / len(precips), 1) if precips else None,
                "source": "frost_api",
                "station_id": source_id,
            }

    except Exception as e:
        logger.warning(f"Frost API call failed for ({lat}, {lon}), month {month}: {e}")
        return None


def get_climate_from_destination(destination: dict, month: int) -> dict:
    """
    Extract climate data for a specific month from the embedded destination data.
    This is the primary data source (always available, no API key needed).
    Month is 1-indexed.
    """
    weather = destination.get("weather", {})
    idx = month - 1  # Convert to 0-indexed

    return {
        "avg_temp_c": weather.get("monthly_avg_temp_c", [None] * 12)[idx],
        "precipitation_mm": weather.get("monthly_precipitation_mm", [None] * 12)[idx],
        "sunshine_hours": weather.get("monthly_sunshine_hours", [None] * 12)[idx],
        "snow_days": weather.get("monthly_snow_days", [None] * 12)[idx],
        "source": "embedded_normals",
    }
