import React, { useState } from 'react';
import { Button, Dialog, IconButton, TextArea, TextField } from '@radix-ui/themes';
import { Cross2Icon, ExternalLinkIcon, Pencil2Icon, ArrowLeftIcon } from '@radix-ui/react-icons';
import SearchSelect from './search-select';
import { buildReport } from '../../place-tools.mjs';

export default function ReportUpdate({ record }) {
  const [form, setForm] = useState({ feature: 'access', status: 'unknown', basis: 'visit', date: '', source: '', notes: '' });
  const [preview, setPreview] = useState(null);
  const set = (key, value) => { setForm(current => ({ ...current, [key]: value })); setPreview(null); };
  return <Dialog.Root><Dialog.Trigger><Button variant="soft" color="gray"><Pencil2Icon />Report update</Button></Dialog.Trigger>
    <Dialog.Content maxWidth="540px" className="report-dialog">
      <div className="sheet-heading"><Dialog.Title>Report an update</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close report"><Cross2Icon /></IconButton></Dialog.Close></div>
      <Dialog.Description>{record.name} · Your report will be reviewed before the data changes.</Dialog.Description>
      {preview ? <div className="report-review"><h2>Review your report</h2><pre>{preview.body}</pre><p className="form-note">Reports are public. A GitHub account is needed. The next step opens a draft; submit it on GitHub when ready. You can attach photos there.</p><div className="sheet-actions"><Button variant="soft" color="gray" onClick={() => setPreview(null)}><ArrowLeftIcon />Edit</Button><Button asChild><a href={preview.url} target="_blank" rel="noopener noreferrer">Open GitHub draft<ExternalLinkIcon /></a></Button></div></div> : <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const next = { ...form, date: String(data.get('date') || ''), source: String(data.get('source') || ''), notes: String(data.get('notes') || '') }; setForm(next); setPreview(buildReport(record, next, location.href)); }}>
        <div className="report-fields">
          <SearchSelect label="Facility" icon={Pencil2Icon} allowAll={false} value={form.feature} options={[["access","Wheelchair access"],["entrance","Step-free entrance"],["parking","Wheelchair parking"],["toilet","Adapted toilet"],["hours","Opening hours"],["contact","Contact details"],["diet","Dietary options"],["facilities","Venue facilities"],["arrival","Entrance / drop-off"],["closure","Temporary closure / barrier"],["other","Other detail"]]} onChange={value => set('feature', value)} />
          <SearchSelect label="Status" icon={Pencil2Icon} allowAll={false} value={form.status} options={[["yes","Yes"],["limited","Limited / partial"],["no","No"],["unknown","Unknown / needs checking"]]} onChange={value => set('status', value)} />
          <SearchSelect label="Evidence" icon={Pencil2Icon} allowAll={false} value={form.basis} options={[["visit","I visited"],["venue","I contacted the venue"],["web","Online source"]]} onChange={value => set('basis', value)} />
          <label>Date <TextField.Root name="date" aria-label="Evidence date" type="date" required={form.basis !== 'web'} max={new Date().toLocaleDateString('en-CA', { timeZone: 'Indian/Mauritius' })} value={form.date} onChange={event => set('date', event.target.value)} /></label>
          <label className="full-width">Source link {form.basis !== 'web' && '(optional)'}<TextField.Root name="source" aria-label="Report source link" type="url" pattern="https?://.*" maxLength={500} required={form.basis === 'web'} placeholder="https://…" value={form.source} onChange={event => set('source', event.target.value)} /></label>
          <label className="full-width">What changed?<TextArea name="notes" aria-label="Update details" required minLength={10} maxLength={1200} rows={4} placeholder="Describe changed hours, an entrance, transfer point, broken lift, blocked ramp, dietary option or temporary closure. Include dates and useful measurements." value={form.notes} onChange={event => set('notes', event.target.value)} /></label>
        </div>
        <p className="form-note">Reports are public. Include venue details only; leave out personal or medical information.</p>
        <Button type="submit" className="report-submit">Review report</Button>
      </form>}
    </Dialog.Content>
  </Dialog.Root>;
}
