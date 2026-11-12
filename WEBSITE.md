# Access Mauritius website

A buildless, mobile-responsive location explorer with text search, area/category/access/parking/dataset filters, sorting, 25/50/100-row pagination, shareable filter URLs and record-detail dialogs. The desktop table becomes stacked records on small screens. Native controls, visible focus, live result counts and keyboard-accessible dialogs are included.

## Enable GitHub Pages

The website files are in the root of `main`. In [repository Pages settings](https://github.com/RishiRajGujadhur/MauritiusInfo/settings/pages), select **Deploy from a branch → main → /(root) → Save**. GitHub will show the live URL after publishing. Expected project URL: `https://rishirajgujadhur.github.io/MauritiusInfo/` (not confirmed live until GitHub finishes publishing).

No build workflow, API key or server is needed. The `.nojekyll` file disables Jekyll processing. GitHub's current setup guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Repository administration/Pages settings are not exposed by the GitHub connection used to add these files, so enabling Pages is a one-time owner step. If Pages is unavailable for a private repository on your GitHub plan, a public repository or an eligible plan is required. Do not put private credentials in the website: published files and data are available to visitors.

## Data connection

`DATASETS` in [data-core.mjs](data-core.mjs) declares nine CSV paths relative to the website. The site fetches those repository files directly from its own published origin; it does not use GitHub API credentials or raw private-repository URLs. Updating a connected CSV on `main` updates the website's data after GitHub republishes it and the visitor refreshes.

- Community map: `data/osm/places.csv`
- Public directory: `data/directory/places.csv`
- Health directory: `data/national/health_facilities.csv`
- Venue research: `data/places.csv`
- Shops, services and offices: the primary CSV in each research folder
- Entertainment: `data/entertainment/venues.csv`
- Festival editions: `data/festivals/events.csv`

At implementation these load **8,548 source records**. Counts are calculated at runtime. Derived OSM subsets are excluded because their records already appear in the main map table. Other cross-source overlaps remain visible; the site does not claim these are unique places. Historical festival editions are identified as such through their dataset and record notes.

The UI groups source claims as positive, limited/partial, negative or unknown. Raw feature values and evidence notes remain in details. A positive entrance/parking claim never establishes general wheelchair access. Areas preserve source labels with superficial spelling normalization; some are districts and others broad regions, and they are not independently verified. Empty/unknown features are not converted to negative claims.

All user/source values are inserted as text, and external source URLs are restricted to HTTP(S). Failed tables show a warning and retry action; available results remain usable with an incomplete-data notice. Some fields and coordinates are missing in the source records.

## Local development and checks

Serve the repository root over HTTP, for example `python3 -m http.server 8000`, then open `http://localhost:8000/`. Opening the HTML with `file://` will not reliably load CSVs.

Run `node --test tests/site-core.test.mjs`. Tests exercise the real datasets, quoted/multiline CSV parsing, independent feature filters, accent-insensitive search, empty results, invalid page bounds and unsafe URL rejection. No dependencies are required. Data shape changes require updating the normalizer and expected fixture counts where appropriate.

Website files: `index.html`, `styles.css`, `app.js`, `data-core.mjs`, `.nojekyll`. No source data is rewritten by the website. Data attribution and licence links are displayed in the footer; original source licences continue to apply.
