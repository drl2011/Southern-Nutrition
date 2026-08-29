const MENU = {
  'build-your-own': { name: 'Build Your Own Loaded Tea', tea: true },
  'hot-mess': { name: 'Hot Mess', tea: true },
  'southern-paradise': { name: 'Southern Paradise', tea: true },
  'cherry-bombshell': { name: 'Cherry Bombshell', tea: true },
  'brb': { name: 'BRB — Back Road Breeze', tea: true },
  'iced-protein-coffee': { name: 'Iced Protein Coffee', coffee: true }
};
const ADDONS = { fiber:350, collagen:350, aloe:100, liftoff:350, 'whipped-cream':100 };
const ALLOWED_FLAVORS = new Set(['Cherry','Mango','Strawberry','Piña Colada','Margarita','Melon','Blackberry','Orange','Grape','Pineapple','Lemonade','Watermelon']);
const SESSION_COOKIE = 'sn_session';
const SESSION_DAYS = 30;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});

function calculateOrder(cart, requestedTipCents){
  if(!Array.isArray(cart)||!cart.length) throw new Error('Your cart is empty.');
  let rawAmount=0,drinkCount=0; const items=[],lineItems=[];
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
    if(product.coffee){
      const flavors=Array.isArray(line.flavors)?line.flavors.filter(f=>['Caramel','Mocha','House Blend'].includes(f)):[];
      if(flavors.length!==1) throw new Error('Choose one coffee flavor.');
      details.push(flavors[0]);
      const whipped=Array.isArray(line.addons)&&line.addons.some(a=>a?.id==='whipped-cream');
      if(whipped){unit+=100;details.push('Whipped Cream');}
    }
    rawAmount+=unit*qty; drinkCount+=qty;
    const itemName=`${product.name}${details.length?' ('+details.join(' / ')+')':''}`;
    items.push(`${qty}x ${itemName}`);
    lineItems.push({name:itemName.slice(0,255),quantity:String(qty),base_price_money:{amount:unit,currency:'USD'}});
  }
  const discount=drinkCount>=10?drinkCount*100:0;
  const subtotal=Math.max(0,rawAmount-discount);
  const tipCents=Math.max(0,Math.round(Number(requestedTipCents)||0));
  if(tipCents>10000 || tipCents>Math.max(5000,Math.round(subtotal*.5))) throw new Error('The tip amount is too high. Please choose a smaller tip.');
  return {amount:subtotal+tipCents,subtotal,tipCents,discount,drinkCount,items,lineItems};
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
  let row;
  try{
    row=await env.DB.prepare(`SELECT u.id,u.email,u.phone,u.name,u.square_customer_id,COALESCE(u.is_disabled,0) AS is_disabled,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? LIMIT 1`).bind(sessionId).first();
  }catch(e){
    // Backward compatibility before the admin schema has added is_disabled.
    row=await env.DB.prepare(`SELECT u.id,u.email,u.phone,u.name,u.square_customer_id,0 AS is_disabled,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? LIMIT 1`).bind(sessionId).first();
  }
  if(!row)return null;
  if(new Date(row.expires_at).getTime()<=Date.now()||Number(row.is_disabled)===1){await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(sessionId).run();return null;}
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
async function ensureSquareCustomer(env,{name,lastName,phone,email}){
  if(!env.SQUARE_ACCESS_TOKEN)return null;
  const existing=await findSquareCustomerByPhone(env,phone); if(existing)return existing;
  const body={idempotency_key:crypto.randomUUID(),given_name:name,family_name:lastName||undefined,phone_number:phone}; if(email)body.email_address=email;
  const data=await squareRequest(env,'/v2/customers',{method:'POST',body:JSON.stringify(body)});
  return data.customer||null;
}

