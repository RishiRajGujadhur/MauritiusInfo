# Data guide and Power BI import

## Shop and wheelchair parking research

The [shop dataset](shops/) records 12 branches with separate entrance, toilet, parking-label, dedicated-bay and shared-facility fields. Its [Power BI guide](shops/README.md) explains the joins and how to avoid counting shared bays for every tenant. The [2,371-shop OSM view](osm/shops.csv) is a subset of existing mapped places, not added national coverage.

## Office accessibility

The [office guide](offices/) provides [12 researched office records](offices/offices.csv), observations and sources. The [382-office OSM subset](osm/offices.csv) is a filtered copy of existing mapped records, not new national coverage. Keep these tables separate until cross-source duplicates are reconciled.

## Festival events

A separate [festival dataset](festivals/) adds **14 edition/component rows for 12 festival series**, with [events.csv](festivals/events.csv), scoped observations and sources. Import it separately from place tables; its [guide](festivals/README.md) explains dates, access levels and venue-only evidence.

## Larger OSM inventory

The [osm folder](osm/) adds **6,965 retained mapped records**, with a [separate flat CSV](osm/places.csv) and [import guide](osm/README.md). Only 103 records have accessibility-related tags; the rest of the inventory primarily supplies research leads. This section's three tables below remain the **35-place curated dataset**. Do not append the datasets and assume they contain unique physical businesses.

Updated: 2026-11-12. UTF-8, comma-delimited CSV with one header row, CRLF line endings and standard double-quote escaping. No merged cells, embedded Markdown, totals rows or multiple tables in a file.

## Tables

| File | Grain | Key |
| --- | --- | --- |
| [places.csv](places.csv) | One physical venue or named tenant branch | place_id |
| [accessibility_observations.csv](accessibility_observations.csv) | One source claim about one feature at one place | observation_id |
| [sources.csv](sources.csv) | One public source URL | source_id |

Start with places.csv for a flat import. Its feature fields are curated summaries; consult the observations for scope, dates and evidence. Multiple observations can support or contradict a feature. The flat view is not a chronological field inspection or a guarantee of current access.

## Import in Power BI Desktop

1. Download the CSV files from GitHub. Choose Get data > Text/CSV, select UTF-8 (65001) and comma delimiter, then Transform data.
2. Set IDs, names, categories, status fields, source_date_text, phone_international_digits and URLs to Text. Set last_web_check, checked_date and source_date to Date. Empty dates remain null.
3. Set field_verified to True/False. Set wheelchair_parking_bay_count to Whole number. Set width fields ending in _m to Decimal number. Empty measurements remain null, never zero.
4. Load places alone for a simple report. For evidence analysis also load observations and sources. Create single-direction relationships: places[place_id] (1) to accessibility_observations[place_id] (*), and sources[source_id] (1) to accessibility_observations[source_id] (*).
5. Filter/slice by region, locality, location_type and individual feature statuses. Use DISTINCTCOUNT(places[place_id]) for place totals when analysing multiple evidence rows.

The repository is private. Download while signed in; an anonymous raw GitHub URL will not reliably refresh. Keep credentials out of queries and repository files. Scheduled refresh is not configured by these files.

Do not also join sources to places through identity_source_id as an active relationship when using the two relationships above; it can introduce an ambiguous filter path. Use a separate role-playing source query for identity metadata if needed.

## places.csv fields

