# 100 quality-of-life improvements

Implementation checklist for the MauritiusInfo follow-up pull request. Existing dark-mode and Radix design are retained.

The entries below describe implemented changes. Core operations have automated tests and the initial React view has a server-render smoke check. Desktop/mobile visual and interactive acceptance testing remains pending because Chromium cannot launch in this environment (socket permission denied). No deployment is implied by this checklist.

## Search and reuse

Implementation: `web/src/explorer.jsx`, `web/src/tools-panel.jsx`

| # | Improvement |
| --- | --- |
| 1 | Remember submitted search terms on this browser |
| 2 | Remove an individual recent search |
| 3 | Clear the complete recent-search history |
| 4 | Reuse recent terms with chips in desktop and mobile search |
| 5 | Save the current filter configuration as a search preset |
| 6 | Give each saved search a custom name |
| 7 | Restore a saved search without re-entering filters |
| 8 | Delete saved search presets |
| 9 | Share the current filtered results using native share or clipboard |
| 10 | Show selectable text when clipboard permission is unavailable |

## Saved places

Implementation: `web/src/tools-panel.jsx`, `web/src/explorer.jsx`

| # | Improvement |
| --- | --- |
| 11 | Save every place on the current results page |
| 12 | Undo an unsave action from the results |
| 13 | Download a JSON bookmark backup |
| 14 | Merge an imported bookmark backup without discarding existing bookmarks |
| 15 | Export only saved places as CSV |
| 16 | Confirm before clearing all saved places |
| 17 | Show the number of unavailable bookmarked records |
| 18 | Jump from Tools to the saved-results view |
| 19 | Clean unavailable bookmarks only after complete online source loading |
| 20 | Search the saved-place shortlist by name or area |

## Navigation

Implementation: `web/src/explorer.jsx`, `web/src/tools-panel.jsx`

| # | Improvement |
| --- | --- |
| 21 | Provide a keyboard-shortcut reference in Tools |
| 22 | Open Tools with the question-mark shortcut |
| 23 | Go to the next page with Alt+PageDown |
| 24 | Go to the previous page with Alt+PageUp |
| 25 | Switch to the map with Alt+M |
| 26 | Switch to the list with Alt+L |
| 27 | Toggle saved-only results with Alt+S |
| 28 | Open the trip planner with Alt+T |
| 29 | Return to the top of the page and results grid from Tools |
| 30 | Provide a visible mobile map/list button |

## Dropdowns

Implementation: `web/src/search-select.jsx`

| # | Improvement |
| --- | --- |
| 31 | Clear a dropdown search with its own button |
| 32 | Announce the number of matching and displayed options |
| 33 | Load another 100 options without changing the query |
| 34 | Reveal the current selection even when it lies beyond the first 100 options |
| 35 | Jump forward ten options with PageDown |
| 36 | Jump backward ten options with PageUp |
| 37 | Avoid selecting an option while an IME composition is active |
| 38 | Prevent Enter on an empty option list from submitting a containing form |
| 39 | Type directly from the open popover to start searching |
| 40 | Recover from an empty search through a dedicated Clear search action |

## Opening hours

Implementation: `web/src/hours-filter.jsx`, `web/src/visit-info.jsx`

| # | Improvement |
| --- | --- |
| 41 | Set the visit date to today in one tap |
| 42 | Set the visit date to tomorrow in one tap |
| 43 | Apply an 08:00–12:00 morning preset |
| 44 | Apply a 12:00–17:00 afternoon preset |
| 45 | Apply an 18:00–22:00 evening preset |
| 46 | Apply a full-day opening-hours window |
| 47 | Edit the opening boundary with a native time field inside Radix |
| 48 | Edit the closing boundary with a time field, including end-of-day midnight |
| 49 | Preview the selected weekday and visit-window duration |
| 50 | Highlight today in the weekly venue schedule |

## Place details

Implementation: `web/src/place-details.jsx`

| # | Improvement |
| --- | --- |
| 51 | Open the previous place in the sorted results |
| 52 | Open the next place in the sorted results |
| 53 | Show the selected place position and total result count |
| 54 | Share a place with the native share sheet when supported |
| 55 | Copy the venue address |
| 56 | Copy the source pin coordinates |
| 57 | Open directions to the place pin directly from details |
| 58 | Open the explicitly sourced venue website from the details action bar |
| 59 | Export one place as CSV |
| 60 | Copy the venue accessibility checklist |

## Map

Implementation: `web/src/map-view.jsx`

| # | Improvement |
| --- | --- |
| 61 | Fit the mapped Mauritius results with a dedicated island button |
| 62 | Fit the mapped Rodrigues results with a dedicated island button |
| 63 | Expand the map height without leaving the page |
| 64 | Retry a failed map background |
| 65 | Keep the current map viewport when filters change |
| 66 | Show the opted-in GPS location as a separate map marker |
| 67 | Recenter the map on the GPS location |
| 68 | Save or unsave a place inside its map popup |
| 69 | Open directions directly from a map popup |
| 70 | Explain marker and map keyboard navigation next to the map |

## Trips

Implementation: `web/src/trip-panel.jsx`, `qol-core.mjs`

| # | Improvement |
| --- | --- |
| 71 | Undo removal of a trip stop |
| 72 | Confirm before clearing a trip and retain an undo snapshot |
| 73 | Show the total planned visit duration and stop count |
| 74 | Sort trip stops by arrival time with unscheduled stops last |
| 75 | Reverse the stop order |
| 76 | Add saved places to the trip in bulk, respecting the 50-stop limit |
| 77 | Download a structured JSON trip backup |
| 78 | Preview and confirm a validated trip-backup restoration |
| 79 | Copy a readable trip plan to the clipboard with a manual fallback |
| 80 | Apply 30-, 60- or 120-minute stay presets |

## Reports

Implementation: `web/src/report-update.jsx`

| # | Improvement |
| --- | --- |
| 81 | Show a live report-detail character count |
| 82 | Reject whitespace-only or too-short trimmed reports before preview |
| 83 | Copy the complete reviewable report draft |
| 84 | Confirm before resetting report fields |
| 85 | Set the evidence date to today in one tap |
| 86 | Offer feature-specific writing prompts for hours, parking, arrival, diet and closures |
| 87 | Explain what an online evidence link should support |
| 88 | Save a report draft explicitly for this browser session |
| 89 | Restore the saved session report draft |
| 90 | Remove the saved session report draft |

## Feedback and resilience

Implementation: `web/src/explorer.jsx`, `web/src/qol-ui.jsx`, `web/src/styles.css`

| # | Improvement |
| --- | --- |
| 91 | Show offline status as soon as the browser reports a lost connection |
| 92 | Offer a source refresh after connectivity returns |
| 93 | Finish loading with a retry message if offline fallback fails |
| 94 | Recover failed views with an error boundary and reload action |
| 95 | Announce actions with a dismissible notification and optional undo |
| 96 | Constrain dialogs to the dynamic viewport and safe areas |
| 97 | Respect reduced-motion preferences throughout controls |
| 98 | Keep borders and focus visible in forced-colour modes |
| 99 | Provide print layouts for results, place details and trip dialogs |
| 100 | Reserve scrollbar space to reduce layout shifts |

## Additional fixes

Exports preserve evidence labels and escape spreadsheet formulas. Importers reject malformed/oversized backups and keep unknown records distinct from known entries. The loading skeleton now matches visible table columns. GPS remains opt-in and is never stored in saved searches or backups.