async function ensureAddressSchema(env){
  if(!env.DB) return false;
  const additions=[
    ['address_street',`ALTER TABLE users ADD COLUMN address_street TEXT`],
    ['address_unit',`ALTER TABLE users ADD COLUMN address_unit TEXT`],
    ['address_city',`ALTER TABLE users ADD COLUMN address_city TEXT`],
    ['address_state',`ALTER TABLE users ADD COLUMN address_state TEXT`],
    ['address_zip',`ALTER TABLE users ADD COLUMN address_zip TEXT`],
    ['address_workplace',`ALTER TABLE users ADD COLUMN address_workplace TEXT`],
    ['address_instructions',`ALTER TABLE users ADD COLUMN address_instructions TEXT`]
  ];
  for(const [column,sql] of additions){
    try{await env.DB.prepare(`SELECT ${column} FROM users LIMIT 1`).first();}
    catch(e){
      try{await env.DB.prepare(sql).run();}
      catch(alterError){
        if(!/duplicate column|already exists/i.test(String(alterError?.message||alterError))) throw alterError;
      }
    }
  }
  return true;
}
function normalizeAddress(body={}){
  const street=String(body.street||'').trim().slice(0,120);
  const unit=String(body.unit||'').trim().slice(0,80);
  const city=String(body.city||'').trim().slice(0,80);
  const state=String(body.state||'').trim().toUpperCase().replace(/[^A-Z]/g,'').slice(0,2);
  const zip=String(body.zip||'').trim().slice(0,10);
  const workplace=String(body.workplace||'').trim().slice(0,120);
  const instructions=String(body.instructions||'').trim().slice(0,500);
  return {street,unit,city,state,zip,workplace,instructions};
}
function validSavedAddress(a){
  return Boolean(a.street && a.city && /^[A-Z]{2}$/.test(a.state) && /^\d{5}(?:-\d{4})?$/.test(a.zip));
}
async function getSavedAddress(env,userId){
  await ensureAddressSchema(env);
  const row=await env.DB.prepare(`SELECT address_street,address_unit,address_city,address_state,address_zip,address_workplace,address_instructions FROM users WHERE id=? LIMIT 1`).bind(userId).first();
  if(!row||!row.address_street) return null;
  return {
    street:row.address_street||'',
    unit:row.address_unit||'',
    city:row.address_city||'',
    state:row.address_state||'',
    zip:row.address_zip||'',
    workplace:row.address_workplace||'',
    instructions:row.address_instructions||''
  };
}
async function savedAddress(request,env){
  if(!env.DB) return json({error:'Customer database is not connected.'},503);
  const user=await getSessionUser(request,env);
  if(!user) return json({error:'Log in to save a delivery address.'},401);
  try{
    if(request.method==='GET'){
      return json({address:await getSavedAddress(env,user.id)});
    }
    const body=normalizeAddress(await request.json());
    if(!validSavedAddress(body)) return json({error:'Enter a valid street, city, 2-letter state, and ZIP code.'},400);
    await ensureAddressSchema(env);
    await env.DB.prepare(`UPDATE users
      SET address_street=?,address_unit=?,address_city=?,address_state=?,address_zip=?,address_workplace=?,address_instructions=?
      WHERE id=?`)
      .bind(body.street,body.unit,body.city,body.state,body.zip,body.workplace,body.instructions,user.id).run();
    return json({ok:true,address:body});
  }catch(e){
    console.log('saved address error',e);
    return json({error:'Unable to save the delivery address right now.'},500);
  }
}

async function signup(request,env){
  if(!env.DB)return json({error:'Customer database is not connected.'},503);
  try{
    const body=await request.json(); const firstName=String(body.name||'').trim().slice(0,40), lastName=String(body.lastName||'').trim().slice(0,40), name=`${firstName} ${lastName}`.trim().slice(0,80), phone=normalizePhone(body.phone), email=normalizeEmail(body.email), password=String(body.password||'');
    if(!firstName)return json({error:'Enter your first name.'},400);
    if(!lastName)return json({error:'Enter your last name.'},400);
    if(!phone)return json({error:'Enter a valid 10-digit phone number.'},400);
    if(!email||!validEmail(email))return json({error:'Enter a valid email address.'},400);
    if(password.length<8)return json({error:'Password must be at least 8 characters.'},400);
    const existing=await env.DB.prepare('SELECT id FROM users WHERE phone=? OR email=? LIMIT 1').bind(phone,email).first();
    if(existing)return json({error:'An account with that phone number or email already exists.'},409);
    const passwordHash=await hashPassword(password);
    const inserted=await env.DB.prepare('INSERT INTO users (email,phone,name,password_hash,square_customer_id) VALUES (?,?,?,?,NULL)').bind(email,phone,name,passwordHash).run();
    const userId=inserted.meta.last_row_id;
    let squareCustomer=null;
    try{squareCustomer=await ensureSquareCustomer(env,{name:firstName,lastName,phone,email});if(squareCustomer?.id)await env.DB.prepare('UPDATE users SET square_customer_id=? WHERE id=?').bind(squareCustomer.id,userId).run();}catch(e){console.log('Square customer link failed',e?.message);}
    const row=await env.DB.prepare('SELECT id,email,phone,name,square_customer_id FROM users WHERE id=?').bind(userId).first();
    const sessionId=await createSession(userId,env);
    return json({ok:true,user:{...publicUser(row),address:null}},201,{'Set-Cookie':sessionCookie(sessionId)});
  }catch(e){console.log('signup error',e);return json({error:'Unable to create account right now.'},500);}
}
async function login(request,env){
  if(!env.DB)return json({error:'Customer database is not connected.'},503);
  try{
    await ensureAdminSchema(env);
    const body=await request.json(),phone=normalizePhone(body.phone),password=String(body.password||'');
    if(!phone||!password)return json({error:'Enter your phone number and password.'},400);
    const row=await env.DB.prepare('SELECT id,email,phone,name,password_hash,square_customer_id,COALESCE(is_disabled,0) AS is_disabled FROM users WHERE phone=? LIMIT 1').bind(phone).first();
    if(!row||!(await verifyPassword(password,row.password_hash)))return json({error:'Phone number or password does not match.'},401);
    if(Number(row.is_disabled)===1)return json({error:'This account has been disabled. Please contact Southern Nutrition.'},403);
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(new Date().toISOString()).run();
    const sessionId=await createSession(row.id,env);
    const address=await getSavedAddress(env,row.id); return json({ok:true,user:{...publicUser(row),address}},200,{'Set-Cookie':sessionCookie(sessionId)});
  }catch(e){console.log('login error',e);return json({error:'Unable to log in right now.'},500);}
}
async function logout(request,env){
  const id=parseCookies(request)[SESSION_COOKIE]; if(id&&env.DB)await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(id).run();
  return json({ok:true},200,{'Set-Cookie':clearSessionCookie()});
}
async function me(request,env){
  const row=await getSessionUser(request,env);
  if(!row) return json({authenticated:false,user:null});
  const address=await getSavedAddress(env,row.id);
  return json({authenticated:true,user:{...publicUser(row),address}});
}

