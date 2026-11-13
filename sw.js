/* Offline shell only. Never cache third-party tiles, GPS data or remote reports. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
  if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  if(request.mode==='navigate')event.respondWith(fetch(request).catch(async()=>{
    const response=await caches.match(new URL('index.html',scope),{ignoreSearch:true});
    return response||new Response('Offline files are unavailable. Reconnect and use Make available offline in My trip.',{status:503,headers:{'Content-Type':'text/plain'}});
  }));
  else if(url.pathname.includes('/assets/'))event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
