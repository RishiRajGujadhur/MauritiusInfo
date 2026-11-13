# Compare places and prepare an outing

Seven additions to the MauritiusInfo directory. No accessibility change-history feature is included.

| Feature | Where to find it | Behaviour |
| --- | --- | --- |
| Compare places | Compare buttons in results/details; Compare in the header | Up to three source records side by side: access, entrance, parking, toilet, listed hours today, distance, needs, contacts and evidence. Missing records remain removable. |
| Can I visit? | Access tab in place details; comparison | Uses enabled My needs, or the four-facility overview when no needs are enabled. Separates reported matches, negative/limited reports and unknowns. It is not an accessibility guarantee. |
| Call-ahead checklist | Prepare & notes tab | Questions follow the selected needs and visit window, plus hours, drop-off, transfer help and temporary barriers. Copy the questions or call an explicitly sourced phone number. |
| Closing-soon alerts | Result rows/cards; Compare & plan → Closing alerts | Inline warnings for the next known closing/break within 30 or 60 minutes. Mauritius time, supported schedules only; no push notifications or permission prompts. |
| Related listing groups | Compare & plan → Related listings; place details | Potential identity matches keep every record and its evidence separate. Nothing is inherited from another listing. |
| Personal visit notes | Prepare & notes tab | Current note per source record, up to 2,000 characters. Browser-local storage, with a save-failure message. Excluded from report drafts, exports, backups and outing links. No note history is stored. |
| Shareable outing | My trip → Share outing link | Choose one to ten stops and share a link containing only their public record IDs, arrival times and durations. Recipient previews supported records and explicitly adds selected stops. Existing trip times are kept; unknown, duplicate and over-limit stops are skipped and disclosed. |

## Related-listing criteria

Candidate names must match exactly after case/accent/punctuation normalisation.
When both pins are present, they must be within 75 metres. When a pin is missing,
a specific normalised address of at least 12 characters and three words must
match. Every member must match every other member, preventing distant records
from being joined through a chain of nearby pins. A candidate group is an identity
hint, not proof of a shared operator, entrance, accessibility or opening hours.
The current 8,574 records produce 81 candidate groups with these rules.

## Personal data and shared links

Notes are stored separately from venue records under a browser-local key. They
never enter the data worker, venue records, source exports, trip backup or outing
payload. Comparison selections and the closing-warning preference are local.
GPS coordinates are never included in outing links. Links do not modify someone
else's trip automatically and are not bookings. Anyone who receives a link can
view its selected public venue IDs and planned times; review dates before sharing.
Invalid versions, malformed payloads, invalid dates, duplicate stop IDs and plans
over ten stops are rejected. The directory's existing 50-stop trip limit remains.

## Validation

57 Node tests pass, including match/barrier/unknown classification, conservative
duplicate grouping, closing thresholds, private-note parsing, outing payload
validation and privacy, and non-destructive trip import. Production export,
React render smoke checks and offline-resource checks are run for this change.
Visual and interactive browser QA remains pending because Chromium cannot launch
in the current environment (socket permission denied).
