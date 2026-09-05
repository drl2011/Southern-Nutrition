// Keep mobile refreshes from restoring/creeping to an old scroll position.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const resetRefreshScroll = () => {
  if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};
resetRefreshScroll();
window.addEventListener('load', () => {
  resetRefreshScroll();
  requestAnimationFrame(() => requestAnimationFrame(resetRefreshScroll));
}, { once: true });

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

const flavorOptions = ['Strawberry','Peach','Mango','Blueberry','Watermelon','Cherry','Blue Blast','Grape','Lime','Pineapple','Orange','Cream','Lemon','Cantaloupe','Raspberry','Green Apple (Warhead Sour)','Blue Blast (Warhead Sour)','Cherry (Warhead Sour)','Watermelon (Warhead Sour)','Grape (Warhead Sour)','Sour Watermelon','Sour Blue Blast','Sour Apple','Sour Cherry','Apple (Warhead Sour)','Caramel','Rainbow Candy'];
const addons = [
  {id:'fiber',name:'Add Fiber',price:3.50},
  {id:'collagen',name:'Add Collagen',price:3.50},
  {id:'aloe',name:'Extra Aloe',price:1.00},
  {id:'liftoff',name:'Add Extra Liftoff',price:4.00,caffeine:true}
];

const CART_KEY='sn_cart_v8';
function loadCart(){try{const raw=JSON.parse(localStorage.getItem(CART_KEY)||localStorage.getItem('sn_cart_v2')||'[]');return Array.isArray(raw)?raw.filter(ci=>menu.some(m=>m.id===ci.id)):[];}catch{return []}}
let cart = loadCart();
let squareCard = null;
let squareEnvironment = 'sandbox';

const BUSINESS_TIME_ZONE = 'America/Chicago';
const BUSINESS_OPEN_HOUR = 6;
const BUSINESS_CLOSE_HOUR = 18;

function businessNowParts(){
  const parts = new Intl.DateTimeFormat('en-US',{
    timeZone: BUSINESS_TIME_ZONE,
    year:'numeric',
    month:'2-digit',
    day:'2-digit',
    hour:'2-digit',
    minute:'2-digit',
    hourCycle:'h23'
  }).formatToParts(new Date());
  const v = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return {
    year:Number(v.year), month:Number(v.month), day:Number(v.day),
    hour:Number(v.hour), minute:Number(v.minute)
  };
}
function parseRequestedTime(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if(!m) return null;
  return {year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5]};
}
function minuteStamp(p){
  return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)/60000;
}
function validateRequestedTime(value){
  const requested=parseRequestedTime(value);
  if(!requested) return 'Choose an available delivery window.';
  const now=businessNowParts();
  if(minuteStamp(requested)<=minuteStamp(now))
    return 'Choose a delivery window in the future.';
  const minutes=requested.hour*60+requested.minute;
  if(minutes<BUSINESS_OPEN_HOUR*60 || minutes>=BUSINESS_CLOSE_HOUR*60)
    return 'Choose an available delivery window between 6:00 AM and 6:00 PM Central.';
  return '';
}
function centralDateString(){
  const n=businessNowParts();
  const pad=x=>String(x).padStart(2,'0');
  return `${n.year}-${pad(n.month)}-${pad(n.day)}`;
}
async function loadDeliverySlots(){
  const date=$('#deliveryDate')?.value;
  const select=$('#deliverySlot');
  if(!select) return;
  $('#orderTime').value='';
  if(!date){
    select.innerHTML='<option value="">Choose a delivery date first</option>';
    return;
  }
  select.disabled=true;
  select.innerHTML='<option value="">Checking availability…</option>';
  try{
    const r=await fetch(`/api/delivery-slots?date=${encodeURIComponent(date)}`,{cache:'no-store'});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||'Unable to load delivery windows.');
    const available=(data.slots||[]).filter(s=>s.available);
    select.innerHTML=available.length
      ? available.map((s,i)=>`<option value="${s.start}"${i===0?' selected':''}>${i===0?'Next available — ':''}${s.label}</option>`).join('')
      : '<option value="">No delivery windows available</option>';
    $('#orderTime').value=available.length?available[0].start:'';
  }catch(e){
    select.innerHTML='<option value="">Unable to load delivery windows</option>';
  }finally{
    select.disabled=false;
  }
}
function setupDeliverySlots(){
  const date=$('#deliveryDate');
  const slot=$('#deliverySlot');
  if(!date||!slot) return;
  date.min=centralDateString();
  if(!date.value) date.value=centralDateString();
  date.addEventListener('change',loadDeliverySlots);
  slot.addEventListener('change',()=>{$('#orderTime').value=slot.value;});
  loadDeliverySlots();
}

