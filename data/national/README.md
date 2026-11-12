# National coverage and additional health facilities

Updated 12 November 2026. This is a location inventory for access research, not a complete list of Mauritius venues or a list of verified accessible premises.

## Downloads for Power BI

| File | Purpose |
| --- | --- |
| [health_facilities.csv](health_facilities.csv) | 169 additional source records: names, addresses, coordinates, source-listed districts, phone numbers and explicit unknown access fields |
| [coverage_by_district.csv](coverage_by_district.csv) | Existing OSM inventory counts for nine districts, Rodrigues and unresolved geography, alongside this source's district counts |
| [coverage_by_district_category.csv](coverage_by_district_category.csv) | Existing OSM counts by district and location category |
| [sources.json](sources.json) | Source URLs, retrieval date, page hashes, snapshot date and licensing provenance |

The 169 records span all nine districts of Mauritius island as grouped by the source. The existing [national OSM inventory](../osm/places.csv) contains 6,965 retained records and also covers Rodrigues. This health source contains no Rodrigues records. Other outer islands are not established as covered. Completeness has not been assessed for any district or category.

These are additional **source records**, not a claim of 169 net-new unique places. Hospitals and centres can overlap the OSM inventory and researched service records. Do not add table row counts to report a national unique-venue total; reconcile facilities across sources first. Use record_id as the source-table key, not a cross-source venue identifier.

## Provenance and licence

The health records are adapted from Open Data Mauritius data republished by [cyber.mu](https://places.cyber.mu/health/), which explicitly labels the dataset **CC-BY-SA-4.0**. Attribution: Open Data Mauritius, via cyber.mu; adapted into a flat access-research table on 12 November 2026. The source snapshot is **6 September 2026, 09:20 Mauritius time**. The original government dataset download returned an anti-bot HTML page during this run, so these records were retrieved from the stated republication, not directly verified against the government CSV.

Health-table adaptations are provided under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The OSM-derived coverage tables retain the [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) attribution and terms: © OpenStreetMap contributors. Keep the two source families separate when distributing data; this folder does not relicense the repository's other datasets.

## Interpretation and quality

- All 169 health records have unknown wheelchair access, parking, toilets, entrance, lift and parking-to-entrance route. A hospital or medical-clinic label is not access evidence. No reviews or on-site checks were performed for this import.
- source_district preserves the directory grouping; district_verified is false. An apparent mismatch for Bambous Virieux, listed under Black River, is explicitly flagged in quality_note. Counts for this source are directory-group counts, not verified geographical assignments.
- location_type preserves the source's facility category; it does not establish ownership, licensing, services or current operation. The source includes private-clinic names despite its introductory description of government facilities.
- Coordinates, addresses and telephone numbers are source values and can be stale. Coordinates come from page structured data where available and otherwise the visible map link (rounded to five decimals). Missing phones are empty strings. Import phone and record_id as text in Power BI; latitude and longitude as decimal numbers.
- Existing OSM district counts use the existing boundary-based assignment; 77 unresolved records remain explicit. Tag counts indicate map evidence exists, not that access is good or recently inspected.
- The district/category coverage table is a view of existing records, not newly collected locations. Unequal counts cannot establish how well a district is covered without an independent denominator.

The next research priority is access evidence for these centres and smaller towns, especially districts with smaller inventories, rather than assuming that more directory entries resolve accessibility uncertainty.
