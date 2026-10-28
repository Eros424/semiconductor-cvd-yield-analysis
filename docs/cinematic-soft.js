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
 let twists=[];
 reduced.addEventListener('change',()=>{if(reduced.matches)twists.forEach(a=>a.cancel());});
 function twist(){
  if(reduced.matches)return;
  twists.forEach(a=>a.cancel());
  twists=[...topLink.querySelectorAll('.top-letter')].map((letter,index)=>letter.animate([
   {transform:'perspective(220px) rotateY(0deg)'},
   {transform:'perspective(220px) rotateY(180deg)',offset:.5},
   {transform:'perspective(220px) rotateY(360deg)'}
  ],{duration:750,delay:index*45,easing:'cubic-bezier(.22,1,.36,1)'}));
 }
 if(topLink){
  topLink.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')twist();});
  topLink.addEventListener('focus',twist);
  topLink.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')twist();});
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
})();
