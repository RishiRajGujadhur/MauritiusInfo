const BASE=import.meta.env.BASE_URL;
const PREFIX='mu-'+BASE.replace(/[^a-z0-9]/gi,'-')+'-';
const PERSONAL_CACHE=PREFIX+'saved-v1';
const snapshotURL=()=>new URL(BASE+'offline-saved.json',location.href).href;
export async function hasOfflineCopy(){
  if(!('caches' in window))return false;
  return Boolean(await (await caches.open(PERSONAL_CACHE)).match(snapshotURL()));
}
export async function clearOffline(){
  if('caches' in window)for(const key of await caches.keys())if(key.startsWith(PREFIX))await caches.delete(key);
  if('serviceWorker' in navigator){ const registration=await navigator.serviceWorker.getRegistration(BASE); if(registration?.scope===new URL(BASE,location.href).href)await registration.unregister(); }
}
export async function loadOfflineRecords(){
  if(!('caches' in window))return [];
  try {const response=await (await caches.open(PERSONAL_CACHE)).match(snapshotURL());const rows=response?await response.json():[];return Array.isArray(rows)?rows.filter(r=>r&&typeof r.key==='string'&&r.raw&&r.dataset):[];}catch{return [];}
}
let writes = Promise.resolve();
export function saveOfflineRecords(records){
  writes = writes.catch(() => {}).then(() => writeSnapshot(records));
  return writes;
}
async function writeSnapshot(records){
  if(!('caches' in window))throw new Error('Offline storage is unavailable in this browser.');
  const cache=await caches.open(PERSONAL_CACHE);
  await cache.put(snapshotURL(),new Response(JSON.stringify(records),{headers:{'Content-Type':'application/json'}}));
}
export async function prepareOffline(records){
  if(!('serviceWorker' in navigator)||!('caches' in window))throw new Error('Offline access is unavailable in this browser.');
  await saveOfflineRecords(records);
  const manifestResponse=await fetch(BASE+'offline-manifest.json',{cache:'no-cache',signal:AbortSignal.timeout(20000)});
  if(!manifestResponse.ok)throw new Error('Could not load offline file list.');
  const manifest=await manifestResponse.json(),cache=await caches.open(PREFIX+'app-'+manifest.version);
  await Promise.all(manifest.files.map(async path=>{
    const url=new URL(path,new URL(BASE,location.href));
    if(url.origin!==location.origin||!url.pathname.startsWith(BASE))throw new Error('Invalid offline resource.');
    const response=await fetch(url,{cache:'reload',signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('A required offline file could not be downloaded.');
    await cache.put(url,response);
  }));
  await cache.put(new URL(BASE+'offline-manifest.json',location.href),new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
  await navigator.serviceWorker.register(BASE+'sw.js',{scope:BASE});
  await navigator.serviceWorker.ready;
  // Remove old app versions only after the new complete cache is available.
  for(const key of await caches.keys())if(key.startsWith(PREFIX+'app-')&&key!==PREFIX+'app-'+manifest.version)await caches.delete(key);
  return records.length;
}
