import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DATASETS,parseCSV,normalize,status,safeURL,humanize,filterRecords,paginate} from '../data-core.mjs';
test('CSV preserves multiline fields, commas, escaped quotes, CRLF and BOM',()=>{
  assert.deepEqual(parseCSV('\uFEFFname,note\r\n"A, B","Line 1\nLine ""2"""\r\n'),[{name:'A, B',note:'Line 1\nLine "2"'}]);
  assert.throws(()=>parseCSV('a,b\n"unclosed,x'));
  assert.throws(()=>parseCSV('a,b\nx,y,z'));
});
test('all nine real source tables load without schema corruption',()=>{
  const counts=DATASETS.map(d=>parseCSV(readFileSync(new URL('../'+d.path,import.meta.url),'utf8')).map((r,i)=>normalize(r,d,i)));
  assert.deepEqual(counts.map(r=>r.length),[6965,1282,169,35,39,16,12,16,14]);
  const all=counts.flat();assert.equal(all.length,8548);assert.equal(new Set(all.map(r=>r.key)).size,8548);
  assert(all.every(r=>r.name&&r.category&&r.area));
  assert(counts[1].every(r=>r.access.group==='unknown'));
  assert(counts[2].every(r=>r.parking.group==='unknown'));
});
test('search is accent-insensitive; access and parking filters remain independent',()=>{
  const ds={id:'test',name:'Test',path:'test.csv'};
  const rows=[{place_name:'Café Moka',wheelchair_access:'unknown',wheelchair_parking:'listed_yes'}, {place_name:'Cafe Moka 2',wheelchair_access:'mapped_no',wheelchair_parking:'unknown'}, {place_name:'Different',wheelchair_access:'mapped_limited'}].map((r,i)=>normalize(r,ds,i));
  assert.equal(filterRecords(rows,{search:'cafe moka'}).length,2);
  assert.equal(filterRecords(rows,{search:'cafe',parking:'positive',access:'unknown'}).length,1);
  assert.equal(filterRecords(rows,{access:'positive'}).length,0);
  assert.equal(filterRecords(rows,{access:'negative'}).length,1);
  assert.equal(humanize('Rivière du Rempart'),'Rivière Du Rempart');
  assert.equal(status('listed_yes').group,'positive');assert.equal(status('mapped_limited').group,'limited');assert.equal(status('unknown').group,'unknown');
});
test('pagination clamps invalid pages and handles empty results',()=>{
  const rows=Array.from({length:61},(_,i)=>i);
  assert.equal(paginate(rows,9,25).page,3);assert.equal(paginate(rows,3,25).items.length,11);
  assert.equal(paginate(rows,-2,25).page,1);assert.equal(paginate([],99,25).pages,1);
  assert.equal(paginate(rows,1,999).size,25);
});
test('source URLs reject script and data protocols',()=>{
  assert.equal(safeURL('javascript:alert(1)'),null);assert.equal(safeURL('data:text/html,bad'),null);
  assert.equal(safeURL('https://example.com/'),'https://example.com/');
});
