import React, { useEffect, useState, useRef } from 'react';
import { Button, Checkbox, Dialog, IconButton } from '@radix-ui/themes';
import { Cross2Icon, DrawingPinIcon, ResetIcon } from '@radix-ui/react-icons';
import SearchSelect from './search-select';
import { PRACTICAL_FILTERS } from '../../planning-core.mjs';
import HoursFilter from './hours-filter';
import { requestGPS } from './geolocation.mjs';
import locations from '../../data/planning/locations.json';

export default function VisitFilters({open,onClose,selected,onChange,nearby,onNearby,hoursWindow,onHoursWindow}) {
  const trigger = useRef(typeof document === 'undefined' ? null : document.activeElement);
  const [geoMessage,setGeoMessage]=useState('');
  const [locating,setLocating]=useState(false);
  const gpsRequest=useRef(0);
  useEffect(()=>()=>{gpsRequest.current++;},[]);
  function chooseNearby(next){gpsRequest.current++;setLocating(false);setGeoMessage('');onNearby(next);}
  async function locate(){
    const request=++gpsRequest.current;setLocating(true);setGeoMessage('Finding your location…');
    try {const {point}=await requestGPS();if(request!==gpsRequest.current)return;onNearby({id:'gps',name:'Your location',point,radius:nearby?.radius||5});setGeoMessage('GPS is used only on this tab; it is not stored or included in shared links.');}
    catch(error){if(request===gpsRequest.current)setGeoMessage(error.message);}
    finally{if(request===gpsRequest.current)setLocating(false);}
  }
  return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose();}}><Dialog.Content className="visit-filter-dialog" maxWidth="560px" onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><div className="sheet-heading"><Dialog.Title>Plan your visit</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close visit filters"><Cross2Icon /></IconButton></Dialog.Close></div><Dialog.Description>Match all selected features using published reports. Missing information is excluded.</Dialog.Description>
    <div className="visit-filter-options">{PRACTICAL_FILTERS.map(([id,label])=><label key={id}><Checkbox checked={selected.includes(id)} onCheckedChange={checked=>onChange(checked?[...selected,id]:selected.filter(value=>value!==id))}/>{label}</label>)}</div>
    <HoursFilter value={hoursWindow} onChange={onHoursWindow} />
    <h2>Nearby places</h2><div className="nearby-controls"><SearchSelect label="Near" icon={DrawingPinIcon} value={nearby?.id==='gps'?'':nearby?.id||''} options={locations.map(t=>[t.id,t.name])} placeholder={nearby?.id==='gps'?'Using GPS':'Any location'} onChange={id=>{const town=locations.find(t=>t.id===id);chooseNearby(town?{id:town.id,name:town.name,point:[town.latitude,town.longitude],radius:nearby?.radius||5}:null);}}/><SearchSelect label="Radius" icon={DrawingPinIcon} value={String(nearby?.radius||5)} options={[1,2,5,10,25,50].map(n=>[String(n),`${n} km`])} allowAll={false} placeholder="5 km" onChange={value=>{if(nearby)chooseNearby({...nearby,radius:Number(value)});}}/><Button variant="soft" disabled={locating} onClick={locate}>{locating?'Finding location…':'Use my location'}</Button></div>{nearby&&<p>Within {nearby.radius} km of {nearby.name} · <Button variant="ghost" onClick={()=>chooseNearby(null)}>Clear location</Button></p>}{geoMessage&&<p role="status">{geoMessage}</p>}<p className="form-note">Distances are in a straight line. Road routes and accessibility can differ. Places without coordinates are excluded only while a location filter is active. GPS permission is requested only when you tap the button.</p><div className="sheet-actions"><Button variant="ghost" color="gray" onClick={()=>{onChange([]);chooseNearby(null);onHoursWindow(null);}}><ResetIcon />Clear visit filters</Button><Dialog.Close><Button>Show places</Button></Dialog.Close></div>
  </Dialog.Content></Dialog.Root>;
}