async function ensureAdminSchema(env){
  if(!env.DB) return false;
  const additions=[
    ['is_admin',`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`],
    ['is_disabled',`ALTER TABLE users ADD COLUMN is_disabled INTEGER NOT NULL DEFAULT 0`]
  ];
  for(const [column,sql] of additions){
    try{await env.DB.prepare(`SELECT ${column} FROM users LIMIT 1`).first();}
    catch(e){
      const msg=String(e?.message||e);
      if(!new RegExp(`${column}|no such column`,'i').test(msg)) throw e;
      try{await env.DB.prepare(sql).run();}
      catch(alterError){if(!/duplicate column|already exists/i.test(String(alterError?.message||alterError))) throw alterError;}
    }
  }
  return true;
}
async function adminSession(request,env){
  const user=await getSessionUser(request,env);
  if(!user) return {user:null,admin:false};
  await ensureAdminSchema(env);
  const access=await env.DB.prepare('SELECT is_admin,is_disabled FROM users WHERE id=? LIMIT 1').bind(user.id).first();
  return {user,admin:Number(access?.is_admin)===1&&Number(access?.is_disabled)!==1};
}
async function adminMe(request,env){
  if(!env.DB) return json({error:'Customer database is not connected.'},503);
  try{
    const access=await adminSession(request,env);
    return json({authenticated:Boolean(access.user),admin:access.admin,user:access.user?publicUser(access.user):null});
  }catch(e){console.log('admin me error',e);return json({error:'Unable to check admin access right now.'},500);}
}
async function getLoyaltyForCustomers(env,customerIds){
  const map=new Map();
  if(!env.SQUARE_ACCESS_TOKEN||!customerIds.length)return {available:false,map,error:null};
  try{
    for(let i=0;i<customerIds.length;i+=30){
      const chunk=customerIds.slice(i,i+30);
      const data=await squareRequest(env,'/v2/loyalty/accounts/search',{method:'POST',body:JSON.stringify({query:{customer_ids:chunk},limit:200})});
      for(const account of data.loyalty_accounts||[]){
        if(account.customer_id) map.set(account.customer_id,{accountId:account.id,balance:Number(account.balance||0),lifetimePoints:Number(account.lifetime_points||0),enrolledAt:account.enrolled_at||null});
      }
    }
    return {available:true,map,error:null};
  }catch(e){
    console.log('admin loyalty lookup error',e?.message||e);
    return {available:false,map,error:e?.message||'Square Loyalty is not available.'};
  }
}
async function adminUsers(request,env){
  if(!env.DB) return json({error:'Customer database is not connected.'},503);
  try{
    const access=await adminSession(request,env);
    if(!access.user) return json({error:'Log in to continue.'},401);
    if(!access.admin) return json({error:'Admin access required.'},403);
    await ensureAdminSchema(env);
    await ensureAddressSchema(env);
    const url=new URL(request.url);
    const q=String(url.searchParams.get('q')||'').trim().slice(0,100);
    const like=`%${q.replaceAll('%','\\%').replaceAll('_','\\_')}%`;
    const fields=`id,name,phone,email,square_customer_id,created_at,is_disabled,is_admin,address_street,address_unit,address_city,address_state,address_zip,address_workplace,address_instructions`;
    const query=q
      ? `SELECT ${fields} FROM users WHERE CAST(id AS TEXT) LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR address_street LIKE ? ESCAPE '\\' OR address_city LIKE ? ESCAPE '\\' OR address_zip LIKE ? ESCAPE '\\' OR address_workplace LIKE ? ESCAPE '\\' ORDER BY created_at DESC`
      : `SELECT ${fields} FROM users ORDER BY created_at DESC`;
    const result=q
      ? await env.DB.prepare(query).bind(like,like,like,like,like,like,like,like).all()
      : await env.DB.prepare(query).all();
    const statsRow=await env.DB.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN square_customer_id IS NOT NULL AND square_customer_id <> '' THEN 1 ELSE 0 END) AS square_linked, SUM(CASE WHEN datetime(created_at) >= datetime('now','-7 days') THEN 1 ELSE 0 END) AS recent_7, SUM(CASE WHEN COALESCE(is_disabled,0)=1 THEN 1 ELSE 0 END) AS disabled FROM users`).first();
    const ids=[...new Set((result.results||[]).map(r=>r.square_customer_id).filter(Boolean))];
    const loyalty=await getLoyaltyForCustomers(env,ids);
    const users=(result.results||[]).map(row=>{
      const loyaltyAccount=row.square_customer_id?loyalty.map.get(row.square_customer_id):null;
      const address=row.address_street?{street:row.address_street||'',unit:row.address_unit||'',city:row.address_city||'',state:row.address_state||'',zip:row.address_zip||'',workplace:row.address_workplace||'',instructions:row.address_instructions||''}:null;
      return {id:row.id,name:row.name,phone:row.phone,email:row.email,squareLinked:Boolean(row.square_customer_id),createdAt:row.created_at,disabled:Number(row.is_disabled)===1,isAdmin:Number(row.is_admin)===1,loyalty:loyaltyAccount||null,address};
    });
    return json({users,stats:{total:Number(statsRow?.total||0),squareLinked:Number(statsRow?.square_linked||0),recent7Days:Number(statsRow?.recent_7||0),disabled:Number(statsRow?.disabled||0)},loyalty:{available:loyalty.available,error:loyalty.error}});
  }catch(e){console.log('admin users error',e);return json({error:'Unable to load customer accounts right now.'},500);}
}
async function adminUpdateUser(request,env,userId){
  if(!env.DB) return json({error:'Customer database is not connected.'},503);
  try{
    const access=await adminSession(request,env);
    if(!access.user) return json({error:'Log in to continue.'},401);
    if(!access.admin) return json({error:'Admin access required.'},403);
    await ensureAdminSchema(env);
    const id=Number(userId); if(!Number.isInteger(id)||id<1)return json({error:'Invalid customer account.'},400);
    const existing=await env.DB.prepare('SELECT id,name,phone,email,is_admin,is_disabled FROM users WHERE id=? LIMIT 1').bind(id).first();
    if(!existing)return json({error:'Customer account not found.'},404);
    const body=await request.json();
    const name=String(body.name??existing.name??'').trim().slice(0,80);
    const phone=normalizePhone(body.phone??existing.phone);
    const email=normalizeEmail(body.email??existing.email);
    const disabled=Boolean(body.disabled);
    const newPassword=String(body.newPassword||'');
    if(!name)return json({error:'Name cannot be blank.'},400);
    if(!phone)return json({error:'Enter a valid 10-digit phone number.'},400);
    if(!email||!validEmail(email))return json({error:'Enter a valid email address.'},400);
    if(newPassword&&newPassword.length<8)return json({error:'New password must be at least 8 characters.'},400);
    if(id===Number(access.user.id)&&disabled)return json({error:'You cannot disable your own admin account.'},400);
    const duplicate=await env.DB.prepare('SELECT id FROM users WHERE (phone=? OR email=?) AND id<>? LIMIT 1').bind(phone,email,id).first();
    if(duplicate)return json({error:'Another account already uses that phone number or email.'},409);
    await env.DB.prepare('UPDATE users SET name=?,phone=?,email=?,is_disabled=? WHERE id=?').bind(name,phone,email,disabled?1:0,id).run();
    let passwordReset=false;
    if(newPassword){
      const passwordHash=await hashPassword(newPassword);
      await env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(passwordHash,id).run();
      await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(id).run();
      passwordReset=true;
    }
    if(disabled) await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(id).run();
    const row=await env.DB.prepare('SELECT id,name,phone,email,square_customer_id,created_at,is_disabled,is_admin FROM users WHERE id=?').bind(id).first();
    return json({ok:true,user:{id:row.id,name:row.name,phone:row.phone,email:row.email,squareLinked:Boolean(row.square_customer_id),createdAt:row.created_at,disabled:Number(row.is_disabled)===1,isAdmin:Number(row.is_admin)===1},passwordReset,selfSessionCleared:passwordReset&&id===Number(access.user.id)});
  }catch(e){console.log('admin update user error',e);return json({error:'Unable to update this customer account right now.'},500);}
}

function businessNowParts(){
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Chicago',
    year:'numeric',
    month:'2-digit',
    day:'2-digit',
    hour:'2-digit',
    minute:'2-digit',
    hourCycle:'h23'
  }).formatToParts(new Date());
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return {year:+v.year,month:+v.month,day:+v.day,hour:+v.hour,minute:+v.minute};
}
function parseRequestedTime(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if(!m) return null;
  return {year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5]};
}
function minuteStamp(p){return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)/60000;}
function validateRequestedTime(value){
  const requested=parseRequestedTime(value);
  if(!requested) return 'Choose a requested delivery date and time.';
  const check=new Date(Date.UTC(requested.year,requested.month-1,requested.day,requested.hour,requested.minute));
  if(check.getUTCFullYear()!==requested.year||check.getUTCMonth()+1!==requested.month||check.getUTCDate()!==requested.day)
    return 'Choose a valid delivery date and time.';
  if(minuteStamp(requested)<=minuteStamp(businessNowParts()))
    return 'Choose a delivery time in the future.';
  const minutes=requested.hour*60+requested.minute;
  if(minutes<6*60||minutes>=18*60)
    return 'Requested delivery times must be between 6:00 AM and 6:00 PM Central.';
  return '';
}


async function ensureDeliverySlotSchema(env){
  if(!env.DB) return false;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS delivery_slots (
    slot_start TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'booked',
    user_id INTEGER,
    payment_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return true;
}
function validDeliveryDate(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;
  const p={year:+m[1],month:+m[2],day:+m[3]};
  const d=new Date(Date.UTC(p.year,p.month-1,p.day));
  if(d.getUTCFullYear()!==p.year||d.getUTCMonth()+1!==p.month||d.getUTCDate()!==p.day) return null;
  return p;
}
function deliverySlotLabel(hour,minute){
  const fmt=(h,m)=>`${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
  const total=hour*60+minute+30;
  return `${fmt(hour,minute)}–${fmt(Math.floor(total/60),total%60)}`;
}
async function deliverySlots(request,env){
  if(!env.DB) return json({error:'Delivery scheduling database is not connected.'},503);
  try{
    await ensureDeliverySlotSchema(env);
    const date=new URL(request.url).searchParams.get('date');
    const d=validDeliveryDate(date);
    if(!d) return json({error:'Choose a valid delivery date.'},400);
    const now=businessNowParts();
    if(Date.UTC(d.year,d.month-1,d.day)<Date.UTC(now.year,now.month-1,now.day))
      return json({date,slots:[]});
    const rows=await env.DB.prepare(
      `SELECT slot_start FROM delivery_slots WHERE slot_start LIKE ? AND status='booked'`
    ).bind(`${date}T%`).all();
    const taken=new Set((rows.results||[]).map(r=>r.slot_start));
    const slots=[];
    for(let mins=6*60;mins<18*60;mins+=30){
      const hour=Math.floor(mins/60),minute=mins%60;
      const start=`${date}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
      const future=minuteStamp({year:d.year,month:d.month,day:d.day,hour,minute})>minuteStamp(now);
      slots.push({start,label:deliverySlotLabel(hour,minute),available:future&&!taken.has(start)});
    }
    return json({date,slots});
  }catch(e){
    console.log('delivery slots error',e);
    return json({error:'Unable to load delivery windows.'},500);
  }
}
async function reserveDeliverySlot(env,start,userId){
  await ensureDeliverySlotSchema(env);
  try{
    await env.DB.prepare(
      `INSERT INTO delivery_slots(slot_start,status,user_id) VALUES (?,'booked',?)`
    ).bind(start,userId||null).run();
    return true;
  }catch(e){
    if(/unique|constraint/i.test(String(e?.message||e))) return false;
    throw e;
  }
}
async function releaseDeliverySlot(env,start){
  try{
    await env.DB.prepare(`DELETE FROM delivery_slots WHERE slot_start=? AND payment_id IS NULL`).bind(start).run();
  }catch(e){
    console.log('delivery slot release error',e);
  }
}


function centralRequestedTimeToRFC3339(value){
  const p=parseRequestedTime(value);
  if(!p) throw new Error('Choose an available delivery window.');
  const target=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute);
  let guess=target;
  const formatter=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
  });
  for(let i=0;i<2;i++){
    const parts=Object.fromEntries(formatter.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));
    const represented=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);
    guess+=target-represented;
  }
  return new Date(guess).toISOString();
}
function squareAddress(addr){
  return {
    address_line_1:String(addr.street||'').trim().slice(0,500),
    ...(String(addr.unit||'').trim()?{address_line_2:String(addr.unit).trim().slice(0,500)}:{}),
    locality:String(addr.city||'').trim().slice(0,255),
    administrative_district_level_1:String(addr.state||'').trim().toUpperCase().slice(0,3),
    postal_code:String(addr.zip||'').trim().slice(0,20),
    country:'US'
  };
}
function buildSquareOrder(order,body,customerId){
  const addr=body.deliveryAddress||{};
  const customerName=`${String(body.customer?.name||'').trim()} ${String(body.customer?.lastName||'').trim()}`.trim().slice(0,255);
  const customerPhone=normalizePhone(body.customer?.phone)||String(body.customer?.phone||'').trim().slice(0,17);
  const email=normalizeEmail(body.customer?.email||'');
  const dropoff=[
    String(addr.workplace||'').trim()?`Workplace: ${String(addr.workplace).trim()}`:'',
    String(addr.instructions||'').trim(),
    String(body.notes||'').trim()?`Order notes: ${String(body.notes).trim()}`:''
  ].filter(Boolean).join(' | ').slice(0,550);
  const squareOrder={
    location_id:'',
    source:{name:'Southern Nutrition Website'},
    line_items:order.lineItems,
    pricing_options:{auto_apply_taxes:true},
    fulfillments:[{
      type:'DELIVERY',
      state:'PROPOSED',
      delivery_details:{
        recipient:{
          display_name:customerName,
          phone_number:customerPhone,
          ...(email?{email_address:email}:{}),
          address:squareAddress(addr)
        },
        schedule_type:'SCHEDULED',
        deliver_at:centralRequestedTimeToRFC3339(body.requestedTime),
        delivery_window_duration:'PT30M',
        ...(dropoff?{dropoff_notes:dropoff}:{})
      }
    }]
  };
  if(customerId) squareOrder.customer_id=customerId;
  if(order.discount>0){
    squareOrder.discounts=[{
      uid:'group-discount',
      name:'10+ Drink Discount',
      type:'FIXED_AMOUNT',
      amount_money:{amount:order.discount,currency:'USD'},
      scope:'ORDER'
    }];
  }
  return squareOrder;
}
async function calculateSquareOrder(env,order,body,customerId){
  const squareOrder=buildSquareOrder(order,body,customerId);
  squareOrder.location_id=env.SQUARE_LOCATION_ID;
  const data=await squareRequest(env,'/v2/orders/calculate',{
    method:'POST',
    body:JSON.stringify({order:squareOrder})
  });
  return data.order;
}
async function createSquareOrder(env,order,body,customerId){
  const squareOrder=buildSquareOrder(order,body,customerId);
  squareOrder.location_id=env.SQUARE_LOCATION_ID;
  const data=await squareRequest(env,'/v2/orders',{
    method:'POST',
    body:JSON.stringify({idempotency_key:crypto.randomUUID(),order:squareOrder})
  });
  return data.order;
}
async function cancelSquareOrder(env,order){
  if(!order?.id||order.version==null)return;
  try{
    await squareRequest(env,`/v2/orders/${encodeURIComponent(order.id)}`,{
      method:'PUT',
      body:JSON.stringify({order:{location_id:env.SQUARE_LOCATION_ID,state:'CANCELED',version:order.version},fields_to_clear:[]})
    });
  }catch(e){console.log('Square order cleanup error',e);}
}
async function orderPreview(request,env){
  try{
    if(!env.SQUARE_ACCESS_TOKEN||!env.SQUARE_LOCATION_ID)return json({error:'Square is not configured on the server yet.'},503);
    const body=await request.json();
    const requestedTimeError=validateRequestedTime(body.requestedTime);
    if(requestedTimeError)return json({error:requestedTimeError},400);
    const order=calculateOrder(body.cart,body.tipCents);
    const user=await getSessionUser(request,env);
    const calculated=await calculateSquareOrder(env,order,body,user?.square_customer_id||null);
    const subtotal=Number(calculated?.total_money?.amount||0);
    const tax=Number(calculated?.total_tax_money?.amount||0);
    return json({
      subtotalBeforeTip:subtotal,
      tax,
      tipCents:order.tipCents,
      total:subtotal+order.tipCents
    });
  }catch(e){
    return json({error:e?.message||'Unable to calculate tax.'},400);
  }
}


function escHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function moneyText(cents){ return `$${(Number(cents||0)/100).toFixed(2)}`; }
function deliveryWindowText(requestedTime){
  const p=parseRequestedTime(requestedTime);
  if(!p)return String(requestedTime||'');
  const start=new Date(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute));
  const end=new Date(start.getTime()+30*60000);
  const dateFmt=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
  const timeFmt=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',hour:'numeric',minute:'2-digit'});
  return `${dateFmt.format(start)} • ${timeFmt.format(start)}–${timeFmt.format(end)}`;
}
async function sendNewOrderEmail(env,{body,order,squareOrder,payment,tax,charged}){
  if(!env.EMAIL)return null;
  const addr=body.deliveryAddress||{};
  const customer=body.customer||{};
  const window=deliveryWindowText(body.requestedTime);
  const address=[addr.street,addr.unit,`${addr.city||''}, ${addr.state||''} ${addr.zip||''}`.trim()].filter(Boolean).join('\n');
  const items=(order.items||[]).map(x=>`• ${x}`).join('\n');
  const subject=`NEW SOUTHERN NUTRITION ORDER — ${window}`.slice(0,200);
  const text=[
    'NEW SOUTHERN NUTRITION ORDER','',
    `Delivery: ${window}`,
    `Customer: ${`${customer.name||''} ${customer.lastName||''}`.trim()}`,
    `Phone: ${customer.phone||''}`,
    customer.email?`Email: ${customer.email}`:'',
    addr.workplace?`Workplace: ${addr.workplace}`:'',
    '', 'DELIVERY ADDRESS', address,
    addr.instructions?`Instructions: ${addr.instructions}`:'',
    body.notes?`Order notes: ${body.notes}`:'',
    '', 'ORDER', items,
    '', `Subtotal: ${moneyText(order.subtotal)}`,
    order.discount?`Group discount: -${moneyText(order.discount)}`:'',
    `Sales tax: ${moneyText(tax)}`,
    `Tip: ${moneyText(order.tipCents)}`,
    `TOTAL: ${moneyText(charged)}`,
    '', `Square Order: ${squareOrder?.id||''}`,
    `Payment: ${payment?.id||''}`
  ].filter(Boolean).join('\n');
  const itemHtml=(order.items||[]).map(x=>`<li>${escHtml(x)}</li>`).join('');
  const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
    <h1 style="margin-bottom:6px">New Southern Nutrition Order</h1>
    <h2 style="margin-top:0">${escHtml(window)}</h2>
    <p><strong>${escHtml(`${customer.name||''} ${customer.lastName||''}`.trim())}</strong><br>${escHtml(customer.phone||'')}${customer.email?`<br>${escHtml(customer.email)}`:''}</p>
    ${addr.workplace?`<p><strong>Workplace:</strong> ${escHtml(addr.workplace)}</p>`:''}
    <h3>Delivery address</h3><p>${escHtml(address).replace(/\n/g,'<br>')}</p>
    ${addr.instructions?`<p><strong>Instructions:</strong> ${escHtml(addr.instructions)}</p>`:''}
    ${body.notes?`<p><strong>Order notes:</strong> ${escHtml(body.notes)}</p>`:''}
    <h3>Order</h3><ul>${itemHtml}</ul>
    <p>Subtotal: <strong>${moneyText(order.subtotal)}</strong><br>
    ${order.discount?`Group discount: <strong>-${moneyText(order.discount)}</strong><br>`:''}
    Sales tax: <strong>${moneyText(tax)}</strong><br>Tip: <strong>${moneyText(order.tipCents)}</strong><br>
    <span style="font-size:20px">Total: <strong>${moneyText(charged)}</strong></span></p>
    <p style="font-size:12px;color:#555">Square Order: ${escHtml(squareOrder?.id||'')}<br>Payment: ${escHtml(payment?.id||'')}</p>
  </div>`;
  return env.EMAIL.send({
    to:'Ashley.lewis0311@icloud.com',
    from:{email:'orders@getsouthernnutrition.com',name:'Southern Nutrition'},
    subject,html,text
  });
}

async function payment(request, env){
  let reservedSlot='',squareOrder=null;
  try{
    if(!env.SQUARE_ACCESS_TOKEN||!env.SQUARE_LOCATION_ID) return json({error:'Square is not configured on the server yet.'},503);
    const body=await request.json();
    if(!body.sourceId) return json({error:'Missing Square payment token.'},400);
    const requestedTimeError=validateRequestedTime(body.requestedTime);
    if(requestedTimeError) return json({error:requestedTimeError},400);

    const slotUser=env.DB?await getSessionUser(request,env):null;
    if(env.DB){
      const reserved=await reserveDeliverySlot(env,body.requestedTime,slotUser?.id);
      if(!reserved) return json({error:'That delivery window was just taken. Please choose another available time.'},409);
      reservedSlot=body.requestedTime;
    }

    const order=calculateOrder(body.cart,body.tipCents);
    const customerName=`${String(body.customer?.name||'').trim()} ${String(body.customer?.lastName||'').trim()}`.trim().slice(0,100);
    const customerPhone=String(body.customer?.phone||'').trim().slice(0,30);
    if(!String(body.customer?.name||'').trim()||!String(body.customer?.lastName||'').trim()||!customerPhone) throw new Error('First name, last name, and phone are required.');

    const addr=body.deliveryAddress||{};
    const street=String(addr.street||'').trim(),city=String(addr.city||'').trim(),state=String(addr.state||'').trim(),zip=String(addr.zip||'').trim();
    if(!street||!city||!state||!zip) throw new Error('Complete delivery address is required.');

    const user=slotUser||await getSessionUser(request,env);
    squareOrder=await createSquareOrder(env,order,body,user?.square_customer_id||null);
    const orderAmount=Number(squareOrder?.total_money?.amount);
    if(!squareOrder?.id||!Number.isInteger(orderAmount)||orderAmount<0) throw new Error('Square could not calculate the order total.');

    const squareBody={
      source_id:body.sourceId,
      idempotency_key:crypto.randomUUID(),
      amount_money:{amount:orderAmount,currency:'USD'},
      ...(order.tipCents?{tip_money:{amount:order.tipCents,currency:'USD'}}:{}),
      location_id:env.SQUARE_LOCATION_ID,
      order_id:squareOrder.id,
      autocomplete:true,
      note:`Southern Nutrition website delivery — ${body.requestedTime}`.slice(0,500)
    };
    if(body.customer?.email) squareBody.buyer_email_address=String(body.customer.email).trim().slice(0,254);
    if(user?.square_customer_id) squareBody.customer_id=user.square_customer_id;

    const response=await fetch(`${squareBase(env)}/v2/payments`,{
      method:'POST',
      headers:{Authorization:`Bearer ${env.SQUARE_ACCESS_TOKEN}`,'Square-Version':'2026-08-19','Content-Type':'application/json'},
      body:JSON.stringify(squareBody)
    });
    const result=await response.json();
    if(!response.ok){
      await cancelSquareOrder(env,squareOrder);
      squareOrder=null;
      if(env.DB&&reservedSlot){await releaseDeliverySlot(env,reservedSlot);reservedSlot='';}
      return json({error:result?.errors?.[0]?.detail||'Square declined or could not process the payment.'},response.status>=500?502:400);
    }

    if(env.DB&&reservedSlot){
      await env.DB.prepare(`UPDATE delivery_slots SET payment_id=? WHERE slot_start=?`).bind(result.payment?.id||'',reservedSlot).run();
      reservedSlot='';
    }
    const tax=Number(squareOrder?.total_tax_money?.amount||0);
    const charged=orderAmount+order.tipCents;
    let orderEmailId=null;
    try{
      const sent=await sendNewOrderEmail(env,{body,order,squareOrder,payment:result.payment,tax,charged});
      orderEmailId=sent?.messageId||null;
    }catch(emailError){
      console.error('New-order email failed',emailError?.code||'',emailError?.message||emailError);
    }
    return json({
      ok:true,
      paymentId:result.payment?.id,
      orderId:squareOrder.id,
      receiptUrl:result.payment?.receipt_url||null,
      amount:charged,
      subtotal:order.subtotal,
      tax,
      tipCents:order.tipCents,
      discount:order.discount,
      status:result.payment?.status||'COMPLETED',
      orderEmailSent:Boolean(orderEmailId),
      customerLinked:Boolean(user?.square_customer_id)
    });
  }catch(e){
    if(squareOrder) await cancelSquareOrder(env,squareOrder);
    if(env.DB&&reservedSlot) await releaseDeliverySlot(env,reservedSlot);
    return json({error:e?.message||'Unable to process payment.'},400);
  }
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
    if(url.pathname==='/api/account/address' && (request.method==='GET'||request.method==='PUT')) return savedAddress(request,env);
    if(url.pathname==='/api/admin/me' && request.method==='GET') return adminMe(request,env);
    if(url.pathname==='/api/admin/users' && request.method==='GET') return adminUsers(request,env);
    if(url.pathname.startsWith('/api/admin/users/') && request.method==='PATCH') return adminUpdateUser(request,env,url.pathname.split('/').pop());
    if(url.pathname==='/api/delivery-slots' && request.method==='GET') return deliverySlots(request,env);
    if(url.pathname==='/api/order-preview' && request.method==='POST') return orderPreview(request,env);
    if(url.pathname==='/api/payment' && request.method==='POST') return payment(request,env);
    if((url.pathname==='/admin'||url.pathname==='/admin/') && request.method==='GET'){
      const adminUrl=new URL('/admin.html',request.url);
      const response=await env.ASSETS.fetch(new Request(adminUrl,{method:'GET',headers:request.headers}));
      const headers=new Headers(response.headers);
      headers.set('Cache-Control','no-store');
      headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
      headers.set('X-Frame-Options','DENY');
      headers.set('Referrer-Policy','no-referrer');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    return env.ASSETS.fetch(request);
  }
};
