const menu = [
  {id:'strawberry-watermelon',name:'Strawberry Watermelon',type:'tea',price:12,emoji:'🍓',desc:'Sweet strawberry with a crisp watermelon finish.'},
  {id:'blue-razz',name:'Blue Razz',type:'tea',price:12,emoji:'🫐',desc:'Bright blue raspberry flavor with a tart kick.'},
  {id:'peach-ring',name:'Peach Ring',type:'tea',price:13,emoji:'🍑',desc:'Juicy peach flavor inspired by the classic candy.'},
  {id:'tropical-punch',name:'Tropical Punch',type:'tea',price:13,emoji:'🌴',desc:'A fruity tropical blend built for hot afternoons.'},
  {id:'sunset',name:'Southern Sunset',type:'tea',price:14,emoji:'🌅',desc:'A layered house specialty with citrus and berry notes.'},
  {id:'pink-starburst',name:'Pink Candy',type:'tea',price:14,emoji:'💗',desc:'Sweet, bright, and candy-inspired.'},
  {id:'vanilla-iced',name:'Vanilla Cream Iced Coffee',type:'coffee',price:12,emoji:'☕',desc:'Smooth iced coffee with creamy vanilla flavor.'},
  {id:'caramel',name:'Salted Caramel Iced Coffee',type:'coffee',price:13,emoji:'🧋',desc:'Rich caramel flavor with a light salted finish.'},
  {id:'mocha',name:'Mocha Dream',type:'coffee',price:14,emoji:'🍫',desc:'Chocolate-forward iced coffee for a richer treat.'},
  {id:'protein-coffee',name:'Protein Iced Coffee',type:'coffee',price:15,emoji:'💪',desc:'A more filling iced coffee option with added protein.'}
];

let cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
let squareCard = null;
let squareEnvironment = 'sandbox';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function subtotal(){ return cart.reduce((s,ci)=>s+(menu.find(x=>x.id===ci.id)?.price || 0)*ci.qty,0); }
function renderMenu(filter='all'){
  const items = filter==='all' ? menu : menu.filter(x=>x.type===filter);
  $('#menuGrid').innerHTML = items.map(x=>`<article class="menu-card"><div class="drink-art">${x.emoji}</div><div class="menu-body"><span class="eyebrow">${x.type==='tea'?'Loaded Tea':'Iced Coffee'}</span><h3>${x.name}</h3><p>${x.desc}</p><div class="price-row"><span class="price">$${x.price}</span><button class="add-btn" data-id="${x.id}">Add to order</button></div></div></article>`).join('');
  $$('.add-btn').forEach(b=>b.onclick=()=>addToCart(b.dataset.id));
}
function addToCart(id){const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({id,qty:1});saveCart();openCart();}
function saveCart(){localStorage.setItem('sn_cart',JSON.stringify(cart));renderCart();}
function renderCart(){
  $('#cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);
  if(!cart.length){$('#cartItems').innerHTML='<p class="form-note">Your cart is empty.</p>';$('#cartSubtotal').textContent='$0.00';return;}
  $('#cartItems').innerHTML=cart.map(ci=>{const m=menu.find(x=>x.id===ci.id);return `<div class="cart-item"><div><strong>${m.name}</strong><div class="form-note">$${m.price.toFixed(2)} each</div></div><div class="qty"><button data-act="minus" data-id="${ci.id}">−</button><span>${ci.qty}</span><button data-act="plus" data-id="${ci.id}">+</button></div></div>`}).join('');
  $$('#cartItems button').forEach(b=>b.onclick=()=>changeQty(b.dataset.id,b.dataset.act));
  $('#cartSubtotal').textContent=`$${subtotal().toFixed(2)}`;
}
function changeQty(id,act){const x=cart.find(i=>i.id===id);x.qty+=act==='plus'?1:-1;cart=cart.filter(i=>i.qty>0);saveCart();}
function openCart(){$('#cartDrawer').classList.add('open');$('#scrim').classList.add('show');$('#cartDrawer').setAttribute('aria-hidden','false');}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#scrim').classList.remove('show');$('#cartDrawer').setAttribute('aria-hidden','true');}

async function initSquare(){
  try {
    const r=await fetch('/api/config',{cache:'no-store'}); const cfg=await r.json();
    if(!cfg.configured){$('#squareStatus').textContent='Square Sandbox is ready in the site, but your Sandbox IDs still need to be added in Cloudflare.';return;}
    squareEnvironment=cfg.environment;
    if(cfg.environment==='production' && location.hostname!=='localhost'){
      // Production uses a different SDK URL, so reload it dynamically if necessary.
      const old=[...document.scripts].find(s=>s.src.includes('squarecdn.com/v1/square.js'));
      if(old?.src.includes('sandbox.')){await loadScript('https://web.squarecdn.com/v1/square.js');}
    }
    if(!window.Square) throw new Error('Square Web Payments SDK did not load.');
    const payments=window.Square.payments(cfg.applicationId,cfg.locationId);
    squareCard=await payments.card(); await squareCard.attach('#card-container');
    $('#payButton').disabled=false;
    $('#squareStatus').textContent=cfg.environment==='production'?'Secure Square checkout':'Square Sandbox connected — test payments only';
  } catch(e){$('#squareStatus').textContent=`Square setup error: ${e.message}`;}
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}

function checkoutSummary(){
  return cart.map(ci=>{const m=menu.find(x=>x.id===ci.id);return `<div class="checkout-line"><span>${ci.qty} × ${m.name}</span><strong>$${(m.price*ci.qty).toFixed(2)}</strong></div>`}).join('')+`<div class="checkout-line checkout-total"><span>Total</span><strong>$${subtotal().toFixed(2)}</strong></div>`;
}

$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMenu(b.dataset.filter);});
$('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#scrim').onclick=closeCart;
$('#fulfillment').onchange=e=>$('#addressWrap').classList.toggle('hidden',e.target.value!=='delivery');

