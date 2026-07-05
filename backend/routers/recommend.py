"""
Core recommendation engine.
Scores Norwegian destinations based on user preferences and returns ranked results.
"""
import math
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

INTEREST_ALIASES = {
    "northern_lights": ["northern_lights", "aurora"],
    "fjords": ["fjord_cruise", "fjord"],
    "hiking": ["hiking", "mountaineering", "trekking"],
    "skiing": ["skiing", "cross_country_skiing"],
    "city": ["city_culture", "food", "museums", "nightlife", "shopping", "architecture"],
    "food": ["food", "city_culture"],
    "wildlife": ["wildlife", "whale_watching", "reindeer_safari", "dog_sledding", "polar_bear_safari"],
    "midnight_sun": ["midnight_sun"],
    "beach": ["swimming", "beaches", "surfing"],
    "culture": ["city_culture", "museums", "history", "sami_culture"],
    "adventure": ["hiking", "kayaking", "glacier_walks", "mountaineering", "snowmobiling"],
    "photography": ["photography"],
    "family": ["family_activities"],
    "romantic": ["fjord_cruise", "kayaking", "scenic_drive", "photography"],
}


def _season_score(destination: dict, month: int) -> Tuple[float, str, str]:
    """
    Score how well a month matches the destination's season.
    Returns (score 0-1, match_label, note).
    """
    best = destination.get("best_months", [])
    ok = destination.get("ok_months", [])
    avoid = destination.get("avoid_months", [])

    if month in best:
        return 1.0, "perfect", _season_note(destination, month, "perfect")
    elif month in ok:
        return 0.6, "good", _season_note(destination, month, "good")
    elif month in avoid:
        return 0.1, "challenging", _season_note(destination, month, "challenging")
    else:
        return 0.4, "ok", _season_note(destination, month, "ok")


def _season_note(destination: dict, month: int, match: str) -> str:
    """Generate a human-readable season note."""
    month_name = MONTH_NAMES[month - 1]
    name = destination["name"]
    best = destination.get("best_months", [])
    highlights = destination.get("highlights", [])

    if match == "perfect":
        # Find relevant highlight for this month
        if month in [6, 7] and any("midnight" in h.lower() for h in highlights):
            return f"{month_name} is midnight sun season — you'll have daylight all night!"
        if month in [11, 12, 1, 2, 3] and any("northern" in h.lower() for h in highlights):
            return f"{month_name} is prime northern lights season at {name}."
        if month in [5, 6] and any("blossom" in h.lower() or "orchard" in h.lower() for h in highlights):
            return f"{month_name} brings stunning apple blossoms to the region."
        return f"{month_name} is one of the best months to visit {name}."
    elif match == "good":
        best_names = [MONTH_NAMES[m - 1] for m in best[:2]]
        return f"Good time to visit. Peak season is {' and '.join(best_names)}."
    elif match == "challenging":
        best_names = [MONTH_NAMES[m - 1] for m in best[:2]]
        return f"This is off-season for {name}. Consider visiting in {' or '.join(best_names)} instead."
    else:
        return f"Decent time to visit, though not peak season."


def _expand_interests(user_interests: List[str]) -> set:
    """Expand user interest tags into destination activity tags."""
    expanded = set()
    for interest in user_interests:
        expanded.add(interest)
        # Add aliases
        if interest in INTEREST_ALIASES:
            expanded.update(INTEREST_ALIASES[interest])
        # Also check if user interest is in any alias list
        for key, aliases in INTEREST_ALIASES.items():
            if interest in aliases:
                expanded.add(key)
                expanded.update(aliases)
    return expanded


def _activity_score(destination: dict, user_interests: List[str]) -> float:
    """Score activity match between user interests and destination activities. Returns 0-1."""
    if not user_interests:
        return 0.5

    dest_activities = set(destination.get("activities", []))
    expanded_interests = _expand_interests(user_interests)

    # Direct overlap
    overlap = dest_activities & expanded_interests
    if not overlap:
        return 0.0

    # Jaccard-like score, weighted toward high overlap
    score = len(overlap) / max(len(user_interests), 1)
    return min(score, 1.0)


def _budget_score(destination: dict, budget_level: int) -> float:
    """Score budget compatibility. Returns 0-1."""
    dest_budget = destination.get("budget_level", 2)

    if dest_budget <= budget_level:
        return 1.0  # Destination is within budget
    elif dest_budget == budget_level + 1:
        return 0.5  # Slightly over budget
    else:
        return 0.1  # Significantly over budget


def _weather_preference_score(destination: dict, month: int, weather_pref: int) -> float:
    """
    Score how well the climate matches user's weather preference.
    weather_pref: 1=loves cold, 2=mild, 3=warm. Returns 0-1.
    """
    weather = destination.get("weather", {})
    temps = weather.get("monthly_avg_temp_c", [])
    if not temps or month < 1 or month > 12:
        return 0.5

    avg_temp = temps[month - 1]
    if avg_temp is None:
        return 0.5

    if weather_pref == 1:  # Loves cold / snow
        if avg_temp <= 0:
            return 1.0
        elif avg_temp <= 5:
            return 0.7
        elif avg_temp <= 10:
            return 0.4
        else:
            return 0.2
    elif weather_pref == 2:  # Mild
        # Optimal around 10-16°C
        diff = abs(avg_temp - 13)
        return max(0.0, 1.0 - diff / 15)
    else:  # Loves warmth
        if avg_temp >= 15:
            return 1.0
        elif avg_temp >= 10:
            return 0.7
        elif avg_temp >= 5:
            return 0.4
        else:
            return 0.1


