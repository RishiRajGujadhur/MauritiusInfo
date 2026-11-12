# Offices in Mauritius — wheelchair accessibility

Checked **12 November 2026**. This batch has **12 researched office records, 23 scoped observations and 8 sources**. The separate [OSM office subset](../osm/offices.csv) contains **382 mapped records already present in the 6,965-place inventory**, not 382 new places.

## Accessibility levels

| Level | Meaning |
| --- | --- |
| operator_features_reported | Specific office facilities published by the operator; independent access not guaranteed. |
| historical_operator_features | Specific facilities in an older operator report; current condition unresolved. |
| directory_labels_only | Third-party labels without a detailed inspection or verified accessibility review. |
| unknown | No adequate physical access evidence retrieved; does not mean inaccessible. |

Levels describe evidence, not a best-to-worst score or legal certification. An entrance ramp alone does not establish a usable toilet, reserved parking or access to the required service floor. All records are desk research, field_verified=false and review_checked=false.

## Researched office records

| Office | Locality | Evidence level | Entrance / ramp | Wheelchair parking | Adapted toilet |
| --- | --- | --- | --- | --- | --- |
| [British High Commission Port Louis](https://www.gov.uk/world/organisations/british-high-commission-port-louis/office/british-high-commission-port-louis) | Floreal | operator_features_reported | operator_reported_yes | unknown | operator_reported_yes |
| [Road Development Authority - Helvetia sub-office](https://rda.govmu.org/rda/?p=7220) | Helvetia, Moka | historical_operator_features | historical_reported_yes | unknown | unknown |
| [Concentrix Mauritius Ltd - The Cube](https://www.top-rated.online/cities/Quatre%2BBornes/place/p/9077194/Concentrix%2BMauritius%2BLtd) | Ebene | directory_labels_only | listed_yes | listed_yes | listed_yes |
| [DHL Mauritius - Import Office](https://loop.mu/services/listings/dhl-mauritius-import-office-ltd) | Plaine Magnien | directory_labels_only | listed_yes | listed_yes | unknown |
| [Mauritius International Arbitration Centre](https://loop.mu/services/listings/mauritius-international-arbitration-centre-miac) | Port Louis | directory_labels_only | listed_yes | listed_yes | unknown |
| [Mauritius Sports Council - Belle Rose office](https://loop.mu/services/listings/mauritius-sports-council) | Belle Rose, Quatre Bornes | directory_labels_only | listed_yes | listed_yes | listed_yes |
| [Registrar of Companies Division](https://www.cybo.com/MU-biz/registrar-of-companies-division) | Port Louis | directory_labels_only | unknown | unknown | unknown |
| [Disability Empowerment Unit](https://govmu.org/EN/Pages/Contact.aspx) | Port Louis | unknown | unknown | unknown | unknown |
| [National Land Transport Authority - Les Cassis office](https://govmu.org/EN/Pages/Contact.aspx) | Les Cassis, Port Louis | unknown | unknown | unknown | unknown |
| [Office of the Electoral Commissioner](https://govmu.org/EN/Pages/Contact.aspx) | Port Louis | unknown | unknown | unknown | unknown |
| [Employment Division - Work Permit Unit](https://govmu.org/EN/Pages/Contact.aspx) | Port Louis | unknown | unknown | unknown | unknown |
| [Office of the Ombudsman](https://govmu.org/EN/Pages/Contact.aspx) | Port Louis | unknown | unknown | unknown | unknown |

## Practical findings

- **British High Commission:** the office's name includes Port Louis, but its published physical access point is in Floreal. It reports entrance ramps and an adapted ground-floor toilet. Appointment and evacuation arrangements need discussing; the page describes on-foot evacuation without specialist equipment.
- **RDA, Helvetia:** a 2023 inauguration report identifies a ramp and ordinary parking. This remains historical evidence; no wheelchair-bay or adapted-toilet claim is inferred.
- **Concentrix:** labels relate to the listed Cube Building office, not every branch or a verified employee workspace assessment.
- **DHL, MIAC and Sports Council:** directory labels are useful leads. MIAC's ordinary toilet label is not treated as an adapted toilet, and a listed entrance does not establish the route to an upper-floor office.
- **Registrar of Companies:** a broad wheelchair-access label is retained without inventing feature-level details.
- **Other government service offices:** official contact listings establish identity and location only. A disability-related service, building regulation or tender specification is not proof of completed physical access.

No employer, government office or visitor was contacted. No office accessibility reviews were independently inspected for this batch. Confirm addresses and service counters before travelling, especially where a directory may be outdated.

## Power BI downloads

| File | Grain | Key |
| --- | --- | --- |
| [offices.csv](offices.csv) | One researched branch or office | office_id |
| [accessibility_observations.csv](accessibility_observations.csv) | One source claim or scoped research gap | observation_id |
| [sources.csv](sources.csv) | One source page | source_id |
| [OSM offices.csv](../osm/offices.csv) | Filtered mapped office object; same IDs as bulk inventory | record_id |

For the researched data, join offices[office_id] (1) to accessibility_observations[office_id] (*) and sources[source_id] (1) to accessibility_observations[source_id] (*), single-direction. Use a separate source query for identity metadata if required; do not create an ambiguous active filter path through identity_source_id.

Import UTF-8 comma-delimited files. Set last_web_check, checked_date and nullable source_date to Date; field_verified/review_checked to True/False; other researched fields to Text. Empty source dates mean undated/unknown, not the retrieval date. RDA source_date is the reported inauguration date.

Filter office_type, region and accessibility_level. Feature statuses are unknown, operator_reported_yes, historical_reported_yes or listed_yes. listed_yes in step_free_entrance means only an accessible-entrance directory label, not a measured step-free route. No office in this batch is certified fully accessible.

## Field dictionary

| Fields | Meaning |
| --- | --- |
| office_id | Stable office/branch key. Preserve when updating names or addresses. |
| office_name, office_type | Specific branch and government/diplomatic/private_company/logistics/professional_services/public_body category. |
| locality, region, address | Published location, with practical outing region. Uncertainty remains in notes. |
| identity_source_id | Source for identity/location; access claims have their own observation source IDs. |
| accessibility_level | Evidence category above; not a numerical score. |
| wheelchair_access | Broad claim only; does not automatically set specific features. |
| step_free_entrance, wheelchair_parking, general_parking, wheelchair_toilet, ramp, lift, wheelchair_seating | Separately supported feature statuses. Ordinary parking is distinct from wheelchair bays. |
| public_visit_policy | appointment_required only where stated; otherwise unknown. Company-office listings do not imply walk-in permission. |
| access_scope | visitor_access. Employee desks, workstations and employment accommodations are not assessed. |
| contact_url | Public source/listing for follow-up. |
| last_web_check, field_verified, review_checked | Retrieval date and verification flags, not a field visit. |
| notes, questions_to_confirm | Limits and specific questions before visiting. |

Observation columns: observation_id, office_id, feature, status, source_id, scope, source_date, checked_date and summary. Extra observations record appointment/evacuation arrangements without misclassifying them as entrance features. An unknown observation is a research gap, not a source claiming access is absent.

## Existing OSM office coverage

The filtered map table includes government, diplomatic, company, insurance, IT, professional and other office tags. It preserves original subtypes, coordinates, OSM links, raw access tags and evidence flags. Some map labels may describe a mixed-use service location; the subset is not a verified workplace register.

| Broad wheelchair_access status | Office records |
| --- | ---: |
| mapped_yes | 1 |
| mapped_limited | 3 |
| mapped_no | 5 |
| unknown | 373 |
| Total | 382 |

All nine non-unknown statuses are community map statements about specific objects/branches, not an assessment of a whole organisation. The researched and mapped office tables may overlap; they have not been reconciled. Do not sum 12 + 382 as unique offices, or add the 382 subset back to the national inventory. No new OSM download was performed for this subset.

The subset preserves the existing 2026-11-12 import and 2026-11-11T21:22:47Z source timestamp. Its source places.csv Git blob SHA is 23c0b915dd2cca591268fce8b4b6eed79b05f352. It is generated by filtering category=office, without assigning nearby mall or building facilities to a tenant. See the [OSM methodology and licence](../osm/README.md). © OpenStreetMap contributors; the OSM subset is available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

Use scripts/export_offices.py to regenerate the subset from data/osm/places.csv. Keep the curated office research separate; it is not an automatic reclassification of OSM tags.
