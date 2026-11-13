import React, { useEffect, useId, useState } from 'react';
import { Button, Switch, TextField } from '@radix-ui/themes';
import { ClockIcon } from '@radix-ui/react-icons';
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
    {value && <><label className="hours-date">Visit date<TextField.Root type="date" aria-label="Visit date for opening hours" value={date} onChange={event=>{const next=readHoursWindow(`${event.target.value},${range.join(',')}`);if(next)onChange(next);}} /></label>
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
