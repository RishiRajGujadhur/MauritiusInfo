import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHours,openingStatus,mauritiusParts,localDateTime,visitStatus,distanceKm,contactLinks,practicalMatch,readTrip,nearbyRecords} from '../planning-core.mjs';
const calendar=JSON.parse(readFileSync(new URL('../data/planning/holidays.json',import.meta.url)));
const record=(hours,tags={})=>({key:'test:1',raw:{},planning:{opening_hours:hours,tags}});
const at=localDateTime;

test('hours parsing handles split shifts, explicit closures and overnight intervals',()=>{
 const schedule=parseHours('Mo-Fr 09:00-12:00,13:00-17:00; Sa 22:00-02:00; Su off; PH off');
 assert.deepEqual(schedule.week[0],[[540,720],[780,1020]]);
 assert.deepEqual(schedule.week[5],[[1320,1560]]);
 assert.deepEqual(schedule.week[6],[]);assert.deepEqual(schedule.holiday,[]);
 for(const raw of ['Mo-Fr sunrise-sunset','Jan-Mar Mo-Fr 09:00-17:00','Mo-Fr 25:00-30:00','PH unknown','Mo 09:00-09:00',';','Mo-Fr 09:00-17:00 "call first"'])assert.equal(parseHours(raw),null,raw);
});
test('hours use Mauritius time regardless of the browser timezone',()=>{
 assert.equal(mauritiusParts(new Date('2026-11-12T21:30:00Z')).date,'2026-11-13');
 assert.equal(mauritiusParts(new Date('2026-11-12T21:30:00Z')).minute,90);
 const r=record('Mo-Fr 09:00-17:00; Sa-Su off; PH off');
 assert.equal(openingStatus(r,at('2026-11-13T10:00'),calendar).state,'open');
 assert.equal(openingStatus(r,at('2026-11-13T17:00'),calendar).state,'closed');
 assert.equal(openingStatus(r,at('2026-11-13T10:00'),calendar).next.at,'2026-11-13T13:00:00.000Z');
});
test('public holidays, unknown exceptions, tentative dates and uncovered years are conservative',()=>{
 const r=record('Mo-Su 09:00-17:00; PH off');
 assert.equal(openingStatus(r,at('2026-12-25T10:00'),calendar).state,'closed');
 assert.equal(openingStatus(record('Mo-Su 09:00-17:00'),at('2026-12-25T10:00'),calendar).state,'unknown');
 assert.equal(openingStatus(r,at('2027-03-10T10:00'),calendar).state,'unknown');
 assert.equal(openingStatus(r,at('2028-01-10T10:00'),calendar).state,'unknown');
 assert.equal(openingStatus(record('24/7'),at('2028-01-10T10:00'),calendar).state,'open');
 assert(calendar.holidays.some(h=>h.date==='2026-11-09'));
 assert(calendar.holidays.some(h=>h.date==='2027-09-06'));
});
test('overnight visits include yesterday and next closing transition',()=>{
 const r=record('Fr 22:00-02:00; PH off');
 const result=openingStatus(r,at('2026-11-14T01:00'),calendar);
 assert.equal(result.state,'open');assert.equal(result.next.at,'2026-11-13T22:00:00.000Z');
 assert.equal(openingStatus(r,at('2026-11-14T02:00'),calendar).state,'closed');
});
test('trip warnings catch lunch breaks and closing during a visit',()=>{
 const r=record('Mo-Fr 09:00-12:00,13:00-17:00; PH off');
 assert.equal(visitStatus(r,'2026-11-13T11:30',120,calendar).state,'closed');
 assert.equal(visitStatus(r,'2026-11-13T10:00',60,calendar).state,'open');
 assert.equal(visitStatus(r,'2026-11-13T16:30',60,calendar).state,'closed');
 assert.equal(visitStatus(r,'',60,calendar).state,'unknown');
});
test('contact channels require a usable number and WhatsApp requires explicit source data',()=>{
 const r=record('',{phone:'468 8555',website:'javascript:bad'});
 assert.equal(contactLinks(r).call,'tel:+2304688555');assert.equal(contactLinks(r).whatsapp,null);assert.equal(contactLinks(r).website,null);
 r.planning.tags['contact:whatsapp']='+230 5800 1234';assert.equal(contactLinks(r).whatsapp,'https://wa.me/23058001234');
 r.planning.tags.phone='ask venue';assert.equal(contactLinks(r).call,null);
});
test('facility and dietary filters exclude unknowns and do not infer eggs or access',()=>{
 const r=record('24/7',{'diet:vegetarian':'yes','air_conditioning':'yes'});
 assert(practicalMatch(r,['vegetarian','air','open'],new Date(),calendar));
 assert(!practicalMatch(r,['egg'],new Date(),calendar));assert(!practicalMatch(r,['toilet'],new Date(),calendar));
});
test('nearby uses straight-line distance and excludes missing coordinates',()=>{
 assert.equal(distanceKm([0,0],[0,0]),0);assert(Math.abs(distanceKm([0,0],[0,1])-111.195)<0.01);
 const a={key:'a',raw:{latitude:-20.2,longitude:57.5}},b={key:'b',raw:{latitude:'',longitude:''}};
 assert.equal(nearbyRecords([a,b],[-20.2,57.5],2).length,1);
});
test('trip storage rejects corrupt entries, deduplicates and clamps durations',()=>{
 assert.deepEqual(readTrip('broken'),[]);assert.deepEqual(readTrip('{"key":"bad"}'),[]);
 const result=readTrip(JSON.stringify([null,{key:'a',arrival:'bad',duration:9999},{key:'a'},{key:123}]));
 assert.deepEqual(result,[{key:'a',arrival:'',duration:1440}]);
});
test('import joins exact mall identities and never assigns mall hours to a tenant',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/planning/records.json',import.meta.url))).records;
 assert(data['curated:MU0013'].hours_scope.includes('Mall'));
 assert.equal(data['curated:MU0032']?.hours_scope,undefined);
 const manifest=JSON.parse(readFileSync(new URL('../data/planning/import-manifest.json',import.meta.url)));
 assert.equal(manifest.failures.length,0);assert.equal(manifest.official_records,26);assert.equal(manifest.osm_opening_hours,405);
});

