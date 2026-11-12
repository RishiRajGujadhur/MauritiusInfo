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
