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
