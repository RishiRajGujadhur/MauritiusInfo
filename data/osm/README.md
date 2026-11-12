# Mauritius OpenStreetMap places

**Snapshot imported 2026-11-12:** 6,965 retained records, including 2,371 shops and 987 tourism objects. 103 records contain accessibility-related tags. For the broad wheelchair-access field: 27 mapped_yes, 49 mapped_no, 24 mapped_limited and 6,865 unknown. These are mapped statements, not verified visits. The extract's data timestamp is 2026-11-11T21:22:47Z.

This folder is a bulk map-derived research inventory, separate from the curated, review-backed tables in the parent folder. A mapped place is not a verified accessible destination. Shops, restaurants, accommodation, health/public services, leisure sites and offices are included when named. Unnamed objects, ordinary buildings, roads, bus-stop nodes, benches and waste bins are not counted to inflate the total.

## Shop subset

Additional derived views: [shop_access_register.csv](shop_access_register.csv) adds readable status/category fields to all 2,371 existing mapped shops; [shop_barrier_reports.csv](shop_barrier_reports.csv) selects the 24 mapped negative/limited reports. These are overlapping views, not additional places. Shop size stays unknown. Reproduce using scripts/build_shop_access_register.py.

[shops.csv](shops.csv) filters existing places to category=shop: **2,371 records**, preserving source IDs and statuses. Do not append this subset to places.csv or count it as extra places. [Separate branch research](../shops/README.md) tracks entrance and wheelchair-parking evidence with unresolved scope explicitly marked. Regenerate the subset using scripts/export_shops.py.

## Office subset

[offices.csv](offices.csv) filters the existing places table to category=office: **382 mapped records**, with identical record IDs and access statuses. Do not append it to places.csv or add it to the national count. [Separate office research](../offices/README.md) documents 12 researched branches with evidence-based accessibility levels. Regenerate the subset using scripts/export_offices.py.

## Files and Power BI

| File | Grain | Key |
| --- | --- | --- |
| places.csv | One retained named OSM place object after duplicate-candidate suppression | record_id |
| accessibility_tags.csv | One original accessibility-related tag on a retained object | observation_id |
| duplicate_candidates.csv | One suppressed nearby name/category match | suppressed_osm_type + suppressed_osm_id |
| import_manifest.json | Import date, source timestamp, checksum, counts and limitations | One import |

Import places.csv as UTF-8, comma-delimited CSV. IDs, names, status fields and URLs are Text; latitude/longitude are Decimal number; wheelchair_parking_bay_count is nullable Whole number; has_accessibility_tag, field_verified and review_checked are True/False. last_web_check is Date and source_object_timestamp is Date/Time/Timezone. In accessibility_tags.csv, keep tag_value and check_date_tag as Text because mapping values and date formats vary. Join places[record_id] (1) to accessibility_tags[record_id] (*) with single-direction filtering.

No joins to the curated sources.csv or observations table are required. Do not append both place tables and claim the sum is unique: the curated venues may also appear in OSM. No cross-source entity reconciliation has been completed. In Power BI, use the OSM table for broad map coverage and the curated table separately for researched evidence.

## Meaning of accessibility fields

- mapped_yes, mapped_no and mapped_limited are explicit community map tags, not an audit by this project. Unknown means missing or unrecognised tagging and never means no.
- wheelchair_access comes only from wheelchair. wheelchair_toilet comes only from toilets:wheelchair. Neither implies a step-free entrance, parking bay or any other feature.
- wheelchair_parking is derived only on a parking/parking_space object, from explicit capacity:disabled or parking_space=disabled. Its scope is that parking object; it is not assigned to a nearby restaurant/store. Numeric zero is preserved; a missing count stays empty.
- ramp comes only from ramp:wheelchair. No gradient or door width is invented.
- step_free_entrance, lift, seating and parking-to-entrance routes remain unknown in this import. Entrance, surface, kerb and other supporting tags can be inspected in accessibility_tags_json; no route analysis is performed.
- has_accessibility_tag includes wheelchair-related keys and capacity:disabled, including description/check-date/unknown values. It does not mean accessible or even that an assessment is conclusive. Filter wheelchair_access for the actual mapped status.
- review_checked and field_verified are false for all imported rows. No Google/Tripadvisor reviews were checked for these imported places.