let customizing = null;
let authMode = 'login';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `$${Number(n).toFixed(2)}`;

function baseSizePrice(size){return size==='jumbo'?12:10}
function linePrice(ci){return ci.unitPrice ?? baseSizePrice(ci.size)}
function drinkCount(){ return cart.reduce((s,ci)=>s+ci.qty,0); }
function rawSubtotal(){ return cart.reduce((s,ci)=>s+linePrice(ci)*ci.qty,0); }
function groupDiscount(){ return drinkCount()>=10 ? drinkCount() : 0; }
function subtotal(){ return Math.max(0, rawSubtotal()-groupDiscount()); }
let selectedTipCents = 0;
function tipAmount(){ return selectedTipCents/100; }
function orderTotal(){ return subtotal()+tipAmount(); }
function itemKey(ci){return `${ci.id}|${ci.size||'regular'}|${(ci.flavors||[]).join(',')}|${(ci.addons||[]).map(a=>a.id).sort().join(',')}`}

function renderMenu(filter='all'){
  const items = filter==='all' ? menu : menu.filter(x=>x.type===filter);
  const order=['Make It Yours','Fruity Favorites','Tropical Flavors','Bold & Blue','Sour & Warheads','Signature Blends','Coming Soon','Coffee Menu'];
  const groups=order.map(category=>({category,items:items.filter(x=>x.category===category)})).filter(g=>g.items.length);
  $('#menuGrid').innerHTML = groups.map(group=>`<section class="menu-category menu-category-${group.items[0]?.accent||'default'}">
    <div class="menu-category-heading"><span class="menu-brush">${group.category}</span>${group.category==='Sour & Warheads'?'<small>Sour favorites + combos</small>':''}${group.category==='Coffee Menu'?'<small>Bold flavor • smooth energy • made for you</small>':''}</div>
    <div class="menu-category-grid">${group.items.map(x=>`<article class="menu-card menu-list-card ${x.comingSoon?'coming-soon-card':''}">
      ${x.image?`<div class="drink-art photo compact-photo"><img src="${x.image}" alt="${x.name}"></div>`:''}
      <div class="menu-body"><div class="menu-name-line"><h3>${x.name}</h3>${x.badge?`<span class="new-badge">${x.badge}</span>`:''}</div><p>${x.desc}</p>
      ${x.comingSoon?'<div class="coming-soon-pill">Coming soon</div>':`<div class="price-row"><span class="price">32 oz $10 • 40 oz $12</span><button class="add-btn" data-id="${x.id}">Customize</button></div>`}
      </div></article>`).join('')}</div>
  </section>`).join('');
  $$('.add-btn').forEach(b=>b.onclick=()=>startAdd(b.dataset.id));
}

function startAdd(id){
  const item=menu.find(x=>x.id===id); if(!item)return;
  customizing={id:item.id,size:'regular',flavors:[...(item.flavors||[])],addons:[]};
  if(item.coffee){ customizing.flavors=[]; customizing.addons=[]; }
  $('#customizeType').textContent=item.coffee?'Iced Protein Coffee':item.custom?'Build Your Own':'Loaded Tea';
  $('#customizeName').textContent=item.name;
  $('#customizeDesc').textContent=item.coffee?'Choose one coffee flavor. Whipped cream is +$1.':item.custom?'Choose any 2 flavors included. Add more flavors for $1 each.':item.desc;
  $('#flavorHelp').textContent=item.coffee?'Choose one: Caramel, Mocha, or House Blend.':item.custom?'Choose up to 2 included flavors. Each additional flavor is +$1.':'Your recipe flavors are preselected and included. Extra flavors beyond the recipe are +$1 each.';
  renderCustomizer();
  $$('#sizeChoices .size-choice').forEach(b=>b.classList.toggle('active',b.dataset.size==='regular'));
  $('#customizeDialog').showModal();
}

