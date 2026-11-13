import React, { useState } from 'react';
import { Button, Dialog, IconButton, TextArea, TextField } from '@radix-ui/themes';
import { Cross2Icon, ExternalLinkIcon, Pencil2Icon, ArrowLeftIcon } from '@radix-ui/react-icons';
import SearchSelect from './search-select';
import { ConfirmButton, CopyFallback } from './qol-ui';
import { copyText } from './qol-actions.mjs';
import { relativeDate } from '../../qol-core.mjs';
import { buildReport } from '../../place-tools.mjs';

export default function ReportUpdate({ record }) {
  const [form, setForm] = useState({ feature: 'access', status: 'unknown', basis: 'visit', date: '', source: '', notes: '' });
  const [preview, setPreview] = useState(null);
  const [message,setMessage]=useState(''),[manual,setManual]=useState('');
  const draftKey='mu-report-draft:'+record.key;
  function draftExists(){try{return Boolean(sessionStorage.getItem(draftKey));}catch{return false;}}
  const [hasDraft,setHasDraft]=useState(draftExists);
  const prompts={hours:'List the days, opening/closing times, breaks and dates when the schedule applies.',closure:'Describe the barrier or closure and when it began. Include any reopening date supplied by the venue.',arrival:'Describe the entrance or drop-off point, steps and available transfer space.',parking:'Describe the parking bay, transfer space and route to the entrance.',diet:'Describe the dietary option and how the venue confirmed it.'};
  function saveDraft(){try{sessionStorage.setItem(draftKey,JSON.stringify(form));setHasDraft(true);setMessage('Draft saved for this browser session.');}catch{setMessage('Draft storage is unavailable. Copy your report instead.');}}
  function restoreDraft(){try{const data=JSON.parse(sessionStorage.getItem(draftKey));if(!data||typeof data.notes!=='string'||data.notes.length>1200)throw Error();const next={...form};for(const key of Object.keys(form))if(typeof data[key]==='string')next[key]=data[key].slice(0,key==='notes'?1200:500);setForm(next);setPreview(null);setMessage('Draft restored. Review all fields before submitting.');}catch{setMessage('The stored draft could not be restored.');}}

  const set = (key, value) => { setForm(current => ({ ...current, [key]: value })); setPreview(null); };
  return <Dialog.Root><Dialog.Trigger><Button variant="soft" color="gray"><Pencil2Icon />Report update</Button></Dialog.Trigger>
    <Dialog.Content maxWidth="540px" className="report-dialog">
      <div className="sheet-heading"><Dialog.Title>Report an update</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close report"><Cross2Icon /></IconButton></Dialog.Close></div>
      <Dialog.Description>{record.name} · Your report will be reviewed before the data changes.</Dialog.Description>
      {preview ? <div className="report-review"><h2>Review your report</h2><Button variant="soft" onClick={async()=>{if(await copyText(preview.body))setMessage('Report copied.');else setManual(preview.body);}}>Copy report draft</Button><pre>{preview.body}</pre><p className="form-note">Reports are public. A GitHub account is needed. The next step opens a draft; submit it on GitHub when ready. You can attach photos there.</p><div className="sheet-actions"><Button variant="soft" color="gray" onClick={() => setPreview(null)}><ArrowLeftIcon />Edit</Button><Button asChild><a href={preview.url} target="_blank" rel="noopener noreferrer">Open GitHub draft<ExternalLinkIcon /></a></Button></div></div> : <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const next = { ...form, date: String(data.get('date') || ''), source: String(data.get('source') || ''), notes: String(data.get('notes') || '') }; if(next.notes.trim().length<10){setMessage('Describe the change in at least 10 non-space characters.');return;}next.notes=next.notes.trim();setForm(next);setMessage('');setPreview(buildReport(record, next, location.href)); }}>
        <div className="report-fields">
          <SearchSelect label="Facility" icon={Pencil2Icon} allowAll={false} value={form.feature} options={[["access","Wheelchair access"],["entrance","Step-free entrance"],["parking","Wheelchair parking"],["toilet","Adapted toilet"],["hours","Opening hours"],["contact","Contact details"],["diet","Dietary options"],["facilities","Venue facilities"],["arrival","Entrance / drop-off"],["closure","Temporary closure / barrier"],["other","Other detail"]]} onChange={value => set('feature', value)} />
          <SearchSelect label="Status" icon={Pencil2Icon} allowAll={false} value={form.status} options={[["yes","Yes"],["limited","Limited / partial"],["no","No"],["unknown","Unknown / needs checking"]]} onChange={value => set('status', value)} />
          <SearchSelect label="Evidence" icon={Pencil2Icon} allowAll={false} value={form.basis} options={[["visit","I visited"],["venue","I contacted the venue"],["web","Online source"]]} onChange={value => set('basis', value)} />
          <label>Date <TextField.Root name="date" aria-label="Evidence date" type="date" required={form.basis !== 'web'} max={new Date().toLocaleDateString('en-CA', { timeZone: 'Indian/Mauritius' })} value={form.date} onChange={event => set('date', event.target.value)} /><Button type="button" variant="ghost" size="1" onClick={()=>set('date',relativeDate())}>Use today</Button></label>
          <label className="full-width">Source link {form.basis !== 'web' && '(optional)'}<TextField.Root name="source" aria-label="Report source link" type="url" pattern="https?://.*" maxLength={500} required={form.basis === 'web'} placeholder="https://…" value={form.source} onChange={event => set('source', event.target.value)} /></label>
          <label className="full-width">What changed?<TextArea name="notes" aria-label="Update details" required minLength={10} maxLength={1200} rows={4} placeholder={prompts[form.feature]||'Describe what changed, when you observed it, and any useful measurements.'} value={form.notes} onChange={event => set('notes', event.target.value)} /><output aria-label="Update detail character count">{form.notes.length}/1200 characters</output></label>
        </div>
        <p className="form-note">Reports are public. Include venue details only; leave out personal or medical information.</p>
        {form.basis==='web'&&<p className="form-note">Link the original public page supporting the change. Use its publication or check date when known.</p>}
        <Button type="submit" className="report-submit">Review report</Button>
      </form>}
      <div className="qol-actions"><Button variant="soft" onClick={saveDraft}>Save session draft</Button>{hasDraft&&<><Button variant="soft" onClick={restoreDraft}>Restore draft</Button><Button variant="ghost" onClick={()=>{try{sessionStorage.removeItem(draftKey);setHasDraft(false);setMessage('Session draft removed.');}catch{setMessage('Draft could not be removed.');}}}>Remove saved draft</Button></>}<ConfirmButton title="Reset report fields?" description="This clears the current form. A saved session draft is kept until you remove it." onConfirm={()=>{setForm({feature:'access',status:'unknown',basis:'visit',date:'',source:'',notes:''});setPreview(null);setMessage('Report fields reset.');}}>Reset report</ConfirmButton></div><p role="status">{message}</p><CopyFallback text={manual} onClose={()=>setManual('')} />
    </Dialog.Content>
  </Dialog.Root>;
}
