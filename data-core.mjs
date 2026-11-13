export const DATASETS = [
  {id:'osm', name:'Community map', path:'data/osm/places.csv'},
  {id:'directory', name:'Public directory', path:'data/directory/places.csv'},
  {id:'health', name:'Health directory', path:'data/national/health_facilities.csv'},
  {id:'curated', name:'Venue research', path:'data/places.csv'},
  {id:'shops', name:'Shop research', path:'data/shops/shops.csv'},
  {id:'services', name:'Service research', path:'data/services/services.csv'},
  {id:'offices', name:'Office research', path:'data/offices/offices.csv'},
  {id:'entertainment', name:'Entertainment research', path:'data/entertainment/venues.csv'},
  {id:'festivals', name:'Festival editions', path:'data/festivals/events.csv'},
  {id:'official', name:'Operator & service information', path:'data/planning/official-places.csv'}
];

// CSV fields may contain commas, CRLFs, escaped quotes and embedded newlines.
export function parseCSV(text) {
  const rows=[]; let row=[], field='', quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted && text[i+1]==='"'){field+='"';i++;}
      else if(quoted || field===''){quoted=!quoted;}
      else field+=c;
    }else if(c===',' && !quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r') && !quoted){
      if(c==='\r' && text[i+1]==='\n')i++;
      row.push(field);if(row.some(v=>v!==''))rows.push(row);row=[];field='';
    }else field+=c;
  }
  if(quoted)throw new Error('Unclosed quoted CSV field');
  if(field!==''||row.length){row.push(field);rows.push(row);}
  const headers=rows.shift()||[];
  if(!headers.length||new Set(headers).size!==headers.length)throw new Error('Invalid CSV headers');
  return rows.map((values,index)=>{
    if(values.length!==headers.length)throw new Error(`CSV row ${index+2} has an unexpected column count`);
    return Object.fromEntries(headers.map((header,i)=>[header,values[i]]));
  });
}
export function fold(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function humanize(value){return String(value||'').replace(/_/g,' ').replace(/(^|[\s-])\p{L}/gu,c=>c.toUpperCase());}
export function status(value){
  const raw=String(value||'unknown').toLowerCase();
  if(/limited|partial/.test(raw))return {group:'limited',label:'Limited / partial',raw};
  if(raw==='no'||raw.endsWith('_no')||raw==='reported_not_accessible')return {group:'negative',label:'Negative report',raw};
  if(raw==='yes'||raw.endsWith('_yes')||raw==='mapped_accessible')return {group:'positive',label:'Positive report',raw};
  return {group:'unknown',label:'Unknown',raw};
}
export function safeURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function normalize(row,dataset,index){
  const id=row.record_id||row.place_id||row.shop_id||row.service_id||row.office_id||row.venue_id||String(index);
  let name=row.place_name||row.shop_name||row.service_name||row.office_name||row.venue_name||row.festival_name||'Unnamed record';
  if(dataset.id==='festivals')name=`${row.festival_name}${row.edition_year?' · '+row.edition_year:''}${row.component_name?' · '+row.component_name:''}`;
  let category=row.category;
  if(!category){category=({health:'Healthcare',shops:'Retail',services:'Repairs & healthcare',offices:'Offices',entertainment:'Entertainment',festivals:'Festivals & events'})[dataset.id]||row.location_type||'Other';}
  category=humanize(category);
  const area=humanize(row.district||row.source_district||row.region||'Not stated').replace('Rivière Du Rempart','Riviere Du Rempart');
  const type=humanize(row.location_type||row.shop_type||row.service_type||row.office_type||row.entertainment_type||row.component_name||'');
  const address=row.address||row.locality||row.venue_name||'';
  return {key:dataset.id+':'+id,id,name,category,area,type,address,raw:row,dataset,
    access:status(row.wheelchair_access),parking:status(row.wheelchair_parking),
    search:fold([name,category,area,type,address,row.locality,row.parent_site_name].join(' '))};
}
export function filterRecords(records,state,{sort=true}={}){
  const words=fold(state.search).trim().split(/\s+/).filter(Boolean);
  const matches = records.filter(r=>words.every(word=>r.search.includes(word)) && (!state.area||r.area===state.area) && (!state.category||r.category===state.category) && (!state.access||r.access.group===state.access) && (!state.parking||r.parking.group===state.parking) && (!state.dataset||r.dataset.id===state.dataset));
  if (!sort) return matches;
  return matches.sort((a,b)=>{
    if(state.sort==='area'){const d=a.area.localeCompare(b.area,'en');if(d)return d;}
    return a.name.localeCompare(b.name,'en')||a.key.localeCompare(b.key);
  });
}
export function paginate(records,page,size){
  size=[25,50,100].includes(Number(size))?Number(size):25;
  const pages=Math.max(1,Math.ceil(records.length/size));
  page=Math.max(1,Math.min(pages,Math.trunc(Number(page))||1));
  const start=(page-1)*size;
  return {items:records.slice(start,start+size),page,pages,start,total:records.length,size};
}