function renderCustomizer(){
  const item=menu.find(x=>x.id===customizing.id);
  const enhanceHeading=$('#enhanceHeading');
  if(enhanceHeading) enhanceHeading.textContent=item?.coffee?'Enhance your coffee':'Enhance your tea';
  if(item?.coffee){
    const coffeeFlavors=['Caramel','Mocha','House Blend'];
    $('#flavorChoices').innerHTML=coffeeFlavors.map(f=>`<button type="button" class="choice-chip coffee-choice ${customizing.flavors[0]===f?'selected':''}" data-coffee="${f}"><span>${f}</span></button>`).join('');
    $$('#flavorChoices .coffee-choice').forEach(b=>b.onclick=()=>{
      customizing.flavors=[b.dataset.coffee];
      $$('#flavorChoices .coffee-choice').forEach(x=>x.classList.toggle('selected',x===b));
      updateCustomizerPrice();
    });
    const checked=customizing.addons.some(x=>x.id==='whipped-cream');
    $('#addonChoices').innerHTML=`<label class="addon-row ${checked?'selected':''}"><input type="checkbox" value="whipped-cream" ${checked?'checked':''}><span><strong>Add Whipped Cream</strong></span><b>+$1.00</b></label>`;
    $$('#addonChoices input').forEach(i=>i.onchange=()=>{
      customizing.addons=i.checked?[{id:'whipped-cream',name:'Add Whipped Cream',price:1}]:[];
      i.closest('.addon-row')?.classList.toggle('selected',i.checked);
      updateCustomizerPrice();
    });
    updateCustomizerPrice(); return;
  }
  const selected=new Set(customizing.flavors);
  $('#flavorChoices').innerHTML=flavorOptions.map(f=>`<label class="choice-chip ${selected.has(f)?'selected':''}"><input type="checkbox" value="${f}" ${selected.has(f)?'checked':''}><span>${f}</span></label>`).join('');
  $$('#flavorChoices input').forEach(i=>i.onchange=()=>{ if(i.checked && !customizing.flavors.includes(i.value)) customizing.flavors.push(i.value); if(!i.checked) customizing.flavors=customizing.flavors.filter(f=>f!==i.value); renderCustomizer(); });
  $('#addonChoices').innerHTML=addons.map(a=>{const checked=customizing.addons.some(x=>x.id===a.id);return `<label class="addon-row ${checked?'selected':''}"><input type="checkbox" value="${a.id}" ${checked?'checked':''}><span><strong>${a.name}</strong>${a.caffeine?'<small> Adds additional caffeine</small>':''}</span><b>+${money(a.price)}</b></label>`}).join('');
  $$('#addonChoices input').forEach(i=>i.onchange=()=>{const a=addons.find(x=>x.id===i.value); customizing.addons=i.checked?[...customizing.addons.filter(x=>x.id!==a.id),a]:customizing.addons.filter(x=>x.id!==a.id); updateCustomizerPrice(); $(`.addon-row input[value="${i.value}"]`)?.closest('.addon-row')?.classList.toggle('selected',i.checked);});
  updateCustomizerPrice();
}

function includedFlavorCount(item){return item?.custom?2:Math.max(2,(item?.flavors||[]).length)}
function currentCustomPrice(){const item=menu.find(x=>x.id===customizing.id);const flavorExtras=item?.coffee?0:Math.max(0,customizing.flavors.length-includedFlavorCount(item));return baseSizePrice(customizing.size)+flavorExtras+customizing.addons.reduce((s,a)=>s+a.price,0)}
function updateCustomizerPrice(){
  const item=menu.find(x=>x.id===customizing.id);
  const included=includedFlavorCount(item);
  const flavorExtras=item?.coffee?0:Math.max(0,customizing.flavors.length-included);
  $('#flavorCharge').textContent=item?.coffee?'Choose 1':flavorExtras?`+${money(flavorExtras)}`:`${included} included`;
  $('#customizeTotal').textContent=money(currentCustomPrice());
  const extra=customizing.addons.some(a=>a.id==='liftoff');
  if(item?.coffee){ $('#caffeineNotice').classList.remove('strong'); $('#caffeineNotice').querySelector('span').textContent='Choose your coffee flavor and optional whipped cream.'; return; }
  $('#caffeineNotice').classList.toggle('strong',extra);
  $('#caffeineNotice').querySelector('span').textContent=extra?'This drink includes Extra Liftoff and therefore additional caffeine.':'Loaded teas contain caffeine. Extra Liftoff adds additional caffeine.';
}

