const menu = [
  {id:'build-your-own',name:'Build Your Own Loaded Tea',type:'tea',price:12,emoji:'✨',desc:'Create your own loaded tea. Pick 2 flavors included, then make it yours.',custom:true},
  {id:'strawberry-watermelon',name:'Strawberry Watermelon',type:'tea',price:12,emoji:'🍓',desc:'Sweet strawberry with a crisp watermelon finish.',flavors:['Strawberry','Watermelon']},
  {id:'blue-razz',name:'Blue Razz',type:'tea',price:12,emoji:'🫐',desc:'Bright blue raspberry flavor with a tart kick.',flavors:['Blue Raspberry']},
  {id:'peach-ring',name:'Peach Ring',type:'tea',price:13,emoji:'🍑',desc:'Juicy peach flavor inspired by the classic candy.',flavors:['Peach','Rainbow Candy']},
  {id:'tropical-punch',name:'Tropical Punch',type:'tea',price:13,emoji:'🌴',desc:'A fruity tropical blend built for hot afternoons.',flavors:['Pineapple','Mango']},
  {id:'sunset',name:'Southern Sunset',type:'tea',price:14,emoji:'🌅',desc:'A layered house specialty with citrus and berry notes.',flavors:['Orange','Blackberry']},
  {id:'pink-starburst',name:'Pink Candy',type:'tea',price:14,emoji:'💗',desc:'Sweet, bright, and candy-inspired.',flavors:['Strawberry','Rainbow Candy']},
  {id:'vanilla-iced',name:'Vanilla Cream Iced Coffee',type:'coffee',price:12,emoji:'☕',desc:'Smooth iced coffee with creamy vanilla flavor.'},
  {id:'caramel',name:'Salted Caramel Iced Coffee',type:'coffee',price:13,emoji:'🧋',desc:'Rich caramel flavor with a light salted finish.'},
  {id:'mocha',name:'Mocha Dream',type:'coffee',price:14,emoji:'🍫',desc:'Chocolate-forward iced coffee for a richer treat.'},
  {id:'protein-coffee',name:'Protein Iced Coffee',type:'coffee',price:15,emoji:'💪',desc:'A more filling iced coffee option with added protein.'}
];

const flavorOptions = ['Strawberry','Watermelon','Cherry','Piña Colada','Margarita','Blackberry','Melon','Rainbow Candy','Mango','Pineapple','Peach','Raspberry','Orange','Lemon-Lime','Blue Raspberry'];
const addons = [
  {id:'fiber',name:'Add Fiber',price:3.50},
  {id:'collagen',name:'Add Collagen',price:3.50},
  {id:'aloe',name:'Add Aloe',price:1.00},
  {id:'liftoff',name:'Add Extra Liftoff',price:3.50,caffeine:true}
];

let cart = JSON.parse(localStorage.getItem('sn_cart_v2') || '[]');
let squareCard = null;
let squareEnvironment = 'sandbox';
let customizing = null;
let authMode = 'login';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `$${Number(n).toFixed(2)}`;

function linePrice(ci){return ci.unitPrice ?? (menu.find(x=>x.id===ci.id)?.price || 0)}
function drinkCount(){ return cart.reduce((s,ci)=>s+ci.qty,0); }
function rawSubtotal(){ return cart.reduce((s,ci)=>s+linePrice(ci)*ci.qty,0); }
function groupDiscount(){ return drinkCount()>=10 ? drinkCount() : 0; }
function subtotal(){ return Math.max(0, rawSubtotal()-groupDiscount()); }
let selectedTipCents = 0;
function tipAmount(){ return selectedTipCents/100; }
function orderTotal(){ return subtotal()+tipAmount(); }
function itemKey(ci){return `${ci.id}|${(ci.flavors||[]).join(',')}|${(ci.addons||[]).map(a=>a.id).sort().join(',')}`}

function renderMenu(filter='all'){
  const items = filter==='all' ? menu : menu.filter(x=>x.type===filter);
  $('#menuGrid').innerHTML = items.map(x=>`<article class="menu-card ${x.custom?'featured-card':''}"><div class="drink-art">${x.emoji}</div><div class="menu-body"><span class="eyebrow">${x.custom?'Make it yours':x.type==='tea'?'Loaded Tea':'Iced Coffee'}</span><h3>${x.name}</h3><p>${x.desc}</p>${x.type==='tea'?'<div class="mini-caffeine">⚡ Contains caffeine</div>':''}<div class="price-row"><span class="price">${x.custom?'From ':''}$${x.price}</span><button class="add-btn" data-id="${x.id}">${x.type==='tea'?'Customize':'Add to order'}</button></div></div></article>`).join('');
  $$('.add-btn').forEach(b=>b.onclick=()=>startAdd(b.dataset.id));
}

