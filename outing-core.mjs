import {fold,status} from './data-core.mjs';
import {NEEDS,validNeeds,coordinates} from './place-tools.mjs';
import {distanceKm,openingStatus,localDateTime,windowTime} from './planning-core.mjs';

export function visitSummary(record,ids=[]){
 const selected=validNeeds(ids),used=selected.length?selected:NEEDS.map(n=>n.id);
 const rows=used.map(id=>{const need=NEEDS.find(n=>n.id===id),report=status(record.raw[need.field]);return {...need,...report,needLabel:need.label};});
 const matched=rows.filter(r=>r.group==='positive'),barriers=rows.filter(r=>['limited','negative'].includes(r.group)),unknown=rows.filter(r=>r.group==='unknown');
 return {rows,matched,barriers,unknown,selected:Boolean(selected.length),label:barriers.length?'Reported barriers to review':unknown.length?'Some facilities need confirmation':'Selected facilities are reported available'};
}
const QUESTIONS={access:'Is the route from the arrival point to the venue wheelchair accessible, including any lifts?',entrance:'Is there a step-free entrance? What is its narrowest clear doorway width?',parking:'Is an accessible parking bay available, with side transfer space and a step-free route to the entrance?',toilet:'Is the adapted toilet available and usable today? Please confirm doorway width and transfer space.'};
export function callAheadChecklist(record,ids=[],window=null){
 const summary=visitSummary(record,ids);
 const questions=summary.rows.map(r=>`${QUESTIONS[r.id]} (Current source: ${r.label.toLowerCase()}.)`);
 questions.push(window?`Will you be open throughout ${windowTime(window.start)}–${windowTime(window.end)} on ${window.date}, Mauritius time, including any breaks?`:'What are your opening hours and any breaks on the day of the visit?');
 questions.push('Where is the safest drop-off or transfer point? Is staff assistance available on arrival, and must it be arranged beforehand?');
 questions.push('Are any lifts, ramps, toilets or entrances temporarily unavailable?');
 return {questions,text:[`Call-ahead checklist: ${record.name}`,`Source record: ${record.dataset?.name||record.key}`,...questions.map((q,i)=>`${i+1}. ${q}`),'These are questions to confirm, not verified venue facts.'].join('\n')};
}
export function closingSoon(record,now,calendar,threshold=60){
 const current=openingStatus(record,now,calendar);
 const minutes=current.next?Math.ceil((Date.parse(current.next.at)-new Date(now).getTime())/60000):Infinity;
 return current.state==='open'&&current.next?.state==='closed'&&minutes>0&&minutes<=(threshold===30?30:60)?{minutes,at:current.next.at}:null;
}
const identity=value=>fold(value).replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function possibleSamePlace(a,b){
 const name=identity(a.name);if(name.length<4||name!==identity(b.name)||name==='unnamed record')return false;
 const pa=coordinates(a),pb=coordinates(b);
 if(pa&&pb)return distanceKm(pa,pb)<=0.075;
 const address=identity(a.address);
 return address.length>=12&&address.split(' ').length>=3&&address===identity(b.address);
}
export function duplicateGroups(records){
 const buckets=new Map();for(const r of records){const name=identity(r.name);if(name.length<4||name==='unnamed record')continue;if(!buckets.has(name))buckets.set(name,[]);buckets.get(name).push(r);}
 const groups=[];
 for(const bucket of buckets.values()){
  if(bucket.length<2)continue;
  const clusters=[];
  for(const record of [...bucket].sort((a,b)=>a.key.localeCompare(b.key))){const group=clusters.find(rows=>rows.every(other=>possibleSamePlace(other,record)));if(group)group.push(record);else clusters.push([record]);}
  for(const rows of clusters)if(rows.length>1)groups.push({id:rows[0].key,name:rows[0].name,records:rows});
 }
 return groups.sort((a,b)=>a.name.localeCompare(b.name));
}
export function readPrivateNotes(value){
 try{const data=JSON.parse(value);if(!data||Array.isArray(data)||typeof data!=='object')return {};return Object.fromEntries(Object.entries(data).filter(([key,text])=>/^[a-z]+:.{1,180}$/.test(key)&&typeof text==='string').slice(0,1000).map(([key,text])=>[key,text.slice(0,2000)]));}catch{return {};}
}
function validStop(row){return row&&typeof row.key==='string'&&row.key.length>0&&row.key.length<200&&!/[\u0000-\u001f]/.test(row.key)&&typeof row.arrival==='string'&&(!row.arrival||localDateTime(row.arrival))&&Number.isInteger(row.duration)&&row.duration>=1&&row.duration<=1440;}
export function encodeOuting(trip){
 if(!Array.isArray(trip)||!trip.length||trip.length>10||!trip.every(validStop)||new Set(trip.map(s=>s.key)).size!==trip.length)throw Error('Choose one to ten different stops with valid times and durations.');
 const data={version:1,stops:trip.map(({key,arrival,duration})=>({key,arrival,duration}))};
 const bytes=new TextEncoder().encode(JSON.stringify(data)),token=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 if(token.length>8000)throw Error('This outing link is too long. Select fewer stops.');return token;
}
export function readSharedOuting(token){
 if(!token)return null;
 try{
  if(typeof token!=='string'||token.length>8000||!/^[A-Za-z0-9_-]+$/.test(token))throw Error();
  const binary=atob(token.replaceAll('-','+').replaceAll('_','/')),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  if(data.version!==1||!Array.isArray(data.stops)||!data.stops.length||data.stops.length>10||!data.stops.every(validStop)||new Set(data.stops.map(s=>s.key)).size!==data.stops.length)throw Error();
  return {token,stops:data.stops.map(({key,arrival,duration})=>({key,arrival,duration})),error:null};
 }catch{return {token:null,stops:[],error:'This outing link is invalid or unsupported. Ask the sender for a fresh link.'};}
}
export function outingURL(trip,base){const url=new URL(base);if(!['https:','http:'].includes(url.protocol))throw Error('Unsupported site address.');url.search='';url.hash='';url.searchParams.set('plan',encodeOuting(trip));return url.href;}
export function mergeOuting(existing,incoming,known){
 const result=[...existing],added=[],seen=new Set(existing.map(s=>s.key));let skipped=0;
 for(const stop of incoming){if(!validStop(stop)||!known.has(stop.key)||seen.has(stop.key)||result.length>=50){skipped++;continue;}seen.add(stop.key);const next={key:stop.key,arrival:stop.arrival,duration:stop.duration};result.push(next);added.push(stop.key);}
 return {trip:result,added,skipped};
}
