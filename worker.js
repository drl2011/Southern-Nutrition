const MENU = {
  'build-your-own': { name: 'Build Your Own Loaded Tea', tea: true },
  'hot-mess': { name: 'Hot Mess', tea: true },
  'purple-paradise': { name: 'Purple Paradise', tea: true },
  'peach-perfect': { name: 'Peach Perfect', tea: true },
  'blueberry-bliss': { name: 'Blueberry Bliss', tea: true }
};
const ADDONS = { fiber:350, collagen:350, aloe:100, liftoff:350 };
const ALLOWED_FLAVORS = new Set(['Strawberry','Watermelon','Tropical Fruit','Grape','Peach','Pineapple','Blueberry','Lemon','Lavender','Cherry','Piña Colada','Margarita','Blackberry','Melon','Rainbow Candy','Mango','Raspberry','Orange','Lemon-Lime','Blue Raspberry']);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
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
async function payment(request, env){
  try{
    if(!env.SQUARE_ACCESS_TOKEN||!env.SQUARE_LOCATION_ID) return json({error:'Square is not configured on the server yet.'},503);
    const body=await request.json(); if(!body.sourceId) return json({error:'Missing Square payment token.'},400);
    const order=calculateOrder(body.cart,body.tipCents);
    const fulfillment='DELIVERY';
    const customerName=String(body.customer?.name||'').trim().slice(0,100), customerPhone=String(body.customer?.phone||'').trim().slice(0,30);
    if(!customerName||!customerPhone) return json({error:'Name and phone are required.'},400);
    const addr=body.deliveryAddress||{}; const street=String(addr.street||'').trim().slice(0,120), city=String(addr.city||'').trim().slice(0,80), state=String(addr.state||'').trim().slice(0,20), zip=String(addr.zip||'').trim().slice(0,20); if(!street||!city||!state||!zip) return json({error:'Complete delivery address is required.'},400); const addressText=[String(addr.workplace||'').trim().slice(0,100),street,String(addr.unit||'').trim().slice(0,50),`${city}, ${state} ${zip}`].filter(Boolean).join(', ');
    const endpoint=env.SQUARE_ENVIRONMENT==='production'?'https://connect.squareup.com/v2/payments':'https://connect.squareupsandbox.com/v2/payments';
    const notes=[`Southern Nutrition - ${fulfillment}`,order.items.join(', '),order.discount?`Group discount: -$${(order.discount/100).toFixed(2)}`:'',order.tipCents?`Tip: $${(order.tipCents/100).toFixed(2)}`:'No tip',body.requestedTime?`Requested: ${String(body.requestedTime).slice(0,40)}`:'',`Address: ${addressText}`,addr.instructions?`Delivery instructions: ${String(addr.instructions).slice(0,180)}`:'',body.notes?`Notes: ${String(body.notes).slice(0,180)}`:'',`Customer: ${customerName} / ${customerPhone}`].filter(Boolean);
    const squareBody={source_id:body.sourceId,idempotency_key:crypto.randomUUID(),amount_money:{amount:order.amount,currency:'USD'},location_id:env.SQUARE_LOCATION_ID,autocomplete:true,note:notes.join(' | ').slice(0,500)};
    if(body.customer?.email) squareBody.buyer_email_address=String(body.customer.email).trim().slice(0,254);
    const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${env.SQUARE_ACCESS_TOKEN}`,'Square-Version':'2026-08-19','Content-Type':'application/json'},body:JSON.stringify(squareBody)});
    const result=await response.json();
    if(!response.ok) return json({error:result?.errors?.[0]?.detail||'Square declined or could not process the payment.'},response.status>=500?502:400);
    return json({ok:true,paymentId:result.payment?.id,receiptUrl:result.payment?.receipt_url||null,amount:order.amount,subtotal:order.subtotal,tipCents:order.tipCents,discount:order.discount,status:result.payment?.status||'COMPLETED'});
  }catch(e){ return json({error:e?.message||'Unable to process payment.'},400); }
}
export default {
  async fetch(request, env){
    const url=new URL(request.url);
    if(url.pathname==='/api/config' && request.method==='GET'){
      const configured=Boolean(env.SQUARE_APPLICATION_ID&&env.SQUARE_LOCATION_ID);
      return json({configured,applicationId:configured?env.SQUARE_APPLICATION_ID:null,locationId:configured?env.SQUARE_LOCATION_ID:null,environment:env.SQUARE_ENVIRONMENT==='production'?'production':'sandbox'});
    }
    if(url.pathname==='/api/payment' && request.method==='POST') return payment(request,env);
    return env.ASSETS.fetch(request);
  }
};
