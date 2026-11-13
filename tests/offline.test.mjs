import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function worker({networkFails=false}={}) {
 const handlers={},calls=[];
 const self={registration:{scope:'https://example.com/MauritiusInfo/'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(type,fn)=>{handlers[type]=fn;}};
 vm.runInNewContext(readFileSync(new URL('../web/public/sw.js',import.meta.url),'utf8'),{self,URL,Response,caches:{match:async(url)=>{calls.push(String(url));return new Response('cached shell');}},fetch:async()=>{if(networkFails)throw new Error('offline');return new Response('network shell');}});
 return {handlers,calls};
}
async function request(handler,url,mode) {
 let response;
 handler({request:{url,mode,method:'GET'},respondWith:value=>{response=Promise.resolve(value);}});
 return response?await response:null;
}
test('offline worker falls back to the cached app shell for deep links',async()=>{
 const {handlers,calls}=worker({networkFails:true});
 const response=await request(handlers.fetch,'https://example.com/MauritiusInfo/?record=curated:MU0013','navigate');
 assert.equal(await response.text(),'cached shell');assert.equal(calls[0],'https://example.com/MauritiusInfo/index.html');
});
test('online navigation uses the network so deployed updates remain visible',async()=>{
 const {handlers}=worker();const response=await request(handlers.fetch,'https://example.com/MauritiusInfo/','navigate');
 assert.equal(await response.text(),'network shell');
});
test('offline worker never intercepts map tiles, third-party sites, or another project',async()=>{
 const {handlers,calls}=worker();
 assert.equal(await request(handlers.fetch,'https://tile.openstreetmap.org/1/1/1.png','cors'),null);
 assert.equal(await request(handlers.fetch,'https://example.com/another-project/assets/main.js','cors'),null);
 assert.equal(await request(handlers.fetch,'https://example.com/MauritiusInfo/data/osm/places.csv','cors'),null);
 assert.equal(calls.length,0);
});

function offlineClient(failAsset=false){
 const buckets=new Map(),registrations=[];
 const key=value=>typeof value==='string'?value:value.url||String(value);
 const caches={open:async name=>{if(!buckets.has(name))buckets.set(name,new Map());const bucket=buckets.get(name);return {put:async(url,response)=>bucket.set(key(url),response.clone()),match:async url=>bucket.get(key(url))?.clone()};},keys:async()=>[...buckets.keys()],delete:async name=>buckets.delete(name)};
 const navigator={serviceWorker:{register:async(url,options)=>registrations.push({url,options}),ready:Promise.resolve({active:{}})}};
 const fetch=async value=>{
  const url=String(value);
  if(url.endsWith('offline-manifest.json'))return Response.json({version:'test',files:['index.html','assets/main.js']});
  if(failAsset&&url.endsWith('main.js'))return new Response('',{status:503});
  return new Response('app file');
 };
 const context={window:{caches},caches,navigator,location:{href:'https://example.com/MauritiusInfo/',origin:'https://example.com'},URL,Response,AbortSignal,fetch};
 const code=readFileSync(new URL('../web/src/offline.js',import.meta.url),'utf8').replaceAll('import.meta.env.BASE_URL',JSON.stringify('/MauritiusInfo/')).replace(/^export /gm,'');
 vm.runInNewContext(code+'\nthis.api={prepareOffline,loadOfflineRecords,saveOfflineRecords,hasOfflineCopy};',context);
 return {...context,buckets,registrations};
}
test('offline preparation caches required assets and saved records before registering the worker',async()=>{
 const client=offlineClient();const records=[{key:'test:a',raw:{},dataset:{id:'test'}}];
 assert.equal(await client.api.prepareOffline(records),1);
 assert.equal(await client.api.hasOfflineCopy(),true);
 assert.equal((await client.api.loadOfflineRecords())[0].key,'test:a');
 assert.equal(client.registrations[0].url,'/MauritiusInfo/sw.js');
 assert.equal(client.registrations[0].options.scope,'/MauritiusInfo/');
});
test('failed offline asset downloads are rejected before service-worker registration',async()=>{
 const client=offlineClient(true);
 await assert.rejects(client.api.prepareOffline([{key:'test:a',raw:{},dataset:{}}]),/required offline file/);
 assert.equal(client.registrations.length,0);
});
test('offline saved records can be cleared and repopulated without retaining unsaved data',async()=>{
 const client=offlineClient();
 await client.api.saveOfflineRecords([{key:'test:a',raw:{},dataset:{}}]);
 await client.api.saveOfflineRecords([]);
 assert.equal(await client.api.hasOfflineCopy(),true);
 assert.equal((await client.api.loadOfflineRecords()).length,0);
 await client.api.saveOfflineRecords([{key:'test:b',raw:{},dataset:{}}]);
 assert.equal((await client.api.loadOfflineRecords())[0].key,'test:b');
});
