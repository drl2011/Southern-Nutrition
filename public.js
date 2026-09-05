// Public menu-only storefront. Commerce code is intentionally not loaded on the public page.
const menu = [
  {id:'build-your-own',name:'Build Your Own Loaded Tea',type:'tea',category:'Make It Yours',accent:'make',image:'assets/build-your-own-ice.png',desc:'Pick your flavors and create your perfect tea.',custom:true},

  {id:'southern-belle',name:'Southern Belle',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Strawberry • Peach',flavors:['Strawberry','Peach']},
  {id:'georgia-peach',name:'Georgia Peach',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Peach • Mango',flavors:['Peach','Mango']},
  {id:'berry-bliss',name:'Berry Bliss',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Strawberry • Blueberry',flavors:['Strawberry','Blueberry']},
  {id:'watermelon-sugar',name:'Watermelon Sugar',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Watermelon • Strawberry',flavors:['Watermelon','Strawberry']},
  {id:'cherry-bombshell',name:'Cherry Bombshell',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Cherry • Blue Blast',flavors:['Cherry','Blue Blast']},
  {id:'strawberry-crush',name:'Strawberry Crush',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Strawberry • Blue Blast',flavors:['Strawberry','Blue Blast']},
  {id:'grape-limeade',name:'Grape Limeade',type:'tea',category:'Fruity Favorites',accent:'fruity',desc:'Grape • Cherry • Lime',flavors:['Grape','Cherry','Lime'],badge:'NEW!'},

  {id:'sour-apple',name:'Sour Apple',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Green Apple (Warhead Sour)',flavors:['Green Apple (Warhead Sour)']},
  {id:'sour-blue-blast',name:'Sour Blue Blast',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Blue Blast (Warhead Sour)',flavors:['Blue Blast (Warhead Sour)']},
  {id:'sour-cherry',name:'Sour Cherry',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Cherry (Warhead Sour)',flavors:['Cherry (Warhead Sour)']},
  {id:'sour-watermelon',name:'Sour Watermelon',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Watermelon (Warhead Sour)',flavors:['Watermelon (Warhead Sour)']},
  {id:'sour-grape',name:'Sour Grape',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Grape (Warhead Sour)',flavors:['Grape (Warhead Sour)']},
  {id:'sour-patch-kid',name:'Sour Patch Kid',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Sour Watermelon • Sour Blue Blast',flavors:['Sour Watermelon','Sour Blue Blast']},
  {id:'sour-power',name:'Sour Power',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Sour Apple • Sour Blue Blast',flavors:['Sour Apple','Sour Blue Blast']},
  {id:'sour-twist',name:'Sour Twist',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Sour Cherry • Sour Blue Blast',flavors:['Sour Cherry','Sour Blue Blast']},
  {id:'extreme-sour',name:'Extreme Sour',type:'tea',category:'Sour & Warheads',accent:'sour',desc:'Sour Blue Blast • Green Apple (Warhead Sour)',flavors:['Sour Blue Blast','Green Apple (Warhead Sour)']},

  {id:'tropical-paradise',name:'Tropical Paradise',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Mango',flavors:['Pineapple','Mango']},
  {id:'hawaiian-sunset',name:'Hawaiian Sunset',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Orange • Strawberry',flavors:['Pineapple','Orange','Strawberry']},
  {id:'mango-tango',name:'Mango Tango',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Mango • Peach • Orange',flavors:['Mango','Peach','Orange']},
  {id:'sunshine',name:'Sunshine',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Orange • Pineapple • Mango',flavors:['Orange','Pineapple','Mango']},
  {id:'pina-colada',name:'Pina Colada',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Cream',flavors:['Pineapple','Cream']},
  {id:'island-breeze',name:'Island Breeze',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Mango • Peach',flavors:['Pineapple','Mango','Peach']},
  {id:'paradise-punch',name:'Paradise Punch',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Peach • Orange',flavors:['Pineapple','Peach','Orange']},
  {id:'golden-hour',name:'Golden Hour',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Mango • Pineapple',flavors:['Mango','Pineapple']},
  {id:'bahama-breeze',name:'Bahama Breeze',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Pineapple • Peach',flavors:['Pineapple','Peach']},
  {id:'margarita',name:'Margarita',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Lime • Lemon • Orange',flavors:['Lime','Lemon','Orange'],badge:'NEW!'},
  {id:'cantaloupe-crush',name:'Cantaloupe Crush',type:'tea',category:'Tropical Flavors',accent:'tropical',desc:'Cantaloupe • Pineapple',flavors:['Cantaloupe','Pineapple'],badge:'NEW!'},

  {id:'southern-sunset',name:'Southern Sunset',type:'tea',category:'Signature Blends',accent:'signature',desc:'Peach • Orange • Strawberry',flavors:['Peach','Orange','Strawberry']},
  {id:'just-peachy',name:'Just Peachy',type:'tea',category:'Signature Blends',accent:'signature',desc:'Peach • Strawberry',flavors:['Peach','Strawberry']},
  {id:'apple-orchard',name:'Apple Orchard',type:'tea',category:'Signature Blends',accent:'signature',desc:'Apple (Warhead Sour) • Caramel',flavors:['Apple (Warhead Sour)','Caramel']},
  {id:'bombshell',name:'Bombshell',type:'tea',category:'Signature Blends',accent:'signature',desc:'Strawberry • Blue Blast • Blueberry',flavors:['Strawberry','Blue Blast','Blueberry']},
  {id:'lucky-charm',name:'Lucky Charm',type:'tea',category:'Signature Blends',accent:'signature',desc:'Strawberry • Blue Blast',flavors:['Strawberry','Blue Blast']},
  {id:'very-berry',name:'Very Berry',type:'tea',category:'Signature Blends',accent:'signature',desc:'Blue Blast • Strawberry',flavors:['Blue Blast','Strawberry']},
  {id:'tutti-frutti',name:'Tutti Frutti',type:'tea',category:'Signature Blends',accent:'signature',desc:'Pineapple • Peach • Strawberry',flavors:['Pineapple','Peach','Strawberry']},
  {id:'beach-day',name:'Beach Day',type:'tea',category:'Signature Blends',accent:'signature',desc:'Peach • Mango • Blue Blast',flavors:['Peach','Mango','Blue Blast']},

  {id:'blue-dream',name:'Blue Dream',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast',flavors:['Blue Blast']},
  {id:'ocean-breeze',name:'Ocean Breeze',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Pineapple',flavors:['Blue Blast','Pineapple']},
  {id:'electric-blue',name:'Electric Blue',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Lemon',flavors:['Blue Blast','Lemon']},
  {id:'bahama-blue',name:'Bahama Blue',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Peach',flavors:['Blue Blast','Peach']},
  {id:'shark-attack',name:'Shark Attack',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Strawberry',flavors:['Blue Blast','Strawberry']},
  {id:'blue-razz',name:'Blue Razz',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Raspberry',flavors:['Blue Blast','Raspberry']},
  {id:'cotton-candy',name:'Cotton Candy',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Grape',flavors:['Blue Blast','Grape']},
  {id:'bubble-berry',name:'Bubble Berry',type:'tea',category:'Bold & Blue',accent:'blue',desc:'Blue Blast • Grape',flavors:['Blue Blast','Grape']},

  {id:'beth-love',name:'Beth Love',type:'tea',category:'Coming Soon',accent:'coming',desc:'Peach • Mango • Rainbow Candy',flavors:['Peach','Mango','Rainbow Candy'],comingSoon:true},
  {id:'iced-protein-coffee',name:'Iced Protein Coffee',type:'coffee',category:'Coffee Menu',accent:'coffee',image:'assets/iced-protein-coffee.png',desc:'Choose Caramel, Mocha, or House Blend.',coffee:true}
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderMenu(filter='all'){
  const items=filter==='all'?menu:menu.filter(x=>x.type===filter);
  const order=['Make It Yours','Fruity Favorites','Tropical Flavors','Bold & Blue','Sour & Warheads','Signature Blends','Coming Soon','Coffee Menu'];
  const groups=order.map(category=>({category,items:items.filter(x=>x.category===category)})).filter(g=>g.items.length);
  const grid=$('#menuGrid'); if(!grid)return;
  grid.innerHTML=groups.map(group=>`<section class="menu-category menu-category-${group.items[0]?.accent||'default'}">
    <div class="menu-category-heading"><span class="menu-brush">${esc(group.category)}</span>${group.category==='Sour & Warheads'?'<small>Sour favorites + combos</small>':''}${group.category==='Coffee Menu'?'<small>Bold flavor • smooth energy • made for you</small>':''}</div>
    <div class="menu-category-grid">${group.items.map(x=>`<article class="menu-card menu-list-card ${x.comingSoon?'coming-soon-card':''}">
      ${x.image?`<div class="drink-art photo compact-photo"><img src="${esc(x.image)}" alt="${esc(x.name)}"></div>`:''}
      <div class="menu-body"><div class="menu-name-line"><h3>${esc(x.name)}</h3>${x.badge?`<span class="new-badge">${esc(x.badge)}</span>`:''}</div><p>${esc(x.desc)}</p>
      ${x.comingSoon?'<div class="coming-soon-pill">Coming soon</div>':'<div class="menu-contact-note">Call or text for delivery</div>'}
      </div></article>`).join('')}</div></section>`).join('');
}

async function loadGallery(){
  const track=$('#galleryTrack'), empty=$('#galleryEmpty'); if(!track)return;
  try{
    const r=await fetch(`/api/gallery-live?t=${Date.now()}`,{cache:'no-store',headers:{'Accept':'application/json'}});
    if(!r.ok) throw new Error(`Gallery ${r.status}`);
    const data=await r.json(); const photos=Array.isArray(data.photos)?data.photos:[];
    if(!photos.length){ if(empty)empty.classList.remove('hidden'); return; }
    track.replaceChildren(...photos.map(p=>{
      const fig=document.createElement('figure'); fig.className='gallery-slide';
      const img=document.createElement('img'); img.src=`${p.imageUrl}?v=${encodeURIComponent(p.id)}`; img.alt=p.caption||'Southern Nutrition photo'; img.loading='eager';
      fig.appendChild(img);
      if(p.caption){const cap=document.createElement('figcaption');cap.textContent=p.caption;fig.appendChild(cap);}
      return fig;
    }));
    if(empty)empty.classList.add('hidden');
    let timer=setInterval(()=>{if(track.scrollWidth<=track.clientWidth+10)return;const nearEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-20;track.scrollTo({left:nearEnd?0:track.scrollLeft+track.clientWidth,behavior:'smooth'});},4200);
    ['pointerdown','touchstart'].forEach(evt=>track.addEventListener(evt,()=>clearInterval(timer),{once:true,passive:true}));
  }catch(err){ console.error('Gallery load failed',err); if(empty)empty.classList.remove('hidden'); }
}

$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMenu(b.dataset.filter);}));
const year=$('#year'); if(year)year.textContent=new Date().getFullYear();
renderMenu(); loadGallery();
