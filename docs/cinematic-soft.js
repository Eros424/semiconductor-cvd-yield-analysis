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
 // One continuous horizontal ribbon, sliced by position rather than by characters.
 const twistRoots=new Set();
 const twistFlights=new WeakMap();
 function stopTwist(control){twistFlights.get(control)?.();twistFlights.delete(control);}
 function decorateTwist(control){
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
  control.classList.add('twist-ready');
  for(const node of nodes){const text=document.createElement('span');text.className='twist-text';text.textContent=node.textContent;node.replaceWith(text);}
  return true;
 }
 function playTwist(control){
  if(reduced.matches)return;
  stopTwist(control);
  const sources=[...control.querySelectorAll('.twist-text,.top-letter-rail')].map(source=>({source,rect:source.getBoundingClientRect(),style:getComputedStyle(source)})).filter(x=>x.rect.width&&x.rect.height);
  if(!sources.length)return;
  const bounds=control.getBoundingClientRect(),border=getComputedStyle(control);
  const left=Math.min(...sources.map(x=>x.rect.left)),right=Math.max(...sources.map(x=>x.rect.right));
  const layers=[],flights=[],restore=[];
  const cleanup=()=>{flights.forEach(a=>a.cancel());layers.forEach(el=>el.remove());restore.forEach(([el,value])=>el.style.opacity=value);};
  twistFlights.set(control,cleanup);
  for(const {source,rect,style} of sources){
   const layer=document.createElement('span');layer.className='twist-layer';layer.setAttribute('aria-hidden','true');
   Object.assign(layer.style,{left:`${rect.left-bounds.left-parseFloat(border.borderLeftWidth)}px`,top:`${rect.top-bounds.top-parseFloat(border.borderTopWidth)}px`,width:`${rect.width}px`,height:`${rect.height}px`,font:style.font,color:style.color,letterSpacing:style.letterSpacing,textTransform:style.textTransform});
   const lineHeight=parseFloat(style.lineHeight);
   const lineOffset=source.matches('.top-letter-rail')||!Number.isFinite(lineHeight)?0:(source.getClientRects()[0].height-lineHeight)/2;
   const count=Math.max(12,Math.min(28,Math.ceil(rect.width/5)));
   for(let i=0;i<count;i++){
    const x=rect.width*i/count,w=rect.width/count;
    const band=document.createElement('span');band.className='twist-band';
    Object.assign(band.style,{left:`${x}px`,top:'0px',width:`${w+.4}px`,height:`${rect.height}px`});
    const content=source.matches('.top-letter-rail')?source.cloneNode(true):document.createElement('span');
    if(!source.matches('.top-letter-rail'))content.textContent=source.textContent;
    Object.assign(content.style,{position:'absolute',left:`${-x}px`,top:`${lineOffset}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',padding:'0',opacity:'1',font:style.font,color:style.color,letterSpacing:style.letterSpacing});
    band.append(content);layer.append(band);
    const position=((rect.left+x+w/2-left)/Math.max(1,right-left)-.5)*2;
    const frames=Array.from({length:33},(_,step)=>{
     const p=step/32,envelope=Math.sin(Math.PI*p),angle=2*Math.PI*p+position*Math.PI*.85*envelope;
     const squeeze=Math.cos(angle),drift=Math.sin(angle)*envelope*3;
     return {offset:p,transform:`translateY(${drift}px) scaleY(${squeeze}) skewX(${Math.sin(angle)*envelope*5}deg)`,opacity:.78+.22*Math.abs(squeeze)};
    });
    flights.push(band.animate(frames,{duration:650,easing:'linear'}));
   }
   restore.push([source,source.style.opacity]);source.style.opacity='0';control.append(layer);layers.push(layer);
  }
  Promise.all(flights.map(a=>a.finished)).then(()=>{if(twistFlights.get(control)===cleanup){cleanup();twistFlights.delete(control);}}).catch(()=>{});
 }
 function attachTwist(control){
  if(twistRoots.has(control))return;
  twistRoots.add(control);
  if(!control.matches('.back-to-top'))decorateTwist(control);
  control.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')playTwist(control);});
  control.addEventListener('focus',()=>playTwist(control));
  control.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')playTwist(control);});
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const control of twistRoots)stopTwist(control);});

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
 // One-shot vertical letter twist on focus/hover or touch, with native hash navigation.
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
  for(const control of changed)if(decorateTwist(control)&&control.matches(':hover,:focus-visible'))playTwist(control);
 });
 for(const control of twistRoots)if(!control.matches('.back-to-top'))labelObserver.observe(control,{childList:true,subtree:true});
})();
