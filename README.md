# Mauritius Info — Wheelchair Accessibility

A practical, source-linked guide to wheelchair access at places in Mauritius.

**Web sources checked: 12 November 2026 (Mauritius time).** This is desk research, not an on-site access audit. The date means the source was checked, not that a facility was inspected or is working today. Summaries are paraphrased from public web pages and PDFs; original pages and photographs are not copied into this repository.

## National coverage expansion

The [national coverage guide](data/national/README.md) adds **169 health-facility source records across all nine districts**, with coordinates, contact details, licensing and explicit unknown accessibility fields. [Download the health directory](data/national/health_facilities.csv).

The [district coverage table](data/national/coverage_by_district.csv) and [district/category table](data/national/coverage_by_district_category.csv) make gaps visible in Power BI. The existing national OSM inventory contains **6,965 records across all nine districts and Rodrigues**, including 77 unresolved district assignments. This is broad geographic coverage, not a complete directory or verified accessibility coverage. The health import can overlap existing records; do not sum source tables as unique venues. Source district assignments remain unverified, with an apparent mismatch flagged.

## Repairs, mechanics, pharmacies and healthcare

The [services guide](data/services/README.md) adds **16 researched locations/practices**, **28 observations** and **11 sources**. [Download researched services](data/services/services.csv).

The separate [415-record map view](data/osm/services.csv) includes explicit repair shops/mechanics, pharmacies, hospitals, clinics, doctors, dentists and related healthcare objects already in the national inventory. It preserves 2 mapped_yes, 1 mapped_limited, 5 mapped_no and 407 unknown wheelchair-access values. It is a subset, not 415 additional unique places.

Entrances, wheelchair parking, adapted toilets, lifts and the route to the actual service/consultation room are separate. Parent-site facilities, patient-transfer assistance and clinical equipment access are not assumed. These are physical-access research records, not medical recommendations or verification of current practice availability.

## Entertainment: cinemas, tracks and spectator access

The [entertainment guide](data/entertainment/README.md) adds **16 venue/site records**, **26 observations** and **12 sources**. [Download the Power BI venue table](data/entertainment/venues.csv).

Coverage includes MCine branches, three outdoor-cinema locations, Caudan Arts Centre, Strike City, Champ de Mars, Côte d’Or athletics stadium, karting/luge listings and an explicitly flagged Anjalay motorsport planning lead. Spectator access is separate from activity participation, seating, toilets and wheelchair parking.

**These are not 16 verified accessible/open venues.** Current screening/event schedules, screen-specific wheelchair spaces, spectator routes and operating status require confirmation where flagged. Old Star cinema labels are not applied to current MCine branches. One karting listing has unresolved operation and the Anjalay record describes refurbishment planning.

## Individual shops and wheelchair parking

The [shop guide](data/shops/README.md) covers **39 branch records**, **56 observations**, **14 sources** and one historical shared parking facility. [Download shop records](data/shops/shops.csv) or [parking facilities](data/shops/parking_facilities.csv).

Shop-level labels are separate from dedicated shop bays and shared-site provision. **No dedicated shop-owned bays are confirmed in this batch.** Directory labels do not establish bay location, ownership, dimensions, availability or the continuous route to the shop. Victoria Urban Terminal's 2022 statement is a historical shared-site lead, not parking reserved for Winners.

The [shop access register](data/osm/shop_access_register.csv) makes all **2,371 mapped shop objects** filterable as 18 reported_not_accessible, 6 reported_limited, 7 mapped_accessible and 2,340 unknown. [Read the 24 branch/object barrier reports](data/shops/BARRIER_REPORTS.md). These are community map reports, not fresh inspections or whole-brand judgements.

The branch table includes 27 additional official Winners listings with unknown physical access and parking. Shop size remains unknown without evidence; supermarket, department-store, furniture, hardware and electronics filters support broader retail research.

The [2,371-shop OSM subset](data/osm/shops.csv) filters existing inventory records and does not add to the 6,965 national total. Its broad wheelchair-access values are 7 mapped_yes, 6 mapped_limited, 18 mapped_no and 2,340 unknown. Do not add overlapping curated and mapped branch counts as unique shops.

## Offices and public service counters

The [office guide](data/offices/README.md) adds **12 researched office/branch records**, **23 observations** and **8 sources**. [Download the researched offices CSV](data/offices/offices.csv).

