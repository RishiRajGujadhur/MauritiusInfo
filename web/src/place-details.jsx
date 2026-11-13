import React, { useState } from 'react';
import { Button, Dialog, IconButton, Link, Tabs, Tooltip } from '@radix-ui/themes';
import { AccessibilityIcon, AngleIcon, ArrowRightIcon, CalendarIcon, CheckCircledIcon, CopyIcon, Cross2Icon, DashboardIcon, DrawingPinIcon, EnterIcon, ExternalLinkIcon, HeightIcon, InfoCircledIcon, LayersIcon, MobileIcon, PersonIcon, RowsIcon, BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { humanize, safeURL } from '../../data-core.mjs';
import ReportUpdate from './report-update';
import { ReportBadge, EvidenceLabels } from './ui';
import { getCategoryIcon } from './category-icons';

function readableDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function PlaceDetails({ record, onClose, triggerRef, saved, onToggleSave }) {
  const row = record.raw;
  const CategoryIcon = getCategoryIcon(record.category);
  const [copyState, setCopyState] = useState('Copy link');
  const features = [
    ['Wheelchair access', AccessibilityIcon, row.wheelchair_access],
    ['Step-free entrance', EnterIcon, row.step_free_entrance],
    ['Wheelchair parking', DashboardIcon, row.wheelchair_parking],
    ['Adapted toilet', PersonIcon, row.wheelchair_toilet],
    ['Lift', HeightIcon, row.lift],
    ['Ramp', AngleIcon, row.ramp],
    ['Wheelchair seating', RowsIcon, row.wheelchair_seating],
    ['Parking route', ArrowRightIcon, row.parking_to_entrance_route || row.parking_to_shop_route || row.parking_to_venue_route],
  ];
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  const hasCoordinates = row.latitude && row.longitude && Number.isFinite(latitude) && Number.isFinite(longitude);
  const sourceURL = safeURL(row.source_url || row.contact_url || row.contact_or_booking_url);
  const phone = row.phone || row.phone_international_digits || '';
  const phoneDigits = String(phone).replace(/[\s()-]/g, '');
  const phoneURL = /^\+?\d{7,12}$/.test(phoneDigits) ? `tel:${phoneDigits.startsWith('+') ? phoneDigits : '+' + (phoneDigits.length <= 8 ? '230' : '') + phoneDigits}` : null;
  const date = row.source_snapshot || row.last_web_check || row.retrieved_date;
  const status = row.listing_status || row.listing_status_as_of_check;
  const location = [record.area === 'Not Stated' ? '' : record.area, record.address].filter(Boolean).join(' · ') || 'Location details unavailable';

  async function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.set('record', record.key);
    try { await navigator.clipboard.writeText(url.href); setCopyState('Copied'); }
    catch { setCopyState('Copy unavailable'); }
  }

  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Content maxWidth="650px" className="place-dialog" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
      <div className="detail-header"><div className="dialog-heading"><div className="place-title-icon"><CategoryIcon width="21" height="21" aria-hidden="true" /></div><div><Dialog.Title>{record.name}</Dialog.Title><Dialog.Description className="detail-location">{location}</Dialog.Description></div><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close details"><Cross2Icon /></IconButton></Dialog.Close></div>
      <div className="detail-subtitle"><LayersIcon />{record.dataset.name}<span>·</span>{record.type || record.category}</div><EvidenceLabels record={record} /></div>
      <Tabs.Root defaultValue="access"><Tabs.List aria-label="Place information"><Tabs.Trigger value="access"><AccessibilityIcon />Access</Tabs.Trigger><Tabs.Trigger value="details"><InfoCircledIcon />Details & source</Tabs.Trigger></Tabs.List>
        <Tabs.Content value="access"><dl className="features">{features.map(([label, Icon, value]) => <div key={label}><dt><Icon />{label}</dt><dd><ReportBadge value={value} /></dd></div>)}</dl><p className="access-note"><InfoCircledIcon />Confirm the facilities you need with the venue. Unknown means no details are available.</p><div className="detail-facts"><Tooltip content={date || 'Source date unavailable'}><span><CalendarIcon />{readableDate(date)}</span></Tooltip><span><CheckCircledIcon />{row.field_verified === 'true' ? 'On-site check recorded' : 'On-site check unknown'}</span></div>{status && <p className="listing-status"><InfoCircledIcon />{humanize(status)}</p>}</Tabs.Content>
        <Tabs.Content value="details"><div className="source-notes"><h2>Evidence</h2>{record.evidenceIncomplete && <p>Some evidence tables did not load. Retry loading the sources.</p>}{record.evidence?.map(item => <p key={item.id}><strong>{item.label}</strong> · {item.description}</p>)}{record.observations?.length > 0 && <details className="evidence-observations"><summary>View {record.observations.length} cited observations</summary>{record.observations.map((observation,index) => <article key={index}><strong>{humanize(observation.feature)} · {humanize(observation.status)}</strong><p>{observation.summary}</p>{observation.scope && <p>Scope · {observation.scope}</p>}<p>Date · {observation.date || 'Not supplied'}</p>{observation.url && <Link href={observation.url} target="_blank" rel="noopener noreferrer">{observation.title || 'Original source'}<ExternalLinkIcon /></Link>}</article>)}</details>}{row.notes && <p>{row.notes}</p>}{row.quality_note && <p>{row.quality_note}</p>}{row.questions_to_confirm && <p><strong>Ask the venue</strong><br />{row.questions_to_confirm}</p>}{phone && <p><MobileIcon />{phone}</p>}<p><CalendarIcon />Source date · {date || 'Unknown'}</p><p className="record-id">Record · {record.id}</p><Link href={`${import.meta.env.BASE_URL}${record.dataset.path}`}><LayersIcon />Download source CSV<ExternalLinkIcon /></Link></div></Tabs.Content>
      </Tabs.Root>
      <div className="detail-personal-actions"><Button variant={saved ? "soft" : "surface"} onClick={() => onToggleSave(record.key)} aria-pressed={saved}>{saved ? <BookmarkFilledIcon /> : <BookmarkIcon />}{saved ? "Saved" : "Save place"}</Button><ReportUpdate record={record} /></div><div className="dialog-actions">{hasCoordinates && <Button asChild variant="solid"><a href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`} target="_blank" rel="noopener noreferrer"><DrawingPinIcon />Map<ExternalLinkIcon /></a></Button>}{phoneURL && <Button asChild variant="soft"><a href={phoneURL}><MobileIcon />Call</a></Button>}{sourceURL && <Button asChild variant="soft" color="gray"><a href={sourceURL} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon />Source</a></Button>}<Tooltip content="Copy a link to this record"><Button variant="ghost" color="gray" aria-label="Copy record link" onClick={copyLink}><CopyIcon /><span role="status">{copyState}</span></Button></Tooltip></div>
    </Dialog.Content>
  </Dialog.Root>;
}
