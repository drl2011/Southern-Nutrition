const $=id=>document.getElementById(id);
const loading=$('adminLoading'), loginView=$('adminLogin'), deniedView=$('adminDenied'), dashboard=$('adminDashboard');
const logoutButton=$('adminLogout');
let searchTimer=null, currentUsers=[];

function show(view){[loading,loginView,deniedView,dashboard].forEach(el=>el.classList.add('hidden'));view.classList.remove('hidden');}
function formatPhone(phone){const d=String(phone||'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:(phone||'—');}
function formatDate(value){if(!value)return '—';const d=new Date(value.endsWith?.('Z')?value:`${value.replace(' ','T')}Z`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function loyaltyText(u){if(!u.squareLinked)return 'Not linked';if(!u.loyalty)return 'No loyalty account';return `${u.loyalty.balance} pt${u.loyalty.balance===1?'':'s'}`;}

async function api(path,options={}){
  const res=await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(data.error||'Request failed.');e.status=res.status;throw e;} return data;
}

async function checkAccess(){
  show(loading); logoutButton.classList.add('hidden');
  try{
    const data=await api('/api/admin/me');
    if(!data.authenticated){show(loginView);return;}
    if(!data.admin){$('adminDeniedMessage').textContent=`${data.user?.email||data.user?.phone||'This account'} is signed in, but it does not have admin permission.`;logoutButton.classList.remove('hidden');show(deniedView);return;}
    logoutButton.classList.remove('hidden');show(dashboard);await loadCustomers();
  }catch(e){$('adminLoading').innerHTML=`<strong>Unable to check admin access.</strong><p>${esc(e.message)}</p>`;}
}

function renderUsers(rows){
  $('customerRows').innerHTML=rows.length?rows.map(u=>`<tr class="${u.disabled?'is-disabled':''}"><td><strong>${esc(u.name||'—')}</strong><small class="admin-id">#${u.id}${u.isAdmin?' · Admin':''}</small></td><td>${esc(formatPhone(u.phone))}</td><td>${esc(u.email||'—')}</td><td><span class="square-pill ${u.squareLinked?'yes':''}">${u.squareLinked?'Linked':'Not linked'}</span></td><td><span class="loyalty-pill ${u.loyalty?'yes':''}">${esc(loyaltyText(u))}</span>${u.loyalty?`<small class="admin-id">${u.loyalty.lifetimePoints} lifetime</small>`:''}</td><td><span class="status-pill ${u.disabled?'disabled':'active'}">${u.disabled?'Disabled':'Active'}</span></td><td>${esc(formatDate(u.createdAt))}</td><td><button class="btn ghost admin-edit-button" data-edit-user="${u.id}">Edit</button></td></tr>`).join(''):`<tr><td colspan="8" class="admin-empty">No matching customer accounts.</td></tr>`;
  $('customerCards').innerHTML=rows.length?rows.map(u=>`<article class="admin-customer-card ${u.disabled?'is-disabled':''}"><div class="admin-card-title"><div><strong>${esc(u.name||'—')}</strong><small>#${u.id}${u.isAdmin?' · Admin':''}</small></div><span class="status-pill ${u.disabled?'disabled':'active'}">${u.disabled?'Disabled':'Active'}</span></div><div class="admin-customer-line"><span>Phone</span><span>${esc(formatPhone(u.phone))}</span></div><div class="admin-customer-line"><span>Email</span><span>${esc(u.email||'—')}</span></div><div class="admin-customer-line"><span>Square</span><span>${u.squareLinked?'Linked':'Not linked'}</span></div><div class="admin-customer-line"><span>Loyalty</span><span>${esc(loyaltyText(u))}${u.loyalty?` · ${u.loyalty.lifetimePoints} lifetime`:''}</span></div><div class="admin-customer-line"><span>Joined</span><span>${esc(formatDate(u.createdAt))}</span></div><button class="btn ghost full admin-edit-button" data-edit-user="${u.id}">Edit customer</button></article>`).join(''):`<div class="admin-empty">No matching customer accounts.</div>`;
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
  $('editUserId').value=u.id;$('editUserTitle').textContent=`Edit ${u.name||'customer'}`;$('editUserName').value=u.name||'';$('editUserPhone').value=formatPhone(u.phone)==='—'?'':formatPhone(u.phone);$('editUserEmail').value=u.email||'';$('editUserPassword').value='';$('editUserDisabled').checked=Boolean(u.disabled);$('editUserMessage').textContent='';
  $('editUserDialog').showModal();
}
function closeEdit(){if($('editUserDialog').open)$('editUserDialog').close();}
$('closeEditUser').addEventListener('click',closeEdit);$('cancelEditUser').addEventListener('click',closeEdit);
$('editUserDialog').addEventListener('click',e=>{if(e.target===$('editUserDialog'))closeEdit();});
$('editUserForm').addEventListener('submit',async e=>{
  e.preventDefault();const id=Number($('editUserId').value);const save=$('saveEditUser');save.disabled=true;$('editUserMessage').textContent='Saving…';
  try{
    const data=await api(`/api/admin/users/${id}`,{method:'PATCH',body:JSON.stringify({name:$('editUserName').value,phone:$('editUserPhone').value,email:$('editUserEmail').value,newPassword:$('editUserPassword').value,disabled:$('editUserDisabled').checked})});
    if(data.selfSessionCleared){location.href='/admin';return;}
    closeEdit();await loadCustomers();$('adminMessage').textContent='Customer account updated.';
  }catch(err){$('editUserMessage').textContent=err.message;}finally{save.disabled=false;}
});

$('adminLoginForm').addEventListener('submit',async e=>{e.preventDefault();const button=$('adminLoginButton');button.disabled=true;$('adminLoginMessage').textContent='Logging in…';try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({phone:$('adminPhone').value,password:$('adminPassword').value})});$('adminPassword').value='';$('adminLoginMessage').textContent='';await checkAccess();}catch(err){$('adminLoginMessage').textContent=err.message;}finally{button.disabled=false;}});
async function logout(){try{await api('/api/auth/logout',{method:'POST',body:'{}'});}catch{}location.href='/admin';}
logoutButton.addEventListener('click',logout);$('adminDeniedLogout').addEventListener('click',logout);$('refreshCustomers').addEventListener('click',loadCustomers);$('customerSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadCustomers,250);});
checkAccess();