function addCustomized(){
  const item=menu.find(x=>x.id===customizing.id);
  if(item.custom && customizing.flavors.length===0){alert('Choose at least one flavor for your custom tea.');return;}
  if(item.coffee && customizing.flavors.length!==1){alert('Choose Caramel, Mocha, or House Blend.');return;}
  const ci={id:item.id,qty:1,size:customizing.size,flavors:[...customizing.flavors],addons:customizing.addons.map(a=>({id:a.id,name:a.name,price:a.price})),unitPrice:currentCustomPrice()};
  const key=itemKey(ci), found=cart.find(x=>itemKey(x)===key); if(found)found.qty++; else cart.push(ci);
  saveCart(); $('#customizeDialog').close(); showAddedToast();
}
function addSimpleToCart(item){const ci={id:item.id,qty:1,size:'regular',flavors:[],addons:[],unitPrice:10};const found=cart.find(x=>itemKey(x)===itemKey(ci));if(found)found.qty++;else cart.push(ci);saveCart();showAddedToast();}

function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart();}
function cartDetails(ci){const parts=[ci.size==='jumbo'?'Jumbo 40 oz':'Regular 32 oz'];if(ci.flavors?.length)parts.push(ci.flavors.join(' + '));if(ci.addons?.length)parts.push(ci.addons.map(a=>a.name.replace('Add ','')).join(', '));return parts.join(' • ')}
function renderCart(){
  const count=drinkCount();
  $('#cartCount').textContent=count;
  const mobileBar=$('#mobileCartBar');
  if(mobileBar){mobileBar.classList.toggle('hidden',count===0);$('#mobileCartText').textContent=`${count} drink${count===1?'':'s'} • ${money(subtotal())}`;}
  if(!cart.length){$('#cartItems').innerHTML='<p class="form-note">Your cart is empty.</p>';$('#cartSubtotal').textContent='$0.00';$('#groupDiscountNotice').innerHTML='<strong>Office & Group Savings</strong><span>Add 10 drinks to save $1 on every drink.</span>';return;}
  $('#cartItems').innerHTML=cart.map((ci,idx)=>{const m=menu.find(x=>x.id===ci.id);return `<div class="cart-item"><div><strong>${m.name}</strong>${cartDetails(ci)?`<div class="cart-detail">${cartDetails(ci)}</div>`:''}<div class="form-note">${money(linePrice(ci))} each</div></div><div class="qty"><button data-act="minus" data-index="${idx}">−</button><span>${ci.qty}</span><button data-act="plus" data-index="${idx}">+</button></div></div>`}).join('');
  $$('#cartItems button').forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.index),b.dataset.act));
  const discount=groupDiscount();
  $('#cartSubtotal').textContent=money(subtotal());
  $('#groupDiscountNotice').innerHTML=count>=10
    ? `<strong>🎉 Group Discount Applied</strong><span>${count} drinks — you saved ${money(discount)} ($1 off each drink).</span>`
    : `<strong>Office & Group Savings</strong><span>Add ${10-count} more drink${10-count===1?'':'s'} to save $1 on every drink.</span>`;
}
function changeQty(index,act){cart[index].qty+=act==='plus'?1:-1;cart=cart.filter(i=>i.qty>0);saveCart();}
function openCart(){$('#cartDrawer').classList.add('open');$('#scrim').classList.add('show');$('#cartDrawer').setAttribute('aria-hidden','false');}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#scrim').classList.remove('show');$('#cartDrawer').setAttribute('aria-hidden','true');}
let toastTimer; function showAddedToast(){const t=$('#addedToast');if(!t)return;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800);}

let currentUser = null;
function renderAccountState(){
  const acct=currentUser;
  $('#accountBtn').textContent=acct?`Hi, ${acct.name}`:'Log in';
  if(acct){
    $('#profileName').textContent=`Hi, ${acct.name}`;
    $('#profileContact').textContent=[acct.phone,acct.email].filter(Boolean).join(' • ');
    $('#customerName').value=String(acct.name||'').trim();
    $('#customerLastName').value=String(acct.lastName||'').trim();
    $('#customerPhone').value=acct.phone;$('#customerEmail').value=acct.email||'';
    if(acct.address&&!$('#deliveryStreet').value.trim())fillSavedAddress(acct.address);
  }
}

function getDeliveryAddressFromForm(){
  return {
    street:$('#deliveryStreet').value.trim(),
    unit:$('#deliveryUnit').value.trim(),
    city:$('#deliveryCity').value.trim(),
    state:$('#deliveryState').value.trim().toUpperCase(),
    zip:$('#deliveryZip').value.trim(),
    workplace:$('#workplaceName').value.trim(),
    instructions:$('#deliveryInstructions').value.trim()
  };
}
function fillSavedAddress(address){
  if(!address) return;
  $('#deliveryStreet').value=address.street||'';
  $('#deliveryUnit').value=address.unit||'';
  $('#deliveryCity').value=address.city||'';
  $('#deliveryState').value=address.state||'AL';
  $('#deliveryZip').value=address.zip||'';
  $('#workplaceName').value=address.workplace||'';
  $('#deliveryInstructions').value=address.instructions||'';
}
async function saveCurrentAddress(){
  if(!currentUser) return true;
  try{
    const r=await fetch('/api/account/address',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      credentials:'same-origin',
      body:JSON.stringify(getDeliveryAddressFromForm())
    });
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||'Unable to save delivery address.');
    currentUser.address=data.address;
    return true;
  }catch(e){
    console.warn('Address save failed',e);
    return false;
  }
}

