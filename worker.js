const MENU = {
  'build-your-own': { name: 'Build Your Own Loaded Tea', tea: true },
  'hot-mess': { name: 'Hot Mess', tea: true },
  'purple-paradise': { name: 'Purple Paradise', tea: true },
  'peach-perfect': { name: 'Peach Perfect', tea: true },
  'blueberry-bliss': { name: 'Blueberry Bliss', tea: true }
};
const ADDONS = { fiber:350, collagen:350, aloe:100, liftoff:350 };
const ALLOWED_FLAVORS = new Set(['Strawberry','Watermelon','Tropical Fruit','Grape','Peach','Pineapple','Blueberry','Lemon','Lavender','Cherry','Piña Colada','Margarita','Blackberry','Melon','Rainbow Candy','Mango','Raspberry','Orange','Lemon-Lime','Blue Raspberry']);
const SESSION_COOKIE = 'sn_session';
const SESSION_DAYS = 30;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});

function calculateOrder(cart, requestedTipCents){
  if(!Array.isArray(cart)||!cart.length) throw new Error('Your cart is empty.');
  let rawAmount=0,drinkCount=0; const items=[];
  for(const line of cart){
    const product=MENU[line.id],qty=Number(line.qty);
    if(!product||!Number.isInteger(qty)||qty<1||qty>50) throw new Error('The cart contains an invalid item.');
    const size=line.size==='jumbo'?'jumbo':'regular'; let unit=size==='jumbo'?1200:1000; const details=[size==='jumbo'?'Jumbo 40 oz':'Regular 32 oz'];
    if(product.tea){
      const flavors=Array.isArray(line.flavors)?line.flavors.filter(f=>ALLOWED_FLAVORS.has(f)):[];
      if(line.id==='build-your-own'&&!flavors.length) throw new Error('Choose at least one flavor for the custom tea.');
      unit+=Math.max(0,flavors.length-2)*100;
      if(flavors.length) details.push(flavors.join(' + '));
      const addonIds=Array.isArray(line.addons)?[...new Set(line.addons.map(a=>a?.id).filter(id=>ADDONS[id]))]:[];
      for(const id of addonIds) unit+=ADDONS[id];
      if(addonIds.length) details.push(addonIds.join(', '));
    }
    rawAmount+=unit*qty; drinkCount+=qty;
    items.push(`${qty}x ${product.name}${details.length?' ('+details.join(' / ')+')':''}`);
  }
  const discount=drinkCount>=10?drinkCount*100:0;
  const subtotal=Math.max(0,rawAmount-discount);
  const tipCents=Math.max(0,Math.round(Number(requestedTipCents)||0));
  if(tipCents>10000 || tipCents>Math.max(5000,Math.round(subtotal*.5))) throw new Error('The tip amount is too high. Please choose a smaller tip.');
  return {amount:subtotal+tipCents,subtotal,tipCents,discount,drinkCount,items};
}

