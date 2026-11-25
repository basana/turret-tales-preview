(function(){
'use strict';
var rail=document.getElementById('mnBottomRail'), panel=document.getElementById('mapPanel');
if(!rail||!panel||window.__mnFullPanelInstalled)return;
window.__mnFullPanelInstalled=true;
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function state(s){document.body.classList.remove('mn-panel-compact','mn-panel-expanded','mn-panel-full');document.body.classList.add('mn-panel-'+s);rail.classList.toggle('mn-state-full',s==='full');panel.classList.add('open');if(window.leafletMap)setTimeout(function(){leafletMap.invalidateSize();},240);}
function content(){var n=panel.querySelector('.mn-full-object-content');if(!n){n=document.createElement('div');n.className='mn-full-object-content';panel.appendChild(n);}return n;}
function tr(ru,de,en){return window.lang==='ru'?(ru||en):window.lang==='de'?(de||en):(en||de||ru);}
function speak(t){if(!t||!window.speechSynthesis)return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=window.lang==='ru'?'ru-RU':window.lang==='de'?'de-DE':'en-US';u.rate=.9;speechSynthesis.speak(u);}
function castle(i){
 var c=window.castles&&castles[i];if(!c)return;
 var story=tr(c.sayRu||c.factsRu,c.sayDe||c.factsDe,c.say||c.facts),facts=tr(c.factsRu,c.factsDe,c.facts),legend=tr(c.legendRu,c.legendDe,c.legend),imgs=Array.isArray(c.images)?c.images.slice(0,8):[];
 var n=content();n.innerHTML=(imgs.length?'<div class="mn-full-gallery">'+imgs.map(function(src){return '<img src="'+esc(src)+'" alt="'+esc(c.name)+'" loading="lazy">';}).join('')+'</div>':'')+
 '<button type="button" class="mn-full-listen">🔊 '+tr('Прослушать','Anhören','Listen')+'</button>'+
 (story?'<h3>'+tr('Рассказ','Geschichte','Story')+'</h3><p>'+esc(story)+'</p>':'')+
 (facts&&facts!==story?'<h3>'+tr('Факты','Fakten','Facts')+'</h3><p>'+esc(facts)+'</p>':'')+
 (legend?'<h3>'+tr('История и легенды','Geschichte und Legenden','History & legends')+'</h3><p>'+esc(legend)+'</p>':'');
 n.querySelector('.mn-full-listen').onclick=function(){speak(story||facts||legend);};
}
function poi(p,emoji){
 var n=content(),txt=[p.name,p.city].filter(Boolean).join(' · ');
 n.innerHTML='<h3>'+emoji+' '+esc(p.name)+'</h3><p>'+esc(p.city||'')+'</p><button type="button" class="mn-full-listen">🔊 '+tr('Прослушать','Anhören','Listen')+'</button>';
 n.querySelector('.mn-full-listen').onclick=function(){speak(txt);};
}
function open(){state('full');}
var old=window.showMapPanel;
if(typeof old==='function'&&!old.__mnFullWrapped){var w=function(i){old(i);castle(i);open();};w.__mnFullWrapped=true;window.showMapPanel=w;}
var oldPoi=window._showPoiToast;
if(typeof oldPoi==='function'&&!oldPoi.__mnFullWrapped){var wp=function(mapObj,p,emoji){
 if(mapObj!==window.leafletMap){oldPoi(mapObj,p,emoji);return;}
 document.querySelectorAll('.nearest-toast').forEach(function(t){t.classList.remove('show');});
 var a=document.getElementById('mapPanelTitle'),b=document.getElementById('mapPanelMeta'),d=document.getElementById('mapPanelDesc');
 if(a)a.textContent=p.name||'';if(b)b.textContent=p.city||'';if(d)d.textContent='';
 poi(p,emoji);open();
};wp.__mnFullWrapped=true;window._showPoiToast=wp;}
var full=document.getElementById('mapPanelOpenGuide');if(full)full.onclick=function(e){e.preventDefault();open();};
var style=document.createElement('style');
style.textContent="body.map-navi-active .mn-bottom-rail{touch-action:pan-y;transition:height .2s ease,top .2s ease}"+
"body.map-navi-active .mn-bottom-rail.mn-is-dragging{transition:none!important}"+
"body.map-navi-active .mn-bottom-rail .mn-full-object-content{display:none;padding:14px 2px 28px}"+
"body.mn-panel-full .mn-bottom-rail .mn-full-object-content{display:block}"+
"body.map-navi-active .mn-full-object-content h3{margin:16px 0 7px;font:600 21px/1.15 'EB Garamond',serif;color:#7A1026}"+
"body.map-navi-active .mn-full-object-content p{margin:0 0 13px;font:17px/1.45 'EB Garamond',serif;color:#493A29;white-space:pre-line}"+
"body.map-navi-active .mn-full-gallery{display:flex;gap:9px;overflow-x:auto;padding:2px 0 12px}"+
"body.map-navi-active .mn-full-gallery img{flex:0 0 78%;width:78%;height:190px;object-fit:cover;border-radius:12px}"+
"body.map-navi-active .mn-full-listen{width:100%;min-height:50px;margin:8px 0 14px;border:1px solid #9A773F;border-radius:12px;background:#7A1026;color:#FFF4DE;font:600 18px 'EB Garamond',serif}"+
"body.map-navi-active .map-panel-open-guide{display:none}"+
"body.map-navi-active .mn-bottom-rail .map-panel{overscroll-behavior:contain}";
document.head.appendChild(style);
function bindDrag(){var h=rail.querySelector('.mn-bottom-handle');
if(h&&!h.__mnDragBound){
 h.__mnDragBound=true;var y=0,h0=0,drag=false;
 h.addEventListener('pointerdown',function(e){y=e.clientY;h0=rail.getBoundingClientRect().height;drag=true;rail.classList.add('mn-is-dragging');try{h.setPointerCapture(e.pointerId);}catch(_){}});
 h.addEventListener('pointermove',function(e){if(!drag)return;var max=window.innerHeight-24,v=Math.max(150,Math.min(max,h0+y-e.clientY));rail.style.top='auto';rail.style.height=v+'px';rail.style.maxHeight=max+'px';var s=v/window.innerHeight>.66?'full':v/window.innerHeight>.34?'expanded':'compact';document.body.classList.remove('mn-panel-compact','mn-panel-expanded','mn-panel-full');document.body.classList.add('mn-panel-'+s);});
 function end(){if(!drag)return;drag=false;rail.classList.remove('mn-is-dragging');var r=rail.getBoundingClientRect().height/window.innerHeight;rail.style.height='';rail.style.maxHeight='';rail.style.top='';state(r>.66?'full':r>.34?'expanded':'compact');}
 h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
}}
bindDrag();var railObserver=new MutationObserver(bindDrag);railObserver.observe(rail,{childList:true});
document.addEventListener('click',function(e){var card=e.target.closest&&e.target.closest('.mn-place-card');if(card&&card.hasAttribute('data-mn-index')){var i=Number(card.getAttribute('data-mn-index'));setTimeout(function(){castle(i);open();},35);}if(card&&card.hasAttribute('data-mn-poi'))open();},true);
})();