$('#rewardsForm').onsubmit=e=>{e.preventDefault();const profile={name:$('#rewardName').value,contact:$('#rewardContact').value,credits:0};localStorage.setItem('sn_rewards',JSON.stringify(profile));$('#rewardStatus').textContent=`Welcome, ${profile.name}! Your rewards profile is saved on this device for now.`;e.target.reset();};
const existing=JSON.parse(localStorage.getItem('sn_rewards')||'null');if(existing)$('#rewardStatus').textContent=`Rewards profile active for ${existing.name}.`;

$('#placeOrder').onclick=()=>{
  if(!cart.length)return alert('Add at least one drink first.');
  if($('#fulfillment').value==='delivery'&&!$('#deliveryAddress').value.trim())return alert('Enter a delivery address.');
  $('#checkoutOrder').innerHTML=checkoutSummary();closeCart();$('#checkoutDialog').showModal();
};
$('#checkoutClose').onclick=()=>$('#checkoutDialog').close();

$('#payButton').onclick=async()=>{
  const name=$('#customerName').value.trim(), phone=$('#customerPhone').value.trim(), email=$('#customerEmail').value.trim();
  if(!name||!phone){$('#paymentMessage').textContent='Enter your name and phone number.';return;}
  if(!squareCard){$('#paymentMessage').textContent='Square is not configured yet.';return;}
  const btn=$('#payButton'); btn.disabled=true; btn.textContent='Processing…'; $('#paymentMessage').textContent='';
  try{
    const tokenResult=await squareCard.tokenize();
    if(tokenResult.status!=='OK') throw new Error(tokenResult.errors?.[0]?.message||'Card information could not be tokenized.');
    const response=await fetch('/api/payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      sourceId:tokenResult.token, cart, fulfillment:$('#fulfillment').value, deliveryAddress:$('#deliveryAddress').value.trim(), requestedTime:$('#orderTime').value, notes:$('#orderNotes').value.trim(), customer:{name,phone,email}
    })});
    const result=await response.json(); if(!response.ok)throw new Error(result.error||'Payment failed.');
    cart=[];saveCart();$('#checkoutDialog').close();
    $('#successMessage').innerHTML=`Payment ${squareEnvironment==='sandbox'?'test ':''}completed for <strong>$${(result.amount/100).toFixed(2)}</strong>.<br>Payment ID: <code>${result.paymentId||'confirmed'}</code>${result.receiptUrl?`<br><a href="${result.receiptUrl}" target="_blank" rel="noopener">View Square receipt</a>`:''}`;
    $('#successDialog').showModal();
  }catch(e){$('#paymentMessage').textContent=e.message;}
  finally{btn.disabled=!squareCard;btn.textContent='Pay securely';}
};
$('#successClose').onclick=()=>$('#successDialog').close();$('#successDone').onclick=()=>$('#successDialog').close();
$('#year').textContent=new Date().getFullYear();
renderMenu();renderCart();initSquare();