async function refreshSession(){
  try{const r=await fetch('/api/auth/me',{cache:'no-store',credentials:'same-origin'});const data=await r.json();currentUser=data.authenticated?data.user:null;}catch{currentUser=null;}renderAccountState();
}
function openAccount(mode='login'){
  if(currentUser){$('#accountAuthView').classList.add('hidden');$('#accountProfileView').classList.remove('hidden');renderAccountState();}
  else{$('#accountAuthView').classList.remove('hidden');$('#accountProfileView').classList.add('hidden');setAuthMode(mode);}
  $('#accountDialog').showModal();
}
function setAuthMode(mode){authMode=mode;$$('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const signup=mode==='signup';$('#nameField').classList.toggle('hidden',!signup);$('#lastNameField').classList.toggle('hidden',!signup);$('#emailField').classList.toggle('hidden',!signup);$('#accountEmail').required=signup;$('#accountTitle').textContent=signup?'Create your account':'Log in';$('#accountSubmit').textContent=signup?'Create account':'Log in';$('#accountPassword').autocomplete=signup?'new-password':'current-password';$('#accountMessage').textContent='';}
$('#accountForm').onsubmit=async e=>{
  e.preventDefault(); const phone=$('#accountPhone').value.trim(),password=$('#accountPassword').value,name=$('#accountName').value.trim(),lastName=$('#accountLastName').value.trim(),email=$('#accountEmail').value.trim();
  if(authMode==='signup'&&password.length<8){$('#accountMessage').textContent='Password must be at least 8 characters.';return;}
  const btn=$('#accountSubmit');btn.disabled=true;btn.textContent=authMode==='signup'?'Creating…':'Logging in…';$('#accountMessage').textContent='';
  try{
    const endpoint=authMode==='signup'?'/api/auth/signup':'/api/auth/login';
    const payload=authMode==='signup'?{name,lastName,phone,email,password}:{phone,password};
    const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});const data=await r.json();
    if(!r.ok)throw new Error(data.error||'Account request failed.'); currentUser=data.user; renderAccountState(); $('#accountDialog').close();
  }catch(err){$('#accountMessage').textContent=err.message;}finally{btn.disabled=false;btn.textContent=authMode==='signup'?'Create account':'Log in';}
};
async function logout(){try{await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'});}finally{currentUser=null;renderAccountState();$('#accountDialog').close();}}

async function initSquare(){
  try {
    const r=await fetch('/api/config',{cache:'no-store'});
    const cfg=await r.json();
    squareEnvironment=cfg.environment;
    const modeNote=$('#paymentModeNote');
    if(modeNote) modeNote.textContent=cfg.environment==='production'
      ? 'Payments are processed securely by Square.'
      : 'Test payment mode is currently enabled.';
    if(!cfg.configured){
      $('#squareStatus').textContent='Square payment connection still needs to be configured in Cloudflare.';
      return;
    }
    if(cfg.environment==='production'&&location.hostname!=='localhost'){
      const old=[...document.scripts].find(s=>s.src.includes('squarecdn.com/v1/square.js'));
      if(old?.src.includes('sandbox.')) await loadScript('https://web.squarecdn.com/v1/square.js');
    }
    if(!window.Square) throw new Error('Square Web Payments SDK did not load.');
    const payments=window.Square.payments(cfg.applicationId,cfg.locationId);
    squareCard=await payments.card();
    await squareCard.attach('#card-container');
    $('#payButton').disabled=paymentMethod==='card'?false:false;
    $('#squareStatus').textContent=cfg.environment==='production'
      ? 'Secure Square checkout'
      : 'Square test checkout connected';
  }catch(e){
    $('#squareStatus').textContent=`Square setup error: ${e.message}`;
  }
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
function checkoutSummary(){
  const lines=cart.map(ci=>{const m=menu.find(x=>x.id===ci.id);return `<div class="checkout-item"><div><span>${ci.qty} × ${m.name}</span>${cartDetails(ci)?`<small>${cartDetails(ci)}</small>`:''}</div><strong>${money(linePrice(ci)*ci.qty)}</strong></div>`}).join('');
  const discount=groupDiscount();
  return lines+
    (discount?`<div class="checkout-line savings-line"><span>10+ drink discount</span><strong>−${money(discount)}</strong></div>`:'')+
    `<div class="checkout-line"><span>Drink subtotal</span><strong>${money(subtotal())}</strong></div>`+
    `<div class="checkout-line tip-summary"><span>Tip</span><strong>${money(tipAmount())}</strong></div>`+
    `<div class="checkout-line checkout-total"><span>Total</span><strong>${money(orderTotal())}</strong></div>`;
}
let squarePreview=null;
let paymentMethod='card';
function checkoutSummaryWithTax(){
  if(!squarePreview)return checkoutSummary();
  const base=checkoutSummary().replace(
    `<div class="checkout-line tip-summary"><span>Tip</span><strong>${money(tipAmount())}</strong></div><div class="checkout-line checkout-total"><span>Total</span><strong>${money(orderTotal())}</strong></div>`,
    `<div class="checkout-line"><span>Sales tax</span><strong>${money((squarePreview.tax||0)/100)}</strong></div><div class="checkout-line tip-summary"><span>Tip</span><strong>${money(tipAmount())}</strong></div><div class="checkout-line checkout-total"><span>Total</span><strong>${money(((squarePreview.subtotalBeforeTip||0)+tipAmount())/100)}</strong></div>`
  );
  return base;
}
function setPaymentMethod(method){
  paymentMethod=method==='cash'?'cash':'card';
  $$('.payment-method').forEach(b=>b.classList.toggle('active',b.dataset.payment===paymentMethod));
  $('#card-container').classList.toggle('hidden',paymentMethod==='cash');
  $('#squareStatus').classList.toggle('hidden',paymentMethod==='cash');
  const btn=$('#payButton');
  if(paymentMethod==='cash'){
    btn.disabled=false;
    btn.textContent='Place cash order';
    $('#paymentModeNote').textContent='Cash is due when your order is delivered.';
  }else{
    btn.disabled=!squareCard;
    btn.textContent='Pay securely';
    $('#paymentModeNote').textContent=squareEnvironment==='production'?'Payments are processed securely by Square.':'Test payment mode is currently enabled.';
  }
}
function setDeliveryStatus(message,state=''){
  const el=$('#deliveryAreaStatus'); if(!el)return;
  el.textContent=message; el.className='delivery-area-status '+state;
}
async function confirmDeliveryArea(showErrors=false){
  const a=getDeliveryAddressFromForm();
  if(!a.street||!a.city||!a.state||!a.zip){
    setDeliveryStatus('Enter your full delivery address to confirm the 25-mile delivery area.');
    return null;
  }
  setDeliveryStatus('Checking delivery area…','checking');
  try{
    const result=await checkDeliveryArea();
    setDeliveryStatus(`✓ Delivery available — ${result.miles.toFixed(1)} miles from 35660.`,'success');
    return result;
  }catch(e){
    setDeliveryStatus(e.message,'error');
    if(showErrors) alert(e.message);
    return null;
  }
}
async function checkDeliveryArea(){
  const response=await fetch('/api/delivery-check',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({deliveryAddress:getDeliveryAddressFromForm()})
  });
  const result=await response.json();
  if(!response.ok) throw new Error(result.error||'That address is outside our delivery area.');
  return result;
}
async function refreshSquarePreview(){
  try{
    const response=await fetch('/api/order-preview',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      cart,deliveryAddress:getDeliveryAddressFromForm(),requestedTime:$('#orderTime').value,
      notes:$('#orderNotes').value.trim(),customer:{name:$('#customerName').value.trim(),lastName:$('#customerLastName').value.trim(),phone:$('#customerPhone').value.trim(),email:$('#customerEmail').value.trim()},
      tipCents:selectedTipCents
    })});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'Unable to calculate tax.');
    squarePreview=result;
    $('#checkoutOrder').innerHTML=checkoutSummaryWithTax();
    return true;
  }catch(e){
    squarePreview=null;
    $('#paymentMessage').textContent=e.message;
    return false;
  }
}
function setTipCents(cents){
  selectedTipCents=Math.max(0,Math.round(Number(cents)||0));
  $$('.tip-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.percent)>=0 && Math.round(subtotal()*Number(b.dataset.percent))===selectedTipCents));
  $('#checkoutOrder').innerHTML=checkoutSummary(); refreshSquarePreview();
}
function selectTipPercent(percent){
  $('#customTip').value='';
  setTipCents(Math.round(subtotal()*Number(percent)));
}
function bindTipControls(){
  $$('.tip-btn').forEach(b=>b.onclick=()=>selectTipPercent(Number(b.dataset.percent)));
  $('#customTip').oninput=e=>{ $$('.tip-btn').forEach(b=>b.classList.remove('active')); setTipCents(Math.round(Math.max(0,Number(e.target.value)||0)*100)); };
}

$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMenu(b.dataset.filter);});
$('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#scrim').onclick=closeCart;
$('#customizeClose').onclick=()=>$('#customizeDialog').close();$('#addCustomized').onclick=addCustomized;
$$('#sizeChoices .size-choice').forEach(b=>b.onclick=()=>{if(!customizing)return;customizing.size=b.dataset.size;$$('#sizeChoices .size-choice').forEach(x=>x.classList.toggle('active',x===b));updateCustomizerPrice();});
$('#mobileCartBar').onclick=openCart;
$('#accountBtn').onclick=()=>openAccount();$('#accountClose').onclick=()=>$('#accountDialog').close();$$('.auth-tab').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.mode));$('#logoutBtn').onclick=logout;

