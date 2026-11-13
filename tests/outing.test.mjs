import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {visitSummary,callAheadChecklist,closingSoon,possibleSamePlace,duplicateGroups,readPrivateNotes,encodeOuting,readSharedOuting,outingURL,mergeOuting} from '../outing-core.mjs';
const calendar=JSON.parse(readFileSync(new URL('../data/planning/holidays.json',import.meta.url)));
const record=(key,lat=-20.2,lon=57.5)=>({key,name:'Example Venue',address:'12 Main Street Moka',raw:{latitude:lat,longitude:lon},planning:{opening_hours:'Mo-Su 09:00-17:00; PH off'}});
const stop={key:'osm:a',arrival:'2026-11-13T14:00',duration:60};
test('visit summaries distinguish reported positives, barriers and missing evidence without inheriting access',()=>{
 const r=record('a');r.raw.wheelchair_access='mapped_yes';r.raw.step_free_entrance='limited';r.raw.wheelchair_toilet='no';
 const s=visitSummary(r);assert.equal(s.matched.length,1);assert.equal(s.barriers.length,2);assert.equal(s.unknown.length,1);
 assert.equal(visitSummary(r,['parking']).unknown.length,1);assert.match(visitSummary(r,['access']).label,/reported available/);
});
test('call-ahead questions include selected needs, the planned date and transfer assistance without claiming availability',()=>{
 const r=record('a');const q=callAheadChecklist(r,['parking'],{date:'2026-11-13',start:540,end:660});
 assert(q.text.includes('09:00–11:00'));assert(q.text.includes('2026-11-13'));assert(q.text.includes('transfer'));assert(q.text.includes('unknown'));assert(!q.text.includes('adapted toilet available'));
});
test('closing alerts use known upcoming closures, respect 30/60 minutes and ignore closed or unknown holidays',()=>{
 const r=record('a');assert.equal(closingSoon(r,'2026-11-13T12:15:00Z',calendar,60).minutes,45);assert.equal(closingSoon(r,'2026-11-13T12:15:00Z',calendar,30),null);
 assert.equal(closingSoon(r,'2026-11-13T13:00:00Z',calendar,60),null);assert.equal(closingSoon(r,'2026-12-25T12:30:00Z',calendar,60),null);
 r.planning.opening_hours='Fr 22:00-02:00; PH off';assert.equal(closingSoon(r,'2026-11-13T21:30:00Z',calendar,30).minutes,30);
 r.planning.opening_hours='Mo-Fr 09:00-12:00,13:00-17:00; PH off';assert.equal(closingSoon(r,'2026-11-13T07:30:00Z',calendar,30).minutes,30);
 r.planning.opening_hours='Mo-Su sunrise-sunset';assert.equal(closingSoon(r,'2026-11-13T12:30:00Z',calendar),null);
});
test('duplicate candidates require exact normalized names and pins within 75m or a specific shared address',()=>{
 const a=record('a'),b=record('b',-20.2001),far=record('far',-20.25);assert(possibleSamePlace(a,b));assert(!possibleSamePlace(a,far));
 b.name='Different shop';assert(!possibleSamePlace(a,b));b.name=a.name;b.raw={};assert(possibleSamePlace(a,b));b.address='Moka';assert(!possibleSamePlace(a,b));
 assert.equal(a.raw.wheelchair_access,undefined);
});
test('duplicate grouping does not chain together distant records or merge any source facts',()=>{
 const a=record('a',-20.2),b=record('b',-20.2006),c=record('c',-20.2012);a.raw.wheelchair_access='yes';b.raw.wheelchair_access='unknown';
 const groups=duplicateGroups([c,b,a]);assert.equal(groups.length,1);assert.deepEqual(groups[0].records.map(r=>r.key),['a','b']);assert.equal(b.raw.wheelchair_access,'unknown');
});
test('private notes tolerate corrupt storage and bound content without accepting arbitrary object keys',()=>{
 assert.deepEqual(readPrivateNotes('broken'),{});assert.deepEqual(readPrivateNotes('[]'),{});assert.deepEqual(readPrivateNotes('{"osm:a":"Side entrance","bad":"no","osm:b":12}'),{'osm:a':'Side entrance'});
 assert.equal(readPrivateNotes(JSON.stringify({'osm:a':'x'.repeat(2500)}))['osm:a'].length,2000);
});
test('outing links round-trip only public stop IDs and schedule fields, excluding notes, GPS and other queries',()=>{
 const privateStop={...stop,notes:'Private note',gps:[-20,57],name:'Private name'};
 const url=outingURL([privateStop],'https://example.test/MauritiusInfo/?gps=1&search=Moka#private');const parsed=new URL(url);
 assert.deepEqual([...parsed.searchParams.keys()],['plan']);assert.equal(parsed.hash,'');
 const injected=btoa(JSON.stringify({version:1,stops:[privateStop],gps:[-20,57],notes:'Secret'})).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');assert.deepEqual(readSharedOuting(injected).stops,[stop]);
 assert.deepEqual(readSharedOuting(parsed.searchParams.get('plan')).stops,[stop]);assert(!atob(parsed.searchParams.get('plan').replaceAll('-','+').replaceAll('_','/')).includes('Private'));
});
test('shared outing reader rejects malformed, unsupported, oversized and invalid-date plans',()=>{
 assert.equal(readSharedOuting(null),null);for(const value of ['%%%','x'.repeat(8001),btoa('{"version":2,"stops":[]}')])assert(readSharedOuting(value).error);
 for(const rows of [[],Array(11).fill(stop),[{...stop,arrival:'2026-02-30T10:00'}],[{...stop,duration:0}],[stop,stop]])assert.throws(()=>encodeOuting(rows));
 const unicode={...stop,key:'official:café'};assert.equal(readSharedOuting(encodeOuting([unicode])).stops[0].key,unicode.key);
});
test('importing shared stops preserves the existing plan and its times, skips unknown/duplicate keys and caps 50',()=>{
 const existing=[stop],changed={...stop,arrival:'2026-11-13T15:00'};const r=mergeOuting(existing,[changed,{...stop,key:'osm:b'},{...stop,key:'missing'}],new Set(['osm:a','osm:b']));
 assert.equal(r.trip[0].arrival,stop.arrival);assert.deepEqual(r.added,['osm:b']);assert.equal(r.skipped,2);assert.equal(existing.length,1);
 assert.equal(mergeOuting(Array.from({length:50},(_,i)=>({...stop,key:'x'+i})),[stop],new Set([stop.key])).trip.length,50);
});
