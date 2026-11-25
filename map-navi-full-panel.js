(function(){
'use strict';
var rail=document.getElementById('mnBottomRail'),panel=document.getElementById('mapPanel');
if(!rail||!panel||window.__mnFullPanelInstalled)return;
window.__mnFullPanelInstalled=true;
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function tr(ru,de,en){var L=typeof lang!=='undefined'?lang:'en';return L==='ru'?(ru||en||de||''):L==='de'?(de||en||ru||''):(en||de||ru||'');}
function state(s){
 document.body.classList.remove('mn-panel-compact','mn-panel-expanded','mn-panel-full');
 document.body.classList.add('mn-panel-'+s);
 rail.classList.toggle('mn-state-full',s==='full');
 rail.style.height='';rail.style.maxHeight='';rail.style.top='';
 if(typeof leafletMap!=='undefined'&&leafletMap)setTimeout(function(){leafletMap.invalidateSize();},240);
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
 var L=typeof lang!=='undefined'?lang:'en';u.lang=L==='ru'?'ru-RU':L==='de'?'de-DE':'en-US';u.rate=.9;
 window.speechSynthesis.speak(u);
}
function castle(i){
 var c=window.castles&&window.castles[i];if(!c)return;
 var story=tr(c.sayRu||c.factsRu,c.sayDe||c.factsDe,c.say||c.facts);
 var facts=tr(c.factsRu,c.factsDe,c.facts);
 var legend=tr(c.legendRu,c.legendDe,c.legend);
 var imgs=Array.isArray(c.images)?c.images.slice(0,10):[];
 var n=content();
 n.innerHTML=(imgs.length?'<div class="mn-full-gallery">'+imgs.map(function(src){return '<img src="'+esc(src)+'" alt="'+esc(c.name)+'" loading="lazy">';}).join('')+'</div>':'')+
 '<button type="button" class="mn-full-listen">🔊 '+esc(tr('Прослушать','Anhören','Listen'))+'</button>'+
 (story?'<h3>'+esc(tr('Рассказ','Geschichte','Story'))+'</h3><p>'+esc(story)+'</p>':'')+
 (facts&&facts!==story?'<h3>'+esc(tr('Факты','Fakten','Facts'))+'</h3><p>'+esc(facts)+'</p>':'')+
 (legend?'<h3>'+esc(tr('История и легенды','Geschichte und Legenden','History & legends'))+'</h3><p>'+esc(legend)+'</p>':'');
 var b=n.querySelector('.mn-full-listen');if(b)b.onclick=function(){speak(story||facts||legend);};
}
function poi(p,emoji){
 var n=content(),txt=[p.name,p.city].filter(Boolean).join(' · '),distance='';
 var lat=null,lng=null;
 if(typeof gpsLastLat==='number'&&typeof gpsLastLng==='number'){lat=gpsLastLat;lng=gpsLastLng;}
 else if(typeof xmasGpsPos!=='undefined'&&xmasGpsPos){lat=xmasGpsPos.lat;lng=xmasGpsPos.lng;}
 if(lat!==null&&typeof distanceMeters==='function'){
  var d=distanceMeters(lat,lng,p.lat,p.lng),mins=Math.ceil(d*1.3/75);
  distance='<p>'+esc(tr('Примерно ','Ca. ','Approx. ')+formatDistance(d)+' · '+mins+' '+tr('мин пешком','Min. zu Fuß','min walk'))+'</p>';
 }
 n.innerHTML='<h3>'+esc(emoji+' '+(p.name||''))+'</h3><p>'+esc(p.city||'')+'</p>'+distance+
 '<button type="button" class="mn-full-listen">🔊 '+esc(tr('Прослушать','Anhören','Listen'))+'</button>';
 var b=n.querySelector('.mn-full-listen');if(b)b.onclick=function(){speak(txt);};
}
function open(){state('full');panel.classList.add('open');}
var oldShow=window.showMapPanel;
if(typeof oldShow==='function'&&!oldShow.__mnFullWrapped){
 var wrapped=function(i){oldShow(i);castle(i);open();};
 wrapped.__mnFullWrapped=true;window.showMapPanel=wrapped;
}
var oldPoi=window._showPoiToast;
if(typeof oldPoi==='function'&&!oldPoi.__mnFullWrapped){
 var wrappedPoi=function(mapObj,p,emoji){
  if(typeof leafletMap==='undefined'||mapObj!==leafletMap){oldPoi(mapObj,p,emoji);return;}
  document.querySelectorAll('.nearest-toast').forEach(function(t){t.classList.remove('show');});
  var a=document.getElementById('mapPanelTitle'),b=document.getElementById('mapPanelMeta'),d=document.getElementById('mapPanelDesc');
  if(a)a.textContent=p.name||'';if(b)b.textContent=p.city||'';if(d)d.textContent='';
  poi(p,emoji);open();
 };
 wrappedPoi.__mnFullWrapped=true;window._showPoiToast=wrappedPoi;
}
var guide=document.getElementById('mapPanelOpenGuide');
if(guide)guide.onclick=function(e){e.preventDefault();open();};
function installHandle(){
 var h=rail.querySelector('.mn-bottom-handle');if(!h||h.__mnThreeStateBound)return;
 h.__mnThreeStateBound=true;
 var startY=0,startHeight=0,dragging=false,moved=false,suppressClick=false;
 h.addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  startY=e.clientY;startHeight=rail.getBoundingClientRect().height;dragging=true;moved=false;
  rail.classList.add('mn-is-dragging');
  try{h.setPointerCapture(e.pointerId);}catch(_){}
 });
 h.addEventListener('pointermove',function(e){
  if(!dragging)return;
  var dy=startY-e.clientY;if(Math.abs(dy)>4)moved=true;
  var bottom=8+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom'))||0);
  var max=Math.max(240,window.innerHeight-24);
  var height=Math.max(82,Math.min(max,startHeight+dy));
  rail.style.top='auto';rail.style.bottom='calc(env(safe-area-inset-bottom) + 8px)';
  rail.style.height=height+'px';rail.style.maxHeight=max+'px';
  var stateName=height<150?'compact':height<window.innerHeight*.68?'expanded':'full';
  document.body.classList.remove('mn-panel-compact','mn-panel-expanded','mn-panel-full');
  document.body.classList.add('mn-panel-'+stateName);
  if(stateName==='full')panel.classList.add('open');
 });
 function finish(){
  if(!dragging)return;dragging=false;rail.classList.remove('mn-is-dragging');
  if(moved){
   var hNow=rail.getBoundingClientRect().height,vh=window.innerHeight;
   var targets=[{s:'compact',h:82},{s:'expanded',h:Math.max(280,vh*.43)},{s:'full',h:vh-32}];
   targets.sort(function(a,b){return Math.abs(a.h-hNow)-Math.abs(b.h-hNow);});
   state(targets[0].s);suppressClick=true;setTimeout(function(){suppressClick=false;},350);
  }else{rail.style.height='';rail.style.maxHeight='';rail.style.top='';}
 }
 h.addEventListener('pointerup',finish);h.addEventListener('pointercancel',finish);
 h.addEventListener('click',function(e){
  if(suppressClick){e.preventDefault();e.stopPropagation();return;}
  var current=document.body.classList.contains('mn-panel-full')?'full':document.body.classList.contains('mn-panel-expanded')?'expanded':'compact';
  state(current==='compact'?'expanded':current==='expanded'?'full':'compact');
 });
 h.addEventListener('keydown',function(e){
  if(e.key==='Enter'||e.key===' '){e.preventDefault();var current=document.body.classList.contains('mn-panel-full')?'full':document.body.classList.contains('mn-panel-expanded')?'expanded':'compact';state(current==='compact'?'expanded':current==='expanded'?'full':'compact');}
 });
}
installHandle();
new MutationObserver(installHandle).observe(rail,{childList:true});
document.addEventListener('click',function(e){
 var card=e.target.closest&&e.target.closest('.mn-place-card');if(!card)return;
 if(card.hasAttribute('data-mn-index')){
  var i=Number(card.getAttribute('data-mn-index'));
  setTimeout(function(){castle(i);open();},60);
 }else if(card.hasAttribute('data-mn-poi')){
  setTimeout(function(){open();},60);
 }
});
state('compact');
})();