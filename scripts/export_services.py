"""Export explicit repair and healthcare objects from the existing OSM inventory."""
import csv
from pathlib import Path
types = {"car_repair", "motorcycle_repair", "repair", "pharmacy", "chemist", "doctors", "doctor", "clinic", "hospital", "dentist", "medical_supply"}
groups = {"car_repair":"mechanic", "motorcycle_repair":"mechanic", "repair":"repair_other", "pharmacy":"pharmacy", "chemist":"pharmacy", "doctors":"doctor_practice", "doctor":"doctor_practice", "clinic":"clinic", "hospital":"hospital", "dentist":"dentist", "medical_supply":"medical_supply"}
with Path("data/osm/places.csv").open(encoding="utf-8", newline="") as f:
    rows = [r for r in csv.DictReader(f) if r["location_type"] in types or r["category"] == "healthcare"]
for r in rows:
    r["service_group"] = groups.get(r["location_type"], "healthcare_other")
assert len({r["record_id"] for r in rows}) == len(rows)
with Path("data/osm/services.csv").open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]))
    w.writeheader()
    w.writerows(rows)
print(f"Exported {len(rows)} existing mapped service objects")