function startAdd(id){
  const item=menu.find(x=>x.id===id); if(!item)return;
  if(item.type==='coffee'){ addSimpleToCart(item); return; }
  customizing={id:item.id,basePrice:item.price,flavors:[...(item.flavors||[])],addons:[]};
  $('#customizeType').textContent=item.custom?'Build Your Own':'Loaded Tea';
  $('#customizeName').textContent=item.name;
  $('#customizeDesc').textContent=item.custom?'Choose any 2 flavors included. Add more flavors for $1 each.':item.desc;
  $('#flavorHelp').textContent=item.custom?'Choose up to 2 included flavors. Each additional flavor is +$1.':'Your recipe flavors are preselected. Add or change flavors; more than 2 total are +$1 each.';
  renderCustomizer();
  $('#customizeDialog').showModal();
}

function renderCustomizer(){
  const selected=new Set(customizing.flavors);
  $('#flavorChoices').innerHTML=flavorOptions.map(f=>`<label class="choice-chip ${selected.has(f)?'selected':''}"><input type="checkbox" value="${f}" ${selected.has(f)?'checked':''}><span>${f}</span></label>`).join('');
  $$('#flavorChoices input').forEach(i=>i.onchange=()=>{ if(i.checked && !customizing.flavors.includes(i.value)) customizing.flavors.push(i.value); if(!i.checked) customizing.flavors=customizing.flavors.filter(f=>f!==i.value); renderCustomizer(); });
  $('#addonChoices').innerHTML=addons.map(a=>{const checked=customizing.addons.some(x=>x.id===a.id);return `<label class="addon-row ${checked?'selected':''}"><input type="checkbox" value="${a.id}" ${checked?'checked':''}><span><strong>${a.name}</strong>${a.caffeine?'<small> Adds additional caffeine</small>':''}</span><b>+${money(a.price)}</b></label>`}).join('');
  $$('#addonChoices input').forEach(i=>i.onchange=()=>{const a=addons.find(x=>x.id===i.value); customizing.addons=i.checked?[...customizing.addons.filter(x=>x.id!==a.id),a]:customizing.addons.filter(x=>x.id!==a.id); updateCustomizerPrice(); $(`.addon-row input[value="${i.value}"]`)?.closest('.addon-row')?.classList.toggle('selected',i.checked);});
  updateCustomizerPrice();
}

function currentCustomPrice(){const flavorExtras=Math.max(0,customizing.flavors.length-2);return customizing.basePrice+flavorExtras+customizing.addons.reduce((s,a)=>s+a.price,0)}
function updateCustomizerPrice(){
  const flavorExtras=Math.max(0,customizing.flavors.length-2);
  $('#flavorCharge').textContent=flavorExtras?`+${money(flavorExtras)}`:'2 included';
  $('#customizeTotal').textContent=money(currentCustomPrice());
  const extra=customizing.addons.some(a=>a.id==='liftoff');
  $('#caffeineNotice').classList.toggle('strong',extra);
  $('#caffeineNotice').querySelector('span').textContent=extra?'This drink includes Extra Liftoff and therefore additional caffeine.':'Loaded teas contain caffeine. Extra Liftoff adds additional caffeine.';
}

function addCustomized(){
  const item=menu.find(x=>x.id===customizing.id);
  if(item.custom && customizing.flavors.length===0){alert('Choose at least one flavor for your custom tea.');return;}
  const ci={id:item.id,qty:1,flavors:[...customizing.flavors],addons:customizing.addons.map(a=>({id:a.id,name:a.name,price:a.price})),unitPrice:currentCustomPrice()};
  const key=itemKey(ci), found=cart.find(x=>itemKey(x)===key); if(found)found.qty++; else cart.push(ci);
  saveCart(); $('#customizeDialog').close(); openCart();
}
function addSimpleToCart(item){const ci={id:item.id,qty:1,flavors:[],addons:[],unitPrice:item.price};const found=cart.find(x=>itemKey(x)===itemKey(ci));if(found)found.qty++;else cart.push(ci);saveCart();openCart();}

