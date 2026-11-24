const V='mutala-pdf-v2';
const CDN=[
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
];
const LOCAL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(LOCAL.map(u=>c.add(u).catch(()=>{})));
    await Promise.all(CDN.map(u=>fetch(u,{mode:'cors'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    await self.clients.claim();
  })());
});

function keep(r,res){
  if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
  return res;
}

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(new URL(r.url).origin===location.origin){
    // berkas aplikasi: coba internet dulu (supaya pembaruan langsung terlihat), cadangan dari penyimpanan
    e.respondWith(fetch(r).then(res=>keep(r,res)).catch(async()=>(await caches.match(r,{ignoreSearch:true}))||caches.match('index.html')));
  }else{
    // pustaka dari CDN: pakai simpanan dulu
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>keep(r,res))));
  }
});
