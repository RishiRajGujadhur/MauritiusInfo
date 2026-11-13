# Access Mauritius website

The static website uses React, Vite, Radix UI and TanStack Table v8. GitHub Pages publishes the committed root `index.html`, `assets/` and existing `data/` directory through main/root.

## Build

Use Node.js 22.12 or newer.

```sh
cd web
npm ci
npm run publish:static
```

Commit source and the generated root files together. Source is in `web/src/`. The build exports `web/dist/`, and the publish script replaces generated assets in the repository root. Interface changes require rebuilding. CSV-only changes flow through after Pages republishes them and the browser refreshes/revalidates cached downloads.

Local development uses `npm run dev` inside `web`, with the page at `/MauritiusInfo/`. Make the root `data` directory available through a local `web/public/data` symlink when developing. Production reads the existing published root data directory.

## Grid and filters

TanStack Table sorts the full filtered dataset before pagination. All six headers toggle direction. Shift-click adds sorting columns. The narrow-screen sort picker provides the same columns. Radix provides the table presentation, buttons, popovers, fields, tabs, tooltips, theme and icons. Searchable filter menus support keyboard navigation and show selected values.

CSV export includes every filtered row in the selected sort order. Filter, sort, page and selected-record state are stored in the URL. Theme and density preferences are local to the browser. Dark mode is the default for a new preference.

CSV loading and normalization run in a worker. Search results use deferred React updates. Place details load on demand. The nine primary sources contain 8,548 records at implementation. Some source records overlap. Existing source licences and provenance continue to apply.

## Verification

Run `node --test tests/site-core.test.mjs` from the repository root for parsing, normalization, feature filters and source-URL checks. Browser checks cover searchable-menu selection, sorting, multi-column order, pagination, CSV export, details, clipboard links and the two themes. The sticky header is checked against the actual scrolling container.

[Review all 50 improvements](UI-IMPROVEMENTS.md).

## Planning features

- **Map:** lazy-loaded Leaflet 1.9.4 with marker clustering. It shows the entire filtered set, not only the current page. Of 8,548 records, 7,852 have usable source coordinates; 696 remain available in the list. Missing coordinates are never guessed. Area centres and rounded positions are disclosed in popups. The initial broad view focuses on Mauritius; Fit all includes Rodrigues. Cluster numbers are counts, not access ratings. Tiles use normal browser caching, visible OpenStreetMap attribution and no prefetch/offline downloads. Set VITE_MAP_TILE_URL at build time to change providers; update attribution when changing provider.
- **Saved:** bookmark icons and Save place keep stable dataset/record keys in mu-saved-v1 localStorage. Saved mode uses the same search, needs and filters. This is browser-local, with no account or cross-device sync. Storage failure is disclosed.
- **My needs:** wheelchair access, step-free entrance, wheelchair parking and adapted toilet require positive reports for every selected field. Unknown, limited and negative values do not match. Preferences persist locally and active requirements are encoded in the URL. Clear filters disables requirements without deleting the saved preference.
- **Evidence:** the worker joins the existing observations and sources tables by dataset and record ID. Labels distinguish map tags, directory labels, operator statements, visitor reviews, government statements, excerpts and listings without access evidence. Identity-only sources never become accessibility evidence. On-site labels require field_verified=true; none of the current records meet that condition. Original observation scope, source links and dates are available in Details & source. Partial evidence-load failures are disclosed.
- **Report update:** the form validates the date/source and description, provides a review screen, and opens a prefilled public GitHub Issue draft with stable record and dataset identifiers. A GitHub account is required; users submit and attach photos there. Reports do not modify CSV data automatically. Review the report and evidence before merging a data correction. No test reports were submitted during implementation.

Run `node --test tests/*.test.mjs` for both data and planning-feature checks.

## Performance and resilience

The explorer requests unsorted matches so TanStack sorts only once. Mobile draft
counts skip sorting entirely. `filterRecords` keeps its sorted default for other
callers. My needs UI loads on demand alongside the existing map and details chunks.

Every CSV fetch times out after 20 seconds. Failed primary tables leave successful
tables available; failed evidence tables flag the affected records. Retry bypasses
the normal HTTP cache. Worker startup errors use the existing retry banner.

Shared URLs explicitly encode disabled needs (`needs=`), preventing the recipient's
stored preferences from silently changing shared results. Page numbers reject
non-finite/fractional values and stay intact while data loads. Browser history
navigation restores filters, sorting, pagination, selected record and view.

Run `node --test tests/*.test.mjs` for data, filtering, evidence and actual worker
loading/failure tests. Build with `npm run publish:static` from `web` and commit the
source and generated export together.

## Mauritius visit planning (November 2026)