function saveCart(){localStorage.setItem('sn_cart_v2',JSON.stringify(cart));renderCart();}
function cartDetails(ci){const parts=[];if(ci.flavors?.length)parts.push(ci.flavors.join(' + '));if(ci.addons?.length)parts.push(ci.addons.map(a=>a.name.replace('Add ','')).join(', '));return parts.join(' • ')}
function renderCart(){
  const count=drinkCount();
  $('#cartCount').textContent=count;
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

function getAccounts(){return JSON.parse(localStorage.getItem('sn_demo_accounts')||'{}')}
function setAccounts(x){localStorage.setItem('sn_demo_accounts',JSON.stringify(x))}
function getSession(){return JSON.parse(localStorage.getItem('sn_demo_session')||'null')}
function setSession(x){x?localStorage.setItem('sn_demo_session',JSON.stringify(x)):localStorage.removeItem('sn_demo_session');renderAccountState()}
function rewardDots(credits){const earned=Math.min(9,Math.max(0,credits||0));return Array.from({length:9},(_,i)=>`<span class="reward-dot ${i<earned?'filled':''}">${i<earned?'✓':''}</span>`).join('')}
function renderRewardProgress(el,credits){el.innerHTML=rewardDots(credits)}
function renderAccountState(){
  const session=getSession(), accounts=getAccounts(), acct=session?accounts[session.phone]:null, credits=acct?.credits||0;
  $('#accountBtn').textContent=acct?`Hi, ${acct.name}`:'Log in';
  $('#rewardLoggedOut').classList.toggle('hidden',!!acct);$('#rewardLoggedIn').classList.toggle('hidden',!acct);
  renderRewardProgress($('#rewardProgress'),credits);
  $('#rewardCaption').textContent=acct?(credits>=9?'Your next standard drink is FREE.':`${credits} of 9 paid drinks — ${9-credits} more until your free drink.`):'Join rewards to start earning.';
  if(acct){$('#rewardHello').textContent=`Hi, ${acct.name}`;$('#rewardAccountContact').textContent=acct.phone;$('#profileName').textContent=`Hi, ${acct.name}`;$('#profileContact').textContent=[acct.phone,acct.email].filter(Boolean).join(' • ');renderRewardProgress($('#profileRewardProgress'),credits);$('#profileRewardCaption').textContent=credits>=9?'Your next standard drink is FREE.':`${credits}/9 toward your free drink.`;$('#customerName').value=acct.name;$('#customerPhone').value=acct.phone;$('#customerEmail').value=acct.email||'';}
}
function openAccount(mode='login'){
  const session=getSession(), acct=session?getAccounts()[session.phone]:null;
  if(acct){$('#accountAuthView').classList.add('hidden');$('#accountProfileView').classList.remove('hidden');renderAccountState();}
  else{$('#accountAuthView').classList.remove('hidden');$('#accountProfileView').classList.add('hidden');setAuthMode(mode);}
  $('#accountDialog').showModal();
}
function setAuthMode(mode){authMode=mode;$$('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const signup=mode==='signup';$('#nameField').classList.toggle('hidden',!signup);$('#emailField').classList.toggle('hidden',!signup);$('#accountTitle').textContent=signup?'Create your account':'Log in';$('#accountSubmit').textContent=signup?'Create account':'Log in';$('#accountPassword').autocomplete=signup?'new-password':'current-password';$('#accountMessage').textContent='';}
$('#accountForm').onsubmit=e=>{e.preventDefault();const phone=$('#accountPhone').value.trim(),pw=$('#accountPassword').value,name=$('#accountName').value.trim(),email=$('#accountEmail').value.trim();const accounts=getAccounts();if(authMode==='signup'){if(!name){$('#accountMessage').textContent='Enter your first name.';return}if(accounts[phone]){$('#accountMessage').textContent='An account with that phone number already exists.';return}accounts[phone]={name,phone,email,password:pw,credits:0};setAccounts(accounts);setSession({phone});}else{const acct=accounts[phone];if(!acct||acct.password!==pw){$('#accountMessage').textContent='Phone number or password does not match.';return}setSession({phone});}$('#accountDialog').close();};

async function initSquare(){
  try {const r=await fetch('/api/config',{cache:'no-store'}); const cfg=await r.json();if(!cfg.configured){$('#squareStatus').textContent='Square Sandbox is ready in the site, but your Sandbox IDs still need to be added in Cloudflare.';return;}squareEnvironment=cfg.environment;if(cfg.environment==='production'&&location.hostname!=='localhost'){const old=[...document.scripts].find(s=>s.src.includes('squarecdn.com/v1/square.js'));if(old?.src.includes('sandbox.'))await loadScript('https://web.squarecdn.com/v1/square.js');}if(!window.Square)throw new Error('Square Web Payments SDK did not load.');const payments=window.Square.payments(cfg.applicationId,cfg.locationId);squareCard=await payments.card();await squareCard.attach('#card-container');$('#payButton').disabled=false;$('#squareStatus').textContent=cfg.environment==='production'?'Secure Square checkout':'Square Sandbox connected — test payments only';}catch(e){$('#squareStatus').textContent=`Square setup error: ${e.message}`;}
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
function setTipCents(cents){
  selectedTipCents=Math.max(0,Math.round(Number(cents)||0));
  $$('.tip-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.percent)>=0 && Math.round(subtotal()*Number(b.dataset.percent))===selectedTipCents));
  $('#checkoutOrder').innerHTML=checkoutSummary();
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
$('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#scrim').onclick=closeCart; $('#fulfillment').onchange=e=>$('#addressWrap').classList.toggle('hidden',e.target.value!=='delivery');
$('#customizeClose').onclick=()=>$('#customizeDialog').close();$('#addCustomized').onclick=addCustomized;
$('#accountBtn').onclick=()=>openAccount();$('#joinRewardsBtn').onclick=()=>openAccount('signup');$('#rewardLoginBtn').onclick=()=>openAccount('login');$('#accountDetailsBtn').onclick=()=>openAccount();$('#accountClose').onclick=()=>$('#accountDialog').close();$$('.auth-tab').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.mode));$('#logoutBtn').onclick=()=>{setSession(null);$('#accountDialog').close();};

$('#placeOrder').onclick=()=>{if(!cart.length)return alert('Add at least one drink first.');if($('#fulfillment').value==='delivery'&&!$('#deliveryAddress').value.trim())return alert('Enter a delivery address.');selectedTipCents=0;$('#customTip').value='';$$('.tip-btn').forEach(b=>b.classList.remove('active'));$('#checkoutOrder').innerHTML=checkoutSummary();renderAccountState();closeCart();$('#checkoutDialog').showModal();};
$('#checkoutClose').onclick=()=>$('#checkoutDialog').close();
$('#payButton').onclick=async()=>{const name=$('#customerName').value.trim(),phone=$('#customerPhone').value.trim(),email=$('#customerEmail').value.trim();if(!name||!phone){$('#paymentMessage').textContent='Enter your name and phone number.';return;}if(!squareCard){$('#paymentMessage').textContent='Square is not configured yet.';return;}const btn=$('#payButton');btn.disabled=true;btn.textContent='Processing…';$('#paymentMessage').textContent='';try{const tokenResult=await squareCard.tokenize();if(tokenResult.status!=='OK')throw new Error(tokenResult.errors?.[0]?.message||'Card information could not be tokenized.');const response=await fetch('/api/payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sourceId:tokenResult.token,cart,fulfillment:$('#fulfillment').value,deliveryAddress:$('#deliveryAddress').value.trim(),requestedTime:$('#orderTime').value,notes:$('#orderNotes').value.trim(),customer:{name,phone,email},tipCents:selectedTipCents})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Payment failed.');cart=[];selectedTipCents=0;saveCart();$('#checkoutDialog').close();$('#successMessage').innerHTML=`Payment ${squareEnvironment==='sandbox'?'test ':''}completed for <strong>${money(result.amount/100)}</strong>.${result.receiptUrl?`<br><a href="${result.receiptUrl}" target="_blank" rel="noopener">View Square receipt</a>`:''}`;$('#successDialog').showModal();}catch(e){$('#paymentMessage').textContent=e.message;}finally{btn.disabled=!squareCard;btn.textContent='Pay securely';}};
$('#successClose').onclick=()=>$('#successDialog').close();$('#successDone').onclick=()=>$('#successDialog').close();
$('#year').textContent=new Date().getFullYear();
renderMenu();renderCart();renderAccountState();bindTipControls();initSquare();