function normalizePhone(value){
  const digits=String(value||'').replace(/\D/g,'');
  if(digits.length===10) return `+1${digits}`;
  if(digits.length===11&&digits.startsWith('1')) return `+${digits}`;
  return null;
}
function normalizeEmail(value){return String(value||'').trim().toLowerCase().slice(0,254)}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
function parseCookies(request){
  const out={}; const raw=request.headers.get('cookie')||'';
  for(const part of raw.split(';')){const i=part.indexOf('=');if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());}
  return out;
}
function sessionCookie(id,maxAge=SESSION_DAYS*86400){return `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function clearSessionCookie(){return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
function bytesToBase64(bytes){let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary)}
function base64ToBytes(str){const binary=atob(str);return Uint8Array.from(binary,c=>c.charCodeAt(0))}
async function hashPassword(password,saltBytes=null){
  const salt=saltBytes||crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},key,256);
  return `pbkdf2_sha256$100000$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password,stored){
  try{
    const [alg,it,saltB64,hashB64]=String(stored||'').split('$'); if(alg!=='pbkdf2_sha256'||!it||!saltB64||!hashB64)return false;
    const salt=base64ToBytes(saltB64), expected=base64ToBytes(hashB64);
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:Number(it)},key,expected.length*8);
    const actual=new Uint8Array(bits); if(actual.length!==expected.length)return false;
    let diff=0;for(let i=0;i<actual.length;i++)diff|=actual[i]^expected[i]; return diff===0;
  }catch{return false;}
}
async function getSessionUser(request,env){
  if(!env.DB)return null;
  const sessionId=parseCookies(request)[SESSION_COOKIE]; if(!sessionId)return null;
  const row=await env.DB.prepare(`SELECT u.id,u.email,u.phone,u.name,u.square_customer_id,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? LIMIT 1`).bind(sessionId).first();
  if(!row)return null;
  if(new Date(row.expires_at).getTime()<=Date.now()){await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(sessionId).run();return null;}
  return row;
}
async function createSession(userId,env){
  const id=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
  const expires=new Date(Date.now()+SESSION_DAYS*86400000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (id,user_id,expires_at) VALUES (?,?,?)').bind(id,userId,expires).run();
  return id;
}
function publicUser(row){return {id:row.id,name:row.name,phone:row.phone,email:row.email,squareLinked:Boolean(row.square_customer_id),credits:0,loyaltyEnabled:false};}
function squareBase(env){return env.SQUARE_ENVIRONMENT==='production'?'https://connect.squareup.com':'https://connect.squareupsandbox.com'}
async function squareRequest(env,path,options={}){
  if(!env.SQUARE_ACCESS_TOKEN) throw new Error('Square is not configured.');
  const response=await fetch(`${squareBase(env)}${path}`,{...options,headers:{Authorization:`Bearer ${env.SQUARE_ACCESS_TOKEN}`,'Square-Version':'2026-08-19','Content-Type':'application/json',...(options.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.errors?.[0]?.detail||'Square request failed.');
  return data;
}
async function findSquareCustomerByPhone(env,phone){
  try{
    const data=await squareRequest(env,'/v2/customers/search',{method:'POST',body:JSON.stringify({query:{filter:{phone_number:{exact:phone}}},limit:1})});
    return data.customers?.[0]||null;
  }catch{return null;}
}
async function ensureSquareCustomer(env,{name,phone,email}){
  if(!env.SQUARE_ACCESS_TOKEN)return null;
  const existing=await findSquareCustomerByPhone(env,phone); if(existing)return existing;
  const body={idempotency_key:crypto.randomUUID(),given_name:name,phone_number:phone}; if(email)body.email_address=email;
  const data=await squareRequest(env,'/v2/customers',{method:'POST',body:JSON.stringify(body)});
  return data.customer||null;
}
async function signup(request,env){
  if(!env.DB)return json({error:'Customer database is not connected.'},503);
  try{
    const body=await request.json(); const name=String(body.name||'').trim().slice(0,80), phone=normalizePhone(body.phone), email=normalizeEmail(body.email), password=String(body.password||'');
    if(!name)return json({error:'Enter your first name.'},400);
    if(!phone)return json({error:'Enter a valid 10-digit phone number.'},400);
    if(!email||!validEmail(email))return json({error:'Enter a valid email address.'},400);
    if(password.length<8)return json({error:'Password must be at least 8 characters.'},400);
    const existing=await env.DB.prepare('SELECT id FROM users WHERE phone=? OR email=? LIMIT 1').bind(phone,email).first();
    if(existing)return json({error:'An account with that phone number or email already exists.'},409);
    const passwordHash=await hashPassword(password);
    const inserted=await env.DB.prepare('INSERT INTO users (email,phone,name,password_hash,square_customer_id) VALUES (?,?,?,?,NULL)').bind(email,phone,name,passwordHash).run();
    const userId=inserted.meta.last_row_id;
    let squareCustomer=null;
    try{squareCustomer=await ensureSquareCustomer(env,{name,phone,email});if(squareCustomer?.id)await env.DB.prepare('UPDATE users SET square_customer_id=? WHERE id=?').bind(squareCustomer.id,userId).run();}catch(e){console.log('Square customer link failed',e?.message);}
    const row=await env.DB.prepare('SELECT id,email,phone,name,square_customer_id FROM users WHERE id=?').bind(userId).first();
    const sessionId=await createSession(userId,env);
    return json({ok:true,user:publicUser(row)},201,{'Set-Cookie':sessionCookie(sessionId)});
  }catch(e){console.log('signup error',e);return json({error:'Unable to create account right now.'},500);}
}
async function login(request,env){
  if(!env.DB)return json({error:'Customer database is not connected.'},503);
  try{
    const body=await request.json(),phone=normalizePhone(body.phone),password=String(body.password||'');
    if(!phone||!password)return json({error:'Enter your phone number and password.'},400);
    const row=await env.DB.prepare('SELECT id,email,phone,name,password_hash,square_customer_id FROM users WHERE phone=? LIMIT 1').bind(phone).first();
    if(!row||!(await verifyPassword(password,row.password_hash)))return json({error:'Phone number or password does not match.'},401);
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(new Date().toISOString()).run();
    const sessionId=await createSession(row.id,env);
    return json({ok:true,user:publicUser(row)},200,{'Set-Cookie':sessionCookie(sessionId)});
  }catch(e){console.log('login error',e);return json({error:'Unable to log in right now.'},500);}
}
async function logout(request,env){
  const id=parseCookies(request)[SESSION_COOKIE]; if(id&&env.DB)await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(id).run();
  return json({ok:true},200,{'Set-Cookie':clearSessionCookie()});
}
async function me(request,env){
  const row=await getSessionUser(request,env); return json({authenticated:Boolean(row),user:row?publicUser(row):null});
}
async function payment(request, env){
  try{
    if(!env.SQUARE_ACCESS_TOKEN||!env.SQUARE_LOCATION_ID) return json({error:'Square is not configured on the server yet.'},503);
    const body=await request.json(); if(!body.sourceId) return json({error:'Missing Square payment token.'},400);
    const order=calculateOrder(body.cart,body.tipCents);
    const fulfillment='DELIVERY';
    const customerName=String(body.customer?.name||'').trim().slice(0,100), customerPhone=String(body.customer?.phone||'').trim().slice(0,30);
    if(!customerName||!customerPhone) return json({error:'Name and phone are required.'},400);
    const addr=body.deliveryAddress||{}; const street=String(addr.street||'').trim().slice(0,120), city=String(addr.city||'').trim().slice(0,80), state=String(addr.state||'').trim().slice(0,20), zip=String(addr.zip||'').trim().slice(0,20); if(!street||!city||!state||!zip) return json({error:'Complete delivery address is required.'},400); const addressText=[String(addr.workplace||'').trim().slice(0,100),street,String(addr.unit||'').trim().slice(0,50),`${city}, ${state} ${zip}`].filter(Boolean).join(', ');
    const endpoint=`${squareBase(env)}/v2/payments`;
    const notes=[`Southern Nutrition - ${fulfillment}`,order.items.join(', '),order.discount?`Group discount: -$${(order.discount/100).toFixed(2)}`:'',order.tipCents?`Tip: $${(order.tipCents/100).toFixed(2)}`:'No tip',body.requestedTime?`Requested: ${String(body.requestedTime).slice(0,40)}`:'',`Address: ${addressText}`,addr.instructions?`Delivery instructions: ${String(addr.instructions).slice(0,180)}`:'',body.notes?`Notes: ${String(body.notes).slice(0,180)}`:'',`Customer: ${customerName} / ${customerPhone}`].filter(Boolean);
    const squareBody={source_id:body.sourceId,idempotency_key:crypto.randomUUID(),amount_money:{amount:order.amount,currency:'USD'},location_id:env.SQUARE_LOCATION_ID,autocomplete:true,note:notes.join(' | ').slice(0,500)};
    if(body.customer?.email) squareBody.buyer_email_address=String(body.customer.email).trim().slice(0,254);
    const user=await getSessionUser(request,env); if(user?.square_customer_id)squareBody.customer_id=user.square_customer_id;
    const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${env.SQUARE_ACCESS_TOKEN}`,'Square-Version':'2026-08-19','Content-Type':'application/json'},body:JSON.stringify(squareBody)});
    const result=await response.json();
    if(!response.ok) return json({error:result?.errors?.[0]?.detail||'Square declined or could not process the payment.'},response.status>=500?502:400);
    return json({ok:true,paymentId:result.payment?.id,receiptUrl:result.payment?.receipt_url||null,amount:order.amount,subtotal:order.subtotal,tipCents:order.tipCents,discount:order.discount,status:result.payment?.status||'COMPLETED',customerLinked:Boolean(user?.square_customer_id)});
  }catch(e){ return json({error:e?.message||'Unable to process payment.'},400); }
}
export default {
  async fetch(request, env){
    const url=new URL(request.url);
    if(url.pathname==='/api/config' && request.method==='GET'){
      const configured=Boolean(env.SQUARE_APPLICATION_ID&&env.SQUARE_LOCATION_ID);
      return json({configured,applicationId:configured?env.SQUARE_APPLICATION_ID:null,locationId:configured?env.SQUARE_LOCATION_ID:null,environment:env.SQUARE_ENVIRONMENT==='production'?'production':'sandbox'});
    }
    if(url.pathname==='/api/auth/signup' && request.method==='POST') return signup(request,env);
    if(url.pathname==='/api/auth/login' && request.method==='POST') return login(request,env);
    if(url.pathname==='/api/auth/logout' && request.method==='POST') return logout(request,env);
    if(url.pathname==='/api/auth/me' && request.method==='GET') return me(request,env);
    if(url.pathname==='/api/payment' && request.method==='POST') return payment(request,env);
    return env.ASSETS.fetch(request);
  }
};