$('#placeOrder').onclick=async()=>{
  if(!cart.length)return alert('Add at least one drink first.');
  try{
    const availabilityResponse=await fetch('/api/delivery-availability',{cache:'no-store'});
    const availability=await availabilityResponse.json();
    if(availability.available===false)return alert('Delivery unavailable — please call us at 205-549-2444.');
  }catch(e){}

  const required=[['#deliveryStreet','street address'],['#deliveryCity','city'],['#deliveryState','state'],['#deliveryZip','ZIP code']];
  for(const [sel,label] of required){if(!$(sel).value.trim())return alert(`Enter your ${label}.`);}
  const timeError=validateRequestedTime($('#orderTime').value);
  if(timeError)return alert(timeError);

  const placeBtn=$('#placeOrder');
  const originalText=placeBtn.textContent;
  placeBtn.disabled=true;
  placeBtn.textContent='Checking delivery area…';
  try{
    const delivery=await confirmDeliveryArea(true);
    if(!delivery)return;
    if(currentUser)await saveCurrentAddress();
    selectedTipCents=0;
    squarePreview=null;
    $('#customTip').value='';
    $$('.tip-btn').forEach(b=>b.classList.remove('active'));
    $('#checkoutOrder').innerHTML=checkoutSummary();
    renderAccountState();
    closeCart();
    $('#checkoutDialog').showModal();
    setPaymentMethod('card');
    $('#paymentMessage').textContent=`Delivery address verified — ${delivery.miles.toFixed(1)} miles from 35660. Calculating sales tax…`;
    const ok=await refreshSquarePreview();
    if(ok)$('#paymentMessage').textContent=`Delivery address verified — ${delivery.miles.toFixed(1)} miles from 35660.`;
  }catch(e){
    alert(e.message);
  }finally{
    placeBtn.disabled=false;
    placeBtn.textContent=originalText;
  }
};
$('#checkoutClose').onclick=()=>$('#checkoutDialog').close();
$$('.payment-method').forEach(b=>b.onclick=()=>setPaymentMethod(b.dataset.payment));

