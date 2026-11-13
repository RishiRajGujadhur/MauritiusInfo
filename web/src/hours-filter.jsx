import React, { useEffect, useId, useState } from 'react';
import { Button, Switch, TextField } from '@radix-ui/themes';
import { ClockIcon } from '@radix-ui/react-icons';
import { relativeDate } from '../../qol-core.mjs';
import { Slider } from 'radix-ui';
import { mauritiusParts, readHoursWindow, windowTime } from '../../planning-core.mjs';

export default function HoursFilter({value,onChange}) {
  const id=useId();
  const [range,setRange]=useState(value?[value.start,value.end]:[540,1020]);
  const date=value?.date||mauritiusParts().date;
  useEffect(()=>{if(value)setRange([value.start,value.end]);},[value?.start,value?.end]);
  return <section className="hours-window" aria-labelledby={id}>
    <div className="hours-window-heading"><h2 id={id}><ClockIcon />Opening hours</h2><Switch aria-label="Filter by opening hours" checked={Boolean(value)} onCheckedChange={checked=>onChange(checked?{date,start:range[0],end:range[1]}:null)} /></div>
    <p className="form-note">Show places open throughout your selected time window.</p>
    {value && <><div className="qol-actions"><Button size="1" variant="soft" onClick={()=>onChange({...value,date:relativeDate()})}>Today</Button><Button size="1" variant="soft" onClick={()=>onChange({...value,date:relativeDate(1)})}>Tomorrow</Button></div><div className="qol-chips" aria-label="Time presets">{[['Morning',480,720],['Afternoon',720,1020],['Evening',1080,1320],['Full day',0,1440]].map(([name,start,end])=><Button key={name} size="1" variant="soft" onClick={()=>{setRange([start,end]);onChange({date,start,end});}}>{name}</Button>)}</div><label className="hours-date">Visit date<TextField.Root type="date" aria-label="Visit date for opening hours" value={date} onChange={event=>{const next=readHoursWindow(`${event.target.value},${range.join(',')}`);if(next)onChange(next);}} /></label>
      <p className="form-note">{new Date(date+'T12:00:00+04:00').toLocaleDateString('en-GB',{timeZone:'Indian/Mauritius',weekday:'long',day:'numeric',month:'short'})} · {(range[1]-range[0])/60} hours</p>
      <div className="hours-exact">{[0,1].map(index=><label key={index}>{index===0?'Open by':'Stay open until'}<TextField.Root type="time" step={900} aria-label={index===0?'Open by time':'Stay open until time'} value={windowTime(range[index]%1440)} onChange={event=>{const next=[...range];const [hour,minute]=event.target.value.split(':').map(Number);next[index]=hour*60+minute;if(index===1&&next[index]===0)next[index]=1440;if(readHoursWindow(`${date},${next.join(',')}`)){setRange(next);onChange({date,start:next[0],end:next[1]});}}} /></label>)}</div><p className="form-note">A closing time of 00:00 means midnight at the end of the selected day.</p>
      <div className="hours-range-labels"><span>Open by <strong>{windowTime(range[0])}</strong></span><span>Stay open until <strong>{windowTime(range[1])}</strong></span></div>
      <Slider.Root className="rt-SliderRoot rt-r-size-3 rt-variant-surface hours-range" min={0} max={1440} step={15} minStepsBetweenThumbs={1} preserveThumbOrder value={range} onValueChange={setRange} onValueCommit={next=>onChange({date,start:next[0],end:next[1]})}>
        <Slider.Track className="rt-SliderTrack"><Slider.Range className="rt-SliderRange" /></Slider.Track>
        <Slider.Thumb className="rt-SliderThumb" aria-label="Open by" aria-valuetext={windowTime(range[0])} />
        <Slider.Thumb className="rt-SliderThumb" aria-label="Stay open until" aria-valuetext={windowTime(range[1])} />
      </Slider.Root>
      <div className="hours-range-scale"><span>00:00</span><span>12:00</span><span>24:00</span></div>
      <p className="form-note">Mauritius time (UTC+4), in 15-minute steps. Unknown hours, unconfirmed holiday hours and lunch breaks during your visit are excluded. Listed hours can change.</p>
      <Button variant="ghost" size="1" onClick={()=>onChange(null)}>Clear hours filter</Button>
    </>}
  </section>;
}