A [separate 382-office map subset](data/osm/offices.csv) makes existing government, diplomatic, company, insurance, IT and professional-office records easier to filter. These are already part of the 6,965-place inventory, not 382 additional places. Nine have mapped wheelchair-access values; 373 remain unknown.

Accessibility levels distinguish operator-published features, historical operator information, directory labels and unknown evidence. Wheelchair parking, entrances, ramps, lifts and adapted toilets are separate fields. Office visiting permission and employee workplace accessibility are not assumed from a map label.

## Festivals and event accessibility

The [festival guide](data/festivals/README.md) adds **14 edition/component records across 12 festival series**, **24 observations** and **15 sources**, checked 12 November 2026.

[Download festival events CSV](data/festivals/events.csv). Filter by edition year, region, venue and accessibility evidence level in Power BI. Event-level entrance, wheelchair parking, drop-off, toilet, viewing area and companion-ticket fields are separate from general venue features.

This batch includes La Isla 2068, MAMA JAZ, Afric Vibes, Japanese Film Festival, Chinatown Food and Cultural Festival, Rang Barse, Awake, Mystik, Festival Internasional Kreol, Maha Shivaratree, Grand Diwali Night and Festival Seggae Zwe. Three 2025 Kreol rows describe separate venue/day components, not three festival series. Past listings are labelled separately from advertised future events.

**No festival is rated fully accessible on the available evidence.** Caudan Arts Centre's general facilities are recorded as venue-only context for the Kokuho screening. Elsewhere, wheelchair arrangements need confirmation; ordinary parking, free entry and general seating do not establish access.

Festival records and place records have different grains and must not be added as unique venue totals.

## Bulk inventory — 6,965 mapped records

[Download the large Power BI CSV](data/osm/places.csv) · [Import guide and licence](data/osm/README.md) · [Snapshot details](data/osm/import_manifest.json)

Imported **12 November 2026** from the Mauritius OpenStreetMap extract (data timestamp **2026-11-11T21:22:47Z**). It contains named shops, restaurants, accommodation, health/public services, leisure sites and offices, including Rodrigues. Every record has an OSM source link, coordinates, category and explicit access status.

| Inventory measure | Records |
| --- | ---: |
| Retained map records | 6,965 |
| Shops | 2,371 |
| Tourism objects | 987 |
| Records with any accessibility-related tag | 103 |
| Broad wheelchair-access tag: yes | 27 |
| Broad wheelchair-access tag: limited | 24 |
| Broad wheelchair-access tag: no | 49 |
| Broad wheelchair-access status: unknown | 6,865 |
| Likely duplicate candidates suppressed and logged | 106 |

**These are not 6,965 verified accessible venues.** Only explicit map tags produce mapped_yes, mapped_no or mapped_limited. Missing tags stay unknown. No individual reviews were checked for this bulk import. The 103 tagged records include description/date/parking tags; that count is not the number of accessible places.

| Region | Retained map records |
| --- | ---: |
| Central plateau and Moka | 2,311 |
| North | 1,111 |
| Port Louis | 1,069 |
| West and south-west | 898 |
| South and south-east | 667 |
| East | 424 |
| Rodrigues | 408 |
| Region unresolved | 77 |

The bulk inventory and the **35 curated places below** are separate datasets and may overlap. Do not add their counts as unique businesses. Node/area duplicates were conservatively flagged by name, type and distance; physical-venue deduplication is not guaranteed. Original tags on suppressed candidates are retained in the duplicate ledger.

