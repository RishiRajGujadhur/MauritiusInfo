# Individual shop access and wheelchair parking

Checked **12 November 2026**. This batch contains **39 branch records**, **56 observations**, **14 sources** and **one historical shared parking facility**. [The 2,371-shop map subset](../osm/shops.csv) is a filtered view of places already in the bulk inventory, not new national coverage.

## Expanded coverage: unknowns and reported barriers

Start with the [2,371-row shop access register](../osm/shop_access_register.csv). It includes **18 reported_not_accessible**, **6 reported_limited**, **7 mapped_accessible** and **2,340 unknown** records. These are existing mapped shops with clearer filter fields, not 2,371 newly found shops. [View the 24 mapped barrier reports](../osm/shop_barrier_reports.csv).

The researched branch table now includes **27 additional Winners branches from its official directory**, with accessibility and wheelchair parking explicitly unknown. Existing positive directory labels are preserved. The official directory verifies identity only; no chain-wide access claim is assigned.

The map register includes 153 supermarkets, 8 department-store objects, 52 electronics shops, 47 furniture shops, 16 DIY shops and 156 hardware shops. These categories help investigate mainstream retail, but **shop_size is unknown** without measured floor area or an explicit size source. No category automatically means medium or large.

Use accessibility_status and retail_category_group in Power BI. A mapped negative report applies to one OSM object/branch, not a whole brand. Missing tags are not converted to negative reports. Sources can be old, branches may have changed, and all require confirmation before visiting.

### Additional operator-listed branches

| Branch | Physical accessibility | Wheelchair parking |
| --- | --- | --- |
| Winners - Souillac | unknown | unknown |
| Winners - Bel Air | unknown | unknown |
| Winners - Chemin Grenier | unknown | unknown |
| Winners - Triolet | unknown | unknown |
| Winners - Roches Brunes | unknown | unknown |
| Winners - Flacq La Source | unknown | unknown |
| Winners - Saint Pierre | unknown | unknown |
| Winners - Coromandel | unknown | unknown |
| Winners - Terre Rouge | unknown | unknown |
| Winners - Goodlands | unknown | unknown |
| Winners - Forest Side | unknown | unknown |
| Winners - Plaine Magnien | unknown | unknown |
| Winners - Bambous | unknown | unknown |
| Winners - Rose Hill | unknown | unknown |
| Winners - Riviere du Rempart | unknown | unknown |
| Winners - Saint Paul | unknown | unknown |
| Winners - Pereybere | unknown | unknown |
| Winners - Boulet Rouge | unknown | unknown |
| Winners - Candos | unknown | unknown |
| Winners - Rose Belle | unknown | unknown |
| Winners - Cascavelle | unknown | unknown |
| Winners - Trianon | unknown | unknown |
| Winners - Garden Tower | unknown | unknown |
| Winners - Tribeca | unknown | unknown |
| Winners - Orchard | unknown | unknown |
| Winners - Manhattan, Curepipe | unknown | unknown |
| Winners - Windsor | unknown | unknown |

Branch names/localities follow operator labels. Orchard and Windsor remain region Unknown until their location is resolved. Floor areas, exact branch sizes, contact numbers and access measurements were not invented. Branch identities can overlap the map table; no cross-source unique total is claimed.

## Branch evidence