def _crowd_score(destination: dict, crowd_pref: int) -> float:
    """Score crowd level match. Returns 0-1."""
    dest_crowd = destination.get("crowd_level", 2)
    diff = abs(dest_crowd - crowd_pref)
    if diff == 0:
        return 1.0
    elif diff == 1:
        return 0.6
    else:
        return 0.2


def _transport_score(destination: dict, transport_pref: str, departure_city: str) -> float:
    """Score transport accessibility. Returns 0-1."""
    transport = destination.get("transport", {})
    has_flight = transport.get("has_airport", False)
    has_train = transport.get("train_accessible", False)
    has_ferry = transport.get("ferry_accessible", False)
    drive_hours = transport.get("drive_from_oslo_hours")

    if transport_pref == "no_car":
        # User wants public transport only
        if has_flight or has_train:
            return 1.0
        elif has_ferry:
            return 0.7
        else:
            return 0.2  # Hard to reach without car
    elif transport_pref == "car":
        if drive_hours is not None and drive_hours <= 8:
            return 1.0
        elif drive_hours is not None and drive_hours <= 15:
            return 0.7
        else:
            return 0.4
    else:  # flexible
        options = sum([has_flight, has_train, has_ferry, drive_hours is not None])
        return min(options / 3, 1.0)


def get_best_for(destination: dict, user_interests: List[str]) -> List[str]:
    """Generate 'best for' tags based on destination and user match."""
    tags = []
    activities = destination.get("activities", [])
    dest_tags = destination.get("tags", [])

    if "northern_lights" in activities:
        tags.append("Northern Lights")
    if "midnight_sun" in activities:
        tags.append("Midnight Sun")
    if any(a in activities for a in ["hiking", "mountaineering"]):
        tags.append("Hiking")
    if any(a in activities for a in ["fjord_cruise", "kayaking"]):
        tags.append("Fjord Experiences")
    if any(a in activities for a in ["skiing", "dog_sledding"]):
        tags.append("Winter Sports")
    if any(a in activities for a in ["city_culture", "museums", "food"]):
        tags.append("City Culture")
    if "wildlife" in activities or "whale_watching" in activities:
        tags.append("Wildlife")
    if "romantic" in dest_tags or "honeymoon" in dest_tags:
        tags.append("Romantic Getaway")
    if "family" in dest_tags or "family_activities" in activities:
        tags.append("Family Travel")
    if destination.get("budget_level", 2) == 1:
        tags.append("Budget Friendly")

    return tags[:4]


def score_destination(destination: dict, preferences: dict) -> Tuple[float, dict]:
    """
    Score a destination against user preferences.
    Returns (total_score, score_breakdown) where score is 0-100.
    """
    month = preferences.get("travel_month", 7)
    budget_level = preferences.get("budget_level", 2)
    interests = preferences.get("interests", [])
    weather_pref = preferences.get("weather_preference", 2)
    crowd_pref = preferences.get("crowd_preference", 2)
    transport_pref = preferences.get("transport_preference", "flexible")
    departure_city = preferences.get("departure_city", "oslo")

    # Calculate individual scores
    season_s, season_match, season_note = _season_score(destination, month)
    activity_s = _activity_score(destination, interests)
    budget_s = _budget_score(destination, budget_level)
    weather_s = _weather_preference_score(destination, month, weather_pref)
    crowd_s = _crowd_score(destination, crowd_pref)
    transport_s = _transport_score(destination, transport_pref, departure_city)

    # Weighted sum (weights sum to 1.0)
    weights = {
        "season": 0.30,
        "activity": 0.28,
        "budget": 0.20,
        "weather": 0.10,
        "crowd": 0.07,
        "transport": 0.05,
    }

    total = (
        season_s * weights["season"] +
        activity_s * weights["activity"] +
        budget_s * weights["budget"] +
        weather_s * weights["weather"] +
        crowd_s * weights["crowd"] +
        transport_s * weights["transport"]
    )

    # Penalty: avoid months get a hard cap
    if month in destination.get("avoid_months", []):
        total = min(total, 0.35)

    breakdown = {
        "season_score": round(season_s * 100),
        "activity_score": round(activity_s * 100),
        "budget_score": round(budget_s * 100),
        "weather_score": round(weather_s * 100),
        "crowd_score": round(crowd_s * 100),
        "transport_score": round(transport_s * 100),
        "season_match": season_match,
        "season_note": season_note,
    }

    return round(total * 100, 1), breakdown


def rank_destinations(destinations: List[dict], preferences: dict) -> List[dict]:
    """
    Score and rank all destinations, returning them sorted by score descending.
    Each destination dict is enriched with scoring metadata.
    """
    scored = []
    for dest in destinations:
        score, breakdown = score_destination(dest, preferences)
        enriched = dict(dest)
        enriched["_score"] = score
        enriched["_breakdown"] = breakdown
        scored.append(enriched)

    # Sort by score descending
    scored.sort(key=lambda d: d["_score"], reverse=True)
    return scored


def get_user_summary(preferences: dict) -> str:
    """Generate a human-readable summary of the user's search."""
    month = preferences.get("travel_month", 7)
    month_name = MONTH_NAMES[month - 1]
    duration = preferences.get("trip_duration_days", 4)
    group = preferences.get("group_type", "travelers")
    interests = preferences.get("interests", [])
    departure = preferences.get("departure_city", "Oslo").title()

    interest_str = ""
    if interests:
        readable = [i.replace("_", " ") for i in interests[:3]]
        interest_str = f" interested in {', '.join(readable)}"

    return (
        f"{duration}-day trip in {month_name} for {group}{interest_str}, "
        f"departing from {departure}."
    )