test('explicit closed days and holiday closures do not inherit an overnight opening',()=>{
 const r=record('Fr 22:00-02:00; Sa off; PH off');
 assert.equal(openingStatus(r,at('2026-11-14T01:00'),calendar).state,'closed');
 const holidayRecord=record('Th 22:00-02:00; PH off');
 assert.equal(openingStatus(holidayRecord,at('2026-12-25T01:00'),calendar).state,'closed');
 assert.equal(localDateTime('2026-02-31T12:00'),null);
});

test('operator arrival statements retain their separate source and do not overwrite map accessibility',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/planning/records.json',import.meta.url))).records;
 const hotel=data['osm:OSM-node-528903259'];
 assert.match(hotel.arrival_source_url,/ihg.com/);assert.match(hotel.drop_off_notes,/Operator reports/);
 const vegetarian=data['official:PADHARO-SA-CENTREPOINT'];
 assert.equal(vegetarian.tags['diet:vegetarian'],'only');assert.equal(vegetarian.tags['diet:ovo_vegetarian'],undefined);
});

test('mall trading groups retain different closing times without changing the default shop hours',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/planning/records.json',import.meta.url))).records;
 const p=data['curated:MU0013'];
 const hypermarket=p.trading_schedules.find(s=>s.scope==='Hypermarket');
 assert.equal(hypermarket.mall,'Bagatelle Mall');
 assert.equal(p.trading_schedules.length,5);
 const sunday=at('2026-11-15T18:00');
 assert.equal(openingStatus({raw:{},planning:p},sunday,calendar).state,'closed');
 assert.equal(openingStatus({raw:{},planning:{...p,opening_hours:hypermarket.opening_hours}},sunday,calendar).state,'open');
 assert.equal(data['curated:MU0032']?.trading_schedules,undefined);
 for(const value of Object.values(data)) for(const s of value.trading_schedules||[]) {
  assert(parseHours(s.opening_hours),s.mall+' '+s.scope);
  assert.equal(s.source_url,'https://www.ascenciamalls.com/opening-hours');
 }
});