The directory now has 8,574 source records, including 26 new operator/service
entries. [Planning data and provenance](data/planning/README.md) explain the
405 mapped hours expressions, official mall schedules, calendars, source dates,
refresh scripts, and coverage gaps.

- **Visit filters:** open now, dietary options, facilities, phone availability,
  service information and visitor reports. Selected features combine with AND
  and with the existing access/parking/needs filters. Unknowns do not match.
- **Nearby:** choose a sourced town or explicitly request GPS, select a radius,
  and sort by distance. Distances are straight line, never travel-time estimates.
  Records without coordinates remain available when nearby filtering is cleared.
  Town/radius filters are shareable; exact GPS is not persisted or put in the URL.
- **Visit tab:** opening status, weekly and holiday hours, next transition,
  contacts, arrival notes, dietary/facility facts, services, preparations and public
  visitor report links. Raw complex or ambiguous schedules remain readable.
- **Hours engine:** conservative weekly OSM syntax only: day ranges, lists,
  split shifts, overnight intervals, explicit closures, `24/7` and `PH` rules.
  Dates, seasons, solar times and unsupported expressions are unconfirmed. It
  uses Indian/Mauritius (UTC+4), independent of the device timezone, and refreshes
  once a minute and when the document becomes visible. Missing holiday exceptions,
  tentative Eid dates and years outside calendar coverage stay unconfirmed.
- **My trip:** add saved places or use Add to trip in details; reorder or remove
  up to 50 stops, set arrival/duration, inspect closed-hours and overlap warnings,
  open directions and export a text plan. Local plans have no account sync and
  do not estimate traffic, accessible routes, queues or assistance time.
- **Offline:** My trip downloads the app shell/chunks and saved-place snapshots
  into browser Cache Storage, then installs the scoped service worker. Cached
  place details work on a later offline visit; external links and map tiles need
  a connection. Snapshots track saved/unsaved places and retain prior saved records
  if a source temporarily fails. Remove offline download clears only this app's
  caches and registration. Browser storage eviction can remove downloads.
- **Visitor updates:** report changed hours/contacts, dietary options, facilities,
  arrival points, broken lifts, blocked ramps and closures through the reviewed
  GitHub draft flow. Add photos on GitHub. The import script refreshes public
  issue metadata; reports do not automatically change facts.

The source import contains no explicit WhatsApp or egg-friendly claim yet.
These capabilities stay empty until a source records them. Exact accessible
entrance, parking and drop-off coordinates also remain unknown unless supplied
by a source; a venue's centre pin is not represented as an entrance.

Validation includes parsing, timezones, holidays, overnight transitions, trip
breaks/overlaps, contact safety, dietary/facility unknowns, source failure recovery,
real dataset joins and service-worker scope/fallback tests. Local Chromium launch
is blocked by this environment's socket restriction, so interactive browser and
visual verification still require a browser-capable environment before merging.

### Dropdown focus and mall trading groups

Search fields use one inset focus border instead of overlapping input and Radix
focus outlines. Tapping a filter leaves the keyboard closed until its search field
is tapped; opening with the keyboard focuses search. Arrow keys, Enter, Escape and
focus return remain supported. Mobile options have 44px minimum tap targets.

Mall visit details can select separately published trading groups (such as
hypermarket or leisure) from the same source snapshot. This does not copy mall
hours onto tenants, change directory open-now badges, or change trip checks.

### GPS proximity sort and opening-hours window

Select **Sort → Nearest to me (GPS)** on desktop or mobile to request location
permission and sort all matching places by straight-line distance. This adds no
radius restriction; the existing nearby radius filter remains independent.
Unmapped places stay at the end. Permission errors preserve the existing order.
Coordinates and GPS sort state stay in memory and are excluded from shared URLs
and browser storage. Clear GPS removes the proximity origin. Changing sort,
clearing filters or leaving the page cancels pending location results.

The **Hours** popover and Visit filters offer a Radix two-thumb slider for an
**Open by / Stay open until** visit window, in 15-minute increments from 00:00 to
24:00 on a selected date. Results must have continuous published opening coverage
for that whole same-day window in Mauritius time, including holiday exceptions
and overnight carry-over. Unknown schedules and breaks during the window are
excluded. The date and time window are shareable through the `hours` URL query;
invalid ranges are ignored. Search badges continue to describe opening now,
while this filter describes the selected visit date.

### Quality-of-life follow-up

See [the 100-item implementation checklist](QOL-IMPROVEMENTS-100.md) for the
search, shortlist, keyboard, dropdown, hours, details, map, trip, report and
resilience changes. Tools are available from the header or `?`. Backups stay
local; imports preview or merge explicitly, and unsupported records are disclosed.
Browser visual and interactive acceptance checks remain pending.
