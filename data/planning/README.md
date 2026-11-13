# Mauritius visit-planning data

Imported 13 November 2026. This adds **26 operator/service records** to the
existing 8,548 records, for **8,574 source records**. Source records can overlap.
No records are described as independently or on-site verified.

## Files and provenance

| File | Contents |
| --- | --- |
| `records.json` | 1,168 stable dataset/record-key enrichments: hours, contact channels, dietary and facility tags, operator arrival notes and service links |
| `official-places.csv` | 24 my.t branches, the MRA e-services helpdesk, and Padharo Sa CentrePoint |
| `mall-hours.json` | Seven Ascencia malls' separate shop, food, supermarket and leisure trading schedules |
| `locations.json` | 231 named town/village/suburb map nodes for nearby search |
| `holidays.json` | Official 2026 and 2027 holiday calendars, including the documented November 2026 and September 2027 following-day holidays |
| `reports.json` | Snapshot of public venue-update issue metadata; currently no visitor reports. Pull requests are excluded |
| `import-manifest.json` | Source URLs, retrieval dates, SHA-256 hashes, licences, extraction counts and failures |

The OpenStreetMap enrichment reuses the exact Geofabrik extract already behind
`data/osm/places.csv`: data timestamp **2026-11-11T21:22:47Z**, not a new live
map download. It preserves 405 opening-hours expressions on retained records.
Map object edit dates and any explicit check dates are distinct from retrieval
dates. A recent retrieval does not establish when the venue's hours were checked.

OpenStreetMap-derived facts and town locations are **© OpenStreetMap
contributors, ODbL 1.0**; see the source manifest and `data/osm/README.md`.
Operator and government sources supply small factual extracts and original
links; full pages, reviews, menus, photographs and personal issue-author details
are not republished. Those publishers retain rights to their pages.

## Conservative joins and interpretation

- Ascencia hours join exact mall identities only. Mall shop hours are **not**
  copied to tenants. The full separate trading groups remain in `mall-hours.json`.
- my.t coordinates come directly from its operator branch locator. They are
  branch positions, not independently surveyed accessible entrances.
- The MRA row describes its e-services support/office information. Its appointment
  link is for remote help; it does not imply an in-person booking or counter service.
- Padharo Sa's pure vegetarian description and phone come from its own website.
  Its published `Sunday to Monday` day range is ambiguous, so no weekly schedule
  is invented. Vegan food, eggs, accessibility and WhatsApp remain unknown.
- InterContinental's flat parking route, ramp and adjacent drop-off statements
  retain their IHG source and scope. No entrance coordinates or transfer assistance
  are inferred, and these notes do not overwrite the original map access status.
- Missing vegetarian, vegan, egg-friendly, air-conditioning and covered-area tags
  remain unknown. WhatsApp requires an explicitly sourced WhatsApp number; an
  ordinary mobile number is insufficient. The current imported snapshot contains
  no explicit WhatsApp or egg-friendly claim.
- Reports remain unverified submissions. A closed GitHub issue is not evidence
  that its report was confirmed. The snapshot covers the first 100 newest issues
  including pull requests; refresh the importer to pick up new reports.

## Reproduce / refresh

```sh
python scripts/import_planning.py \
  --pbf /path/to/the/matching/mauritius.osm.pbf \
  --checked-date YYYY-MM-DD \
  --cache-dir /tmp/mauritius-planning-sources
node --test tests/*.test.mjs
cd web
npm run publish:static
```

Requires `osmium` from `scripts/requirements.txt`, Python's standard library and
Poppler's `pdftotext`. The PBF hash must match the existing OSM import manifest.
Use a **new empty cache directory for a fresh scrape**. The default cache is for
reproducible reruns on downloaded source pages; do not give old cached pages a
new retrieval date. Review parser assertions, source failures, changed holiday
notices, matching and coverage before committing refreshed data. New primary
sources or changed page layouts need a reviewed parser change.
