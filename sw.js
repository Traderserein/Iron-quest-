// Prog YaL offline cache.
// Pages: network first (so updates show up as soon as you are online), cache when offline.
// Icons and fonts: cache first.
const CACHE='iron-quest-v5';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:'reload'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const own=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!own&&!font)return;
  const page=r.mode==='navigate'||(own&&/\/$|\.html$|\.webmanifest$/.test(u.pathname));
  if(page){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
      if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(own&&r.mode==='navigate'?'./':r,c))}
      return res;
    }).catch(()=>caches.open(CACHE).then(k=>k.match(r,{ignoreSearch:true}).then(h=>h||k.match('./')))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r);if(hit)return hit;
    const res=await fetch(r);if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res;
  }));
});
