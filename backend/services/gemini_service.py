"""
Gemini AI service for personalized destination narration.
"""
import os
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed. AI narration will be disabled.")

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]


def _init_gemini() -> Optional[object]:
    """Initialize the Gemini model if API key is available."""
    if not GEMINI_AVAILABLE:
        return None
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not set. Using template narration.")
        return None
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


def _build_narration_prompt(destination: dict, preferences: dict, month_name: str) -> str:
    interests = ", ".join(preferences.get("interests", []))
    budget_labels = {1: "budget", 2: "mid-range", 3: "premium"}
    budget = budget_labels.get(preferences.get("budget_level", 2), "mid-range")
    group = preferences.get("group_type", "travelers")
    duration = preferences.get("trip_duration_days", 4)

    return f"""You are a knowledgeable Norwegian travel expert writing a personalized travel recommendation.

Write a 2-3 sentence enthusiastic, warm, and specific recommendation for "{destination['name']}" tailored to this traveler:
- Travel month: {month_name}
- Interests: {interests}
- Budget: {budget}
- Group type: {group} ({preferences.get('num_travelers', 1)} people)
- Trip duration: {duration} days

Destination highlights: {', '.join(destination.get('highlights', [])[:3])}
Activities available: {', '.join(destination.get('activities', [])[:5])}

Rules:
- Be specific about WHY this destination matches their preferences
- Mention 1-2 concrete activities or sights
- Reference the travel month if relevant (e.g. northern lights, midnight sun, apple blossoms)
- Keep it to 2-3 sentences maximum
- Write in second person ("you", "your")
- Do not start with "I" or repeat the destination name in the first word"""


def _template_narration(destination: dict, preferences: dict, month_name: str) -> str:
    """Fallback template narration when Gemini is unavailable."""
    interests = preferences.get("interests", [])
    name = destination["name"]
    highlights = destination.get("highlights", [])
    activities = destination.get("activities", [])

    # Find matching activities
    matching = [a.replace("_", " ") for a in activities if a in interests]
    highlight = highlights[0] if highlights else f"the stunning landscape"

    if matching:
        activity_str = f"{matching[0]} and {matching[1]}" if len(matching) > 1 else matching[0]
        return (
            f"In {month_name}, {name} is a perfect match for your love of {activity_str}. "
            f"Don't miss {highlight} — it's one of the most memorable experiences in all of Norway. "
            f"With your planned trip duration, you'll have just enough time to soak up the best of what this destination has to offer."
        )
    else:
        return (
            f"{name} in {month_name} offers an unforgettable Norwegian experience. "
            f"{highlight} is just the beginning — the entire region is full of hidden gems waiting to be discovered. "
            f"This destination will reward your sense of adventure and leave you planning your return trip."
        )


async def generate_narration(
    destination: dict,
    preferences: dict,
    travel_month: int
) -> str:
    """
    Generate a personalized AI narration for a destination.
    Falls back to template if Gemini is unavailable.
    """
    month_name = MONTH_NAMES[travel_month - 1]
    model = _init_gemini()

    if model is None:
        return _template_narration(destination, preferences, month_name)

    try:
        prompt = _build_narration_prompt(destination, preferences, month_name)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini narration failed for {destination.get('name')}: {e}")
        return _template_narration(destination, preferences, month_name)


async def generate_batch_narrations(
    destinations: List[dict],
    preferences: dict,
    travel_month: int
) -> List[str]:
    """Generate narrations for multiple destinations (top results)."""
    narrations = []
    for dest in destinations[:5]:  # Only narrate top 5 to save API calls
        narration = await generate_narration(dest, preferences, travel_month)
        narrations.append(narration)
    return narrations
