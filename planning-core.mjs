import { safeURL, status } from './data-core.mjs';
import { coordinates } from './place-tools.mjs';

export const TIMEZONE = 'Indian/Mauritius';
export const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_CODES = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const DAY_MS = 86400000;
const OFFSET = 4 * 3600000;

// Conservative weekly OSM subset. Unsupported dates, seasons, solar times,
// comments and fallback operators stay unknown rather than producing a guess.
export function parseHours(expression) {
  if (!expression || typeof expression !== 'string' || !expression.replaceAll(';','').trim()) return null;
  const raw = expression.trim();
  if (raw === '24/7') return { week: Array.from({length:7},()=>[[0,1440]]), holiday:[[0,1440]], always:true };
  const result = { week:Array.from({length:7},()=>[]), holiday:null, closedDays:[] };
  for (const rule of raw.split(';').map(r=>r.trim()).filter(Boolean)) {
    const match = rule.match(/^(?:(Mo|Tu|We|Th|Fr|Sa|Su|PH)[A-Za-z,\- ]*\s+)?(off|closed|\d\d?:\d\d-\d\d?:\d\d(?:\s*,\s*\d\d?:\d\d-\d\d?:\d\d)*)$/);
    if (!match) return null;
    const value = match[2], selector = rule.slice(0,rule.length-value.length).trim();
    const days = [];
    if (!selector) days.push(...DAY_CODES);
    else for (const part of selector.replaceAll(' ','').split(',')) {
      if (DAY_CODES.includes(part) || part==='PH') days.push(part);
      else {
        const range = part.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)-(Mo|Tu|We|Th|Fr|Sa|Su)$/);
        if (!range) return null;
        let day=DAY_CODES.indexOf(range[1]), end=DAY_CODES.indexOf(range[2]);
        for(let i=0;i<7;i++,day=(day+1)%7){days.push(DAY_CODES[day]);if(day===end)break;}
      }
    }
    const intervals=[];
    if (!['off','closed'].includes(value)) for (const part of value.split(',')) {
      const [start,end]=part.trim().split('-').map(t=>{const [h,m]=t.split(':').map(Number);return h<24&&m<60?h*60+m:h===24&&m===0?1440:NaN;});
      if (!Number.isFinite(start)||!Number.isFinite(end)||start===1440||start===end) return null;
      intervals.push([start,end<=start?end+1440:end]);
    }
    for (const day of days) if(day==='PH') result.holiday=intervals; else {
      const index=DAY_CODES.indexOf(day);result.week[index]=intervals;
      result.closedDays=result.closedDays.filter(i=>i!==index);
      if(!intervals.length)result.closedDays.push(index);
    }
  }
  return result;
}
export function mauritiusParts(now=new Date()) {
  const date=new Date(new Date(now).getTime()+OFFSET);
  return { date:date.toISOString().slice(0,10), day:(date.getUTCDay()+6)%7, minute:date.getUTCHours()*60+date.getUTCMinutes() };
}
export function localDateTime(value) {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value||''))return null;
  const date=new Date(value+':00+04:00');
  return Number.isFinite(date.getTime()) && new Date(date.getTime()+OFFSET).toISOString().slice(0,16)===value ? date : null;
}
export function hoursFor(record){return record.planning?.opening_hours || record.planning?.tags?.opening_hours || '';}
function dayIntervals(schedule,date,calendar) {
  const parts=mauritiusParts(date), holiday=calendar?.holidays?.filter(h=>h.date===parts.date)||[];
  if(holiday.some(h=>h.tentative))return null;
  if(!calendar?.years?.includes(Number(parts.date.slice(0,4)))&&!schedule.always)return null;
  if(holiday.length)return schedule.holiday;
  return schedule.week[parts.day];
}
function stateAt(schedule,date,calendar) {
  const {minute}=mauritiusParts(date);
  const today=dayIntervals(schedule,date,calendar),previous=dayIntervals(schedule,new Date(date.getTime()-DAY_MS),calendar);
  if(today===null)return null;
  const parts=mauritiusParts(date);
  const isHoliday=calendar?.holidays?.some(h=>h.date===parts.date);
  if((isHoliday && schedule.holiday?.length===0)||(!isHoliday && schedule.closedDays?.includes(parts.day)))return false;
  if(today.some(([start,end])=>minute>=start&&minute<end))return true;
  if(previous?.some(([,end])=>end>1440&&minute<end-1440))return true;
  // Unknown previous holiday hours might extend into this morning.
  if(previous===null && minute<720)return null;
  return false;
}
const scheduleCache = new Map();
export function openingStatus(record,now,calendar,{next=true}={}) {
  const raw=hoursFor(record);
  if(!scheduleCache.has(raw)) { if(scheduleCache.size>10000)scheduleCache.clear(); scheduleCache.set(raw,parseHours(raw)); }
  const schedule=scheduleCache.get(raw);
  const unknown={state:'unknown',label:raw?'Hours need checking':'Hours unknown',raw};
  if(!schedule)return unknown;
  const instant=new Date(now),open=stateAt(schedule,instant,calendar);
  if(open===null)return {...unknown,label:'Holiday hours unconfirmed'};
  const result={state:open?'open':'closed',label:open?'Open according to listed hours':'Closed according to listed hours',raw};
  const parts=mauritiusParts(instant),today=dayIntervals(schedule,instant,calendar);
  result.today=today;result.date=parts.date;
  if(!next)return result;
  // Check schedule boundaries rather than every minute of a week.
  const midnight=Date.parse(parts.date+'T00:00:00+04:00');
  for(let d=-1;d<8;d++){
    const day=new Date(midnight+d*DAY_MS), intervals=dayIntervals(schedule,day,calendar);
    if(!intervals)continue;
    for(const minute of [...new Set(intervals.flat())].sort((a,b)=>a-b)){
      const boundary=new Date(day.getTime()+minute*60000);
      if(boundary<=instant)continue;
      const before=stateAt(schedule,new Date(boundary.getTime()-60000),calendar),after=stateAt(schedule,boundary,calendar);
      if(before!==null&&after!==null&&before!==after){result.next={at:boundary.toISOString(),state:after?'open':'closed'};return result;}
    }
  }
  return result;
}
export function visitStatus(record,arrival,duration,calendar) {
  const instant=localDateTime(arrival);
  if(!instant)return {state:'unknown',label:'Choose an arrival time (Mauritius time)'};
  const minutes=Math.max(1,Math.min(1440,Number(duration)||60));let unknown=false;
  for(let i=0;i<minutes;i++){
    const state=openingStatus(record,new Date(instant.getTime()+i*60000),calendar,{next:false}).state;
    if(state==='closed')return {state:'closed',label:i===0?'Closed at planned arrival':'Closes or has a break during your visit'};
    if(state==='unknown')unknown=true;
  }
  return unknown?{state:'unknown',label:'Confirm hours for this visit'}:{state:'open',label:'Visit fits listed hours'};
}
export function distanceKm(a,b) {
  if(!a||!b)return null;
  const rad=d=>d*Math.PI/180, dlat=rad(b[0]-a[0]),dlon=rad(b[1]-a[1]);
  const h=Math.sin(dlat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dlon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function contactLinks(record) {
  const p=record.planning||{},t=p.tags||{},row=record.raw;
  function digits(value){
    const first=String(value||'').split(/[;,]/)[0].trim().replace(/[\s().-]/g,'').replace(/^00/,'+');
    if(/^\d{7,8}$/.test(first))return '230'+first;
    if(/^\+\d{8,15}$/.test(first))return first.slice(1);
    if(/^230\d{7,8}$/.test(first))return first;
    return null;
  }
  const phone=t['contact:phone']||t.phone||row.phone||row.phone_international_digits;
  const telephone=digits(phone), whatsapp=digits(t['contact:whatsapp']);
  return {phone,call:telephone?'tel:+'+telephone:null,whatsapp:whatsapp?'https://wa.me/'+whatsapp:null,website:safeURL(t['contact:website']||t.website),source:safeURL(p.source_url||row.source_url)};
}
export const PRACTICAL_FILTERS=[
 ['open','Open now (listed hours)'],['vegetarian','Vegetarian options'],['vegan','Vegan options'],['egg','Egg-friendly vegetarian'],['toilet','Adapted toilet'],['lift','Lift'],['seating','Wheelchair seating'],['air','Air conditioning'],['covered','Covered venue / area'],['contacts','Has a phone number'],['services','Service information'],['updates','Has visitor reports'],
];
export function practicalMatch(record,selected,now,calendar) {
  if (!selected.length) return true;
  const t=record.planning?.tags||{},r=record.raw;
  const positive=v=>['yes','only','designated'].includes(v)||status(v).group==='positive';
  const flags={vegetarian:positive(t['diet:vegetarian']),vegan:positive(t['diet:vegan']),egg:positive(t['diet:ovo_vegetarian']),toilet:positive(r.wheelchair_toilet)||positive(t['toilets:wheelchair']),lift:positive(r.lift),seating:positive(r.wheelchair_seating),air:positive(t.air_conditioning),covered:positive(t.covered),contacts:Boolean(contactLinks(record).call),services:Boolean(record.planning?.services?.length),updates:Boolean(record.reports?.length)};
  return selected.every(id=>id==='open'?openingStatus(record,now,calendar,{next:false}).state==='open':Boolean(flags[id]));
}
export function nearbyRecords(records,origin,radius) {
  return records.map(record=>({record,distance:distanceKm(origin,coordinates(record))})).filter(item=>item.distance!==null&&item.distance<=radius).sort((a,b)=>a.distance-b.distance);
}
export function formatTime(minutes){return String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');}
export function formatIntervals(intervals){return intervals===null?'Unconfirmed':intervals.length?intervals.map(([a,b])=>`${formatTime(a)}–${formatTime(b)}${b>1440?' (+1 day)':''}`).join(', '):'Closed';}
export function readTrip(value) {
  try {const rows=JSON.parse(value);if(!Array.isArray(rows))return [];const seen=new Set();return rows.filter(r=>r&&typeof r.key==='string'&&r.key.length<200&&!seen.has(r.key)&&seen.add(r.key)).slice(0,50).map(r=>({key:r.key,arrival:localDateTime(r.arrival)?r.arrival:'',duration:Math.max(1,Math.min(1440,Math.trunc(Number(r.duration))||60))}));}catch{return [];}
}
