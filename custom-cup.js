(() => {
  const ALLOWED_FLAVORS = [
    'Cherry',
    'Mango',
    'Strawberry',
    'Pina Colada',
    'Margarita',
    'Melon',
    'Blackberry',
    'Orange',
    'Grape',
    'Pineapple',
    'Lemonaid',
    'Watermelon'
  ];

  const FLAVOR_COLORS = {
    'Cherry': '#d7263d',
    'Mango': '#f6a623',
    'Strawberry': '#ef476f',
    'Pina Colada': '#f7e7a9',
    'Margarita': '#b8df65',
    'Melon': '#76d672',
    'Blackberry': '#5b2a86',
    'Orange': '#f47c20',
    'Grape': '#7651a8',
    'Pineapple': '#f4cf45',
    'Lemonaid': '#f6e95f',
    'Watermelon': '#ef5b63'
  };

  const style = document.createElement('style');
  style.textContent = `
    #snCustomCupWrap{
      display:none;
      margin:14px 0 20px;
      padding:16px 14px 18px;
      border:1px solid var(--line,#eadfd9);
      border-radius:18px;
      background:linear-gradient(145deg,#fffaf7,#fff);
      text-align:center;
    }
    #snCustomCupWrap.active{display:block}
    #snCustomCupWrap .sn-cup-label{
      margin:0 0 10px;
      font-size:12px;
      font-weight:800;
      color:var(--muted,#746b66);
    }
    #snCustomCup{
      position:relative;
      width:170px;
      height:245px;
      margin:0 auto;
      overflow:hidden;
      border:3px solid rgba(82,69,63,.28);
      border-top:5px solid rgba(82,69,63,.38);
      border-radius:18px 18px 34px 34px;
      background:linear-gradient(90deg,rgba(255,255,255,.82),rgba(250,250,250,.44),rgba(255,255,255,.78));
      box-shadow:inset 10px 0 18px rgba(255,255,255,.55), inset -8px 0 14px rgba(70,50,45,.05);
    }
    #snCustomCup::before{
      content:"";
      position:absolute;
      z-index:7;
      left:10px;
      right:10px;
      top:-8px;
      height:13px;
      border-radius:50%;
      border:3px solid rgba(82,69,63,.28);
      background:rgba(255,255,255,.85);
    }
    #snCustomLiquid{
      position:absolute;
      z-index:1;
      left:3px;
      right:3px;
      bottom:3px;
      height:0%;
      border-radius:0 0 29px 29px;
      background:#ffffff;
      opacity:.82;
      transition:height .42s ease, background .45s ease, opacity .3s ease;
      box-shadow:inset 0 10px 24px rgba(255,255,255,.22);
    }
    #snCustomLiquid.has-flavor{height:78%;opacity:.82}
    #snCustomLiquid.multi{height:84%}
    #snCustomIce{
      position:absolute;
      z-index:3;
      inset:12px 8px 14px;
      pointer-events:none;
    }
    #snCustomIce span{
      position:absolute;
      width:39px;
      height:28px;
      border:2px solid rgba(255,255,255,.84);
      border-radius:8px 12px 7px 10px;
      background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(213,239,247,.26));
      box-shadow:0 2px 5px rgba(36,70,80,.07), inset 0 0 8px rgba(255,255,255,.7);
      transform:rotate(var(--r));
      backdrop-filter:blur(1px);
    }
    #snCustomIce span:nth-child(1){left:8px;top:11px;--r:-10deg}
    #snCustomIce span:nth-child(2){left:55px;top:5px;--r:8deg}
    #snCustomIce span:nth-child(3){left:104px;top:15px;--r:-5deg}
    #snCustomIce span:nth-child(4){left:27px;top:48px;--r:11deg}
    #snCustomIce span:nth-child(5){left:82px;top:48px;--r:-13deg}
    #snCustomIce span:nth-child(6){left:8px;top:84px;--r:6deg}
    #snCustomIce span:nth-child(7){left:57px;top:88px;--r:-7deg}
    #snCustomIce span:nth-child(8){left:104px;top:82px;--r:12deg}
    #snCustomIce span:nth-child(9){left:30px;top:126px;--r:-8deg}
    #snCustomIce span:nth-child(10){left:86px;top:124px;--r:7deg}
    #snCustomCupLogo{
      position:absolute;
      z-index:6;
      width:98px;
      height:96px;
      left:50%;
      top:103px;
      transform:translateX(-50%);
      object-fit:contain;
      filter:drop-shadow(0 2px 2px rgba(0,0,0,.08));
      pointer-events:none;
    }
    #snCustomCupShine{
      position:absolute;
      z-index:5;
      top:15px;
      bottom:15px;
      left:15px;
      width:15px;
      border-radius:999px;
      background:linear-gradient(rgba(255,255,255,.75),rgba(255,255,255,.12));
      opacity:.72;
      pointer-events:none;
    }
    #snCustomCupStatus{
      min-height:20px;
      margin:10px 0 0;
      font-size:13px;
      font-weight:800;
      color:var(--navy,#1f2f44);
    }
    @media(max-width:580px){
      #snCustomCup{width:150px;height:216px}
      #snCustomCupLogo{width:87px;height:85px;top:91px}
      #snCustomIce{transform:scale(.88);transform-origin:top left}
    }
    @media(prefers-reduced-motion:reduce){
      #snCustomLiquid{transition:none}
    }
  `;
  document.head.appendChild(style);

  function hexToRgb(hex){
    const h = hex.replace('#','');
    return {
      r: parseInt(h.slice(0,2),16),
      g: parseInt(h.slice(2,4),16),
      b: parseInt(h.slice(4,6),16)
    };
  }

  function rgbToHex({r,g,b}){
    const c = n => Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
    return `#${c(r)}${c(g)}${c(b)}`;
  }

  function mixColors(names){
    if(!names.length) return '#ffffff';
    const colors = names.map(n => hexToRgb(FLAVOR_COLORS[n]));
    const total = colors.reduce((a,c)=>({r:a.r+c.r,g:a.g+c.g,b:a.b+c.b}),{r:0,g:0,b:0});
    const avg = {r:total.r/colors.length,g:total.g/colors.length,b:total.b/colors.length};

    // Keep mixed drinks bright enough to look like a loaded tea instead of muddy paint.
    const max = Math.max(avg.r,avg.g,avg.b);
    const min = Math.min(avg.r,avg.g,avg.b);
    if(max-min < 38){
      const boost = 18;
      if(avg.r === max) avg.r += boost;
      if(avg.g === max) avg.g += boost;
      if(avg.b === max) avg.b += boost;
    }
    return rgbToHex(avg);
  }

  function isBuildYourOwn(){
    const type = document.querySelector('#customizeType')?.textContent?.trim().toLowerCase() || '';
    const name = document.querySelector('#customizeName')?.textContent?.trim().toLowerCase() || '';
    return type.includes('build your own') || name.includes('build your own');
  }

  function selectedFlavors(){
    return [...document.querySelectorAll('#flavorChoices input[type="checkbox"]:checked')]
      .map(i => i.value)
      .filter(v => ALLOWED_FLAVORS.includes(v));
  }

  function filterCustomFlavorList(){
    if(!isBuildYourOwn()) return;
    document.querySelectorAll('#flavorChoices .choice-chip').forEach(chip => {
      const input = chip.querySelector('input');
      if(!input) return;
      chip.style.display = ALLOWED_FLAVORS.includes(input.value) ? '' : 'none';
    });
  }

  function updateCup(){
    const wrap = document.querySelector('#snCustomCupWrap');
    const liquid = document.querySelector('#snCustomLiquid');
    const status = document.querySelector('#snCustomCupStatus');
    if(!wrap || !liquid || !status) return;

    const active = isBuildYourOwn();
    wrap.classList.toggle('active', active);
    if(!active) return;

    filterCustomFlavorList();
    const selected = selectedFlavors();
    const mixed = mixColors(selected);

    liquid.style.background = mixed;
    liquid.classList.toggle('has-flavor', selected.length > 0);
    liquid.classList.toggle('multi', selected.length > 1);

    if(selected.length === 0){
      status.textContent = 'Cup of ice — pick your first flavor';
    } else if(selected.length === 1){
      status.textContent = selected[0];
    } else {
      status.textContent = selected.join(' + ');
    }
  }

  function installCup(){
    const builder = document.querySelector('#flavorBuilder');
    if(!builder || document.querySelector('#snCustomCupWrap')) return false;

    const wrap = document.createElement('div');
    wrap.id = 'snCustomCupWrap';
    wrap.setAttribute('aria-live','polite');
    wrap.innerHTML = `
      <p class="sn-cup-label">Your custom drink</p>
      <div id="snCustomCup" aria-label="Preview of your custom loaded tea">
        <div id="snCustomLiquid"></div>
        <div id="snCustomIce" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <img id="snCustomCupLogo" src="assets/custom-cup-logo.png" alt="">
        <div id="snCustomCupShine" aria-hidden="true"></div>
      </div>
      <p id="snCustomCupStatus">Cup of ice — pick your first flavor</p>
    `;
    builder.insertBefore(wrap, builder.firstChild);

    document.querySelector('#flavorChoices')?.addEventListener('change', () => {
      requestAnimationFrame(updateCup);
    });
    return true;
  }

  function refresh(){
    installCup();
    updateCup();
  }

  const observer = new MutationObserver(() => refresh());
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});

  document.addEventListener('click', e => {
    if(e.target.closest('[data-id], #customizeClose, #addCustomized')){
      setTimeout(refresh, 0);
    }
  });

  refresh();
})();