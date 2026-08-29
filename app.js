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
  {id:'build-your-own',name:'Build Your Own Loaded Tea',type:'tea',image:'assets/build-your-own-ice.png',desc:'Create your own loaded tea. Pick 2 flavors included, then make it yours.',custom:true},
  {id:'hot-mess',name:'Hot Mess',type:'tea',image:'assets/hot-mess.png',desc:'Strawberry • Watermelon • Chili Lime',flavors:['Strawberry','Watermelon']},
  {id:'southern-paradise',name:'Southern Paradise',type:'tea',image:'assets/southern-paradise.png',desc:'Mango • Pineapple',flavors:['Mango','Pineapple']},
  {id:'cherry-bombshell',name:'Cherry Bombshell',type:'tea',image:'assets/cherry-bombshell.png',desc:'Cherry • Orange',flavors:['Cherry','Orange']},
  {id:'brb',name:'BRB — Back Road Breeze',type:'tea',image:'assets/brb.png',desc:'Cherry • Grape',flavors:['Cherry','Grape']},
  {id:'iced-protein-coffee',name:'Iced Protein Coffee',type:'coffee',image:'assets/iced-protein-coffee.png',desc:'Protein coffee with your choice of Caramel, Mocha, or House Blend.',coffee:true}
];

const flavorOptions = ['Cherry','Mango','Strawberry','Piña Colada','Margarita','Melon','Blackberry','Orange','Grape','Pineapple','Lemonade','Watermelon'];
const addons = [
  {id:'fiber',name:'Add Fiber',price:3.50},
  {id:'collagen',name:'Add Collagen',price:3.50},
  {id:'aloe',name:'Add Aloe',price:1.00},
  {id:'liftoff',name:'Add Extra Liftoff',price:3.50,caffeine:true}
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
 const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);if(!m)return null;
 return {year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5]};
}
function minuteStamp(p){return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)/60000;}
function validateRequestedTime(value){
 const p=parseRequestedTime(value);if(!p)return 'Choose an available delivery window.';
 if(minuteStamp(p)<=minuteStamp(businessNowParts()))return 'Choose a delivery window in the future.';
 const mins=p.hour*60+p.minute;if(mins<360||mins>=1080)return 'Choose a delivery window between 6:00 AM and 6:00 PM Central.';return '';
}
function centralDateString(){const n=businessNowParts(),pad=x=>String(x).padStart(2,'0');return `${n.year}-${pad(n.month)}-${pad(n.day)}`;}
async function loadDeliverySlots(){
 const date=$('#deliveryDate')?.value,sel=$('#deliverySlot');if(!sel)return;$('#orderTime').value='';
 if(!date){sel.innerHTML='<option value="">Choose a delivery date first</option>';return;}
 sel.disabled=true;sel.innerHTML='<option value="">Checking availability…</option>';
 try{const r=await fetch(`/api/delivery-slots?date=${encodeURIComponent(date)}`,{cache:'no-store'}),data=await r.json();if(!r.ok)throw new Error();
 const slots=(data.slots||[]).filter(x=>x.available);
 sel.innerHTML=slots.length?'<option value="">Choose a delivery window</option>'+slots.map(x=>`<option value="${x.start}">${x.label}</option>`).join(''):'<option value="">No delivery windows available</option>';
 }catch(e){sel.innerHTML='<option value="">Unable to load delivery windows</option>';}finally{sel.disabled=false;}
}
function setupDeliverySlots(){const d=$('#deliveryDate'),s=$('#deliverySlot');if(!d||!s)return;d.min=centralDateString();if(!d.value)d.value=centralDateString();d.addEventListener('change',loadDeliverySlots);s.addEventListener('change',()=>{$('#orderTime').value=s.value;});loadDeliverySlots();}

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
function setAuthMode(mode){authMode=mode;$$('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const signup=mode==='signup';$('#nameField').classList.toggle('hidden',!signup);$('#emailField').classList.toggle('hidden',!signup);$('#accountEmail').required=signup;$('#accountTitle').textContent=signup?'Create your account':'Log in';$('#accountSubmit').textContent=signup?'Create account':'Log in';$('#accountPassword').autocomplete=signup?'new-password':'current-password';$('#accountMessage').textContent='';}
$('#accountForm').onsubmit=async e=>{
  e.preventDefault(); const phone=$('#accountPhone').value.trim(),password=$('#accountPassword').value,name=$('#accountName').value.trim(),email=$('#accountEmail').value.trim();
  if(authMode==='signup'&&password.length<8){$('#accountMessage').textContent='Password must be at least 8 characters.';return;}
  const btn=$('#accountSubmit');btn.disabled=true;btn.textContent=authMode==='signup'?'Creating…':'Logging in…';$('#accountMessage').textContent='';
  try{
    const endpoint=authMode==='signup'?'/api/auth/signup':'/api/auth/login';
    const payload=authMode==='signup'?{name,phone,email,password}:{phone,password};
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
    $('#payButton').disabled=false;
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
$('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#scrim').onclick=closeCart;
$('#customizeClose').onclick=()=>$('#customizeDialog').close();$('#addCustomized').onclick=addCustomized;
$$('#sizeChoices .size-choice').forEach(b=>b.onclick=()=>{if(!customizing)return;customizing.size=b.dataset.size;$$('#sizeChoices .size-choice').forEach(x=>x.classList.toggle('active',x===b));updateCustomizerPrice();});
$('#mobileCartBar').onclick=openCart;
$('#accountBtn').onclick=()=>openAccount();$('#joinRewardsBtn').onclick=()=>openAccount('signup');$('#rewardLoginBtn').onclick=()=>openAccount('login');$('#accountDetailsBtn').onclick=()=>openAccount();$('#accountClose').onclick=()=>$('#accountDialog').close();$$('.auth-tab').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.mode));$('#logoutBtn').onclick=logout;

$('#placeOrder').onclick=async()=>{if(!cart.length)return alert('Add at least one drink first.');const required=[['#deliveryStreet','street address'],['#deliveryCity','city'],['#deliveryState','state'],['#deliveryZip','ZIP code']];for(const [sel,label] of required){if(!$(sel).value.trim())return alert(`Enter your ${label}.`);}const timeError=validateRequestedTime($('#orderTime').value);if(timeError)return alert(timeError);if(currentUser)await saveCurrentAddress();selectedTipCents=0;$('#customTip').value='';$$('.tip-btn').forEach(b=>b.classList.remove('active'));$('#checkoutOrder').innerHTML=checkoutSummary();renderAccountState();closeCart();$('#checkoutDialog').showModal();};
$('#checkoutClose').onclick=()=>$('#checkoutDialog').close();
$('#payButton').onclick=async()=>{const timeError=validateRequestedTime($('#orderTime').value);if(timeError){$('#paymentMessage').textContent=timeError;return;}const name=$('#customerName').value.trim(),phone=$('#customerPhone').value.trim(),email=$('#customerEmail').value.trim();if(!name||!phone){$('#paymentMessage').textContent='Enter your name and phone number.';return;}if(!squareCard){$('#paymentMessage').textContent='Square is not configured yet.';return;}const btn=$('#payButton');btn.disabled=true;btn.textContent='Processing…';$('#paymentMessage').textContent='';try{const tokenResult=await squareCard.tokenize();if(tokenResult.status!=='OK')throw new Error(tokenResult.errors?.[0]?.message||'Card information could not be tokenized.');const response=await fetch('/api/payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sourceId:tokenResult.token,cart,fulfillment:'delivery',deliveryAddress:getDeliveryAddressFromForm(),requestedTime:$('#orderTime').value,notes:$('#orderNotes').value.trim(),customer:{name,phone,email},tipCents:selectedTipCents})});const result=await response.json();if(!response.ok){if(response.status===409)loadDeliverySlots();throw new Error(result.error||'Payment failed.');}cart=[];selectedTipCents=0;saveCart();$('#checkoutDialog').close();$('#successMessage').innerHTML=`Payment ${squareEnvironment==='sandbox'?'test ':''}completed for <strong>${money(result.amount/100)}</strong>.${result.receiptUrl?`<br><a href="${result.receiptUrl}" target="_blank" rel="noopener">View Square receipt</a>`:''}`;$('#successDialog').showModal();}catch(e){$('#paymentMessage').textContent=e.message;}finally{btn.disabled=!squareCard;btn.textContent='Pay securely';}};
$('#successClose').onclick=()=>$('#successDialog').close();$('#successDone').onclick=()=>$('#successDialog').close();
$('#year').textContent=new Date().getFullYear();
renderMenu();renderCart();renderAccountState();bindTipControls();setupDeliverySlots();refreshSession();initSquare();

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
