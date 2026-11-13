import React,{useState} from 'react';
import {Badge,Button,TextArea} from '@radix-ui/themes';
import {visitSummary,callAheadChecklist} from '../../outing-core.mjs';
import {contactLinks} from '../../planning-core.mjs';
import {copyText} from './qol-actions.mjs';
import {CopyFallback,ConfirmButton} from './qol-ui';

export function VisitSummary({record,ids=[]}){
 const result=visitSummary(record,ids);
 return <section className="visit-summary"><h2>Can I visit?</h2><p><strong>{result.label}</strong></p><p className="form-note">{result.selected?'Based on your selected needs.':'General overview: select My needs to personalise this summary.'} Source reports can change; confirm facilities before travelling.</p><div className="qol-chips"><Badge color="green">{result.matched.length} reported matches</Badge><Badge color="amber">{result.barriers.length} barriers / limits</Badge><Badge color="gray">{result.unknown.length} unknown</Badge></div><dl className="visit-facts">{result.rows.map(row=><div key={row.id}><dt>{row.needLabel}</dt><dd>{row.group==='positive'?'Reported available':row.group==='negative'?'Reported unavailable':row.group==='limited'?'Limited / partial':'Needs confirmation'}</dd></div>)}</dl></section>;
}
export default function VisitSupport({record,needIds,hoursWindow,note,onNote,notesError,showSummary=true}){
 const [manual,setManual]=useState(''),[message,setMessage]=useState('');const checklist=callAheadChecklist(record,needIds,hoursWindow),contacts=contactLinks(record);
 return <div className="visit-support">{showSummary&&<VisitSummary record={record} ids={needIds}/>}<section><h2>Call-ahead checklist</h2><ol>{checklist.questions.map(q=><li key={q}>{q}</li>)}</ol><div className="qol-actions">{contacts.call&&<Button asChild><a href={contacts.call}>Call venue</a></Button>}<Button variant="soft" onClick={async()=>{if(await copyText(checklist.text))setMessage('Call-ahead questions copied.');else setManual(checklist.text);}}>Copy questions</Button></div><p role="status">{message}</p></section><section><h2>My private visit note</h2><label className="qol-field">Useful details for your next visit<TextArea rows={4} maxLength={2000} aria-label={`Private visit note for ${record.name}`} placeholder="For example: ask about the side entrance before arriving." value={note||''} onChange={event=>onNote(event.target.value)}/></label><p className="form-note">{(note||'').length}/2000 characters · Saved on this browser only. Excluded from reports, exports and shared outing links.</p>{notesError&&<p role="status">{notesError}</p>}{note&&<ConfirmButton title="Delete this private note?" description="This removes the note from this browser." onConfirm={()=>onNote('')}>Delete private note</ConfirmButton>}</section><CopyFallback text={manual} onClose={()=>setManual('')}/></div>;
}