| Shop / branch | Region | Entrance label | Wheelchair parking label | Dedicated shop bays | Parking scope |
| --- | --- | --- | --- | --- | --- |
| [Intermart - Bagatelle](https://www.top-rated.online/cities/Moka/place/p/9304501/Intermart%2BBagatelle) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Intermart - Ebene](https://www.top-rated.online/cities/Quatre%2BBornes/place/p/9304503/Intermart%2BEb%C3%A8ne) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Intermart - Curepipe](https://www.top-rated.online/cities/Curepipe/place/p/2539378/Intermart%2C%2BPartenaire%2BIntermarch%C3%A9%2B-%2BCurepipe) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Espace Maison - Trianon](https://www.top-rated.online/cities/Quatre%2BBornes/place/p/9304505/Espace%2BMaison%2BTrianon) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Winners - Vacoas](https://www.top-rated.online/cities/Vacoas-Phoenix/place/p/9645308/Winner%27s%2BVacoas) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Winners - Victoria Urban Terminal](https://www.cybo.com/MU-biz/winners-victoria-urban-terminal) | Port Louis | unknown | unknown | unknown | none_for_shop |
| [Jumbo - Riche Terre (directory name)](https://www.top-rated.online/cities/Baie%2Bdu%2BTombeau/place/p/6168339/Jumbo%2BRiche%2BTerre) | North | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Courts Mammouth - Bell Village](https://www.top-rated.online/cities/Port%2BLouis/place/p/6172423/Courts%2BMammouth%2BBell%2BVillage) | Port Louis | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Courts Mammouth - Bambous](https://www.top-rated.online/cities/Bambous/place/p/2538919/Courts%2BMammouth%2BBambous) | West and south-west | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Courts Mammouth - Mahebourg](https://www.top-rated.online/cities/Mah%C3%A9bourg/place/p/9535263/Courts%2BMammouth%2BMahebourg) | South and south-east | unknown | listed_yes | unknown | shop_listing_scope_unresolved |
| [Galaxy - Curepipe](https://www.top-rated.online/cities/Curepipe/place/p/8678351/Galaxy%2BCurepipe) | Central plateau and Moka | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |
| [Galaxy - Coeur de Ville Flacq](https://www.top-rated.online/cities/Pont%2BBlanc/place/p/8123250/Galaxy%2BCoeur%2BDe%2BVille%2BFlacq) | East | listed_yes | listed_yes | unknown | shop_listing_scope_unresolved |

## What the parking fields mean

A branch directory may flag wheelchair parking without saying whether the bays are in front of that shop, elsewhere in a mall or shared with another building. We retain that label as listed_yes and mark its scope unresolved. **No dedicated shop-owned bays are confirmed in this batch.** No availability, enforcement, width or transfer clearance is inferred.

- wheelchair_parking is the branch listing's feature claim, not a guarantee of shop-owned parking.
- wheelchair_parking_claim_scope is shop_listing_scope_unresolved or none_for_shop.
- dedicated_shop_bays remains unknown; dedicated_shop_bay_count stays null rather than zero.
- parking_facility_id links separately researched shared-site facilities. It does not establish a usable route to the shop.
- parking_to_shop_route remains unknown until a continuous route is supported. Nearby parking is not automatically usable wheelchair parking.
- A toilet label may refer to a shared mall facility; ownership, exact location and usable layout remain unverified.

### Victoria Urban Terminal and Winners

The **12 April 2022** parliamentary statement describes initial terminal-wide provision of **eight disabled bays, two per parking level**, in a pre-opening context. The current delivered count and condition are unverified. This is stored once as PK001 in parking_facilities.csv with status historical_announced_provision. It is **not eight dedicated Winners bays**, and it does not establish a current step-free route from those bays to the store.

### Other planning details

- Courts Mammouth Mahebourg has a parking label in the reviewed directory without an entrance label. Its entrance stays unknown; parking does not prove entry.
- Winners Vacoas has a mirrored visitor comment about narrow corridors. It supplies no wheelchair measurements or reliable date and was not checked directly on Google Maps. It remains an unmeasured concern rather than an inaccessible classification.
- The Riche Terre hypermarket listing retains the name Jumbo and a 2025 update. Confirm current branch branding and location. No brand-wide access claim is made.
- Espace Maison Trianon is a single listed branch. Entrance, toilet and seating labels do not establish door/aisle dimensions, lift operation or the route from the parking bay.

A wheelchair-accessible entrance directory label is not a measured step-free access audit. No shop is classified fully accessible on this evidence. No direct shop accessibility reviews, field inspections or telephone checks were performed; the single mirrored corridor comment is explicitly labelled. Listed features can be outdated or assigned to the containing complex.

## Downloads and Power BI

| File | Grain | Key |
| --- | --- | --- |
| [shops.csv](shops.csv) | One branch with access evidence or an explicit identity-only lead | shop_id |
| [accessibility_observations.csv](accessibility_observations.csv) | One branch claim or scoped concern | observation_id |
| [parking_facilities.csv](parking_facilities.csv) | One shared parking facility | parking_facility_id |
| [sources.csv](sources.csv) | One source page | source_id |
| [OSM shops.csv](../osm/shops.csv) | Existing mapped object filtered to category=shop | record_id |

Start with shops.csv. For the researched evidence model, join shops[shop_id] (1) to accessibility_observations[shop_id] (*), and sources[source_id] (1) to accessibility_observations[source_id] (*), single-direction. Optionally relate parking_facilities[parking_facility_id] (1) to shops[parking_facility_id] (*) for shared-site filtering. Keep source_id on parking_facilities as metadata or use a separate role-playing source query; do not create ambiguous active paths.

Import UTF-8 comma-delimited files. Dates are Date, field_verified is True/False, bay counts are nullable Whole number, and width/clearance fields ending _m are nullable Decimal number. Other values are Text. Empty counts and measurements stay null. No merged cells, totals rows or Markdown are embedded in CSV cells.

**Avoid double counting:** count distinct shop_id for branches. Sum bay counts once per distinct parking_facility_id in the facility table, never once per linked shop/observation. Historical reported counts are not current verified capacity. Do not append the 2,371-shop subset to the bulk places table or sum it as extra records. The curated branch table can overlap both maps and the older curated place table.

Intermart Bagatelle links to MU0032. Its original curated place row is updated with the new directory labels and source S30, preserving the previous identity evidence. Other cross-source shop identities have not been reconciled.

## Research fields

| Field | Meaning |
| --- | --- |
| shop_size | unknown for every current branch; measured size not established. |
| shop_id, shop_name, shop_type | Stable physical branch identifier/name and retail category. Preserve IDs on rename. |
| locality, region, parent_site_name | Branch location and named containing site where established; no automatic access inheritance. |
| related_curated_place_id | Optional identity link to data/places.csv. |
| accessibility_level | directory_labels_only, shared_site_historical_lead or unknown; evidence categories, not grades. |
| wheelchair_access | Broad whole-shop claim; unknown unless explicitly established. |
| step_free_entrance | listed_yes only for accessible-entrance label, otherwise unknown. |
| wheelchair_toilet, wheelchair_seating | Branch listing labels; precise facility location/ownership unresolved. |
| wheelchair_parking, wheelchair_parking_claim_scope | Directory parking claim and whether its physical scope has been established. |
| dedicated_shop_bays, dedicated_shop_bay_count | Confirmation/count of bays specifically allocated to this shop. Currently unknown/null. |
| parking_facility_id | Link to separately recorded shared parking evidence. |
| parking_to_shop_route | Continuous usable route evidence, currently unknown. |
| parking_bay_width_m, parking_transfer_space_m, entrance_clear_width_m | Supported measurements in metres, currently null. |
| lift | Unknown unless explicit evidence retrieved; not inferred from a mall's floors. |
| identity_source_id, contact_url | Branch listing source and follow-up link. |
| last_web_check, field_verified, notes | Retrieval date, inspection flag and material limits. |

Observations have observation_id, shop_id, feature, status, scope, source_id, checked_date, original_review_check and summary. Status listed_yes means directory only; unmeasured_visitor_concern is the mirrored aisle comment; historical_announced_provision is the shared terminal statement. The last observation is scoped shared_terminal, not specific_branch_listing.

Parking facility fields distinguish historical_reported_bay_count/count_source_date from current_verified_bay_count. The current count remains empty. Source dates are not inspection dates. Sources carry stable source_id, title, url, evidence_type, optional source_date and checked_date.

## Existing mapped shops

| Broad wheelchair_access status | Records |
| --- | ---: |
| mapped_yes | 7 |
| mapped_limited | 6 |
| mapped_no | 18 |
| unknown | 2,340 |
| Total | 2,371 |

These are map statements about individual objects, not field-verified ratings or chain-wide conclusions. No shop parking status is inferred from nearby parking objects. The subset preserves the existing 2026-11-12 import and 2026-11-11T21:22:47Z extract timestamp, generated from source places.csv Git blob 23c0b915dd2cca591268fce8b4b6eed79b05f352. Its scope and limitations follow the [OSM guide](../osm/README.md).

© OpenStreetMap contributors. The map subset is available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). It is separate from the web-researched branch table. Regenerate using scripts/export_shops.py.

## Confirm before visiting

Ask for the exact wheelchair-bay location, whether it is shared or reserved, a photo showing transfer clearance, and the complete route to that branch's entrance. Check kerbs, thresholds, ramp surface/gradient, door width, aisle clearance, usable toilet location and any required lift. Keep a confirmed drop-off alternative where bay availability is uncertain.

## Expanded register fields and licence

The OSM access register preserves every column from the existing shop subset, plus:
- accessibility_status: reported_not_accessible (wheelchair=no), reported_limited (limited), mapped_accessible (yes/designated), or unknown.
- status_evidence: community_map_tag for explicit mapped values; no_usable_map_tag for unknown.
- shop_size: unknown; no measured floor area inferred.
- retail_category_group: grocery, hardware_diy, furniture_home, electronics_appliances, fashion or other, derived from the mapped shop subtype. This is a retail grouping, not a size rating.

These added columns are Text. Coordinates remain Decimal number, dates retain the types described in the OSM guide, and empty counts remain null. Count distinct record_id. Do not append the register, barrier-only extract and original shops.csv subset together: they share the same OSM IDs. Separate tables under data/shops use shop_id and can overlap with OSM.

The access register and barrier extract are OSM-derived and available under ODbL 1.0, with attribution to © OpenStreetMap contributors. They preserve the existing import/source dates. They do not contain fresh Google reviews or field inspections. The 39-row web branch table remains a separate maintained dataset. scripts/build_shop_access_register.py reproduces the OSM views.
