import { status, safeURL } from './data-core.mjs';

export const NEEDS = [
  { id: 'access', field: 'wheelchair_access', label: 'Wheelchair access' },
  { id: 'entrance', field: 'step_free_entrance', label: 'Step-free entrance' },
  { id: 'parking', field: 'wheelchair_parking', label: 'Wheelchair parking' },
  { id: 'toilet', field: 'wheelchair_toilet', label: 'Adapted toilet' },
];
export function validNeeds(values) { return [...new Set(values)].filter(id => NEEDS.some(need => need.id === id)); }
export function matchesNeeds(record, needs) {
  return validNeeds(needs).every(id => status(record.raw[NEEDS.find(need => need.id === id).field]).group === 'positive');
}
export function coordinates(record) {
  const { latitude, longitude } = record.raw;
  if (latitude == null || longitude == null || String(latitude).trim() === '' || String(longitude).trim() === '') return null;
  const lat = Number(latitude), lon = Number(longitude);
  // Mauritius, Rodrigues and outer islands. Never turn missing coordinates into 0,0.
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -21 && lat <= -9 && lon >= 55 && lon <= 65 ? [lat, lon] : null;
}
const EVIDENCE = {
  onsite: ['On-site check', 'An on-site check is explicitly recorded in the dataset. Check its date and scope.'],
  map: ['Map tag', 'An OpenStreetMap contributor recorded an accessibility tag. This is not an independent inspection.'],
  visitor: ['Visitor review', 'A visitor review is cited for an accessibility observation. Its date and scope may vary.'],
  venue: ['Venue statement', 'The operator states a facility is available. This is not an independent inspection.'],
  official: ['Official statement', 'A government source is cited for an accessibility observation. Check its date and scope.'],
  directory: ['Directory label', 'A directory labels a facility. The label has not been independently checked.'],
  web: ['Web excerpt', 'The record cites a search excerpt rather than a checked original review.'],
  research: ['Published report', 'An accessibility observation is cited. Review the original source and its scope.'],
  listing: ['Listing only', 'The place is listed, but there is no cited accessibility observation in this record.'],
};
export function attachEvidence(record, observations = [], sources = []) {
  const sourceById = new Map(sources.map(source => [source.source_id, source]));
  const kinds = new Set();
  if (record.raw.field_verified === 'true') kinds.add('onsite');
  if (record.dataset.id === 'osm' && record.raw.has_accessibility_tag === 'true') kinds.add('map');
  const details = observations.filter(row => String(row.place_id || row.shop_id || row.service_id || row.office_id || row.venue_id || row.record_id) === String(record.id)).map(row => {
    const source = sourceById.get(row.source_id);
    const type = row.evidence_type || source?.evidence_type || source?.source_type || '';
    // Identity-only sources are not evidence of wheelchair access.
    if (!/identity/.test(type)) {
      if (/visitor_review/.test(type)) kinds.add('visitor');
      else if (/search_index/.test(type)) kinds.add('web');
      else if (/government/.test(type)) kinds.add('official');
      else if (/operator|organizer|venue_operator/.test(type)) kinds.add('venue');
      else if (/directory/.test(type)) kinds.add('directory');
      else if (row.status && row.status !== 'unknown') kinds.add('research');
    }
    return { feature: row.feature, status: row.status, summary: row.summary, scope: row.scope, date: row.source_date || source?.source_date || row.checked_date || source?.checked_date, title: source?.title, url: safeURL(source?.url), type };
  });
  if (!kinds.size) kinds.add('listing');
  return { ...record, evidence: [...kinds].map(id => ({ id, label: EVIDENCE[id][0], description: EVIDENCE[id][1] })), observations: details };
}
export function readSaved(value) {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? [...new Set(parsed.filter(key => typeof key === 'string' && key.length < 200))].slice(0, 10000) : []; } catch { return []; }
}
export function buildReport(record, form, siteURL) {
  const feature = {access:'Wheelchair access',entrance:'Step-free entrance',parking:'Wheelchair parking',toilet:'Adapted toilet',other:'Other detail'}[form.feature] || 'Other detail';
  const basis = {visit:'Personal visit',venue:'Contact with venue',web:'Online source'}[form.basis] || 'Not specified';
  const link = new URL(siteURL); link.search = ''; link.hash = ''; link.searchParams.set('record', record.key);
  const body = `## Place\n${record.name}\nRecord: ${record.key}\nDataset: ${record.dataset.name}\n${link.href}\n\n## Proposed update\nFeature: ${feature}\nReported status: ${form.status}\nEvidence: ${basis}\nVisit / contact / source date: ${form.date || 'Not supplied'}\nSource: ${safeURL(form.source) || 'Not supplied'}\n\n## Details\n${form.notes.trim()}\n\n---\nSubmitted for review. This report has not yet changed the published data.`;
  const url = new URL('https://github.com/RishiRajGujadhur/MauritiusInfo/issues/new');
  url.searchParams.set('title', `[Access update] ${record.name}`.slice(0, 160)); url.searchParams.set('body', body);
  return { body, url: url.href };
}
