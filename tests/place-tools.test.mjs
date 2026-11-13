import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalize, parseCSV, DATASETS } from '../data-core.mjs';
import { matchesNeeds, validNeeds, coordinates, attachEvidence, readSaved, buildReport } from '../place-tools.mjs';
const ds = DATASETS.find(item => item.id === 'curated');
const record = raw => normalize({ place_id:'one',place_name:'Café & <script>',...raw }, ds, 0);
test('needs require positive reports for every chosen facility; no inference from general access', () => {
  const item = record({wheelchair_access:'mapped_yes',wheelchair_parking:'listed_yes',step_free_entrance:'unknown',wheelchair_toilet:'reported_no'});
  assert(matchesNeeds(item,['access','parking']));
  assert(!matchesNeeds(item,['access','entrance']));
  assert(!matchesNeeds(item,['toilet']));
  assert(!matchesNeeds(record({wheelchair_access:'partial'}),['access']));
  assert.deepEqual(validNeeds(['access','bad','access','parking']),['access','parking']);
});
test('map rejects blank, zero, malformed and out-of-region coordinates, accepts Rodrigues', () => {
  for(const raw of [{},{latitude:'',longitude:''},{latitude:'0',longitude:'0'},{latitude:'bad',longitude:'57.5'},{latitude:'-91',longitude:'57.5'}])assert.equal(coordinates(record(raw)),null);
  assert.deepEqual(coordinates(record({latitude:'-19.7',longitude:'63.4'})),[-19.7,63.4]);
});
test('evidence joins exact record IDs and never promotes identity listings to access or onsite verification', () => {
  const observations=[{place_id:'one',source_id:'a',feature:'wheelchair_access',status:'reported_yes',evidence_type:'visitor_review'}, {place_id:'different',source_id:'b',status:'yes',evidence_type:'operator_statement'}];
  const item = attachEvidence(record({field_verified:'false'}),observations,[{source_id:'a',url:'https://example.com/review',title:'Review'}]);
  assert.deepEqual(item.evidence.map(value=>value.id),['visitor']);
  assert.equal(item.observations.length,1);assert.equal(item.observations[0].url,'https://example.com/review');
  assert.deepEqual(attachEvidence(record({}),[{place_id:'one',source_id:'x',status:'yes'}],[{source_id:'x',evidence_type:'operator_identity_directory'}]).evidence.map(value=>value.id),['listing']);
  assert.deepEqual(attachEvidence(normalize({record_id:'osm1',has_accessibility_tag:'true'},DATASETS[0],0)).evidence.map(value=>value.id),['map']);
});
test('saved keys tolerate corrupt storage and deduplicate',()=>{
 assert.deepEqual(readSaved('bad'),[]);assert.deepEqual(readSaved('{}'),[]);assert.deepEqual(readSaved('["osm:1","osm:1",42]'),['osm:1']);
});
test('report creates a reviewable GitHub draft with stable record and source, without implying data has changed',()=>{
 const result=buildReport(record({}),{feature:'entrance',status:'no',basis:'visit',date:'2026-11-12',notes:'Three steps at the entrance.',source:'javascript:bad'},'https://rishirajgujadhur.github.io/MauritiusInfo/?search=private&saved=1');
 const url=new URL(result.url);assert.equal(url.pathname,'/RishiRajGujadhur/MauritiusInfo/issues/new');
 assert.match(url.searchParams.get('body'),/Three steps/);assert(!result.body.includes('search=private'));assert(!result.body.includes('javascript:'));
 assert.match(result.body,/not yet changed/);assert.match(result.body,/2026-11-12/);assert.match(result.body,/record=curated%3Aone/);
});
test('real evidence coverage and coordinate coverage keep listings distinct from verified reports',()=>{
 const counts={};let mapped=0, onsite=0;
 for(const dataset of DATASETS){
  const root=dataset.path.slice(0,dataset.path.lastIndexOf('/'));
  const read=p=>parseCSV(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
  const observations=['osm','directory','health','official'].includes(dataset.id)?[]:read(root+'/accessibility_observations.csv');
  const sources=['osm','directory','health','official'].includes(dataset.id)?[]:read(root+'/sources.csv');
  for(const [index,row] of read(dataset.path).entries()){
   const item=attachEvidence(normalize(row,dataset,index),observations,sources);
   if(coordinates(item))mapped++;
   for(const evidence of item.evidence)counts[evidence.id]=(counts[evidence.id]||0)+1;
   if(item.evidence.some(e=>e.id==='onsite'))onsite++;
   if(['directory','health'].includes(dataset.id))assert.deepEqual(item.evidence.map(e=>e.id),['listing']);
  }
 }
 assert.equal(mapped,7876);assert.equal(onsite,0);assert(counts.map>0);assert(counts.visitor>0);assert(counts.venue>0);
});
