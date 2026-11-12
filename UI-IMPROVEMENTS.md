# 50 interface improvements

Implemented 13 November 2026 in the React, Vite, Radix UI and TanStack Table explorer.

1. Replaced the Next.js build with React and Vite for this static, single-page explorer.
2. Reduced initial JavaScript from 741,264 bytes to approximately 471 KB, about 36% before compression. This measures initial scripts, excluding CSV data and deferred details.
3. Moved CSV downloads, parsing and normalization into a web worker to free the main UI thread.
4. Reduced the desktop application header to 53 pixels.
5. Combined the page heading and search box into one toolbar.
6. Removed the separate hero description and its vertical margins.
7. Moved the travel-access reminder into a labelled help tooltip beside search.
8. Shortened the search prompt to “Place, town or address”.
9. Added an inline clear-search action that returns focus to search.
10. Added the `/` search shortcut with a visible key hint.
11. Added distinct Radix icons to all five location filters.
12. Made the area filter searchable.
13. Made the category filter searchable.
14. Made the access filter searchable.
15. Made the parking filter searchable.
16. Made the source filter searchable.
17. Made the page-size menu searchable.
18. Added arrow-key navigation and Enter selection inside searchable menus.
19. Added checkmarks to identify selected menu options.
20. Added explicit “No matches” feedback to menu searches.
21. Kept filter names visible in selected values to distinguish access from parking claims.
22. Added a row of active filter chips below the toolbar.
23. Made each chip removable independently.
24. Disabled the reset action when there is nothing to reset.
25. Added TanStack sorting to all six grid columns.
26. Added ascending and descending sort indicators to column headers.
27. Exposed sorting direction through `aria-sort` for assistive technology.
28. Added Shift-click multi-column sorting.
29. Displayed sort priority when multiple columns are active.
30. Kept column headers visible while scrolling the grid.
31. Gave category its own sortable column, with the detailed type beneath it.
32. Added distinct icons to positive, limited, negative and unknown status badges.
33. Shortened status labels to “Reported yes”, “Reported no”, “Limited” and “Unknown”.
34. Reduced default row padding so more records fit on screen.
35. Added a saved compact/comfortable row-density control.
36. Added alternating row shading for easier horizontal scanning.
37. Added a row focus highlight for keyboard navigation.
38. Added a place icon and an on-focus/on-hover open icon to record buttons.
39. Reworked narrow-screen records to show all six columns as labelled cards.
40. Added a searchable sort picker on narrow screens where table headers are hidden.
41. Added direct first-page and last-page actions.
42. Added CSV export of every filtered result in the current sort order, across all pages.
43. Added skeleton rows while the initial data is loading.
44. Added Radix icons to all eight access features in the place dialog.
45. Changed access details into compact, aligned feature tiles.
46. Moved longer source notes into a separate “Details & source” tab.
47. Added a location icon and compact location/source summary to the dialog header.
48. Added a compact action bar with map, valid telephone, source and copy-link actions when available.
49. Added readable source dates and compact verification metadata below access features.
50. Added copyable links that reopen the selected record, with success/failure feedback.

GitHub Pages publishes the compiled files from `main` and `/(root)`.
