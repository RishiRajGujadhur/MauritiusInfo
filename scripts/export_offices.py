"""Export the existing OSM office subset; does not create new place IDs."""
import csv
from pathlib import Path

source = Path("data/osm/places.csv")
target = Path("data/osm/offices.csv")
with source.open(encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    rows = [row for row in reader if row["category"] == "office"]
assert len({row["record_id"] for row in rows}) == len(rows)
with target.open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)
print(f"Exported {len(rows)} existing office records")
