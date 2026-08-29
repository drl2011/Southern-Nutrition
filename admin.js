const $=id=>document.getElementById(id);
const loading=$('adminLoading'), loginView=$('adminLogin'), deniedView=$('adminDenied'), dashboard=$('adminDashboard');
const logoutButton=$('adminLogout');
let searchTimer=null;

function show(view){[loading,loginView,deniedView,dashboard].forEach(el=>el.classList.add('hidden'));view.classList.remove('hidden');}
function formatPhone(phone){const d=String(phone||'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:(phone||'—');}
function formatDate(value){if(!value)return '—';const d=new Date(value.endsWith?.('Z')?value:`${value.replace(' ','T')}Z`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

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
    if(!data.admin){
      $('adminDeniedMessage').textContent=`${data.user?.email||data.user?.phone||'This account'} is signed in, but it does not have admin permission.`;
      logoutButton.classList.remove('hidden'); show(deniedView); return;
    }
    logoutButton.classList.remove('hidden'); show(dashboard); await loadCustomers();
  }catch(e){$('adminLoading').innerHTML=`<strong>Unable to check admin access.</strong><p>${esc(e.message)}</p>`;}
}

async function loadCustomers(){
  const q=$('customerSearch').value.trim(); $('adminMessage').textContent='Loading customers…';
  try{
    const data=await api(`/api/admin/users${q?`?q=${encodeURIComponent(q)}`:''}`);
    $('statTotal').textContent=data.stats.total;
    $('statSquare').textContent=data.stats.squareLinked;
    $('statRecent').textContent=data.stats.recent7Days;
    const rows=data.users||[];
    $('customerRows').innerHTML=rows.length?rows.map(u=>`<tr><td><strong>${esc(u.name||'—')}</strong></td><td>${esc(formatPhone(u.phone))}</td><td>${esc(u.email||'—')}</td><td><span class="square-pill ${u.squareLinked?'yes':''}">${u.squareLinked?'Linked':'Not linked'}</span></td><td>${esc(formatDate(u.createdAt))}</td></tr>`).join(''):`<tr><td colspan="5" class="admin-empty">No matching customer accounts.</td></tr>`;
    $('customerCards').innerHTML=rows.length?rows.map(u=>`<article class="admin-customer-card"><strong>${esc(u.name||'—')}</strong><div class="admin-customer-line"><span>Phone</span><span>${esc(formatPhone(u.phone))}</span></div><div class="admin-customer-line"><span>Email</span><span>${esc(u.email||'—')}</span></div><div class="admin-customer-line"><span>Square</span><span>${u.squareLinked?'Linked':'Not linked'}</span></div><div class="admin-customer-line"><span>Joined</span><span>${esc(formatDate(u.createdAt))}</span></div></article>`).join(''):`<div class="admin-empty">No matching customer accounts.</div>`;
    $('adminMessage').textContent=`Showing ${rows.length} account${rows.length===1?'':'s'}.`;
  }catch(e){
    if(e.status===401||e.status===403){await checkAccess();return;}
    $('adminMessage').textContent=e.message;
  }
}

$('adminLoginForm').addEventListener('submit',async e=>{
  e.preventDefault(); const button=$('adminLoginButton'); button.disabled=true; $('adminLoginMessage').textContent='Logging in…';
  try{
    await api('/api/auth/login',{method:'POST',body:JSON.stringify({phone:$('adminPhone').value,password:$('adminPassword').value})});
    $('adminPassword').value=''; $('adminLoginMessage').textContent=''; await checkAccess();
  }catch(err){$('adminLoginMessage').textContent=err.message;}finally{button.disabled=false;}
});
async function logout(){try{await api('/api/auth/logout',{method:'POST',body:'{}'});}catch{} location.href='/admin';}
logoutButton.addEventListener('click',logout); $('adminDeniedLogout').addEventListener('click',logout);
$('refreshCustomers').addEventListener('click',loadCustomers);
$('customerSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadCustomers,250);});
checkAccess();
