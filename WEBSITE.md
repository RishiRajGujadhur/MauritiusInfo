# Access Mauritius website

The interface uses Next.js, React and Radix Themes. It exports static HTML, CSS and JavaScript for the existing GitHub Pages main/root configuration.

## Build and publish

Source lives in `web/app/`. Use Node.js 20.9 or newer.

```sh
cd web
npm ci
npm run publish:static
```

Commit the changed source, lockfile and exported root files together, including `_next/`. GitHub Pages publishes from `main` and `/(root)`. The live URL is https://rishirajgujadhur.github.io/MauritiusInfo/.

`publish:static` builds Next.js and copies `web/out/` into the repository root. The static export is committed so the current Pages branch setup can publish it directly. Future interface edits require running the build command before committing. CSV updates are fetched directly after Pages republishes them and the visitor refreshes.

For local development, run `npm run dev` inside `web`, then visit `http://localhost:3000/MauritiusInfo/`. For CSV loading during development, make the repository `data` directory available as `web/public/data` (a local symlink works). The exported site uses the existing root `data` directory.

## Data and behaviour

The shared `data-core.mjs` declares nine CSV datasets and handles parsing, normalization, search, filtering and pagination. Existing tests run with `node --test tests/site-core.test.mjs` from the repository root.

The site includes Radix Select filters, Dialog details, Switch dark mode, tooltips, icons and an animated SVG pin. The saved `mu-theme` preference is reused. Reduced-motion preference disables the pin animation. Source links and individual feature evidence remain in the detail view.

At migration, the nine datasets contain 8,548 source records. Some sources overlap. Positive reports describe source claims, and unknown access fields remain unknown. Historical festival editions retain their dates and status in details. Failed source downloads show a retry action and an incomplete-results message.

Source data remains under its existing licences. The footer provides attribution and links for OSM/ODbL and Open Data Mauritius via cyber.mu/CC BY-SA. No private credentials are used by the website.
