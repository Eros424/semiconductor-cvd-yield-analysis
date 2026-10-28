/* One reversible scroll system. Evidence remains complete without JavaScript. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1001px) and (min-height: 650px)');
  const chapters = [...document.querySelectorAll('.story-chapter')];
  const transitions = [...document.querySelectorAll('[data-transition]')];
  const photos = [...document.querySelectorAll('[data-photo]')];
  const progress = document.querySelector('.reading-progress');
  const current = document.querySelector('[data-current-chapter]');
  const menu = document.querySelector('.chapter-menu');
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  // B's opening has a natural-scroll runway; A retains its original timing.
  const sequencedHero = hero.hasAttribute('data-hero-sequence');
  let heroRunway = null;
  if (sequencedHero) {
    heroRunway = document.createElement('div');
    heroRunway.className = 'hero-runway';
    hero.before(heroRunway);
    heroRunway.append(hero);
  }
  const languageLink = document.querySelector('[data-language-link]');
  const flow = document.querySelector('.flow');
  const clamp = value => Math.max(0,Math.min(1,value));
  const ease = 'cubic-bezier(.22,1,.36,1)';
  let frame = 0;
  let activeId = '';
  let navHeight = 76;
  const cameraState = new WeakMap();
  let previousPaint = performance.now();
  // A little visual inertia; document scrolling and glyph progress stay native.
  function dampCamera(target,value,delta,visible) {
    if(!sequencedHero||reduced.matches||document.hidden||!visible){cameraState.set(target,value);return value;}
    const previous=cameraState.has(target)?cameraState.get(target):value;
    const next=previous+(value-previous)*(1-Math.exp(-delta/(desktop.matches?125:65)));
    const settled=Math.abs(next-value)<.0005;
    cameraState.set(target,settled?value:next);
    if(!settled)schedule();
    return settled?value:next;
  }

  // Grid-overlaid glyphs preserve a single selectable, accessible base string.
  function splitType(target) {
    const nodes = [];
    const walker = document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    const segments = 'Segmenter' in Intl ? new Intl.Segmenter(root.lang,{granularity:'grapheme'}) : null;
    function glyph(character) {
      const wrapper = document.createElement('span');
      wrapper.className = 'scroll-glyph';
      wrapper.style.setProperty('--glyph-index',String(index++));
      const base = document.createElement('span');base.className = 'type-base';base.textContent = character;
      const ink = document.createElement('span');ink.className = 'type-ink';ink.textContent = character;ink.setAttribute('aria-hidden','true');
      wrapper.append(base,ink);return wrapper;
    }
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      const tokens = node.textContent.split(/([A-Za-z0-9]+(?:['’–-][A-Za-z0-9]+)*)/g);
      for (const token of tokens) {
        if (!token) continue;
        const letters = segments ? [...segments.segment(token)].map(item=>item.segment) : Array.from(token);
        if (/^[A-Za-z0-9]/.test(token)) {
          const word = document.createElement('span');word.className = 'type-word';
          letters.forEach(character=>word.append(glyph(character)));fragment.append(word);
        } else {
          for (const character of letters) {
            if (/\s/.test(character)) { fragment.append(document.createTextNode(character));continue; }
            const letter = glyph(character);
            if (/[，。！？：；、,.!?;:]/.test(character) && fragment.lastChild?.nodeType===1) {
              const punctuation = document.createElement('span');punctuation.className = 'type-punctuation';
              punctuation.append(fragment.lastChild,letter);fragment.append(punctuation);
            } else fragment.append(letter);
          }
        }
      }
      node.replaceWith(fragment);
    }
    target.classList.add('scroll-type');target.style.setProperty('--glyph-count',String(Math.max(1,index)));
  }
  const types = [...document.querySelectorAll('#hero-title,.story-copy h2,.investigation-heading h2,.english-title,.pressure-word,.comparison-title,.action-word b,#conclusion-title')];
  types.forEach(splitType);

  function setActive(chapter,navRects) {
    const id = chapter?.id || '';
    if (id === activeId) return;
    activeId = id;
    const number = chapter?.dataset.chapter;
    current.textContent = number ? `${number} / 05` : '01 — 05';
    if (!reduced.matches) current.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300,easing:ease});
    if (chapter) languageLink.dataset.chapter = id;
    else delete languageLink.dataset.chapter;
    menu.querySelectorAll('a').forEach(link=>{
      if (link.hash === '#' + id) link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
    });
    const selected = navRects.find(item=>item.id===id);
    if (selected) {
      flow.style.setProperty('--indicator-x',`${selected.x}px`);
      flow.style.setProperty('--indicator-y',`${selected.y}px`);
      flow.style.setProperty('--indicator-width',`${selected.width}px`);
      menu.style.setProperty('--menu-indicator-y',`${12 + (Number(number)-1)*53 + 12}px`);
    }
  }

  function paint() {
    frame = 0;
    const now=performance.now();
    const delta=Math.min(64,Math.max(1,now-previousPaint));previousPaint=now;
    const height = innerHeight;
    // Read layout first, then write only paint/composite properties.
    const total = document.documentElement.scrollHeight-height;
    const heroRect = hero.getBoundingClientRect();
    const chapterLayouts = chapters.map(chapter=>({chapter,rect:chapter.getBoundingClientRect(),stage:chapter.querySelector('.story-stage').getBoundingClientRect()}));
    const typeLayouts = types.map(target=>({target,rect:target.getBoundingClientRect()}));
    const transitionLayouts = transitions.map(target=>({target,rect:target.getBoundingClientRect()}));
    const photoLayouts = photos.map(target=>({target,rect:target.closest('section').getBoundingClientRect()}));
    const navRects = [...flow.querySelectorAll('a')].map(link=>({id:link.hash.slice(1),x:link.parentElement.offsetLeft,y:link.parentElement.offsetTop,width:link.parentElement.offsetWidth}));
    const motion = !reduced.matches;
    const runwayRect = heroRunway?.getBoundingClientRect();
    const hold = runwayRect ? Math.max(0,runwayRect.height-heroRect.height) : 0;
    const travelled = runwayRect ? -runwayRect.top : -heroRect.top;
    // Finish all glyphs during the held scene, then move the camera and copy.
    const heroP = sequencedHero && motion
      ? clamp((travelled-hold)/Math.max(1,heroRect.height))
      : clamp(-heroRect.top/Math.max(1,heroRect.height));
    const heroTextP = sequencedHero
      ? clamp(.06+travelled/Math.max(1,hold*.65))
      : clamp(.12+heroP*2.2);
    let active = null;
    progress.style.transform = `scaleX(${total>0?clamp(scrollY/total):0})`;
    if (sequencedHero) hero.style.setProperty('--hero-sweep-progress',motion?String(clamp(travelled/Math.max(1,hold*.9))):'1');
    hero.style.setProperty('--hero-copy-y',`${motion?-heroP*70:0}px`);
    hero.style.setProperty('--hero-copy-opacity',motion?String(1-clamp((heroP-.3)/.55)*.8):'1');
    for (const {chapter,rect,stage} of chapterLayouts) {
      if (rect.top<height*.55 && rect.bottom>navHeight) active = chapter;
      const pinned = motion && desktop.matches ? clamp((navHeight-stage.top)/Math.max(1,stage.height-height+navHeight)) : 0;
      const exit = clamp((pinned-.68)/.32);
      chapter.style.setProperty('--copy-y',`${-exit*28}px`);
      chapter.style.setProperty('--media-y',`${-exit*10}px`);
      chapter.style.setProperty('--exit-opacity',String(1-exit*.3));
    }
    for (const {target,rect} of typeLayouts) {
      let p = motion ? clamp((height*.9-rect.top)/Math.max(1,height*.48+rect.height*.3)) : 1;
      if (target.id==='hero-title' || target.classList.contains('english-title')) p=motion?heroTextP:1;
      target.style.setProperty('--text-progress',p.toFixed(4));
      target.style.setProperty('--gradient-x',`${20+p*65}%`);
    }
    for (const {target,rect} of photoLayouts) {
      const isHero=target.dataset.photo==='hero';
      const raw=isHero?heroP:clamp((height-rect.top)/Math.max(1,height+rect.height));
      const p=dampCamera(target,raw,delta,rect.bottom>0&&rect.top<height);
      const strength=desktop.matches?1:.45;
      target.style.setProperty('--photo-scale',motion?String((isHero?1:1.05)+p*.12*strength):'1');
      target.style.setProperty('--photo-y',motion?`${(isHero?p*3:(p-.5)*4)*strength}%`:'0%');
    }
    for (const {target,rect} of transitionLayouts) {
      const raw=motion?clamp((height*.8-rect.top)/Math.max(1,rect.height-height*.15)):1;
      const p=dampCamera(target,raw,delta,rect.bottom>0&&rect.top<height);
      const cross=clamp((p-.2)/.65);
      const strength=desktop.matches?1:.45;
      const values={
        '--transition-p':p.toFixed(4),'--aperture':`${(desktop.matches?12:6)*(1-clamp(p/.75))}%`,
        '--frame-radius':`${18*(1-p)}px`,'--old-scale':String(1+p*.12*strength),
        '--new-scale':String(1+.14*strength-p*.12*strength),'--old-opacity':String(1-cross),
        '--new-opacity':String(cross),'--wipe':`${100*(1-clamp((p-.12)/.65))}%`,
        '--camera-pan':`${(p-.5)*6*strength}%`,'--bridge-title-opacity':String(motion?clamp((p-.25)/.5):1),
        '--bridge-title-y':`${motion?(1-clamp((p-.25)/.5))*20:0}px`,'--transition-shade':String(.6+p*.35)
      };
      if (Number(target.dataset.transitionIndex)%2===0) values['--wipe']='0%';
      else if (motion) { values['--old-opacity']='1'; values['--new-opacity']='1'; }
      if (!motion) {values['--aperture']='0%';values['--frame-radius']='0px';values['--wipe']='0%';}
      for(const [property,value] of Object.entries(values))target.style.setProperty(property,value);
    }
    setActive(active,navRects);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function setup(){
    navHeight=Math.ceil(header.getBoundingClientRect().height);
    root.style.setProperty('--nav-height',`${navHeight}px`);
    root.classList.toggle('motion-enabled',!reduced.matches && 'IntersectionObserver' in window);
    schedule();
  }
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    },{threshold:.12});
    document.querySelectorAll('.reveal,.text-reveal,.image-reveal,.evidence-body .figure-card').forEach(el=>observer.observe(el));
  }
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}
  });
  languageLink.addEventListener('click',()=>{
    const file=languageLink.getAttribute('href').split('#')[0];
    const anchor=document.getElementById(location.hash.slice(1));
    const bounds=anchor?.getBoundingClientRect();
    const evidenceVisible=location.hash.startsWith('#evidence-')&&bounds&&bounds.top<innerHeight&&bounds.bottom>navHeight;
    languageLink.href=file+(evidenceVisible?location.hash:activeId?'#'+activeId:'');
  });

  // Optional focus mode: FLIP geometry plus native dialog focus/inert semantics.
  const dialog=document.querySelector('.lightbox');
  const shell=dialog.querySelector('.focus-image-shell');
  const enlarged=dialog.querySelector('img');
  const backdrop=dialog.querySelector('.focus-backdrop');
  const caption=dialog.querySelector('[data-chart-caption]');
  const original=dialog.querySelector('[data-original-chart]');
  const actual=dialog.querySelector('[data-actual-size]');
  const closeButton=dialog.querySelector('.lightbox-header .lightbox-close');
  const local=root.lang!=='en';
  const zoomLinks=[...document.querySelectorAll('a[data-zoom]')];
  zoomLinks.forEach((link,i)=>link.dataset.focusId=`chart-${i+1}`);
  let focusedLink=null,focusState='closed',flight=null,scrimFlight=null,revision=0,ownsHistory=false,previousOverflow='',closeRequested=false;
  function focusQuery(){return new URL(location.href).searchParams.get('focus');}
  function focusURL(id){const url=new URL(location.href);if(id)url.searchParams.set('focus',id);else url.searchParams.delete('focus');return url;}
  function mapRect(rect,base){return `translate3d(${rect.left-base.left}px,${rect.top-base.top}px,0) scale(${rect.width/Math.max(1,base.width)})`;}
  function stopFlights(){flight?.cancel();scrimFlight?.cancel();}
  function restore(){
    dialog.classList.remove('is-flying','is-actual');
    if(dialog.open)dialog.close();
    root.style.overflow=previousOverflow;
    if(focusedLink){focusedLink.querySelector('img').style.visibility='';focusedLink.focus({preventScroll:true});}
    focusState='closed';flight=null;scrimFlight=null;closeRequested=false;schedule();
  }
  async function openFocus(link,{push=true}={}){
    if(focusState!=='closed')return;
    const source=link.querySelector('img');
    focusState='opening';focusedLink=link;const token=++revision;
    if(!source.complete||!source.naturalWidth){
      source.loading='eager';
      try{await source.decode();}catch{focusState='closed';location.href=link.href;return;}
    }
    if(token!==revision)return;
    enlarged.src=link.href;enlarged.alt=source.alt;enlarged.width=source.naturalWidth;enlarged.height=source.naturalHeight;
    try{await enlarged.decode();}catch{focusState='closed';location.href=link.href;return;}
    if(token!==revision)return;
    const first=source.getBoundingClientRect();
    caption.textContent=source.alt;original.href=link.href;
    dialog.classList.remove('is-actual');actual.setAttribute('aria-pressed','false');actual.textContent=local?'原始大小':'Actual size';
    previousOverflow=root.style.overflow;root.style.overflow='hidden';
    dialog.showModal();dialog.classList.add('is-flying');
    const last=shell.getBoundingClientRect();source.style.visibility='hidden';
    if(push){history.pushState({...history.state,cvdFocus:link.dataset.focusId},'',focusURL(link.dataset.focusId));ownsHistory=true;}
    else ownsHistory=history.state?.cvdFocus===link.dataset.focusId;
    closeButton.focus({preventScroll:true});
    const duration=reduced.matches?0:1050;
    flight=shell.animate([{transform:mapRect(first,last)},{transform:'none'}],{duration,easing:ease,fill:'both'});
    scrimFlight=backdrop.animate([{opacity:0},{opacity:1}],{duration:reduced.matches?0:800,easing:ease,fill:'both'});
    await Promise.allSettled([flight.finished,scrimFlight.finished]);
    if(token!==revision)return;
    stopFlights();dialog.classList.remove('is-flying');focusState='open';
  }
  async function closeFocus(){
    if(focusState==='closed'||focusState==='closing')return;
    if(!dialog.open){++revision;focusState='closed';closeRequested=false;return;}
    focusState='closing';const token=++revision;
    const first=shell.getBoundingClientRect();const last=focusedLink.querySelector('img').getBoundingClientRect();
    const alpha=getComputedStyle(backdrop).opacity;
    stopFlights();dialog.classList.add('is-flying');const base=shell.getBoundingClientRect();
    const duration=reduced.matches?0:750;
    flight=shell.animate([{transform:mapRect(first,base)},{transform:mapRect(last,base)}],{duration,easing:ease,fill:'both'});
    scrimFlight=backdrop.animate([{opacity:alpha},{opacity:0}],{duration:reduced.matches?0:650,easing:ease,fill:'both'});
    await Promise.allSettled([flight.finished,scrimFlight.finished]);
    if(token!==revision)return;
    stopFlights();restore();
  }
  function requestClose(){
    if(focusState==='closed'||focusState==='closing'||closeRequested)return;
    closeRequested=true;
    if(ownsHistory&&focusQuery()){history.back();}
    else{history.replaceState(history.state,'',focusURL(null));closeFocus();}
  }
  function syncFocus(){
    const id=focusQuery();const target=zoomLinks.find(link=>link.dataset.focusId===id);
    if(target&&focusState==='closed')openFocus(target,{push:false});
    else if(target&&focusState==='closing'){++revision;stopFlights();restore();openFocus(target,{push:false});}
    else if(!target)closeFocus();
  }
  if(typeof dialog.showModal==='function'){
    zoomLinks.forEach(link=>link.addEventListener('click',event=>{
      if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();openFocus(link);
    }));
    closeButton.addEventListener('click',requestClose);
    dialog.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();requestClose();}
    });
    dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
    dialog.addEventListener('close',()=>{
      if(focusState==='closed')return;
      ++revision;stopFlights();restore();
      if(focusQuery())history.replaceState({...history.state,cvdFocus:null},'',focusURL(null));
    });
    backdrop.addEventListener('click',requestClose);
    actual.addEventListener('click',()=>{
      if(focusState!=='open')return;
      const show=dialog.classList.toggle('is-actual');actual.setAttribute('aria-pressed',String(show));
      actual.textContent=show?(local?'完整圖表':'Fit chart'):(local?'原始大小':'Actual size');
    });
    addEventListener('popstate',syncFocus);
    syncFocus();
  }
  reduced.addEventListener('change',()=>{
    if(reduced.matches){try{flight?.finish();scrimFlight?.finish();}catch{}}
    setup();
  });
  addEventListener('resize',()=>{
    try{flight?.finish();scrimFlight?.finish();}catch{}
    setup();
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('hashchange',schedule);
  desktop.addEventListener('change',setup);
  if('ResizeObserver' in window)new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(setup);
  setup();
})();