$('#payButton').onclick=async()=>{
  const timeError=validateRequestedTime($('#orderTime').value);
  if(timeError){$('#paymentMessage').textContent=timeError;return;}
  const name=$('#customerName').value.trim(),lastName=$('#customerLastName').value.trim(),phone=$('#customerPhone').value.trim(),email=$('#customerEmail').value.trim();
  if(!name||!lastName||!phone){$('#paymentMessage').textContent='Enter your first name, last name, and phone number.';return;}
  if(paymentMethod==='card'&&!squareCard){$('#paymentMessage').textContent='Square is not configured yet.';return;}
  const btn=$('#payButton');
  btn.disabled=true;btn.textContent=paymentMethod==='cash'?'Placing order…':'Processing…';$('#paymentMessage').textContent='';
  try{
    const previewOk=await refreshSquarePreview();
    if(!previewOk)throw new Error('Could not confirm delivery area and sales tax. Please try again.');
    const common={cart,fulfillment:'delivery',deliveryAddress:getDeliveryAddressFromForm(),requestedTime:$('#orderTime').value,notes:$('#orderNotes').value.trim(),customer:{name,lastName,phone,email},tipCents:selectedTipCents};
    let response;
    if(paymentMethod==='cash'){
      response=await fetch('/api/cash-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(common)});
    }else{
      const tokenResult=await squareCard.tokenize();
      if(tokenResult.status!=='OK')throw new Error(tokenResult.errors?.[0]?.message||'Card information could not be tokenized.');
      response=await fetch('/api/payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sourceId:tokenResult.token,...common})});
    }
    const result=await response.json();
    if(!response.ok){if(response.status===409)loadDeliverySlots();throw new Error(result.error||(paymentMethod==='cash'?'Order could not be placed.':'Payment failed.'));}
    cart=[];selectedTipCents=0;saveCart();$('#checkoutDialog').close();
    $('#successMessage').innerHTML=paymentMethod==='cash'
      ? `Order placed for <strong>${money(result.amount/100)}</strong>.<br><strong>Cash is due at delivery.</strong>`
      : `Payment ${squareEnvironment==='sandbox'?'test ':''}completed for <strong>${money(result.amount/100)}</strong>.${result.receiptUrl?`<br><a href="${result.receiptUrl}" target="_blank" rel="noopener">View Square receipt</a>`:''}`;
    $('#successDialog').showModal();
  }catch(e){$('#paymentMessage').textContent=e.message;}
  finally{
    btn.disabled=paymentMethod==='card'?!squareCard:false;
    btn.textContent=paymentMethod==='cash'?'Place cash order':'Pay securely';
  }
};
$('#successClose').onclick=()=>$('#successDialog').close();$('#successDone').onclick=()=>$('#successDialog').close();
$('#year').textContent=new Date().getFullYear();

async function loadGallery(){
  const section=$('#gallerySection'), track=$('#galleryTrack');
  if(!section||!track)return;
  try{
    const r=await fetch('/api/gallery',{cache:'no-store'}); const data=await r.json();
    const photos=Array.isArray(data.photos)?data.photos:[];
    if(!photos.length){section.classList.add('hidden');return;}
    track.innerHTML=photos.map(p=>`<figure class="gallery-slide"><img src="${p.imageData}" alt="${p.caption||'Southern Nutrition photo'}" loading="lazy">${p.caption?`<figcaption>${p.caption}</figcaption>`:''}</figure>`).join('');
    section.classList.remove('hidden');
    let timer=setInterval(()=>{
      if(track.scrollWidth<=track.clientWidth+10)return;
      const nearEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-20;
      track.scrollTo({left:nearEnd?0:track.scrollLeft+Math.min(330,track.clientWidth*.8),behavior:'smooth'});
    },4200);
    ['pointerdown','touchstart'].forEach(evt=>track.addEventListener(evt,()=>{clearInterval(timer);},{once:true,passive:true}));
  }catch(e){section.classList.add('hidden');}
}

renderMenu();renderCart();renderAccountState();bindTipControls();setupDeliverySlots();refreshSession();initSquare();loadGallery();
['#deliveryStreet','#deliveryCity','#deliveryState','#deliveryZip'].forEach(sel=>{
  const el=$(sel); if(el)el.addEventListener('change',()=>confirmDeliveryArea(false));
});

// V13: Mobile autofill/keyboard focus correction inside the cart drawer.
// Some mobile browsers scroll the next autofilled field underneath the keyboard.
(() => {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;

  const isCartField = (el) => el && drawer.contains(el) && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);

  const keepFieldVisible = (el) => {
    if (!isCartField(el) || !drawer.classList.contains('open')) return;

    // Let Safari/Chrome finish opening the keyboard and applying autofill first.
    window.setTimeout(() => {
      if (document.activeElement !== el) return;

      const vv = window.visualViewport;
      const viewportTop = vv ? vv.offsetTop : 0;
      const viewportBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const topPad = 82;
      const bottomPad = 34;
      const rect = el.getBoundingClientRect();
      const safeTop = viewportTop + topPad;
      const safeBottom = viewportBottom - bottomPad;

      if (rect.bottom > safeBottom) {
        drawer.scrollBy({ top: rect.bottom - safeBottom + 10, behavior: 'smooth' });
      } else if (rect.top < safeTop) {
        drawer.scrollBy({ top: rect.top - safeTop - 10, behavior: 'smooth' });
      }
    }, 180);
  };

  drawer.addEventListener('focusin', (event) => keepFieldVisible(event.target));

  // Autofill and keyboard opening can resize the visual viewport after focus.
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => keepFieldVisible(document.activeElement));
  }
})();
