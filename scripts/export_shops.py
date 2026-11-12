"""Filter existing OSM shop objects without creating new place IDs."""
import csv
from pathlib import Path
with Path("data/osm/places.csv").open(encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    rows = [row for row in reader if row["category"] == "shop"]
assert len({row["record_id"] for row in rows}) == len(rows)
with Path("data/osm/shops.csv").open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)
print(f"Exported {len(rows)} existing shop records")
