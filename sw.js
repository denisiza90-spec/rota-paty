const CACHE='rota-paty-v1';
const ARQUIVOS=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 // Não interceptar as consultas de CEP e da IA
 if(url.hostname.includes('viacep')||url.hostname.includes('googleapis'))return;
 // Página: tenta a internet primeiro (assim as atualizações chegam logo); sem internet, usa a cópia salva
 if(req.mode==='navigate'){
  e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  return;
 }
 // Demais arquivos (bibliotecas, ícones): usa o salvo e guarda na primeira vez
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r})));
});
