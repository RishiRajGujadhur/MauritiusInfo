import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readHoursWindow,hoursWindowMatch,windowTime,distanceKm} from '../planning-core.mjs';
import {coordinates} from '../place-tools.mjs';
import {requestGPS} from '../web/src/geolocation.mjs';
import {createTable,getCoreRowModel,getSortedRowModel} from '../web/node_modules/@tanstack/table-core/build/lib/index.mjs';
const calendar=JSON.parse(readFileSync(new URL('../data/planning/holidays.json',import.meta.url)));
const record=opening_hours=>({raw:{},planning:{opening_hours}});
const window=(start=540,end=1020,date='2026-11-13')=>({date,start,end});

test('hours URL range validates dates, quarter-hour steps, ordered bounds and midnight',()=>{
 assert.deepEqual(readHoursWindow('2026-11-13,540,1020'),window());
 assert.deepEqual(readHoursWindow('2026-11-13,0,1440'),window(0,1440));
 for(const value of [null,'','2026-02-30,540,1020','2026-11-13,600,540','2026-11-13,540,540','2026-11-13,-15,1440','2026-11-13,541,1020','2026-11-13,0,1441','2026-11-13,0,1440,extra','2026-11-13,,1440'])assert.equal(readHoursWindow(value),null,String(value));
 assert.equal(windowTime(1440),'24:00');assert.equal(windowTime(555),'09:15');
});
test('opening window requires continuous coverage, including split and adjacent shifts',()=>{
 const r=record('Mo-Fr 09:00-12:00,13:00-17:00; PH off');
 assert(hoursWindowMatch(r,window(540,720),calendar));
 assert(hoursWindowMatch(r,window(780,1020),calendar));
 assert(!hoursWindowMatch(r,window(),calendar));
 assert(!hoursWindowMatch(r,window(525,720),calendar));
 assert(!hoursWindowMatch(r,window(780,1035),calendar));
 assert(hoursWindowMatch(record('Fr 09:00-12:00,12:00-17:00'),window(),calendar));
 assert(hoursWindowMatch(record('24/7'),window(0,1440),calendar));
 assert(!hoursWindowMatch(record('Fr sunrise-sunset'),window(),calendar));
 assert(!hoursWindowMatch(record(''),window(),calendar));
 assert(hoursWindowMatch(record(''),null,calendar));
});
test('opening window respects calendar, overnight carry and explicit day closures',()=>{
 const r=record('Mo-Su 09:00-17:00; PH off');
 assert(!hoursWindowMatch(r,window(540,1020,'2026-12-25'),calendar));
 assert(!hoursWindowMatch(record('Mo-Su 09:00-17:00'),window(540,1020,'2026-12-25'),calendar));
 assert(!hoursWindowMatch(r,window(540,1020,'2027-03-10'),calendar));
 assert(!hoursWindowMatch(r,window(540,1020,'2028-01-10'),calendar));
 assert(hoursWindowMatch(record('Fr 22:00-02:00; PH off'),window(0,120,'2026-11-14'),calendar));
 assert(!hoursWindowMatch(record('Fr 22:00-02:00; Sa off; PH off'),window(0,120,'2026-11-14'),calendar));
 assert(!hoursWindowMatch(record('Th 22:00-02:00; PH off'),window(0,120,'2026-12-25'),calendar));
});
test('GPS is requested explicitly with a timeout and validated coordinates',async()=>{
 let called=0;
 const geo={getCurrentPosition(success,error,options){called++;assert.equal(options.timeout,12000);assert.equal(options.enableHighAccuracy,true);success({coords:{latitude:-20.2,longitude:57.5,accuracy:35}});}};
 assert.equal(called,0);
 assert.deepEqual(await requestGPS(geo),{point:[-20.2,57.5],accuracy:35});assert.equal(called,1);
 await assert.rejects(requestGPS({getCurrentPosition(success){success({coords:{latitude:NaN,longitude:57.5}});}}),/invalid location/);
 await assert.rejects(requestGPS({getCurrentPosition(success){success({coords:{latitude:91,longitude:57.5}});}}),/invalid location/);
 await assert.rejects(requestGPS(null),/unavailable/);
});
test('GPS denial and timeout produce actionable errors without fabricating a location',async()=>{
 for(const [code,pattern] of [[1,/permission was denied/],[2,/could not be found/],[3,/timed out/]])await assert.rejects(requestGPS({getCurrentPosition(success,error){error({code});}}),pattern);
});
test('proximity sorting retains distant and unmapped places and orders known coordinates first',()=>{
 const origin=[-20.2,57.5];
 const rows=[{key:'unknown',raw:{}},{key:'far',raw:{latitude:-19.7,longitude:63.4}},{key:'near',raw:{latitude:-20.201,longitude:57.501}},{key:'missing',raw:{latitude:'',longitude:''}}];
 const table=createTable({data:rows,columns:[{id:'proximity',accessorFn:r=>distanceKm(origin,coordinates(r))??Infinity,sortingFn:'basic'}],state:{sorting:[{id:'proximity',desc:false}],columnPinning:{}},getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),onStateChange(){},renderFallbackValue:null});
 assert.deepEqual(table.getSortedRowModel().rows.map(r=>r.original.key),['near','far','unknown','missing']);
 assert.equal(rows.length,4);
});
