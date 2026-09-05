const $=id=>document.getElementById(id);
const loading=$('adminLoading'), loginView=$('adminLogin'), deniedView=$('adminDenied'), dashboard=$('adminDashboard');
const logoutButton=$('adminLogout');
let searchTimer=null, currentUsers=[];

function show(view){[loading,loginView,deniedView,dashboard].forEach(el=>el.classList.add('hidden'));view.classList.remove('hidden');}
function formatPhone(phone){const d=String(phone||'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:(phone||'—');}
function formatDate(value){if(!value)return '—';const d=new Date(value.endsWith?.('Z')?value:`${value.replace(' ','T')}Z`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function loyaltyText(u){if(!u.squareLinked)return 'Not linked';if(!u.loyalty)return 'No loyalty account';return `${u.loyalty.balance} pt${u.loyalty.balance===1?'':'s'}`;}
function formatAddress(a){if(!a?.street)return 'No saved address';return [a.workplace,a.street,a.unit,[a.city,a.state,a.zip].filter(Boolean).join(', ').replace(/, ([A-Z]{2})/,', $1')].filter(Boolean).join(' · ');}
function addressLines(a){if(!a?.street)return '<span class="admin-no-address">No saved address</span>';const place=a.workplace?`<strong>${esc(a.workplace)}</strong><br>`:'';const unit=a.unit?` ${esc(a.unit)}`:'';return `${place}${esc(a.street)}${unit}<br>${esc(a.city||'')}${a.city&&a.state?', ':''}${esc(a.state||'')} ${esc(a.zip||'')}`;}

async function api(path,options={}){
  const res=await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(data.error||'Request failed.');e.status=res.status;throw e;} return data;
}


async function loadDeliveryAvailability(){
  const toggle=$('deliveryAvailableToggle'), label=$('deliveryAvailableLabel'), msg=$('deliveryAvailabilityMessage');
  try{
    const data=await api('/api/admin/delivery-availability');
    toggle.checked=Boolean(data.available);
    label.textContent=data.available?'Available':'Not available';
    msg.textContent=data.available?'Customers can check out normally.':'Checkout is blocked. Customers will see “Delivery unavailable — please call us at 205-549-2444.”';
  }catch(e){msg.textContent=e.message;}
}
async function saveDeliveryAvailability(){
  const toggle=$('deliveryAvailableToggle'), label=$('deliveryAvailableLabel'), msg=$('deliveryAvailabilityMessage');
  toggle.disabled=true; msg.textContent='Saving…';
  try{
    const data=await api('/api/admin/delivery-availability',{method:'PUT',body:JSON.stringify({available:toggle.checked})});
    toggle.checked=Boolean(data.available);
    label.textContent=data.available?'Available':'Not available';
    msg.textContent=data.available?'Delivery checkout is available.':'Delivery checkout is unavailable. Customers will be told to call 205-549-2444.';
  }catch(e){toggle.checked=!toggle.checked;label.textContent=toggle.checked?'Available':'Not available';msg.textContent=e.message;}
  finally{toggle.disabled=false;}
}

async function resizeGalleryImage(file){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Unable to read that photo.'));r.readAsDataURL(file);});
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Unable to open that photo.'));i.src=dataUrl;});
  const make=(maxDim,quality)=>{
    const scale=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',quality);
  };
  let out=make(1000,.72); if(out.length>320000)out=make(800,.62); if(out.length>320000)out=make(640,.55); if(out.length>320000)out=make(520,.48);
  if(out.length>320000)throw new Error(`${file.name} is too large. Try a smaller photo.`);
  return out;
}
function renderGalleryAdmin(photos){
  const grid=$('adminGalleryGrid');
  grid.innerHTML=photos.length?photos.map(p=>`<article class="admin-gallery-photo"><img src="${p.imageUrl}" alt="${esc(p.caption||'Gallery photo')}"><div class="admin-gallery-photo-body"><small>${esc(p.caption||'No caption')}</small><button class="btn ghost admin-gallery-delete" type="button" data-delete-photo="${p.id}">Delete</button></div></article>`).join(''):'<div class="admin-empty">No gallery photos yet.</div>';
  grid.querySelectorAll('[data-delete-photo]').forEach(btn=>btn.addEventListener('click',async()=>{
    if(!confirm('Delete this photo from the website gallery?'))return;
    btn.disabled=true; $('galleryMessage').textContent='Deleting photo…';
    try{await api(`/api/admin/gallery/${btn.dataset.deletePhoto}`,{method:'DELETE'});$('galleryMessage').textContent='Photo deleted.';await loadGalleryAdmin();}
    catch(e){$('galleryMessage').textContent=e.message;btn.disabled=false;}
  }));
}
async function loadGalleryAdmin(){
  try{const data=await api('/api/admin/gallery');renderGalleryAdmin(data.photos||[]);}
  catch(e){$('galleryMessage').textContent=e.message;}
}
async function uploadGalleryPhotos(e){
  e.preventDefault();const files=[...$('galleryFiles').files];if(!files.length)return;
  const button=$('galleryUploadButton'),caption=$('galleryCaption').value.trim();button.disabled=true;
  try{
    for(let i=0;i<files.length;i++){
      $('galleryMessage').textContent=`Preparing photo ${i+1} of ${files.length}…`;
      const imageData=await resizeGalleryImage(files[i]);
      $('galleryMessage').textContent=`Uploading photo ${i+1} of ${files.length}…`;
      await api('/api/admin/gallery',{method:'POST',body:JSON.stringify({imageData,caption})});
    }
    $('galleryFiles').value='';$('galleryCaption').value='';$('galleryMessage').textContent=`Uploaded ${files.length} photo${files.length===1?'':'s'}.`;await loadGalleryAdmin();
  }catch(e){$('galleryMessage').textContent=e.message;}finally{button.disabled=false;}
}

async function checkAccess(){
  show(loading); logoutButton.classList.add('hidden');
  try{
    const data=await api('/api/admin/me');
    if(!data.authenticated){show(loginView);return;}
    if(!data.admin){$('adminDeniedMessage').textContent=`${data.user?.email||data.user?.phone||'This account'} is signed in, but it does not have admin permission.`;logoutButton.classList.remove('hidden');show(deniedView);return;}
    logoutButton.classList.remove('hidden');show(dashboard);await Promise.all([loadCustomers(),loadDeliveryAvailability(),loadGalleryAdmin()]);
  }catch(e){$('adminLoading').innerHTML=`<strong>Unable to check admin access.</strong><p>${esc(e.message)}</p>`;}
}

function renderUsers(rows){
  $('customerRows').innerHTML=rows.length?rows.map(u=>`<tr class="${u.disabled?'is-disabled':''}"><td><strong>${esc([u.name,u.lastName].filter(Boolean).join(' ')||'—')}</strong><small class="admin-id">#${u.id}${u.isAdmin?' · Admin':''}</small></td><td>${esc(formatPhone(u.phone))}</td><td>${esc(u.email||'—')}</td><td class="admin-address-cell">${addressLines(u.address)}</td><td><span class="square-pill ${u.squareLinked?'yes':''}">${u.squareLinked?'Linked':'Not linked'}</span></td><td><span class="loyalty-pill ${u.loyalty?'yes':''}">${esc(loyaltyText(u))}</span>${u.loyalty?`<small class="admin-id">${u.loyalty.lifetimePoints} lifetime</small>`:''}</td><td><span class="status-pill ${u.disabled?'disabled':'active'}">${u.disabled?'Disabled':'Active'}</span></td><td>${esc(formatDate(u.createdAt))}</td><td><button class="btn ghost admin-edit-button" data-edit-user="${u.id}">Edit</button></td></tr>`).join(''):`<tr><td colspan="9" class="admin-empty">No matching customer accounts.</td></tr>`;
  $('customerCards').innerHTML=rows.length?rows.map(u=>`<article class="admin-customer-card ${u.disabled?'is-disabled':''}"><div class="admin-card-title"><div><strong>${esc([u.name,u.lastName].filter(Boolean).join(' ')||'—')}</strong><small>#${u.id}${u.isAdmin?' · Admin':''}</small></div><span class="status-pill ${u.disabled?'disabled':'active'}">${u.disabled?'Disabled':'Active'}</span></div><div class="admin-customer-line"><span>Phone</span><span>${esc(formatPhone(u.phone))}</span></div><div class="admin-customer-line"><span>Email</span><span>${esc(u.email||'—')}</span></div><div class="admin-customer-line admin-address-line"><span>Address</span><span>${addressLines(u.address)}${u.address?.instructions?`<small class="admin-address-instructions">${esc(u.address.instructions)}</small>`:''}</span></div><div class="admin-customer-line"><span>Square</span><span>${u.squareLinked?'Linked':'Not linked'}</span></div><div class="admin-customer-line"><span>Loyalty</span><span>${esc(loyaltyText(u))}${u.loyalty?` · ${u.loyalty.lifetimePoints} lifetime`:''}</span></div><div class="admin-customer-line"><span>Joined</span><span>${esc(formatDate(u.createdAt))}</span></div><button class="btn ghost full admin-edit-button" data-edit-user="${u.id}">Edit customer</button></article>`).join(''):`<div class="admin-empty">No matching customer accounts.</div>`;
  document.querySelectorAll('[data-edit-user]').forEach(btn=>btn.addEventListener('click',()=>openEditUser(Number(btn.dataset.editUser))));
}

async function loadCustomers(){
  const q=$('customerSearch').value.trim();$('adminMessage').textContent='Loading customers…';
  try{
    const data=await api(`/api/admin/users${q?`?q=${encodeURIComponent(q)}`:''}`);
    $('statTotal').textContent=data.stats.total;$('statSquare').textContent=data.stats.squareLinked;$('statRecent').textContent=data.stats.recent7Days;$('statDisabled').textContent=data.stats.disabled;
    currentUsers=data.users||[];renderUsers(currentUsers);
    if(data.loyalty?.available){$('loyaltyStatus').textContent='Square Loyalty is connected. Point balances shown below are live from Square.';$('loyaltyStatus').className='admin-loyalty-note success';}
    else if(data.loyalty?.error){$('loyaltyStatus').textContent=`Loyalty balances are not available yet: ${data.loyalty.error}`;$('loyaltyStatus').className='admin-loyalty-note';}
    else{$('loyaltyStatus').textContent='Loyalty balances will appear automatically after Square Loyalty and the Square access token are connected.';$('loyaltyStatus').className='admin-loyalty-note';}
    $('adminMessage').textContent=`Showing ${currentUsers.length} account${currentUsers.length===1?'':'s'}.`;
  }catch(e){if(e.status===401||e.status===403){await checkAccess();return;}$('adminMessage').textContent=e.message;}
}

function openEditUser(id){
  const u=currentUsers.find(x=>x.id===id);if(!u)return;
  $('editUserId').value=u.id;$('editUserTitle').textContent=`Edit ${[u.name,u.lastName].filter(Boolean).join(' ')||'customer'}`;$('editUserName').value=u.name||'';$('editUserLastName').value=u.lastName||'';$('editUserPhone').value=formatPhone(u.phone)==='—'?'':formatPhone(u.phone);$('editUserEmail').value=u.email||'';$('editUserPassword').value='';$('editUserDisabled').checked=Boolean(u.disabled);$('editUserMessage').textContent='';
  $('editUserAddress').innerHTML=addressLines(u.address);$('editUserInstructions').textContent=u.address?.instructions?`Delivery instructions: ${u.address.instructions}`:'';
  $('editUserDialog').showModal();
}
function closeEdit(){if($('editUserDialog').open)$('editUserDialog').close();}
$('closeEditUser').addEventListener('click',closeEdit);$('cancelEditUser').addEventListener('click',closeEdit);
$('editUserDialog').addEventListener('click',e=>{if(e.target===$('editUserDialog'))closeEdit();});
$('editUserForm').addEventListener('submit',async e=>{
  e.preventDefault();const id=Number($('editUserId').value);const save=$('saveEditUser');save.disabled=true;$('editUserMessage').textContent='Saving…';
  try{
    const data=await api(`/api/admin/users/${id}`,{method:'PATCH',body:JSON.stringify({name:$('editUserName').value,lastName:$('editUserLastName').value,phone:$('editUserPhone').value,email:$('editUserEmail').value,newPassword:$('editUserPassword').value,disabled:$('editUserDisabled').checked})});
    if(data.selfSessionCleared){location.href='/admin';return;}
    closeEdit();await loadCustomers();$('adminMessage').textContent='Customer account updated.';
  }catch(err){$('editUserMessage').textContent=err.message;}finally{save.disabled=false;}
});

$('adminLoginForm').addEventListener('submit',async e=>{e.preventDefault();const button=$('adminLoginButton');button.disabled=true;$('adminLoginMessage').textContent='Logging in…';try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({phone:$('adminPhone').value,password:$('adminPassword').value})});$('adminPassword').value='';$('adminLoginMessage').textContent='';await checkAccess();}catch(err){$('adminLoginMessage').textContent=err.message;}finally{button.disabled=false;}});
async function logout(){try{await api('/api/auth/logout',{method:'POST',body:'{}'});}catch{}location.href='/admin';}
logoutButton.addEventListener('click',logout);$('adminDeniedLogout').addEventListener('click',logout);$('refreshCustomers').addEventListener('click',loadCustomers);$('customerSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadCustomers,250);});
checkAccess();

$('deliveryAvailableToggle').addEventListener('change',saveDeliveryAvailability);
$('galleryUploadForm').addEventListener('submit',uploadGalleryPhotos);
