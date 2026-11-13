import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecents,addRecent,searchQuery,readSearches,savedBackup,importSaved,tripBackup,importTrip,chronologicalTrip,csvCell,recordsCSV,relativeDate} from '../qol-core.mjs';

test('recent queries recover from corrupt storage and deduplicate accent-insensitively',()=>{
 assert.deepEqual(readRecents('broken'),[]);assert.deepEqual(readRecents('{}'),[]);
 assert.deepEqual(addRecent(['Café','Moka'],'cafe'),['cafe','Moka']);
 assert.equal(addRecent(Array.from({length:8},(_,i)=>'q'+i),'new').length,8);
 assert.deepEqual(readRecents('[null,12,"  Moka ","Moka"]'),['Moka']);
 assert.equal(addRecent([],'x'.repeat(200))[0].length,120);
});
test('saved searches strip unknown keys, place selection and location coordinates',()=>{
 const query=searchQuery('?search=Moka&latitude=-20&longitude=57&gps=1&record=osm:1&page=3&hours=2026-11-13,540,1020&needs=parking');
 const params=new URLSearchParams(query);assert.equal(params.get('search'),'Moka');assert.equal(params.get('needs'),'parking');
 for(const key of ['latitude','longitude','gps','record','page'])assert(!params.has(key));
 assert.equal(readSearches(JSON.stringify([{name:'Weekend',query}]))[0].query,query);
 assert.deepEqual(readSearches('null'),[]);
});
test('bookmark backups merge without losing existing bookmarks or trusting unknown records',()=>{
 const known=new Set(['a','b']);
 assert.deepEqual(importSaved(savedBackup(['b','b','missing']),['a'],known),{keys:['a','b'],skipped:1});
 for(const bad of ['broken','{}','{"type":"mauritius-saved","version":1,"keys":[null]}'])assert.throws(()=>importSaved(bad,[],known));
 assert.throws(()=>importSaved('x'.repeat(1000001),[],known),/large/);
 assert.throws(()=>importSaved(savedBackup(['a']),Array.from({length:10000},(_,i)=>'old'+i),known),/10,000/);
});
test('trip backups retain duration and dates but reject invalid times and outsize plans',()=>{
 const plan=[{key:'a',arrival:'2026-11-13T10:00',duration:60},{key:'missing',arrival:'',duration:30}];
 assert.deepEqual(importTrip(tripBackup(plan),new Set(['a'])),{trip:[plan[0]],skipped:1});
 assert.throws(()=>importTrip(tripBackup([{key:'a',arrival:'2026-02-30T09:00',duration:30}]),new Set(['a'])));
 assert.throws(()=>importTrip(tripBackup([{key:'a',arrival:'',duration:0}]),new Set(['a'])));
 assert.throws(()=>importTrip(tripBackup(Array(51).fill(plan[0])),new Set(['a'])));
});
test('arrival ordering is stable for unscheduled stops and never mutates the plan',()=>{
 const rows=[{key:'none',arrival:''},{key:'late',arrival:'2026-11-13T12:00'},{key:'early',arrival:'2026-11-13T09:00'},{key:'other',arrival:''}];
 assert.deepEqual(chronologicalTrip(rows).map(x=>x.key),['early','late','none','other']);assert.equal(rows[0].key,'none');
});
test('CSV exports escape multiline values and spreadsheet formulas while preserving source identity',()=>{
 assert.equal(csvCell('=SUM(A1)'),`"'=SUM(A1)"`);assert.equal(csvCell(' A"B\nC'),`" A""B\nC"`);
 const text=recordsCSV([{id:'a',name:'=bad()',category:'Other',area:'Moka',address:'Line 1\nLine 2',access:{raw:'unknown'},parking:{raw:'unknown'},dataset:{name:'Source'},evidence:[{label:'Listing only'}]}]);
 assert(text.startsWith('\uFEFF'));assert(text.includes("'=bad()"));assert(text.includes('Listing only'));
});
test('date shortcuts cross midnight, months and leap days in Mauritius time',()=>{
 assert.equal(relativeDate(0,new Date('2026-11-13T21:00:00Z')),'2026-11-14');
 assert.equal(relativeDate(1,new Date('2028-02-28T10:00:00Z')),'2028-02-29');
});
