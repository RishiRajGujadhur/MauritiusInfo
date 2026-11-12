# Additional Mauritius directory locations

Collected 12 November 2026 from [cyber.mu Places](https://places.cyber.mu/), a republication attributed to Open Data Mauritius. These are directory source records for accessibility research. Listing a place here does not mean it is accessible, operating, or recently inspected.

## Files for Power BI

| File | Contents |
| --- | --- |
| [places.csv](places.csv) | Flat location records with name, category, address, source-listed district, coordinates where supplied, public phone and separate access fields |
| [category_counts.csv](category_counts.csv) | Counts by directory category |
| [district_category_counts.csv](district_category_counts.csv) | Counts by source district and category, including unstated districts |
| [sources.json](sources.json) | Every ingested directory page, row counts, source snapshot, retrieval date and response hash |

**1,282 source records across 11 categories and 64 directory pages.** Of these, **564 have no source coordinates**; they are retained with blank latitude/longitude rather than guessed locations.

| Category | Records |
| --- | ---: |
| Community/social services | 264 |
| ATMs | 258 |
| Schools | 181 |
| Supermarkets/malls | 172 |
| Petrol stations | 151 |
| Post offices | 102 |
| Police/coast guard | 79 |
| Utility offices | 26 |
| Sports facilities | 23 |
| Embassies/high commissions | 15 |
| Fire stations | 11 |

This import covers police/coast-guard posts, fire stations, schools, post offices, ATMs, petrol stations, shopping locations, embassies, community/social services, utility offices and sports facilities. The previous [169-record health import](../national/health_facilities.csv) remains separate. None of these directory tables is a complete national census.

## Data meaning

- Every physical-access field is **unknown**: wheelchair entrance/access, wheelchair parking, adapted toilets, step-free entrance, lift and the parking-to-entrance route. Neither positive nor negative access is inferred from the institution type, map coordinates or the host building.
- field_verified, review_checked, operation_verified and district_verified are false. Google Maps directions links on source pages were used only to extract source coordinates; Google reviews and Google accessibility attributes were not checked or scraped for this batch.
- source_district preserves the directory's label. Missing districts remain empty, and summaries show Not stated. Do not infer coverage or correct an assignment merely from an address string. Source errors can exist, as documented in the earlier health import.
- location_type preserves the source's badge, which can be a facility category, operator or brand (for example a petrol brand), when supplied. ATMs, their host supermarkets and nearby branches are distinct service/location records; a shared host does not establish access to the machine or branch.
- Coordinates are copied from source map links and can be rounded or stale. Missing coordinates are blank. Addresses and phones are copied as facts without reproducing descriptions or reviews; current details need confirmation.
- record_id is a stable hash of category, source badge, name, address and coordinates. It identifies this source record only, and may change if those facts change. It is not a national cross-source venue ID.
- Existing OSM, researched venue and health tables may describe the same premises. Source-table counts must not be added to claim a unique-location total. Cross-source reconciliation has not been completed.
- Source snapshot dates are kept separately from retrieval dates. A page checked today can describe older data. The source's category totals are reconciled against visible listing rows; structured-data snippets can omit later entries.

Import record_id and phone as text, latitude/longitude as decimal numbers, and retrieved_date as an ISO date. Keep source_snapshot as text with its supplied timezone. Unknown access values are text, not false. Counts describe available records, not a district's accessibility level.

## Attribution and licence

Attribution: **Open Data Mauritius, via cyber.mu Places**. Adapted into flat research tables on 12 November 2026 by this project. The republisher states **CC-BY-SA-4.0**; its licence statement and page URLs are recorded in sources.json. The original government downloads were not independently ingested in this batch. No Google review text, photographs or map tiles are redistributed.

These directory-derived tables and their adaptations are provided under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This does not relicense the separate OSM/ODbL datasets or the repository as a whole. Preserve attribution, identify changes and comply with the source licence when redistributing adaptations.