Object timestamps record any edit to the object, not necessarily an accessibility visit. last_web_check is the extract-download date. check_date_tag is the mapper's raw date, if present; it is not independently verified.

## Geography, coordinates and categories

District/region are assigned by testing each representative coordinate against OSM administrative polygons. Districts map to the same practical outing regions used in the main guide. Rodrigues, Agalega and Saint Brandon remain separate when present. Unresolved areas are explicitly Unknown rather than guessed. These are map boundaries, not a legal boundary determination. The import manifest records assembled boundary names and geometry errors.

For nodes, coordinates are the mapped point. For ways and multipolygon relations, coordinates are the geometry bounding-box centre, which may be outside an irregular shape. They are not entrances, accessible drop-offs or navigable routes. Boundary allocation near district borders can therefore be imperfect. Locality is an address tag if present; no town is inferred by nearest-neighbour guess.

category records the primary OSM key; location_type records its value. Priority is shop, eligible amenity, healthcare, eligible tourism, eligible leisure, beach, office. Individual branches retain separate IDs. Parent mall/tenant membership is not inferred from proximity. Access restrictions are preserved in access_restriction; a mapped venue may be private, customers-only, closed, renamed or outdated.

## Duplicate handling and limitations

Only one record per OSM type/id is selected. Nearby records with the same normalised name, category and subtype within 100 metres are treated as duplicate candidates. The object with more tags is retained; ties use type and ID. Every suppressed candidate is recorded in duplicate_candidates.csv, including its original source URL and any accessibility tags, so conflicting tags are not silently discarded or merged into the retained record. This rule can suppress two real neighbouring branches or fail to identify differently named duplicates. Counts are retained map records, not a guarantee of unique physical businesses. Chain branches farther apart are retained.

The importer selects named, eligible POIs from nodes, ways and multipolygon areas. It is not a complete national business register. Extract omissions, incomplete geometries and sparse wheelchair tagging remain data gaps. The imported table is intentionally separate from the curated table to preserve provenance and licensing boundaries.

## Source, attribution and licence

© OpenStreetMap contributors. Extract distributed by [Geofabrik](https://download.geofabrik.de/africa/mauritius.html). The data files in this folder are derived from OpenStreetMap and are made available under the [Open Database Licence 1.0](https://opendatacommons.org/licenses/odbl/1-0/). See [OSM copyright and licensing](https://www.openstreetmap.org/copyright). Preserve attribution and the licence when redistributing or publishing a derived database/report. This notice covers this OSM dataset; it does not relicense third-party review text elsewhere in the repository.

Tag references: [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair), [toilets:wheelchair](https://wiki.openstreetmap.org/wiki/Key:toilets:wheelchair), [capacity:disabled](https://wiki.openstreetmap.org/wiki/Key:capacity:disabled).

## Reproduce

The repository script scripts/import_osm.py takes a downloaded .osm.pbf and generates these CSV files and the manifest. Install osmium==4.3.2 in a virtual environment, then run:

```sh
python scripts/import_osm.py mauritius.osm.pbf data/osm --checked-date YYYY-MM-DD
```

Use the actual download date. The manifest stores the PBF SHA-256 and its replication timestamp. The dated Geofabrik URL can be recovered from the latest URL's redirect. Existing OSM IDs are stable while an object survives; editing or rebuilding a map object can introduce a new ID. Suppression choices may change when tags change. Run `python scripts/validate_osm.py data/osm` to validate row counts, keys, links, coordinates and explicit tag-to-status mappings. No background refresh is configured.
