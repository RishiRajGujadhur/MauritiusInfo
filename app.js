import {DATASETS,parseCSV,normalize,status,safeURL,humanize,filterRecords,paginate} from './data-core.mjs';
const $=id=>document.getElementById(id);
const fields=['search','area','category','access','parking','dataset','sort'];
let records=[],page=1,controller,detailTrigger;
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function badge(value){const s=typeof value==='object'?value:status(value);const n=el('span',s.label,'badge '+s.group);n.title='Source value: '+humanize(s.raw);return n;}
function state(){return Object.fromEntries(fields.map(id=>[id,$(id).value]));}
function fillSelect(id,values){const select=$(id),selected=select.value;select.querySelectorAll('option:not(:first-child)').forEach(n=>n.remove());[...new Set(values)].sort((a,b)=>a.localeCompare(b,'en')).forEach(value=>{const option=el('option',value);option.value=value;select.append(option);});select.value=selected;}
function render(){
  const s=state(),filtered=filterRecords(records,s),view=paginate(filtered,page,$('page-size').value);page=view.page;
  $('rows').replaceChildren();
  view.items.forEach(record=>{
    const tr=el('tr'),nameCell=el('td'),button=el('button',record.name,'place-button');button.type='button';button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>openDetails(record,button));nameCell.append(button,el('span',record.category+(record.type?' · '+record.type:''),'subline'));tr.append(nameCell);
    const area=el('td',record.area);if(record.address)area.append(el('span',record.address,'subline'));tr.append(area);
    for(const [label,value] of [['Wheelchair access',record.access],['Wheelchair parking',record.parking]]){const cell=el('td');cell.dataset.label=label;cell.append(badge(value));tr.append(cell);}
    tr.append(el('td',record.dataset.name,'dataset-label'));$('rows').append(tr);
  });
  $('count').textContent=`${filtered.length.toLocaleString()} matching source records · ${records.length.toLocaleString()} loaded`;
  $('empty').hidden=filtered.length!==0;
  $('page-summary').textContent=filtered.length?`Showing ${view.start+1}–${view.start+view.items.length} of ${filtered.length.toLocaleString()}`:'No records to display';
  $('page-number').value=page;$('page-number').max=view.pages;$('page-total').textContent='of '+view.pages;
  $('previous').disabled=page===1||!filtered.length;$('next').disabled=page===view.pages||!filtered.length;
  const query=new URLSearchParams();for(const [key,value] of Object.entries(s)){if(value&&!(key==='sort'&&value==='name'))query.set(key,value);}if(page>1)query.set('page',page);if($('page-size').value!=='25')query.set('size',$('page-size').value);
  history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
}
function reset(){for(const id of fields)$(id).value=id==='sort'?'name':'';page=1;render();}
function link(text,url){const safe=safeURL(url);if(!safe)return null;const a=el('a',text);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';return a;}
function openDetails(record,trigger){
  detailTrigger=trigger;const r=record.raw,body=$('detail-body');body.replaceChildren();
  const h=el('h2',record.name,'detail-heading');h.id='detail-title';body.append(h,el('p',[record.category,record.type,record.area,record.address].filter(Boolean).join(' · '),'detail-meta'));
  const features=el('dl',undefined,'detail-features');
  const featuresMap=[['Wheelchair access','wheelchair_access'],['Step-free entrance','step_free_entrance'],['Wheelchair parking','wheelchair_parking'],['Adapted toilet','wheelchair_toilet'],['Lift','lift'],['Ramp','ramp'],['Wheelchair seating','wheelchair_seating'],['Parking route','parking_to_entrance_route']];
  for(const [label,key] of featuresMap){const feature=el('div',undefined,'detail-feature'),dd=el('dd');dd.append(badge(r[key]));if(r[key]&&r[key]!=='unknown')dd.append(el('span',humanize(r[key]),'subline'));feature.append(el('dt',label),dd);features.append(feature);}body.append(features);
  const notes=[r.notes,r.quality_note,r.questions_to_confirm?'To confirm: '+r.questions_to_confirm:'',r.listing_status||r.listing_status_as_of_check,r.phone||r.phone_international_digits?'Listed phone: '+(r.phone||r.phone_international_digits):'',r.accessibility_level?'Evidence summary: '+humanize(r.accessibility_level):'',`Source snapshot / check: ${r.source_snapshot||r.last_web_check||r.retrieved_date||'Not stated'}`,`On-site verification: ${r.field_verified==='true'?'recorded by source':'not recorded'}.`, 'A positive report is a source claim, not a current access audit. Parent-site facilities do not guarantee access to an individual service.'].filter(Boolean).join('\n\n');
  body.append(el('div',notes,'detail-notes'));
  const links=el('div',undefined,'detail-links');
  const source=link('Open source ↗',r.source_url||r.contact_url||r.contact_or_booking_url);if(source)links.append(source);
  const csv=el('a','Download source table ↓');csv.href='./'+record.dataset.path;links.append(csv);
  if(r.latitude!==''&&r.longitude!==''&&r.latitude!==undefined&&r.longitude!==undefined&&Number.isFinite(Number(r.latitude))&&Number.isFinite(Number(r.longitude))){const map=link('Map location ↗',`https://www.openstreetmap.org/?mlat=${encodeURIComponent(r.latitude)}&mlon=${encodeURIComponent(r.longitude)}#map=17/${encodeURIComponent(r.latitude)}/${encodeURIComponent(r.longitude)}`);if(map)links.append(map);}
  body.append(links,el('p',`${record.dataset.name} · ${record.id} · Records from different datasets may describe the same premises.`,'detail-id'));
  $('detail').showModal();
}
async function load(){
  const params=new URLSearchParams(location.search);
  controller?.abort();controller=new AbortController();const signal=controller.signal;$('load-error').hidden=true;$('inventory').textContent='Loading the repository data…';
  const results=await Promise.allSettled(DATASETS.map(async dataset=>{const response=await fetch('./'+dataset.path,{signal,cache:'no-cache'});if(!response.ok)throw new Error(`${dataset.name}: HTTP ${response.status}`);const rows=parseCSV(await response.text());if(rows.length&&!Object.hasOwn(rows[0],'place_name')&&!Object.hasOwn(rows[0],'shop_name')&&!Object.hasOwn(rows[0],'service_name')&&!Object.hasOwn(rows[0],'office_name')&&!Object.hasOwn(rows[0],'venue_name')&&!Object.hasOwn(rows[0],'festival_name'))throw new Error(dataset.name+': unrecognized schema');return rows.map((r,i)=>normalize(r,dataset,i));}));
  if(signal.aborted)return;
  records=results.flatMap(r=>r.status==='fulfilled'?r.value:[]);const failures=results.flatMap((r,i)=>r.status==='rejected'?[DATASETS[i].name]:[]);
  fillSelect('area',records.map(r=>r.area));fillSelect('category',records.map(r=>r.category));
  const select=$('dataset');select.querySelectorAll('option:not(:first-child)').forEach(n=>n.remove());DATASETS.forEach((d,i)=>{if(results[i].status==='fulfilled'){const o=el('option',d.name);o.value=d.id;select.append(o);}});
  for(const id of fields){const desired=params.get(id);if(desired!==null){$(id).value=desired;if($(id).selectedIndex===-1)$(id).value=id==='sort'?'name':'';}}
  $('page-size').value=['25','50','100'].includes(params.get('size'))?params.get('size'):'25';page=Number(params.get('page'))||1;
  $('inventory').textContent=`${records.length.toLocaleString()} source records · ${DATASETS.length-failures.length} datasets loaded`;
  if(failures.length){$('load-error').hidden=false;$('load-error').replaceChildren(el('span',`Some data could not load: ${failures.join(', ')}. Results below are incomplete. `));const retry=el('button','Retry','button quiet');retry.type='button';retry.addEventListener('click',load);$('load-error').append(retry);}
  render();
}
$('filters').addEventListener('submit',event=>event.preventDefault());
let debounce;for(const id of fields){$(id).addEventListener(id==='search'?'input':'change',()=>{clearTimeout(debounce);if(id==='search')debounce=setTimeout(()=>{page=1;render();},150);else{page=1;render();}});}
$('page-size').addEventListener('change',()=>{page=1;render();});
$('previous').addEventListener('click',()=>{page--;render();});$('next').addEventListener('click',()=>{page++;render();});$('page-number').addEventListener('change',()=>{page=Number($('page-number').value);render();});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('close',()=>detailTrigger?.focus());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
load().catch(error=>{$('load-error').hidden=false;$('load-error').textContent='Unable to initialize the explorer. Reload the page to retry.';$('inventory').textContent='Data unavailable';console.error(error);});
