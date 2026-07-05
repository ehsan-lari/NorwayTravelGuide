"""
Entur Journey Planner service — multi-modal public transport routing in Norway.
GraphQL API v3 — no authentication required for open services.
Docs: https://developer.entur.org/pages-journeyplanner-journeyplanner
"""
import logging
from typing import List, Optional
import httpx

logger = logging.getLogger(__name__)

ENTUR_GRAPHQL_URL = "https://api.entur.io/journey-planner/v3/graphql"
ET_CLIENT_NAME = "norway-travel-guide-ehsan"

# Major departure cities with their Entur stop IDs
DEPARTURE_CITIES = {
    "oslo": "NSR:StopPlace:59872",
    "bergen": "NSR:StopPlace:548",
    "trondheim": "NSR:StopPlace:41630",
    "stavanger": "NSR:StopPlace:41682",
    "tromsø": "NSR:StopPlace:61062",
    "tromso": "NSR:StopPlace:61062",
    "kristiansand": "NSR:StopPlace:10369",
    "bodø": "NSR:StopPlace:15676",
    "bodo": "NSR:StopPlace:15676",
    "ålesund": "NSR:StopPlace:40430",
    "alesund": "NSR:StopPlace:40430",
}

TRIP_QUERY = """
query TripQuery($from: Location!, $to: Location!, $numTripPatterns: Int) {
  trip(
    from: $from
    to: $to
    numTripPatterns: $numTripPatterns
    transportModes: [
      {transportMode: bus},
      {transportMode: rail},
      {transportMode: water},
      {transportMode: coach}
    ]
  ) {
    tripPatterns {
      duration
      legs {
        mode
        distance
        fromPlace { name }
        toPlace { name }
        line { id name operator { name } }
      }
    }
  }
}
"""


def _format_duration(seconds: int) -> str:
    """Convert seconds to a human-readable duration string."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    if hours > 0:
        return f"{hours}h {minutes}min" if minutes > 0 else f"{hours}h"
    return f"{minutes}min"


def _describe_legs(legs: list) -> str:
    """Create a readable description of transport legs."""
    parts = []
    for leg in legs:
        mode = leg.get("mode", "").lower()
        from_place = leg.get("fromPlace", {}).get("name", "")
        to_place = leg.get("toPlace", {}).get("name", "")
        line = leg.get("line", {})
        operator = line.get("operator", {}).get("name", "") if line else ""

        if mode == "foot":
            continue  # Skip walking legs
        elif mode == "rail":
            parts.append(f"🚂 Train ({operator or 'NSB/Vy'}) {from_place} → {to_place}")
        elif mode == "bus" or mode == "coach":
            parts.append(f"🚌 Bus {from_place} → {to_place}")
        elif mode == "water":
            parts.append(f"⛴️ Ferry {from_place} → {to_place}")
        elif mode == "air":
            parts.append(f"✈️ Flight {from_place} → {to_place}")
        else:
            parts.append(f"{mode.title()} {from_place} → {to_place}")

    return " + ".join(parts) if parts else "Direct connection"


async def get_transport_options(
    departure_city: str,
    destination: dict,
) -> List[dict]:
    """
    Query Entur for transport options from departure city to destination.
    Returns a list of transport option dicts.
    """
    dest_stop_id = destination.get("transport", {}).get("entur_stop_id")
    departure_city_lower = departure_city.lower().strip()

    # Build static transport info based on destination data
    transport_info = destination.get("transport", {})
    options = []

    # Add flight option if airport available
    if transport_info.get("has_airport") and transport_info.get("airport_codes"):
        airports = transport_info["airport_codes"]
        flight_time = transport_info.get("flight_from_oslo_hours")
        options.append({
            "mode": "flight",
            "duration_text": f"~{flight_time}h flight" if flight_time else "Flight available",
            "description": f"Fly into {destination['name']} via {', '.join(airports)} airport(s). SAS and Norwegian operate domestic routes.",
            "operator": "SAS / Norwegian Air",
            "estimated_cost_nok": 800,
        })

    # Add train option if accessible
    if transport_info.get("train_accessible"):
        options.append({
            "mode": "train",
            "duration_text": destination.get("travel_time_from_oslo", {}).get("train", "Train available"),
            "description": f"Direct or connecting train service. Check Vy (vy.no) for tickets and schedules.",
            "operator": "Vy",
            "estimated_cost_nok": 400,
        })

    # Add ferry option if accessible
    if transport_info.get("ferry_accessible"):
        options.append({
            "mode": "ferry",
            "duration_text": "Ferry connection available",
            "description": f"Ferry connections available. Check Fjord1, Norled, or Color Line depending on the route.",
            "operator": "Fjord1 / Norled",
            "estimated_cost_nok": 250,
        })

    # Add drive option
    drive_hours = transport_info.get("drive_from_oslo_hours")
    if drive_hours:
        options.append({
            "mode": "car",
            "duration_text": f"~{drive_hours}h drive from Oslo",
            "description": f"Scenic road trip through Norwegian countryside. Car rental available at major airports.",
            "operator": "Self-drive",
            "estimated_cost_nok": int(drive_hours * 150),  # rough fuel estimate
        })

    # Try to enrich with live Entur data if we have stop IDs
    if dest_stop_id and departure_city_lower in DEPARTURE_CITIES:
        from_id = DEPARTURE_CITIES[departure_city_lower]
        live_options = await _query_entur(from_id, dest_stop_id)
        if live_options:
            # Prepend live route info
            options.insert(0, live_options[0])

    return options if options else [
        {
            "mode": "info",
            "duration_text": "Check local transport",
            "description": "For this destination, check visitnorway.com or ruter.no for current transport options.",
            "operator": None,
            "estimated_cost_nok": None,
        }
    ]


async def _query_entur(from_stop_id: str, to_stop_id: str) -> Optional[List[dict]]:
    """Query the Entur GraphQL API for live journey options."""
    variables = {
        "from": {"place": from_stop_id},
        "to": {"place": to_stop_id},
        "numTripPatterns": 3,
    }
    headers = {
        "Content-Type": "application/json",
        "ET-Client-Name": ET_CLIENT_NAME,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                ENTUR_GRAPHQL_URL,
                json={"query": TRIP_QUERY, "variables": variables},
                headers=headers,
            )
            if resp.status_code != 200:
                return None
            data = resp.json()

        patterns = data.get("data", {}).get("trip", {}).get("tripPatterns", [])
        if not patterns:
            return None

        results = []
        for pattern in patterns[:2]:
            duration_sec = pattern.get("duration", 0)
            legs = pattern.get("legs", [])
            description = _describe_legs(legs)
            results.append({
                "mode": "public_transport",
                "duration_text": _format_duration(duration_sec),
                "description": description or "Multi-modal journey via Entur",
                "operator": "Entur (live data)",
                "estimated_cost_nok": None,
            })
        return results

    except Exception as e:
        logger.warning(f"Entur API call failed: {e}")
        return None
