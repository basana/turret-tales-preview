(function(){
'use strict';
var rail=document.getElementById('mnBottomRail'),panel=document.getElementById('mapPanel');
if(!rail||!panel||window.__mnFullPanelInstalled)return;
window.__mnFullPanelInstalled=true;
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function L(){return typeof lang!=='undefined'?lang:'en';}
function tr(ru,de,en){var l=L();return l==='ru'?(ru||en||de||''):l==='de'?(de||en||ru||''):(en||de||ru||'');}
function setState(s){
 document.body.classList.remove('mn-panel-compact','mn-panel-quarter','mn-panel-third','mn-panel-half','mn-panel-full');
 document.body.classList.add('mn-panel-'+s);
 rail.classList.toggle('mn-state-full',s==='full');
 rail.style.height='';rail.style.maxHeight='';rail.style.top='';
 if(typeof leafletMap!=='undefined'&&leafletMap)setTimeout(function(){leafletMap.invalidateSize();},220);
}
function content(){
 var n=panel.querySelector('.mn-full-object-content');
 if(!n){n=document.createElement('div');n.className='mn-full-object-content';panel.appendChild(n);}
 return n;
}
function speak(t){
 if(!t||!window.speechSynthesis)return;
 window.speechSynthesis.cancel();
 var u=new SpeechSynthesisUtterance(t);
 u.lang=L()==='ru'?'ru-RU':L()==='de'?'de-DE':'en-US';u.rate=.9;
 window.speechSynthesis.speak(u);
}
function routesFor(c){
 if(typeof routePlaces==='undefined'||!Array.isArray(routePlaces))return [];
 var town=String(c.town||'').toLowerCase(),name=String(c.name||'').toLowerCase();
 return routePlaces.filter(function(r){
  var place=String(r.place||'').toLowerCase(),title=String(r.title||'').toLowerCase();
  return (name&&title.indexOf(name.split(' ')[0])>=0)||
    (town&&place.indexOf(town)>=0&&place.indexOf('→')<0);
 });
}
function castle(i){
 var c=typeof castles!=='undefined'&&castles[i];if(!c)return;
 var story=tr(c.sayRu||c.factsRu,c.sayDe||c.factsDe,c.say||c.facts);
 var facts=tr(c.factsRu,c.factsDe,c.facts);
 var legend=tr(c.legendRu,c.legendDe,c.legend);
 var imgs=Array.isArray(c.images)?c.images.slice(0,12):[];
 var route=routesFor(c);
 var parts=[story,facts!==story?facts:'',legend].filter(Boolean);
 route.forEach(function(r){parts.push(tr(r.textRu,r.textDe,r.text));if(tr(r.extraRu,r.extraDe,r.extra))parts.push(tr(r.extraRu,r.extraDe,r.extra));if(tr(r.hookRu,r.hookDe,r.hook))parts.push(tr(r.hookRu,r.hookDe,r.hook));});
 var n=content();n.setAttribute('data-kind','castle');
 n.innerHTML=(imgs.length?'<div class="mn-full-gallery" aria-label="Photographs">'+imgs.map(function(src,k){return '<img src="'+esc(src)+'" alt="'+esc(c.name)+' — '+(k+1)+'" loading="lazy">';}).join('')+'</div>':'')+
 (story?'<section class="mn-detail-section"><h3>'+esc(tr('Story','Geschichte','Story'))+'</h3><p>'+esc(story)+'</p></section>':'')+
 (facts&&facts!==story?'<section class="mn-detail-section"><h3>'+esc(tr('Facts','Fakten','Facts'))+'</h3><p>'+esc(facts)+'</p></section>':'')+
 (legend?'<section class="mn-detail-section"><h3>'+esc(tr('Legends & history','Legenden & Geschichte','Legends & history'))+'</h3><p>'+esc(legend)+'</p></section>':'')+
 (route.length?'<section class="mn-route-section"><h3>'+esc(tr('Route','Route','Route'))+'</h3>'+route.map(function(r){
   var title=tr(r.titleRu,r.titleDe,r.title),place=r.place||'';
   var text=tr(r.textRu,r.textDe,r.text),extra=tr(r.extraRu,r.extraDe,r.extra),hook=tr(r.hookRu,r.hookDe,r.hook);
   return '<article class="mn-route-entry"><h4>'+esc(title)+'</h4><div class="mn-route-place">'+esc(place)+'</div>'+(text?'<p>'+esc(text)+'</p>':'')+(extra?'<p>'+esc(extra)+'</p>':'')+(hook?'<p class="mn-route-hook">'+esc(hook)+'</p>':'')+'</article>';
  }).join('')+'</section>':'');
 var title=document.getElementById('mapPanelTitle'),meta=document.getElementById('mapPanelMeta'),desc=document.getElementById('mapPanelDesc');
 if(title)title.textContent=c.name||'';
 if(meta)meta.textContent=[c.town,c.built].filter(Boolean).join(' · ');
 if(desc)desc.textContent=story||facts||'';
 var read=document.getElementById('mapPanelSpeak');
 if(read){read.style.display='inline-flex';read.textContent='🔊 '+tr('Read aloud','Vorlesen','Read aloud');read.onclick=function(){speak(parts.join('\n\n'));};}
 var guide=document.getElementById('mapPanelOpenGuide');if(guide)guide.style.display='none';
 var wa=document.getElementById('mapPanelWa');if(wa)wa.style.display='';
 setState('full');panel.classList.add('open');
}
function poi(p,emoji){
 var n=content(),address=p.address||p.location||p.city||'';
 var txt=[p.name,address].filter(Boolean).join(' · ');
 var distance='';
 var lat=null,lng=null;
 if(typeof gpsLastLat==='number'&&gpsLastLat!==null&&typeof gpsLastLng==='number'){lat=gpsLastLat;lng=gpsLastLng;}
 else if(typeof xmasGpsPos!=='undefined'&&xmasGpsPos){lat=xmasGpsPos.lat;lng=xmasGpsPos.lng;}
 if(lat!==null&&typeof distanceMeters==='function'&&typeof p.lat==='number'&&typeof p.lng==='number'){
  var d=distanceMeters(lat,lng,p.lat,p.lng),mins=Math.ceil(d*1.3/75);
  distance='<p class="mn-poi-distance">📍 '+esc(formatDistance(d))+' · '+mins+' '+esc(tr('min walk','Min. zu Fuß','min walk'))+'</p>';
 }
 n.setAttribute('data-kind','poi');
 n.innerHTML='<div class="mn-poi-detail-icon">'+esc(emoji)+'</div><h3>'+esc(p.name||'')+'</h3><p class="mn-poi-address">'+esc(address)+'</p>'+distance;
 var title=document.getElementById('mapPanelTitle'),meta=document.getElementById('mapPanelMeta'),desc=document.getElementById('mapPanelDesc');
 if(title)title.textContent=p.name||'';
 if(meta)meta.textContent=address;
 if(desc)desc.textContent='';
 var read=document.getElementById('mapPanelSpeak');if(read)read.style.display='none';
 var guide=document.getElementById('mapPanelOpenGuide');if(guide)guide.style.display='none';
 var wa=document.getElementById('mapPanelWa');if(wa)wa.style.display='none';
 panel.classList.add('open');setState('third');
}
var oldShow=window.showMapPanel;
if(typeof oldShow==='function'&&!oldShow.__mnFullWrapped){
 var wrapped=function(i){oldShow(i);castle(i);};
 wrapped.__mnFullWrapped=true;window.showMapPanel=wrapped;
}
var oldPoi=window._showPoiToast;
if(typeof oldPoi==='function'&&!oldPoi.__mnFullWrapped){
 var wrappedPoi=function(mapObj,p,emoji){
  if(typeof leafletMap==='undefined'||mapObj!==leafletMap){oldPoi(mapObj,p,emoji);return;}
  document.querySelectorAll('.nearest-toast').forEach(function(t){t.classList.remove('show');});
  if(mapObj._mnPoiMarkers)Object.keys(mapObj._mnPoiMarkers).forEach(function(k){
   var m=mapObj._mnPoiMarkers[k],el=m&&m.getElement();if(el)el.classList.toggle('mn-selected-poi-marker',k===p.name);
  });
  var card=rail.querySelector('[data-mn-poi="'+String(p.name).replace(/"/g,'&quot;')+'"]');
  if(card){
   rail.querySelectorAll('.mn-place-card').forEach(function(el){el.classList.toggle('active',el===card);});
   var track=rail.querySelector('.mn-card-track');
   if(track){var left=card.offsetLeft-track.offsetLeft-(track.clientWidth-card.offsetWidth)/2;track.scrollTo({left:left,behavior:'smooth'});}
  }
  if(mapObj._mnPoiPulse)mapObj.removeLayer(mapObj._mnPoiPulse);
  if(typeof L!=='undefined'){var pulse=L.divIcon({className:'mn-poi-pulse-wrap',html:'<div class="mn-poi-pulse"></div>',iconSize:[76,76],iconAnchor:[38,38]});mapObj._mnPoiPulse=L.marker([p.lat,p.lng],{icon:pulse,interactive:false,keyboard:false,zIndexOffset:1600}).addTo(mapObj);}
  poi(p,emoji);
 };
 wrappedPoi.__mnFullWrapped=true;window._showPoiToast=wrappedPoi;
}
var guide=document.getElementById('mapPanelOpenGuide');if(guide)guide.onclick=function(e){e.preventDefault();setState('full');};
var style=document.createElement('style');
style.textContent=
"body.map-navi-active .mn-bottom-rail{position:absolute!important;left:8px!important;right:8px!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;top:auto;display:flex;flex-direction:column;gap:6px;box-sizing:border-box;padding:7px 9px 10px;overflow-x:hidden;overflow-y:hidden;overscroll-behavior:contain;transition:height .22s ease,top .22s ease;touch-action:pan-y}"+
"body.map-navi-active .mn-bottom-rail.mn-is-dragging{transition:none!important}"+
"body.map-navi-active .mn-bottom-handle{flex:0 0 18px;min-height:18px;touch-action:none;cursor:ns-resize}"+
"body.map-navi-active .mn-top-rail{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;width:100%;flex:0 0 62px;min-height:62px;display:flex;gap:7px;overflow-x:auto;overflow-y:hidden;padding:0 1px;touch-action:pan-x;scrollbar-width:none}"+
"body.map-navi-active .mn-category{flex:1 0 82px;min-width:82px;max-width:none;height:60px;min-height:60px;padding:4px 6px;gap:5px;flex-direction:row;justify-content:center;border-radius:12px;font-size:14px;white-space:nowrap}"+
"body.map-navi-active .mn-category img,body.map-navi-active .mn-category .mn-emoji{width:38px;height:38px;flex:0 0 38px;font-size:32px;object-fit:contain}"+
"body.map-navi-active .mn-card-track{display:none;flex:0 0 116px;min-height:116px;width:100%;gap:9px;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none}"+
"body.map-navi-active .mn-card-track .mn-place-card{display:flex;flex:0 0 min(82vw,360px);height:108px;min-height:108px;box-sizing:border-box;align-items:center;gap:10px;padding:7px 9px;scroll-snap-align:center}"+
"body.map-navi-active .mn-card-track .mn-place-card img{display:block;flex:0 0 92px;width:92px;height:92px;max-height:92px;aspect-ratio:1/1;object-fit:contain;object-position:center;background:transparent;border-radius:8px}"+
"body.map-navi-active .mn-place-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}"+
"body.map-navi-active .mn-place-copy strong{font:600 19px/1.08 'EB Garamond',serif;white-space:normal}"+
"body.map-navi-active .mn-place-copy small{font:15px/1.12 'EB Garamond',serif;white-space:normal}"+
"body.map-navi-active .mn-poi-card-icon{display:grid;place-items:center;flex:0 0 54px;width:54px;height:54px;font-size:40px}"+
"body.map-navi-active .mn-bottom-rail .map-panel{display:none!important;position:relative!important;inset:auto!important;left:auto!important;right:auto!important;bottom:auto!important;width:100%;max-width:none;max-height:none!important;min-height:0;overflow:visible;flex:0 0 auto;margin:0;border-radius:12px;box-shadow:none}"+
"body.map-navi-active .mn-bottom-rail .map-panel.open{display:block!important}"+
"body.map-navi-active .mn-full-object-content{display:none;padding:8px 2px 32px}"+
"body.map-navi-active .mn-full-gallery{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:2px 0 12px;touch-action:pan-x;scroll-snap-type:x mandatory}"+
"body.map-navi-active .mn-full-gallery img{flex:0 0 min(24vw,124px);width:min(24vw,124px);height:min(24vw,124px);aspect-ratio:1/1;object-fit:contain;object-position:center;background:transparent;border-radius:5px;scroll-snap-align:start}"+
"body.map-navi-active .mn-full-object-content h3{margin:12px 0 6px;font:600 21px/1.12 'EB Garamond',serif;color:#7A1026}"+
"body.map-navi-active .mn-full-object-content h4{margin:13px 0 3px;font:600 19px/1.15 'EB Garamond',serif;color:#7A1026}"+
"body.map-navi-active .mn-full-object-content p{margin:0 0 12px;font:17px/1.42 'EB Garamond',serif;color:#493A29;white-space:pre-line}"+
"body.map-navi-active .mn-route-place{font:italic 14px 'EB Garamond',serif;color:#80633D;margin-bottom:7px}"+
"body.map-navi-active .mn-route-hook{font-style:italic;color:#7A1026}"+
"body.map-navi-active .mn-full-listen{display:none!important}"+
"body.map-navi-active .map-panel-open-guide{display:none!important}"+
"body.mn-panel-compact .mn-bottom-rail{height:92px!important;min-height:92px!important;max-height:92px!important}"+
"body.mn-panel-compact .mn-card-track{display:none!important}"+
"body.mn-panel-quarter .mn-bottom-rail{height:max(25dvh,205px)!important;min-height:max(25dvh,205px)!important;max-height:max(25dvh,205px)!important}"+
"body.mn-panel-quarter .mn-card-track{display:flex!important}"+
"body.mn-panel-quarter .mn-bottom-rail .map-panel{display:none!important}"+
"body.mn-panel-third .mn-bottom-rail{height:max(34dvh,260px)!important;min-height:max(34dvh,260px)!important;max-height:max(34dvh,260px)!important}"+
"body.mn-panel-third .mn-card-track{display:flex!important}"+
"body.mn-panel-third .mn-bottom-rail .map-panel{display:none!important}"+
"body.mn-panel-half .mn-bottom-rail{height:52dvh!important;min-height:52dvh!important;max-height:58dvh!important;overflow-y:auto!important}"+
"body.mn-panel-half .mn-card-track{display:flex!important}"+
"body.mn-panel-half .mn-bottom-rail .map-panel{display:block!important}"+
"body.mn-panel-half .mn-full-object-content{display:block;padding-top:0;max-height:130px;overflow:hidden}"+
"body.mn-panel-half .mn-full-gallery{display:none!important}"+
"body.mn-panel-half .mn-full-object-content .mn-detail-section:not(:first-child),body.mn-panel-half .mn-full-object-content .mn-route-section{display:none!important}"+
"body.mn-panel-half .mn-full-object-content .mn-detail-section:first-child p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}"+
"body.mn-panel-full .mn-bottom-rail{top:calc(env(safe-area-inset-top) + 8px)!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;height:auto!important;min-height:0!important;max-height:none!important;overflow-x:hidden!important;overflow-y:auto!important;padding-bottom:18px;touch-action:pan-y}"+
"body.mn-panel-full .mn-card-track{display:flex!important;flex:0 0 116px;min-height:116px}"+
"body.mn-panel-full .mn-bottom-rail .map-panel{display:block!important}"+
"body.mn-panel-full .mn-full-object-content{display:block!important}"+
"body.mn-panel-full .mn-full-gallery img{flex-basis:min(24vw,124px)}"+
"body.mn-panel-full .map-panel-desc{font-size:16px;line-height:1.35}"+
"body.mn-panel-full .map-panel-title{font-size:24px}"+
"body.mn-panel-full .map-panel-speak{min-height:42px;margin:8px 0 10px}"+
"body.mn-panel-full .mn-back{display:none}"+
"body.mn-panel-third .mn-poi-detail-icon{font-size:30px}"+
"body.mn-panel-third .mn-poi-address{font-size:15px}"+
"body.mn-panel-third .mn-poi-distance{font-size:14px}"+
"@media(orientation:landscape){body.mn-panel-quarter .mn-bottom-rail{height:30dvh!important;min-height:180px!important;max-height:30dvh!important}body.mn-panel-third .mn-bottom-rail{height:38dvh!important;min-height:220px!important;max-height:38dvh!important}body.mn-panel-half .mn-bottom-rail{height:58dvh!important;max-height:62dvh!important}}"+
"@media(max-width:390px){body.map-navi-active .mn-category{flex-basis:76px;min-width:76px}body.map-navi-active .mn-card-track .mn-place-card{flex-basis:86vw}body.map-navi-active .mn-card-track .mn-place-card img{flex-basis:84px;width:84px;height:84px}}"+
"@media(prefers-reduced-motion:reduce){body.map-navi-active .mn-bottom-rail{transition:none!important}}";
document.head.appendChild(style);
function installDrag(){
 var h=rail.querySelector('.mn-bottom-handle');if(!h||h.__mnFiveStateBound)return;
 h.__mnFiveStateBound=true;
 var startY=0,startHeight=0,dragging=false,moved=false,suppressClick=false;
 var names=['compact','quarter','third','half','full'];
 function heights(){
  var vh=window.innerHeight;
  return [{s:'compact',h:92},{s:'quarter',h:Math.max(205,vh*.25)},{s:'third',h:Math.max(260,vh*.34)},{s:'half',h:vh*.52},{s:'full',h:vh-32}];
 }
 function snap(h0){
  var hs=heights();hs.sort(function(a,b){return Math.abs(a.h-h0)-Math.abs(b.h-h0);});setState(hs[0].s);
 }
 h.addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  startY=e.clientY;startHeight=rail.getBoundingClientRect().height;dragging=true;moved=false;
  rail.classList.add('mn-is-dragging');try{h.setPointerCapture(e.pointerId);}catch(_){}
 });
 h.addEventListener('pointermove',function(e){
  if(!dragging)return;
  var dy=startY-e.clientY;if(Math.abs(dy)>4)moved=true;
  var max=window.innerHeight-32,height=Math.max(92,Math.min(max,startHeight+dy));
  rail.style.height=height+'px';rail.style.maxHeight=max+'px';rail.style.top='auto';
  var hs=heights(),closest=hs.reduce(function(best,x){return !best||Math.abs(x.h-height)<Math.abs(best.h-height)?x:best;},null);
  document.body.classList.remove('mn-panel-compact','mn-panel-quarter','mn-panel-third','mn-panel-half','mn-panel-full');
  document.body.classList.add('mn-panel-'+closest.s);
 });
 function finish(){
  if(!dragging)return;dragging=false;rail.classList.remove('mn-is-dragging');
  if(moved){snap(rail.getBoundingClientRect().height);suppressClick=true;setTimeout(function(){suppressClick=false;},350);}
  else{rail.style.height='';rail.style.maxHeight='';rail.style.top='';}
 }
 h.addEventListener('pointerup',finish);h.addEventListener('pointercancel',finish);
 h.addEventListener('click',function(e){
  if(suppressClick){e.preventDefault();e.stopPropagation();return;}
  var current=names.find(function(n){return document.body.classList.contains('mn-panel-'+n);})||'compact';
  var next=names[Math.min(names.indexOf(current)+1,names.length-1)];
  if(current==='full')next='compact';setState(next);
 });
}
installDrag();new MutationObserver(installDrag).observe(rail,{childList:true});
document.addEventListener('click',function(e){
 var card=e.target.closest&&e.target.closest('.mn-place-card');
 if(card&&card.hasAttribute('data-mn-index')){var i=Number(card.getAttribute('data-mn-index'));setTimeout(function(){castle(i);setState('full');},40);}
});
setState('compact');
})();