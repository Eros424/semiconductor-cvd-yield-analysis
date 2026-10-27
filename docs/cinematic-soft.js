/* B's native details retain the original reading controls and hash destinations. */
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
 function revealHash(){
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(target instanceof HTMLDetailsElement)target.open=true;
 }
 document.querySelectorAll('a[href^="#evidence-"]').forEach(link=>link.addEventListener('click',()=>{
  const target=document.getElementById(link.hash.slice(1));
  if(target instanceof HTMLDetailsElement)target.open=true;
 }));
 addEventListener('hashchange',revealHash);
 revealHash();
})();