| Field | Type | Meaning |
| --- | --- | --- |
| place_id | Text | Stable identifier. Preserve when renaming. Never reuse an ID. |
| place_name | Text | Specific venue/branch, not a brand-wide access claim. |
| region | Text | Practical outing region, not an administrative district. |
| locality | Text | Town/area supported by source. |
| location_type | Text | waterfront, arts_centre, oceanarium, heritage_site, restaurant, museum, garden, shopping_mall, beach, nature_park, bar_restaurant, supermarket or grocery_store. |
| parent_place_id | Nullable text | Containing mall/complex. Does not inherit its features. |
| identity_source_id | Text | Source for venue identity/location, not all access features. |
| phone_international_digits | Nullable text | International phone digits without plus sign. Contact details are not telephone-verified. |
| wheelchair_access | Status text | Broad wheelchair-access claim. Does not imply any specific feature below. |
| step_free_entrance | Status text | Entrance-specific evidence. listed_yes means only an accessible-entrance directory label, not a measured step-free route. |
| wheelchair_parking | Status text | Designated/accessible parking for wheelchair users, separate from ordinary parking. |
| general_parking | Status text | Ordinary parking exists or is reported absent; does not establish wheelchair bays. |
| wheelchair_toilet | Status text | Adapted toilet evidence, not ordinary toilet presence/cleanliness. |
| lift | Status text | Lift evidence; boarding dimensions and operation unverified unless a note states otherwise. |
| ramp | Status text | Ramp evidence; no gradient or width inferred. |
| wheelchair_seating | Status text | Dedicated/accessible seating evidence; does not establish entrance. |
| parking_to_entrance_route | Status text | Route evidence; for beaches read the frontage scope in observations. |
| wheelchair_parking_bay_count | Nullable integer | Supported count of designated bays. Currently unknown for all venues. |
| parking_bay_width_m | Nullable decimal | Measured width in metres; currently unknown. |
| entrance_clear_width_m | Nullable decimal | Clear doorway width in metres; currently unknown. |
| toilet_door_width_m | Nullable decimal | Toilet doorway clear width in metres; currently unknown. |
| last_web_check | Date | Source retrieval date, not a visit/inspection. |
| field_verified | Boolean | false for all current desk-researched rows. |
| notes | Text | Important scope/parent caveats. |

## Feature status vocabulary

| Status | Meaning |
| --- | --- |
| unknown | No usable evidence retrieved, or source explicitly uncertain. Never treat as no. |
| reported_yes | Operator, government or visitor reports feature; inspect evidence_type and age. |
| reported_no | Explicit negative report; not inferred from silence. |
| listed_yes | Third-party directory label only. |
| partial | Some access/areas or significant route limitations. |
| conditional | Visitor suggests possible access without establishing it. |
| reported_barrier | A specific difficulty reported; not a whole-site inaccessible classification. |
| provisional_barrier | Search-index excerpt only; original/full review unavailable. |
| historical_reported_yes | Older official route statement; current condition unconfirmed. |

No overall accessibility score is calculated. Do not combine listed_yes and reported_yes into a verified-access count. All claims require their evidence type and scope.

## Observation fields

| Field | Meaning |
| --- | --- |
| observation_id | Unique stable claim identifier. Preserve on updates. |
| place_id | Foreign key to places. |
| feature | One feature field from places, or tenant_presence for branch identity only. |
| status | Controlled vocabulary above. |
| source_id | Foreign key to sources. |
| evidence_type | operator_statement, government_statement, visitor_review, directory_label, search_index_excerpt or operator_directory. |
| scope | venue, mall, tenant, entrance, main_bar, visit, visitor_facilities or parking_to_beach_frontage. |
| source_date | Exact supported source/review date only, YYYY-MM-DD; otherwise empty. |
| source_date_precision | day, month, relative or unknown. Month/relative text is kept separately. |
| source_date_text | Partial or relative displayed date, such as February 2026 or a year ago. Do not auto-convert relative dates. |
| original_review_check | directly_inspected, mirror_only, not_retrieved or not_applicable. Tripadvisor review read on its original host is directly_inspected. |
| checked_date | Web check date YYYY-MM-DD. |
| summary | Paraphrased claim and limitations. |

A source publication date is not necessarily the visit date. Directory page update dates are not review/inspection dates. The exact Food Republic dates shown by Wanderlog remain contextual mirror metadata in the README; original Google reviews displayed a relative date.

## sources.csv fields

source_id is the stable primary key. title identifies the page; url links to it; checked_date is the retrieval date. A source URL is provenance, not permission to redistribute its photographs or complete reviews.

## Updates and quality rules

- Keep existing IDs stable; append new ones. Do not renumber by sort order.
- Add each individual branch separately and link the parent where known.
- Do not infer tenant toilets, parking or entrances from the mall. Query the parent separately for shared facilities.
- Preserve conflicting observations. Set a summary to partial/conditional or add an explicitly documented conflict status if genuine same-feature contradictions emerge; never silently discard an older report.
- Record new measurements only when a source supports the units and scope.
- Keep unknown measurements empty and status fields explicit.
- The readable README and CSVs are separate maintained views. Update both in the same research change; no automatic synchronisation currently runs.