© OpenStreetMap contributors. Bulk map data is available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) and distributed through [Geofabrik](https://download.geofabrik.de/africa/mauritius.html). Attribution and detailed scope are in [data/osm/README.md](data/osm/README.md). The curated review research remains separate.

## Download curated tables for Power BI

The [data folder](data/) contains **35 places**, **75 feature-level observations** and **30 sources**. It includes individual tenant branches and separates ordinary parking from wheelchair parking.

| Download | Use |
| --- | --- |
| [places.csv](data/places.csv) | Start here: one row per place, with separate entrance, wheelchair parking, toilet, ramp, lift and seating statuses |
| [accessibility_observations.csv](data/accessibility_observations.csv) | Claim-level evidence, dates, sources and scope |
| [sources.csv](data/sources.csv) | Source IDs and URLs |
| [Data dictionary and Power BI instructions](data/README.md) | Field types, joins, status definitions and update rules |

**Unknown is not no.** Directory labels, operator claims and visitor reports remain distinct. Parking bay counts and doorway widths are empty where no measurements were found. Parent mall facilities are not automatically assigned to shops.

## How to read this guide

- **Operator-reported:** the venue or its operator publishes an access statement. Specific facilities are listed only where supported.
- **Partial / barriers reported:** the operator describes restrictions, terrain problems or accessible areas within a larger site.
- **Visitor-reported:** a public review describes access; it may reflect one visit, chair or entrance. Dates and whether the original review was inspected are recorded.
- **Directory label only:** a third-party listing flags a feature; no detailed access assessment was retrieved.
- **Historical lead:** older official information worth following up; current condition is unconfirmed.
- **Unknown:** the reviewed source does not establish the feature. It does not mean inaccessible.

A step-free entrance does not establish a usable toilet, suitable transfer space, or an accessible route from the car. None of these listings guarantees independent access for every wheelchair. Confirm the details that matter for your chair and assistance needs.

## Browse by region

These are practical outing regions, not administrative district boundaries. Chamarel is grouped with the south-west; Port Louis has its own section.

| Region | Location types covered | Named places |
| --- | --- | ---: |
| [Port Louis](#port-louis) | Waterfront, culture, heritage, oceanarium, restaurant | 5 |
| [North](#north) | Museum, garden, shopping malls, historical beach leads | 7 |
| [Central plateau and Moka](#central-plateau-and-moka) | Shopping malls, restaurants, individual grocery stores | 14 |
| [East](#east) | Restaurant, historical beach lead | 2 |
| [West and south-west](#west-and-south-west) | Nature attractions, bar/restaurant | 4 |
| [South and south-east](#south-and-south-east) | Shopping mall, historical beach leads | 3 |

## Browse by location type

- **Shopping / waterfront:** [Caudan](#le-caudan-waterfront), [northern mall](#north-shopping), [central malls](#central-shopping), [south-eastern mall](#south-shopping).
- **Museums / heritage:** [Aapravasi Ghat](#aapravasi-ghat-and-interpretation-centre), [L'Aventure du Sucre](#laventure-du-sucre).
- **Arts / performances:** [Caudan Arts Centre](#caudan-arts-centre).
- **Oceanarium:** [Odysseo](#odysseo-oceanarium).
- **Nature parks / viewpoints:** [west and south-west attractions](#west-and-south-west). Each has reported limitations.
- **Beaches:** historical leads in the [north](#north-beaches), [east](#east-beaches), and [south/south-east](#south-beaches); read the [evidence limits](#beach-evidence-limits).

- **Restaurants / cafés:** [Port Louis](#port-louis-dining), [central plateau](#central-dining), [east](#east-dining), [west](#west-dining). Evidence includes barriers and unverified directory leads.
- **Gardens:** [SSR Botanic Garden](#ssr-botanic-garden).

## Port Louis

### Waterfront shopping and dining

#### Le Caudan Waterfront

**Status:** operator-reported facilities. **Source:** [S1].

- **Arrival:** the operator lists reserved parking and wheelchair facilities through its Security office, plus ramps from parking areas.
- **Vertical access:** lifts on Level 0 at Barkly Wharf, Dias Pier and l'Observatoire tower connect to upper levels.
- **Toilets:** not established by the reviewed page.
- **Contact:** +230 211 9500; ask for Security and the best arrival point.
- **Confirm:** route to your particular restaurant/shop, lift operation and toilet location. No continuous waterfront route has been independently checked for this guide.

### Arts and performances

#### Caudan Arts Centre

**Status:** operator-reported facilities. **Source:** [S2].

- **Entrance / circulation:** entrance ramp and lifts serving all floors.
- **Theatre:** wheelchair lift, dedicated seating and staff trained to assist visitors with mobility needs.
- **Arrival:** paid parking is reported.
- **Toilets:** not specified in the reviewed access statement.
- **Confirm:** wheelchair space for the specific performance, companion seating, lift availability and whether any transfer is required.
- **Contact:** use the contact form on the [operator page][S2].

### Oceanarium

#### Odysseo Oceanarium

**Status:** operator-reported access. **Source:** [S3].

- **Location:** Les Salines, Harbour Waterfront, Port Louis.
- **Access:** the operator reports barrier-free access and facilities for wheelchair users.
- **Parking:** free covered parking is listed; reserved bay dimensions and the full route to reception are unknown.
- **Toilets:** an adapted toilet is not explicitly established by the reviewed page. Baby-changing facilities are not evidence of an accessible adult toilet.
- **Contact:** +230 659 8000; oceanarium@odysseomauritius.com.
- **Confirm:** toilet layout and access to optional activities such as the VR experience.

### Heritage and museums

#### Aapravasi Ghat and Interpretation Centre

**Status:** access reported in an official factsheet; document age/current arrangements need checking. **Source:** [S4], page 2.

- **Location:** Quay Street, Port Louis.
- **Access:** the factsheet states that the World Heritage Site and Interpretation Centre, including galleries and shop, accommodate wheelchairs.
- **Toilets:** accessible toilets are explicitly reported.
- **Parking:** the factsheet says no visitor parking is available on site and suggests the Granary or Caudan. The onward pavement route has not been verified here.
- **Contact:** +230 217 7770, as listed in the factsheet; confirm the current contact and closest drop-off.
- **Confirm:** the step-free entrance, route around the historic site and current toilet condition.

<a id="port-louis-dining"></a>
### Restaurants — directory lead

#### Wapalapam La Place

**Location:** 6 Sir William Newton Street, Port Louis. **Status:** directory label only. **Source:** [S15].

The listing flags a wheelchair-accessible entrance, toilet, seating and parking. No access-specific visitor review was retrieved; these labels do not establish dimensions or a continuous route. Confirm the drop-off and parking arrangement, especially given the street location. **Contact:** +230 5852 2902. The listing displays an update date of 29 November 2025, not an inspection date.

## North

### Museums

#### L'Aventure du Sucre

**Status:** partial access reported by the operator. **Sources:** [S5], [S6].

- **Location:** Beau Plan, Pamplemousses.
- **Access:** the operator says most of the museum is adapted for people with reduced mobility; this is not a whole-site guarantee.
- **Equipment:** a loan wheelchair is available on request.
- **Toilets / parking access:** not established by the reviewed practical-information page.
- **Contact:** +230 243 7900; administration@aventuredusucre.com.
- **Confirm:** which exhibits are excluded, accessible toilet details and the route to any restaurant you intend to use.

### Gardens — conflicting evidence

#### SSR Botanic Garden

**Location:** Pamplemousses. **Status:** visitor-reported barriers; current workable route unresolved. **Source:** [S16].

A Tripadvisor review dated **February 2026**, displayed in translation, reports that the visitor could not complete the visit because access arrangements/equipment were unsuitable or deteriorated and assistance was not provided. This is one visitor's account, not a whole-site audit. Ask the garden to confirm the current wheelchair route, surface, equipment operation, toilets and assistance before travelling. A botanical garden's broad paths or generic accessibility label do not settle these questions.

<a id="north-shopping"></a>
### Shopping malls

| Place | Locality | Access evidence |
| --- | --- | --- |
| Riche Terre Mall | Riche Terre | Operator's general wheelchair-access claim [S7] |

#### Grand Baie La Croisette

**Location:** Twenty-Foot Road, Grand Baie. **Status:** directory label only. **Source:** [S17].

The listing flags a wheelchair-accessible entrance, restroom and parking. No access-specific visitor review was retrieved. Confirm the particular tenant, toilet layout, parking route and any required lift. **Contact:** +230 209 2000. The page displays 19 August 2026 as its update date; this is not a facility inspection.

See [mall evidence limits](#mall-evidence-limits) for the limits of Riche Terre's operator claim.

<a id="north-beaches"></a>
### Beaches — historical leads

| Place | Evidence |
| --- | --- |
| Mont Choisy | Historical route report [S13] |
| La Cuvette | Historical route report [S13] |
| Bain Boeuf | Historical route report [S13] |

Read the [beach evidence limits](#beach-evidence-limits) before planning a visit.

## Central plateau and Moka

<a id="central-shopping"></a>
### Shopping malls

| Place | Locality | Access evidence |
| --- | --- | --- |
| Bagatelle Mall | Moka | Operator's general wheelchair-access claim [S7] |
| Phoenix Mall | Phoenix | Operator's general wheelchair-access claim [S7] |
| So'flo | Floréal | Operator's general wheelchair-access claim [S7] |
| Kendra | St Pierre | Operator's general wheelchair-access claim [S7] |
| Les Allées | Moka | Operator's general wheelchair-access claim [S7] |

#### Tribeca Mall and individual stores

**Location:** Trianon. The operator reports general surface/underground parking, but the reviewed page does not specify designated wheelchair bays or their dimensions. General welcoming/accessibility wording is not a detailed wheelchair assessment. **Source:** [S29].

| Individual store / branch | Parent mall | Category | Branch identity evidence | Tenant entrance, wheelchair parking and toilet |
| --- | --- | --- | --- | --- |
| Intermart — Bagatelle | Bagatelle Mall | Supermarket | Operator identity [S27]; branch labels [S30] | Entrance, toilet and parking directory labels; ownership and route unresolved |
| Food Lover's Market — Bagatelle | Bagatelle Mall | Supermarket | Operator key tenants [S27] | Unknown at tenant level |
| Votre Pote Age — Bagatelle | Bagatelle Mall | Grocery store | Operator key tenants [S27] | Unknown at tenant level |
| Winners — Tribeca | Tribeca Mall | Supermarket | Official branch page [S28]; +230 202 0700 | Unknown at tenant level |

These are individual branch records, not accessible recommendations. Intermart Bagatelle now has branch-specific directory evidence [S30], detailed in the [shop dataset](data/shops/README.md). Shared mall facilities can be researched through the parent link. Col'Cacchio also has its own restaurant row linked to Tribeca in the CSV.

#### Ebene Commercial Centre

**Location:** Ebene. **Status:** directory label only. **Source:** [S18].

The retrieved listing flags wheelchair-accessible entrance, restroom and parking. No dated access-specific review was available in the retrieved page. Toilet layout, step-free route and lift operation remain unverified; ask about these rather than relying on the labels.

See [mall evidence limits](#mall-evidence-limits) for the five Ascencia malls above.

<a id="central-dining"></a>
### Restaurants — reviews and directory leads

#### Food Republic

**Location:** Remy Ollier Avenue, Quatre Bornes. **Status:** visitor-reported barriers, checked directly on Google Maps. **Sources:** [S19], [S20]; mirrored dates [S21].

- One reviewer describes an entrance step that makes wheelchair entry difficult. A second reports no wheelchair access, no adapted toilet and no lift/ramp; designated wheelchair parking was uncertain.
- Both original Google reviews were opened and inspected on **12 November 2026**. Google displayed **“a year ago”**. Wanderlog displays **4 November 2025** and **8 March 2025**, respectively; these exact dates are mirror metadata, not independently confirmed original timestamps.
- Ordinary parking and a clean toilet do not establish wheelchair parking or an adapted toilet. Confirm whether a step-free alternative has since been installed.
- **Contact:** +230 463 9898. The original Google place details establish Quatre Bornes; the mirror's Port Louis categorisation should not be used for navigation.

#### Gourmet Avenue

**Location:** Subramanien Bharati Road, Beau Bassin–Rose Hill. **Status:** conditional visitor report via a review mirror. **Source:** [S22].

A Google-attributed review says wheelchair access might be workable, while wheelchair parking and adapted toilet provision are uncertain. The listing also flags accessible seating, which does not establish entrance or toilet access. The review's date was not established; the page's **31 January 2026** update date is separate. The original Google review was not independently inspected. **Contact:** +230 5804 0687. Ask for entrance and toilet photographs.

#### Col’Cacchio — Tribeca Mall

**Location:** Shop A76, Tribeca Mall, Trianon. **Status:** directory label only. **Source:** [S23].

Restaurant Guru flags wheelchair accessibility without describing the route or toilet. No access-specific visitor account was retrieved. Confirm restaurant seating/entrance and the usable mall toilet separately. **Contact:** +230 471 3178.

## East

<a id="east-beaches"></a>
### Beaches — historical leads

| Place | Evidence |
| --- | --- |
| Belle Mare | Historical route report [S13] |

Read the [beach evidence limits](#beach-evidence-limits). Further research is needed for other eastern venues.

<a id="east-dining"></a>
### Restaurants — directory lead

#### Symon's Restaurant

**Location:** Coastal Road, Poste de Flacq; the directory groups it under Belle Mare. **Status:** directory label only. **Source:** [S24].

The listing flags an accessible entrance, toilet, seating and parking. No access-specific visitor review was retrieved. A general review praising toilet cleanliness is not evidence of wheelchair toilet suitability. **Contact:** +230 415 1135. Page update shown: 15 January 2026; facility inspection date unknown.

## West and south-west

### Nature parks and viewpoints — partial access or barriers

#### Ebony Forest

**Area:** Chamarel. **Status:** partial access reported. **Source:** [S8].

- The operator identifies the shop, museum, ecology centre and toilets as accessible to wheelchair users.
- Mountain slopes limit access to trails and the raised walkway. The reviewed tour page describes substantial stair sections; an “easy” hiking grade does not mean step-free.
- Parking is reported, but its wheelchair route is unspecified.
- **Confirm before booking:** precisely which areas you can reach, any jeep transfer, assistance and toilet layout. Do not assume access to the viewpoint or a tour because the visitor facilities are accessible.
- **Contact:** the [operator's linked contact page][S8].

#### Casela Nature Parks

**Area:** Cascavelle. **Status:** terrain barriers reported. **Source:** [S9].

- The operator warns that rough terrain can make some areas difficult for wheelchair users and says staff can assist where possible.
- The FAQ does not establish wheelchair boarding for shuttles or access to every activity.
- **Toilets / parking:** adapted toilet layout and reserved parking access are unknown from this source.
- **Confirm:** a workable route for your chosen activities, transfer requirements and the availability of assistance.
- **Contact:** +230 401 6500; booking@caselaparks.com.

#### Chamarel 7 Coloured Earth Geopark

**Area:** Chamarel. **Status:** path barriers reported. **Source:** [S10].

- The operator says basalt-rock paths can be challenging for people with reduced mobility and mentions access improvements in progress. No completion date is established here.
- **Toilets / independent circuit:** unknown.
- **Confirm:** current path surface, slopes, viewing areas and the nearest usable drop-off before purchasing tickets.
- **Contact:** +230 483 4298; info@chamarel7colouredearth.com. [S11]
- **Separate activity:** the operator explicitly says its Coffee Plantation Experience is not accessible to visitors with reduced mobility because of uneven paths and physical barriers. Do not treat this as included in a general Geopark access claim. [S12]

<a id="west-dining"></a>
### Bars and restaurants — conflicting / incomplete evidence

#### Saphire Bar & Resto

**Location:** Flic en Flac, plus code P9C9+5CJ. **Status:** directory label conflicts with an indexed visitor report. **Sources:** [S25], [S26].

The English directory page flags wheelchair accessibility. A search-indexed review excerpt on its Spanish version describes ground-floor areas but steps into the main bar. The full review and its date were not retrieved; treat this as a **provisional barrier lead**, not a verified current assessment. Ask which seating areas have a continuous step-free route and whether an adapted toilet exists. **Contact:** +230 5705 1387.

## South and south-east

<a id="south-shopping"></a>
### Shopping malls

| Place | Locality | Access evidence |
| --- | --- | --- |
| Bo'Valon Mall | Mahébourg area | Operator's general wheelchair-access claim [S7] |

See [mall evidence limits](#mall-evidence-limits).

<a id="south-beaches"></a>
### Beaches — historical leads

| Place | Evidence |
| --- | --- |
| Saint Félix / St Felix | Historical route report [S13] |
| Blue Bay | Historical route report [S13] |

Read the [beach evidence limits](#beach-evidence-limits).

## Mall evidence limits

Ascencia's article dated 19 March 2025 reports parking and wheelchair access across its seven listed malls. It does not establish toilet layouts, ramp gradients, or routes through individual tenants. Treat these as broad operator claims, not detailed assessments. Use the mall links in the [operator article][S7] to ask about your chosen entrance, parking and toilets.

## Beach evidence limits

The official statement on **19 April 2022** reports routes from parking to the frontage at the six listed beaches. This is historical information, not a current inspection. Usable toilets at each named beach, sand/sea access, equipment and present condition remain unknown. [S13]

The government [public beach access map][S14] locates public access points; it is not wheelchair certification. Reconfirm the specific route and facilities before travel.

## What to ask before an outing

1. Which entrance and drop-off give a continuous step-free route?
2. Is the ramp manageable, and are all required lifts operating?
3. Is there an accessible toilet? Ask for door width, turning/transfer space, grab rails and a current photo.
4. Can I remain in my chair throughout, including in shuttles or theatre seating?
5. If help is needed, what assistance is actually available, and must it be arranged?

For outdoor locations, ask about the current surface after rain or works. Contact links are provided for you to use; no venues have been contacted for this guide.

## Sources and research record

All sources below were consulted on **2026-11-12**. “Undated” means no reliable publication/update date was established from the reviewed page. Retrieval dates and search-engine crawl dates are not inspection dates. Read the linked primary source for the full context.

| ID | Publisher / document | Source age or scope |
| --- | --- | --- |
| S1 | [Le Caudan Waterfront — Services][S1] | Operator; undated; parking/access section |
| S2 | [Caudan Arts Centre — About us][S2] | Operator; undated; wheelchair access section |
| S3 | [Odysseo — Plan your visit][S3] | Operator; undated; access/arrival sections |
| S4 | [Aapravasi Ghat official factsheet, PDF][S4] | Official factsheet, page 2; publication date uncertain; older document |
| S5 | [L'Aventure du Sucre — Practical information][S5] | Operator; undated; reduced-mobility section |
| S6 | [L'Aventure du Sucre — Contact us][S6] | Operator; contact/address |
| S7 | [Ascencia — Commercial-space article][S7] | Operator; 19 March 2025; facilities across portfolio |
| S8 | [Ebony Forest — Sublime Sundowner][S8] | Operator; undated; suitability and facilities |
| S9 | [Casela — Frequently Asked Questions][S9] | Operator; undated; stroller/wheelchair question |
| S10 | [Chamarel 7 Coloured Earth — FAQ][S10] | Operator; undated; accessibility question |
| S11 | [Chamarel 7 Coloured Earth — Contact us][S11] | Operator; contact/address |
| S12 | [Chamarel — Coffee Plantation Experience][S12] | Operator; undated; mobility exclusion |
| S13 | [Mauritius National Assembly — Hansard, 19 April 2022][S13] | Historical official beach-access statement; search PDF for “Mont Choisy” |
| S14 | [Ministry of Housing — Public beach and Access to the Sea][S14] | Official public-access map; not wheelchair certification |
| S15 | [Wapalapam La Place — Top-Rated.online][S15] | Directory flags; no access-specific review retrieved |
| S16 | [SSR Botanic Garden — Tripadvisor reviews][S16] | Visitor account, February 2026; displayed translation |
| S17 | [La Croisette — Top-Rated.online][S17] | Directory flags; page update 19 August 2026 |
| S18 | [Ebene Commercial Centre — Top-Rated.online][S18] | Directory flags; access-review date unknown |
| S19 | [Food Republic — original Google Maps review (entrance step)][S19] | Directly inspected; Google displays a year ago |
| S20 | [Food Republic — original Google Maps review (facility checklist)][S20] | Directly inspected; Google displays a year ago |
| S21 | [Food Republic — Wanderlog mirror][S21] | Mirror review dates; geographic categorisation corrected using Google |
| S22 | [Gourmet Avenue — Top-Rated.online][S22] | Google-attributed conditional review; review date unknown |
| S23 | [Col’Cacchio Tribeca Mall — Restaurant Guru][S23] | Generic directory accessibility label only |
| S24 | [Symon's Restaurant — Top-Rated.online][S24] | Directory flags; page update 15 January 2026 |
| S25 | [Saphire Bar & Resto — Restaurant Guru (English)][S25] | Generic directory label; full barrier review not retrieved |
| S26 | [Saphire Bar & Resto — Restaurant Guru (Spanish)][S26] | Search-index excerpt only; review date unknown |
| S27 | [Ascencia — Bagatelle key tenants][S27] | Operator directory; tenant identities only |
| S28 | [Tribeca — Winners branch][S28] | Operator branch page; identity/contact only |
| S29 | [Tribeca — About us][S29] | Operator; general parking, no designated wheelchair-bay detail |
| S30 | [Intermart Bagatelle — branch directory][S30] | Entrance, toilet and parking labels; ownership and route unverified |

### Method and gaps

Public pages and PDF text were located through web searches and extracted for their accessibility statements. The guide paraphrases relevant facts rather than mirroring websites. Operator and government sources were preferred over generic travel lists. A broad “accessible” claim is not converted into invented measurements or toilet details. Public visitor reviews and third-party accessibility labels were also checked. Two original Food Republic reviews and its address were inspected directly on Google Maps; other Google-attributed reviews are mirrors unless explicitly stated otherwise. No bulk Maps dataset was imported, and no field inspections or telephone checks were performed. Relative review dates are preserved as displayed; directory update dates are not treated as visit dates. Search-index-only evidence is explicitly provisional.

This edition covers **35 named places**, grouped by region and location type, including a mall and four individual grocery branches added for structured analysis. Some entries are directory-only leads, identity-only tenant records or reported barriers, not accessible recommendations. It is not a complete directory of Mauritius. Hotels, transport operators, Rodrigues and many individual tenants still need research. The coffee plantation is an exclusion note, not an accessible recommendation.

### Corrections

For an update, provide the venue, a public source or dated first-hand observation, the exact entrance/route, relevant measurements and any conditions. Record observation dates separately from web-check dates. Avoid including a visitor's medical details or private contact information in public contributions. Preserve contradictory reports and explain what is uncertain instead of silently upgrading an access claim.

[S1]: https://caudan.com/service/
[S2]: https://caudan.com/caudan-arts-centre/cac-about-us/
[S3]: https://odysseomauritius.com/plan-your-visit/
[S4]: https://aapravasi.govmu.org/aapravasi/wp-content/uploads/2020/09/Factsheet-Aapravasi-Ghat-World-Heritage-Site.pdf
[S5]: https://aventuredusucre.com/practical-information/
[S6]: https://aventuredusucre.com/contact-us/
[S7]: https://www.ascenciacorporate.com/newsroom/news/why-rent-a-commercial-space-at-ascencia
[S8]: https://www.ebonyforest.com/visit-ebony/sublime-sundowner/
[S9]: https://caselaparks.com/frequently-asked-questions/
[S10]: https://chamarel7colouredearth.com/faqs/
[S11]: https://chamarel7colouredearth.com/contact-us/
[S12]: https://chamarel7colouredearth.com/experiences/coffee-plantation-mauritius/
[S13]: https://mauritiusassembly.govmu.org/mauritiusassembly/index.php/download/33/2022/13275/debate-no-04-of-2022-tuesday-19-april-2022.pdf
[S14]: https://housing.govmu.org/Pages/Public-beach-and-Access-to-the-Sea.aspx

[S15]: https://www.top-rated.online/cities/Port%2BLouis/place/p/8623336/Wapalapam%2BLa%2BPlace
[S16]: https://www.tripadvisor.co.uk/Attraction_Review-g804550-d2020531-Reviews-or30-SSR_Botanic_Garden-Pamplemousses.html
[S17]: https://www.top-rated.online/cities/Upper%2BVale/place/p/2538926/La%2BCroisette
[S18]: https://www.top-rated.online/cities/Quatre%2BBornes/place/p/2538879/Ebene%2BCommercial%2BCentre
[S19]: https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2tSRlZsWkNNakV0YjBWYWVtUmZaRWwyU1hCWFpYYxAB!2m1!1s0x217c5b166ebf5e83:0x4487a55210214edb!3m1!1s2
[S20]: https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChZDSUhNMG9nS0VJQ0FnTURRbUlQaldnEAE!2m1!1s0x217c5b166ebf5e83:0x4487a55210214edb!3m1!1s2
[S21]: https://wanderlog.com/place/details/10770993/food-republic
[S22]: https://www.top-rated.online/cities/Beau%2BBassin-Rose%2BHill/place/p/2539383/Gourmet%2BAvenue
[S23]: https://restaurantguru.com/ColCacchio-Tribeca-Mall-Quatre-Bornes
[S24]: https://www.top-rated.online/cities/Belle%2BMare/place/p/2842160/Symon%27s%2BRestaurant
[S25]: https://restaurantguru.com/Saphire-Bar-and-Resto-Flic-en-Flac
[S26]: https://es.restaurantguru.com/Saphire-Bar-and-Resto-Flic-en-Flac

[S27]: https://www.ascenciacorporate.com/malls/bagatelle-mall
[S28]: https://tribecamall.mu/stores/winners-tribeca/
[S29]: https://tribecamall.mu/about-us/

[S30]: https://www.top-rated.online/cities/Moka/place/p/9304501/Intermart%2BBagatelle
