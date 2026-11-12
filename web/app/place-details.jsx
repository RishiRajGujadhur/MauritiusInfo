'use client';

import { Dialog, IconButton, Link } from '@radix-ui/themes';
import { Cross2Icon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { humanize } from '../../data-core.mjs';
import { ReportBadge, SourceLink } from './ui';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MauritiusInfo';

export default function PlaceDetails({ record, onClose, triggerRef }) {
  const row = record.raw;
  const features = [
    ['Wheelchair access', row.wheelchair_access], ['Step-free entrance', row.step_free_entrance],
    ['Wheelchair parking', row.wheelchair_parking], ['Adapted toilet', row.wheelchair_toilet],
    ['Lift', row.lift], ['Ramp', row.ramp], ['Wheelchair seating', row.wheelchair_seating],
    ['Parking route', row.parking_to_entrance_route || row.parking_to_shop_route || row.parking_to_venue_route],
  ];
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  const hasCoordinates = row.latitude && row.longitude && Number.isFinite(latitude) && Number.isFinite(longitude);
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Content maxWidth="620px" className="place-dialog" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
      <div className="dialog-heading"><Dialog.Title>{record.name}</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close details"><Cross2Icon /></IconButton></Dialog.Close></div>
      <Dialog.Description size="2" color="gray">{[record.type, record.area, record.address].filter(Boolean).join(' · ')}</Dialog.Description>
      <dl className="features">{features.map(([label, value]) => <div key={label}><dt>{label}</dt><dd><ReportBadge value={value} />{value && value !== 'unknown' && <small>{humanize(value)}</small>}</dd></div>)}</dl>
      <div className="notes">
        {row.notes && <p>{row.notes}</p>}{row.quality_note && <p>{row.quality_note}</p>}
        {row.questions_to_confirm && <p><strong>Ask the venue</strong><br />{row.questions_to_confirm}</p>}
        {(row.listing_status || row.listing_status_as_of_check) && <p>{humanize(row.listing_status || row.listing_status_as_of_check)}</p>}
        {(row.phone || row.phone_international_digits) && <p>Listed phone · {row.phone || row.phone_international_digits}</p>}
        <p>Source date · {row.source_snapshot || row.last_web_check || row.retrieved_date || 'Unknown'}</p>
        <p>On-site check · {row.field_verified === 'true' ? 'Recorded' : 'Not recorded'}</p>
      </div>
      <div className="detail-links"><SourceLink url={row.source_url || row.contact_url || row.contact_or_booking_url}>Source</SourceLink><Link href={`${BASE_PATH}/${record.dataset.path}`}>CSV table <ExternalLinkIcon /></Link>{hasCoordinates && <SourceLink url={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}>Map</SourceLink>}</div>
      <p className="record-id">{record.dataset.name} · {record.id}</p>
    </Dialog.Content>
  </Dialog.Root>;
}

