import React, { useState, useRef } from 'react';
import { Badge, Button, Dialog, IconButton, TextField } from '@radix-ui/themes';
import { ArrowDownIcon, ArrowUpIcon, Cross2Icon, DownloadIcon, ExternalLinkIcon, PlusIcon } from '@radix-ui/react-icons';
import { visitStatus, distanceKm, localDateTime } from '../../planning-core.mjs';
import { coordinates } from '../../place-tools.mjs';
import calendar from '../../data/planning/holidays.json';
import { chronologicalTrip, importTrip, tripBackup } from '../../qol-core.mjs';
import { copyText, downloadFile, readBackup } from './qol-actions.mjs';
import { ConfirmButton, CopyFallback } from './qol-ui';
import { prepareOffline, clearOffline } from './offline';

export default function TripPanel({open,onClose,trip,onChange,records,savedKeys,onOpen,offlineMode}) {
  const trigger = useRef(typeof document === 'undefined' ? null : document.activeElement);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const [removed,setRemoved]=useState(null),[manual,setManual]=useState(''),[imported,setImported]=useState(null);
  function remove(key){setRemoved(trip);onChange(trip.filter(s=>s.key!==key));setMessage('Stop removed. Undo is available below.');}
  const byKey=new Map(records.map(r=>[r.key,r]));
  const saved=savedKeys.map(key=>byKey.get(key)).filter(Boolean);
  const rows=trip.map(stop=>({...stop,record:byKey.get(stop.key)}));
  function update(key,patch){onChange(trip.map(stop=>stop.key===key?{...stop,...patch}:stop));}
  function add(key){if(!trip.some(stop=>stop.key===key)&&trip.length<50)onChange([...trip,{key,arrival:'',duration:60}]);}
  function move(index,delta){const next=[...trip];[next[index],next[index+delta]]=[next[index+delta],next[index]];onChange(next);}
  async function offline(){
    setBusy(true);setMessage('Downloading the app and saving your selected places…');
    try{const count=await prepareOffline(saved);setMessage(`${count} saved places are available offline on this browser. Keep this site address bookmarked. Map backgrounds and external links need a connection.`);}
    catch(error){setMessage(error.message||'Offline download failed. Please reconnect and try again.');}
    finally{setBusy(false);}
  }
  function planText(){
    const lines=['Access Mauritius trip','Times: Indian/Mauritius (UTC+4)','Distances are straight-line distances, not driving estimates.',''];
    rows.forEach(({record,arrival,duration})=>{if(!record)return;lines.push(record.name,`${record.area} · ${record.address}`,`Arrival: ${arrival||'Not set'} · Duration: ${duration} minutes`,visitStatus(record,arrival,duration,calendar).label,`https://rishirajgujadhur.github.io/MauritiusInfo/?record=${encodeURIComponent(record.key)}`,'');});
    return lines.join('\n');
  }
  function exportPlan(){downloadFile('mauritius-trip.txt',planText(),'text/plain;charset=utf-8');}

  return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose();}}><Dialog.Content maxWidth="760px" className="trip-dialog" onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><div className="sheet-heading"><Dialog.Title>My trip</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close trip"><Cross2Icon /></IconButton></Dialog.Close></div><Dialog.Description>Build an outing from saved places. Set each arrival in Mauritius time and check the listed hours.</Dialog.Description>
    {offlineMode&&<p role="status">Offline · Showing your downloaded places.</p>}
    <p className="trip-total">{trip.length}/50 stops · {Math.floor(trip.reduce((sum,s)=>sum+s.duration,0)/60)} h {trip.reduce((sum,s)=>sum+s.duration,0)%60} min planned visits (travel excluded)</p>
    <div className="qol-actions"><Button variant="soft" disabled={!trip.length} onClick={()=>onChange(chronologicalTrip(trip))}>Sort by arrival</Button><Button variant="soft" disabled={trip.length<2} onClick={()=>onChange([...trip].reverse())}>Reverse stop order</Button><Button variant="soft" disabled={!saved.length||trip.length>=50} onClick={()=>{const existing=new Set(trip.map(s=>s.key));onChange([...trip,...saved.filter(r=>!existing.has(r.key)).map(r=>({key:r.key,arrival:'',duration:60}))].slice(0,50));}}>Add all saved places</Button><Button variant="soft" onClick={()=>downloadFile('mauritius-trip.json',tripBackup(trip))}>Back up trip</Button><Button variant="soft" disabled={!trip.length} onClick={async()=>{const text=planText();if(await copyText(text))setMessage('Trip copied.');else setManual(text);}}>Copy trip</Button><ConfirmButton disabled={!trip.length} title="Clear this trip?" description="This removes planned stops, keeping your bookmarks. Back up the trip first if needed." onConfirm={()=>{setRemoved(trip);onChange([]);setMessage('Trip cleared. You can undo below.');}}>Clear trip</ConfirmButton></div>
    <label className="qol-field">Restore a trip backup<TextField.Root type="file" accept=".json,application/json" aria-label="Restore trip backup" onChange={async event=>{try{setImported(importTrip(await readBackup(event.target.files?.[0]),new Set(records.map(r=>r.key))));}catch(error){setMessage(error.message);}event.target.value='';}} /></label>{imported&&<div className="qol-actions"><p>{imported.trip.length} stops ready · {imported.skipped} unavailable stops skipped.</p><ConfirmButton title="Replace this trip?" description="The imported plan will replace the stops currently on this browser. Undo is available after replacing." onConfirm={()=>{setRemoved(trip);onChange(imported.trip);setImported(null);setMessage('Trip restored.');}}>Replace with imported trip</ConfirmButton><Button variant="ghost" onClick={()=>setImported(null)}>Cancel import</Button></div>}
    {removed&&<Button variant="soft" onClick={()=>{onChange(removed);setRemoved(null);setMessage('Previous trip restored.');}}>Undo last removal or replacement</Button>}<CopyFallback text={manual} onClose={()=>setManual('')} />
    <div className="trip-actions"><Button variant="soft" onClick={offline} disabled={busy||!saved.length}><DownloadIcon />{busy?'Saving…':'Make saved places available offline'}</Button><Button variant="ghost" color="gray" onClick={async()=>{try{await clearOffline();setMessage("Offline download removed from this browser.");}catch{setMessage("Offline download could not be removed.");}}}>Remove offline download</Button><Button variant="soft" onClick={exportPlan} disabled={!trip.length}>Export trip</Button></div>{message&&<p role="status" className="offline-status">{message}</p>}
    {rows.length?<ol className="trip-stops">{rows.map(({record,key,arrival,duration},index)=>{
      if(!record)return <li key={key}><p>Place data is unavailable: {key}</p><Button onClick={()=>remove(key)}>Remove stop</Button></li>;
      const result=visitStatus(record,arrival,duration,calendar),previous=rows[index-1],distance=previous?.record?distanceKm(coordinates(previous.record),coordinates(record)):null;
      const previousEnd=previous?.arrival&&localDateTime(previous.arrival)?localDateTime(previous.arrival).getTime()+previous.duration*60000:null;
      const overlap=previousEnd&&localDateTime(arrival)&&localDateTime(arrival).getTime()<previousEnd;
      const position=coordinates(record);
      return <li className="trip-stop" key={key}><div className="trip-stop-heading"><Button variant="ghost" onClick={event=>onOpen(record,event)}>{record.name}</Button><div><IconButton variant="ghost" color="gray" aria-label={`Move ${record.name} up`} disabled={!index} onClick={()=>move(index,-1)}><ArrowUpIcon /></IconButton><IconButton variant="ghost" color="gray" aria-label={`Move ${record.name} down`} disabled={index===rows.length-1} onClick={()=>move(index,1)}><ArrowDownIcon /></IconButton><IconButton variant="ghost" color="gray" aria-label={`Remove ${record.name} from trip`} onClick={()=>remove(key)}><Cross2Icon /></IconButton></div></div><p>{record.address||record.area}{distance!==null&&` · ${distance.toFixed(1)} km straight line from previous stop`}</p><div className="trip-schedule"><label>Arrival (Mauritius)<TextField.Root aria-label={`Arrival for ${record.name}`} type="datetime-local" value={arrival} onChange={event=>update(key,{arrival:event.target.value})}/></label><label>Stay (minutes)<TextField.Root aria-label={`Duration for ${record.name}`} type="number" min="1" max="1440" value={duration} onChange={event=>update(key,{duration:Math.min(1440,Math.max(1,Number(event.target.value)||1))})}/></label></div><div className="qol-chips" aria-label={`Stay presets for ${record.name}`}>{[30,60,120].map(minutes=><Button key={minutes} size="1" variant={duration===minutes?'soft':'ghost'} aria-pressed={duration===minutes} onClick={()=>update(key,{duration:minutes})}>{minutes} min</Button>)}</div><Badge color={result.state==='open'?'green':result.state==='closed'?'red':'gray'}>{result.label}</Badge>{overlap&&<p className="trip-warning">This arrival overlaps the previous visit. Allow time for travel and assistance.</p>}{position&&<p><a href={`https://www.google.com/maps/dir/?api=1&destination=${position.join(',')}`} target="_blank" rel="noopener noreferrer">Directions to place pin <ExternalLinkIcon /></a></p>}</li>;
    })}</ol>:<p className="trip-empty">Save places while browsing, then add them below to start your outing.</p>}
    <h2>Add from saved places</h2><div className="trip-saved">{saved.filter(r=>!trip.some(s=>s.key===r.key)).map(r=><Button key={r.key} variant="soft" disabled={trip.length>=50} onClick={()=>add(r.key)}><PlusIcon />{r.name}</Button>)}{!saved.length&&<p>No saved places yet. Use a bookmark icon in the results.</p>}</div><p className="form-note">Up to 50 stops. Trip plans stay on this browser. Schedule warnings do not account for traffic, queues, cyclones or temporary closures. Confirm entrance, transfer help and facilities before travelling. Offline downloads include saved place details; map tiles are not downloaded.</p>
  </Dialog.Content></Dialog.Root>;
}
