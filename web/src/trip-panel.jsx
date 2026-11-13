import React, { useState, useRef } from 'react';
import { Badge, Button, Dialog, IconButton, TextField } from '@radix-ui/themes';
import { ArrowDownIcon, ArrowUpIcon, Cross2Icon, DownloadIcon, ExternalLinkIcon, PlusIcon } from '@radix-ui/react-icons';
import { visitStatus, distanceKm, localDateTime } from '../../planning-core.mjs';
import { coordinates } from '../../place-tools.mjs';
import calendar from '../../data/planning/holidays.json';
import { prepareOffline, clearOffline } from './offline';

export default function TripPanel({open,onClose,trip,onChange,records,savedKeys,onOpen,offlineMode}) {
  const trigger = useRef(typeof document === 'undefined' ? null : document.activeElement);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
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
  function exportPlan(){
    const lines=['Access Mauritius trip','Times: Indian/Mauritius (UTC+4)','Distances are straight-line distances, not driving estimates.',''];
    rows.forEach(({record,arrival,duration})=>{if(!record)return;lines.push(record.name,`${record.area} · ${record.address}`,`Arrival: ${arrival||'Not set'} · Duration: ${duration} minutes`,visitStatus(record,arrival,duration,calendar).label,`https://rishirajgujadhur.github.io/MauritiusInfo/?record=${encodeURIComponent(record.key)}`,'');});
    const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='mauritius-trip.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose();}}><Dialog.Content maxWidth="760px" className="trip-dialog" onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><div className="sheet-heading"><Dialog.Title>My trip</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close trip"><Cross2Icon /></IconButton></Dialog.Close></div><Dialog.Description>Build an outing from saved places. Set each arrival in Mauritius time and check the listed hours.</Dialog.Description>
    {offlineMode&&<p role="status">Offline · Showing your downloaded places.</p>}
    <div className="trip-actions"><Button variant="soft" onClick={offline} disabled={busy||!saved.length}><DownloadIcon />{busy?'Saving…':'Make saved places available offline'}</Button><Button variant="ghost" color="gray" onClick={async()=>{try{await clearOffline();setMessage("Offline download removed from this browser.");}catch{setMessage("Offline download could not be removed.");}}}>Remove offline download</Button><Button variant="soft" onClick={exportPlan} disabled={!trip.length}>Export trip</Button></div>{message&&<p role="status" className="offline-status">{message}</p>}
    {rows.length?<ol className="trip-stops">{rows.map(({record,key,arrival,duration},index)=>{
      if(!record)return <li key={key}><p>Place data is unavailable: {key}</p><Button onClick={()=>onChange(trip.filter(s=>s.key!==key))}>Remove stop</Button></li>;
      const result=visitStatus(record,arrival,duration,calendar),previous=rows[index-1],distance=previous?.record?distanceKm(coordinates(previous.record),coordinates(record)):null;
      const previousEnd=previous?.arrival&&localDateTime(previous.arrival)?localDateTime(previous.arrival).getTime()+previous.duration*60000:null;
      const overlap=previousEnd&&localDateTime(arrival)&&localDateTime(arrival).getTime()<previousEnd;
      const position=coordinates(record);
      return <li className="trip-stop" key={key}><div className="trip-stop-heading"><Button variant="ghost" onClick={event=>onOpen(record,event)}>{record.name}</Button><div><IconButton variant="ghost" color="gray" aria-label={`Move ${record.name} up`} disabled={!index} onClick={()=>move(index,-1)}><ArrowUpIcon /></IconButton><IconButton variant="ghost" color="gray" aria-label={`Move ${record.name} down`} disabled={index===rows.length-1} onClick={()=>move(index,1)}><ArrowDownIcon /></IconButton><IconButton variant="ghost" color="gray" aria-label={`Remove ${record.name} from trip`} onClick={()=>onChange(trip.filter(s=>s.key!==key))}><Cross2Icon /></IconButton></div></div><p>{record.address||record.area}{distance!==null&&` · ${distance.toFixed(1)} km straight line from previous stop`}</p><div className="trip-schedule"><label>Arrival (Mauritius)<TextField.Root aria-label={`Arrival for ${record.name}`} type="datetime-local" value={arrival} onChange={event=>update(key,{arrival:event.target.value})}/></label><label>Stay (minutes)<TextField.Root aria-label={`Duration for ${record.name}`} type="number" min="1" max="1440" value={duration} onChange={event=>update(key,{duration:Math.min(1440,Math.max(1,Number(event.target.value)||1))})}/></label></div><Badge color={result.state==='open'?'green':result.state==='closed'?'red':'gray'}>{result.label}</Badge>{overlap&&<p className="trip-warning">This arrival overlaps the previous visit. Allow time for travel and assistance.</p>}{position&&<p><a href={`https://www.google.com/maps/dir/?api=1&destination=${position.join(',')}`} target="_blank" rel="noopener noreferrer">Directions to place pin <ExternalLinkIcon /></a></p>}</li>;
    })}</ol>:<p className="trip-empty">Save places while browsing, then add them below to start your outing.</p>}
    <h2>Add from saved places</h2><div className="trip-saved">{saved.filter(r=>!trip.some(s=>s.key===r.key)).map(r=><Button key={r.key} variant="soft" disabled={trip.length>=50} onClick={()=>add(r.key)}><PlusIcon />{r.name}</Button>)}{!saved.length&&<p>No saved places yet. Use a bookmark icon in the results.</p>}</div><p className="form-note">Up to 50 stops. Trip plans stay on this browser. Schedule warnings do not account for traffic, queues, cyclones or temporary closures. Confirm entrance, transfer help and facilities before travelling. Offline downloads include saved place details; map tiles are not downloaded.</p>
  </Dialog.Content></Dialog.Root>;
}
