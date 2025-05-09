import requests
from api.models import Exercise

API_URL = "https://exercisedb.p.rapidapi.com/exercises"
HEADERS = {
    "x-rapidapi-key": "3ad4a2f8admsh440268a18f36360p163235jsne9d005b72609",
    "x-rapidapi-host": "exercisedb.p.rapidapi.com"
}
LIMIT = 10  # Fetch in batches of 10

def fetch_and_save_exercises():
    offset = 0
    while True:
        resp = requests.get(
            f"{API_URL}?limit={LIMIT}&offset={offset}",
            headers=HEADERS
        )

        if resp.status_code != 200:
            print(f"Error fetching exercises: {resp.status_code}")
            break

        exercises = resp.json()
        if not exercises:
            break

        for ex in exercises:
            # Only name is used to lookup; all other fields go into defaults
            Exercise.objects.get_or_create(
                name=ex["name"],
                defaults={
                    "target":     ex.get("target", ""),
                    "difficulty": ex.get("difficulty", ""),
                    "equipment":  ex.get("equipment", ""),
                    "description": "",               # no instructions field in this API
                    "image_url":   ex.get("gifUrl", ""),
                    # recommended_* fields will use your model’s defaults
                }
            )

        print(f"Fetched and saved {len(exercises)} exercises (offset {offset})")
        offset += LIMIT

    print("All exercises fetched and saved.")
