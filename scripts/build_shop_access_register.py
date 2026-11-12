"""Build status-friendly views of existing OSM shops, without adding place IDs."""
import csv
from pathlib import Path
status = {"mapped_no": "reported_not_accessible", "mapped_limited": "reported_limited", "mapped_yes": "mapped_accessible", "unknown": "unknown"}
groups = {
    "grocery": {"supermarket", "convenience", "grocery", "wholesale"},
    "hardware_diy": {"hardware", "doityourself", "building_materials", "paint", "tiles", "garden_centre"},
    "furniture_home": {"furniture", "houseware", "bed", "kitchen", "interior_decoration", "department_store"},
    "electronics_appliances": {"electronics", "electrical", "computer", "mobile_phone", "appliance"},
    "fashion": {"clothes", "shoes", "boutique", "fashion", "fashion_accessories"}
}
with Path("data/osm/places.csv").open(encoding="utf-8", newline="") as f:
    rows = [r for r in csv.DictReader(f) if r["category"] == "shop"]
for r in rows:
    r.update(accessibility_status=status[r["wheelchair_access"]],
             status_evidence="community_map_tag" if r["wheelchair_access"] != "unknown" else "no_usable_map_tag",
             shop_size="unknown",
             retail_category_group=next((g for g, types in groups.items() if r["location_type"] in types), "other"))
assert len({r["record_id"] for r in rows}) == len(rows)
for name, selected in [("shop_access_register.csv", rows), ("shop_barrier_reports.csv", [r for r in rows if r["wheelchair_access"] in ("mapped_no", "mapped_limited")])]:
    with (Path("data/osm") / name).open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(selected)
print(f"Registered {len(rows)} existing shop objects")
