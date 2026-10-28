/* B: reversible visual highlights, one analysis toggle, and progressive reading. */
(() => {
 // A separate, aria-hidden sheen layer keeps the existing highlight intact.
 document.querySelectorAll('#hero-title,.hero .english-title').forEach(title=>{
  const glyphs=[...title.querySelectorAll('.scroll-glyph')];
  glyphs.forEach((glyph,index)=>{
   const glint=document.createElement('span');
   glint.className='type-glint';
   glint.setAttribute('aria-hidden','true');
   glint.textContent=glyph.querySelector('.type-base').textContent;
   glint.style.setProperty('--glint-start',String(index/Math.max(1,glyphs.length)*.7));
   glint.style.setProperty('--glint-end',String(index/Math.max(1,glyphs.length)*.7+.3));
   glyph.append(glint);
  });
 });
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 // Text rolls down on entry, holds, and rises sequentially only on exit.
 const twistRoots=new Set(),twistFlights=new WeakMap(),rollStates=new WeakMap();
 const segmenter='Segmenter' in Intl?new Intl.Segmenter(document.documentElement.lang,{granularity:'grapheme'}):null;
 function stopTwist(control){(twistFlights.get(control)||[]).forEach(a=>a.cancel());twistFlights.delete(control);}
 function fillRollText(target,text){
  const fragment=document.createDocumentFragment();
  for(const token of text.split(/(\s+|[A-Za-z0-9]+(?:[-’'][A-Za-z0-9]+)*)/g)){
   if(!token)continue;
   if(/^\s+$/.test(token)){fragment.append(document.createTextNode(token));continue;}
   const latin=/^[A-Za-z0-9]/.test(token),container=latin?document.createElement('span'):fragment;
   if(latin)container.className='roll-word';
   const letters=segmenter?[...segmenter.segment(token)].map(x=>x.segment):Array.from(token);
   for(const character of letters){
    const letter=document.createElement('span');letter.className='roll-letter';
    const track=document.createElement('span');track.className='roll-track';
    const original=document.createElement('span');original.className='roll-copy roll-original';original.textContent=character;
    const echo=document.createElement('span');echo.className='roll-copy roll-echo';echo.textContent=character;echo.setAttribute('aria-hidden','true');
    track.append(original,echo);letter.append(track);container.append(letter);
   }
   if(latin)fragment.append(container);
  }
  target.replaceChildren(fragment);
 }
 function decorateTwist(control){
  if(control.matches('.back-to-top'))return false;
  const nodes=[],walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.textContent.trim()&&!node.parentElement.closest('.twist-text,.arrow,.analysis-icon,svg,[aria-hidden=true],.sr-only'))nodes.push(node);
  }
  if(!nodes.length)return false;
  stopTwist(control);
  if(!control.hasAttribute('aria-label')||control.dataset.twistOwnLabel==='true'){
   const names=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);let label='';
   while(names.nextNode())if(!names.currentNode.parentElement.closest('[aria-hidden=true],svg'))label+=names.currentNode.textContent;
   control.setAttribute('aria-label',label.replace(/\s+/g,' ').trim());control.dataset.twistOwnLabel='true';
  }
  control.classList.add('twist-ready','roll-ready');
  for(const node of nodes){const text=document.createElement('span');text.className='twist-text';fillRollText(text,node.textContent);node.replaceWith(text);}
  return true;
 }
 function playTwist(control,down){
  const tracks=[...control.querySelectorAll('.roll-track')];
  const from=tracks.map(track=>getComputedStyle(track).transform);
  const positions=tracks.map((track,index)=>({index,rect:track.parentElement.getBoundingClientRect()}));
  stopTwist(control);
  const flip=control.matches('.back-to-top');
  const target=flip?(down&&!reduced.matches?'rotateY(180deg)':'rotateY(0deg)'):(down&&!reduced.matches?'translateY(100%)':'translateY(0%)');
  tracks.forEach(track=>track.style.transform=target);
  if(reduced.matches)return;
  // Text labels roll right-to-left; vertical BACK TO TOP flips P-first, B-last.
  const order=flip?[...positions].reverse():positions.sort((a,b)=>Math.abs(a.rect.top-b.rect.top)>4?a.rect.top-b.rect.top:b.rect.left-a.rect.left);
  const rank=new Map(order.map((item,index)=>[item.index,index]));
  const stagger=Math.min(12,100/Math.max(1,tracks.length-1));
  const flights=tracks.map((track,index)=>track.animate([{transform:from[index]},{transform:target}],{duration:220,delay:rank.get(index)*stagger,easing:'linear',fill:'both'}));
  twistFlights.set(control,flights);
  Promise.all(flights.map(a=>a.finished)).then(()=>{if(twistFlights.get(control)===flights)stopTwist(control);}).catch(()=>{});
 }
 function syncRoll(control){const state=rollStates.get(control);playTwist(control,!!(state?.hover||state?.keyboard||state?.touch));}
 function attachTwist(control){
  if(twistRoots.has(control))return;
  twistRoots.add(control);rollStates.set(control,{hover:false,keyboard:false,touch:false});
  if(control.matches('.back-to-top')){control.classList.add('roll-ready');control.querySelectorAll('.top-letter').forEach(letter=>fillRollText(letter,letter.textContent));}
  else decorateTwist(control);
  control.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){rollStates.get(control).hover=true;syncRoll(control);}});
  control.addEventListener('pointerleave',event=>{const state=rollStates.get(control);if(event.pointerType==='touch')state.touch=false;else state.hover=false;syncRoll(control);});
  control.addEventListener('focus',()=>{if(control.matches(':focus-visible')){rollStates.get(control).keyboard=true;syncRoll(control);}});
  control.addEventListener('blur',()=>{rollStates.get(control).keyboard=false;syncRoll(control);});
  control.addEventListener('pointerdown',event=>{const state=rollStates.get(control);if(event.pointerType==='touch'){state.touch=true;syncRoll(control);}else state.keyboard=false;});
  for(const name of ['pointerup','pointercancel'])control.addEventListener(name,event=>{if(event.pointerType==='touch'){rollStates.get(control).touch=false;syncRoll(control);}});
 }
 reduced.addEventListener('change',()=>{for(const control of twistRoots){if(reduced.matches){stopTwist(control);control.querySelectorAll('.roll-track').forEach(track=>track.style.transform=control.matches('.back-to-top')?'rotateY(0deg)':'translateY(0%)');}else syncRoll(control);}});

 const controls = new Map();
 const flights = new Map();
 const closeLabel = document.documentElement.lang==='en' ? 'Close full analysis' : '收合完整分析';
 function setOpen(panel,open,{animate=true}={}) {
  const button=controls.get(panel);
  if(!button)return;
  const running=flights.get(panel);
  const fromHeight=panel.hidden?0:panel.getBoundingClientRect().height;
  const fromOpacity=panel.hidden?0:Number(getComputedStyle(panel).opacity);
  running?.cancel();flights.delete(panel);
  button.setAttribute('aria-expanded',String(open));
  button.querySelector('[data-analysis-label]').textContent=open?closeLabel:button.dataset.closedLabel;
  if(!open&&panel.contains(document.activeElement))button.focus({preventScroll:true});
  panel.hidden=false;panel.inert=!open;
  const toHeight=open?panel.getBoundingClientRect().height:0;
  const settle=()=>{panel.hidden=!open;panel.inert=!open;panel.style.removeProperty('overflow');};
  if(!animate||reduced.matches||!panel.animate){settle();return;}
  // Only the toggled panel changes height, once per explicit interaction.
  // Inner charts keep their original dimensions; no scroll-linked layout animation.
  panel.style.overflow='clip';
  const flight=panel.animate([{height:`${fromHeight}px`,opacity:fromOpacity},{height:`${toHeight}px`,opacity:open?1:0}],{duration:open?520:380,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  flights.set(panel,flight);
  flight.finished.then(()=>{
   if(flights.get(panel)!==flight)return;
   settle();flight.cancel();flights.delete(panel);
  }).catch(()=>{});
 }
 document.querySelectorAll('button.story-analysis-link[aria-controls]').forEach(button=>{
  const panel=document.getElementById(button.getAttribute('aria-controls'));
  if(!panel)return;
  controls.set(panel,button);
  button.dataset.closedLabel=button.querySelector('[data-analysis-label]').textContent;
  setOpen(panel,false,{animate:false});button.hidden=false;
  button.addEventListener('click',()=>{
   const open=button.getAttribute('aria-expanded')!=='true';
   setOpen(panel,open);
   const url=new URL(location.href);
   if(open)url.hash=panel.id;
   else if(url.hash==='#'+panel.id)url.hash=panel.closest('.story-chapter').id;
   history.replaceState(history.state,'',url);
   if(open)requestAnimationFrame(()=>{
    const nav=document.querySelector('.site-header').getBoundingClientRect().height;
    const top=panel.getBoundingClientRect().top+scrollY-nav-180;
    scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
   });
  });
 });
 function revealHash(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);
  const panel=target?.closest('.story-evidence');
  if(panel&&controls.has(panel)){
   setOpen(panel,true,{animate:false});
   requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
  }else if(target instanceof HTMLDetailsElement)target.open=true;
 }
 addEventListener('hashchange',revealHash);
 addEventListener('popstate',revealHash);
 reduced.addEventListener('change',()=>{
  if(reduced.matches)for(const [panel,button] of controls)setOpen(panel,button.getAttribute('aria-expanded')==='true',{animate:false});
 });
 revealHash();
 // Top-to-bottom reading with the same held text rollover and page navigation.
 const topLink=document.querySelector('.back-to-top');
 if(topLink){
  attachTwist(topLink);
  topLink.addEventListener('click',event=>{
   if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   const url=new URL(location.href);url.hash='top';
   history.pushState(history.state,'',url);
   scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
   const hero=document.getElementById('top');
   hero.setAttribute('tabindex','-1');hero.focus({preventScroll:true});
  });
 }

 const interactiveText='button,.text-link,.flow a,.nav-links>a,.chapter-menu>summary,.chapter-menu li a,.evidence-body details>summary,.footer-links a,.scroll-cue,.lightbox-footer a';
 document.querySelectorAll(interactiveText).forEach(attachTwist);
 // Label changes (open/close, actual size/fit) keep the same animation and wording.
 const labelObserver=new MutationObserver(records=>{
  const changed=new Set();
  for(const record of records){
   const node=record.target.nodeType===Node.ELEMENT_NODE?record.target:record.target.parentElement;
   const control=node.closest(interactiveText);
   if(control&&twistRoots.has(control))changed.add(control);
  }
  for(const control of changed)if(decorateTwist(control))syncRoll(control);
 });
 for(const control of twistRoots)if(!control.matches('.back-to-top'))labelObserver.observe(control,{childList:true,subtree:true});
})();
