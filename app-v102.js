
// Disable browser page zoom gestures on touch devices (normal one-finger scrolling remains available).
(function preventPageZoom(){
  ['gesturestart','gesturechange','gestureend'].forEach(function(type){
    document.addEventListener(type,function(event){event.preventDefault();},{passive:false});
  });
  document.addEventListener('touchmove',function(event){
    if(event.touches && event.touches.length > 1) event.preventDefault();
  },{passive:false});
  document.addEventListener('dblclick',function(event){event.preventDefault();},{passive:false});
})();
const $=id=>document.getElementById(id);const KEY='daelmann-liefernachweis-v1';
const EMPTY_DB={customers:[],projects:[],materials:['Sand SE gesiebt','Schottertragschicht Naturstein'],services:[],reports:[],deliveryMaterials:null,haulMaterials:[]};
// Defensives Laden: Ein beschädigter oder unvollständiger lokaler Speicher darf nicht die gesamte App lahmlegen.
function loadDatabase(){try{const raw=localStorage.getItem(KEY);const parsed=raw?JSON.parse(raw):{};if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {...EMPTY_DB};return {...EMPTY_DB,...parsed,customers:Array.isArray(parsed.customers)?parsed.customers:[],projects:Array.isArray(parsed.projects)?parsed.projects:[],materials:Array.isArray(parsed.materials)?parsed.materials:EMPTY_DB.materials,services:Array.isArray(parsed.services)?parsed.services:[],reports:Array.isArray(parsed.reports)?parsed.reports:[],deliveryMaterials:Array.isArray(parsed.deliveryMaterials)?parsed.deliveryMaterials:(Array.isArray(parsed.materials)?parsed.materials:EMPTY_DB.materials),haulMaterials:Array.isArray(parsed.haulMaterials)?parsed.haulMaterials:[]};}catch(error){console.error('Lokale Daten konnten nicht gelesen werden:',error);return {...EMPTY_DB};}}
let db=loadDatabase();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db));}catch(error){console.error('Speichern fehlgeschlagen:',error);alert('Die Daten konnten nicht im Browser gespeichert werden. Bitte prüfen Sie den freien Speicherplatz.');}};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id==='home')renderArchive();if(id==='customers')renderCustomers();if(id==='projects')renderProjects();if(id==='deliveryMaterials')renderDeliveryMaterials();if(id==='haulMaterials')renderHaulMaterials();if(id==='services')renderServices()}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>show(b.dataset.open));
$('goNew').onclick=fresh;$('goDeliveries').onclick=()=>show('home');$('goMaster').onclick=()=>show('master');$('homeMaster').onclick=()=>show('master');$('homeWelcome').onclick=()=>show('welcome');$('formHomeButton').addEventListener('click',()=>{try{if(currentDraftId)autoSaveDraft();}finally{show('welcome');}});document.querySelectorAll('.back').forEach(b=>b.onclick=()=>show(b.closest('#master')?'welcome':'master'));
function fillSelect(el,items,placeholder){el.innerHTML=`<option value="">${placeholder}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}
function renderCustomers(){ $('customerList').innerHTML=db.customers.map((c,i)=>`<div class="archiveCard"><div><b>${esc(c.name)}</b><small>${esc(c.address)}</small></div><button class="remove" data-del-c="${i}">×</button></div>`).join('')||'<p class="hint">Noch keine Kunden angelegt.</p>';document.querySelectorAll('[data-del-c]').forEach(b=>b.onclick=()=>{db.customers.splice(+b.dataset.delC,1);save();renderCustomers()})}
function renderProjects(){fillSelect($('projectOwner'),db.customers.map(c=>c.name),'Auftraggeber wählen');$('projectList').innerHTML=db.projects.map((p,i)=>`<div class="archiveCard"><div><b>${esc(p.name)}</b><small>${esc(p.owner)}</small></div><button class="remove" data-del-p="${i}">×</button></div>`).join('')||'<p class="hint">Noch keine Bauvorhaben angelegt.</p>';document.querySelectorAll('[data-del-p]').forEach(b=>b.onclick=()=>{db.projects.splice(+b.dataset.delP,1);save();renderProjects()})}
function renderDeliveryMaterials(){db.deliveryMaterials=db.deliveryMaterials||[];$('deliveryMaterialsList').innerHTML=db.deliveryMaterials.map((m,i)=>`<div class="archiveCard"><b>${esc(m)}</b><button class="remove" data-del-dm="${i}">×</button></div>`).join('')||'<p class="hint">Noch keine Liefermaterialien angelegt.</p>';document.querySelectorAll('[data-del-dm]').forEach(b=>b.onclick=()=>{db.deliveryMaterials.splice(+b.dataset.delDm,1);save();renderDeliveryMaterials()})}
function renderHaulMaterials(){db.haulMaterials=db.haulMaterials||[];$('haulMaterialsList').innerHTML=db.haulMaterials.map((m,i)=>`<div class="archiveCard"><b>${esc(m)}</b><button class="remove" data-del-hm="${i}">×</button></div>`).join('')||'<p class="hint">Noch keine Abfuhrmaterialien angelegt.</p>';document.querySelectorAll('[data-del-hm]').forEach(b=>b.onclick=()=>{db.haulMaterials.splice(+b.dataset.delHm,1);save();renderHaulMaterials()})}

function renderServices(){db.services=db.services||[];$('servicesList').innerHTML=db.services.map((v,i)=>`<div class="archiveCard"><b>${esc(v)}</b><button class="remove" data-del-s="${i}">×</button></div>`).join('')||'<p class="hint">Noch keine Leistungen angelegt.</p>';document.querySelectorAll('[data-del-s]').forEach(b=>b.onclick=()=>{db.services.splice(+b.dataset.delS,1);save();renderServices()})}

$('saveCustomer').onclick=()=>{let name=$('newCustomer').value.trim();if(!name)return alert('Bitte einen Kundennamen eingeben.');db.customers.push({name,address:$('newAddress').value.trim()});$('newCustomer').value='';$('newAddress').value='';save();renderCustomers()};
$('saveProject').onclick=()=>{let name=$('newProject').value.trim(),owner=$('projectOwner').value;if(!name||!owner)return alert('Bitte Auftraggeber und Bauvorhaben angeben.');db.projects.push({name,owner});$('newProject').value='';save();renderProjects()};
$('saveDeliveryMaterial').onclick=()=>{let m=$('newDeliveryMaterial').value.trim();if(!m)return;db.deliveryMaterials=db.deliveryMaterials||[];if(db.deliveryMaterials.includes(m))return alert('Dieses Liefermaterial ist bereits vorhanden.');db.deliveryMaterials.push(m);$('newDeliveryMaterial').value='';save();renderDeliveryMaterials()};
$('saveHaulMaterial').onclick=()=>{let m=$('newHaulMaterial').value.trim();if(!m)return;db.haulMaterials=db.haulMaterials||[];if(db.haulMaterials.includes(m))return alert('Dieses Abfuhrmaterial ist bereits vorhanden.');db.haulMaterials.push(m);$('newHaulMaterial').value='';save();renderHaulMaterials()};
$('saveService').onclick=()=>{let v=$('newService').value.trim();if(!v)return;db.services=db.services||[];if(db.services.includes(v))return alert('Diese Leistung ist bereits vorhanden.');db.services.push(v);$('newService').value='';save();renderServices()};

let quickMaterialType='delivery';
function openQuickMaterial(type){
  quickMaterialType=type;
  $('quickMaterialTitle').textContent=type==='haul'?'Abfuhrmaterial hinzufügen':'Liefermaterial hinzufügen';
  $('quickMaterialHint').textContent='Wird direkt in den Stammdaten gespeichert und steht sofort zur Auswahl bereit.';
  $('quickMaterialName').value='';
  openQuickModal('quickMaterialModal');
  setTimeout(()=>$('quickMaterialName').focus(),50);
}
$('quickAddDeliveryMaterial').onclick=()=>openQuickMaterial('delivery');
$('quickAddHaulMaterial').onclick=()=>openQuickMaterial('haul');
$('cancelQuickMaterial').onclick=()=>closeQuickModal('quickMaterialModal');
document.querySelectorAll('[data-close-quick-material]').forEach(el=>el.onclick=()=>closeQuickModal('quickMaterialModal'));
$('saveQuickMaterial').onclick=()=>{
  const name=$('quickMaterialName').value.trim();
  if(!name)return alert('Bitte eine Materialbezeichnung eingeben.');
  const key=quickMaterialType==='haul'?'haulMaterials':'deliveryMaterials';
  db[key]=db[key]||[];
  if(db[key].some(item=>String(item).toLocaleLowerCase()===name.toLocaleLowerCase()))return alert('Dieses Material ist bereits in den Stammdaten vorhanden.');
  db[key].push(name);
  save();
  closeQuickModal('quickMaterialModal');
};
let activeMaterialType='delivery';
let enteredMaterials=[];
let currentDraftId=null;
let autoSaveTimer=null;
let autoSaveBusy=false;
function setAutoSaveStatus(message,kind='saved'){const el=$('autoSaveStatus');if(!el)return;el.textContent=message;el.dataset.state=kind;}
function autoSaveDraft(){
  if(autoSaveBusy||!$('form').classList.contains('active')||!$('pdfPreviewModal').hidden)return;
  const hasStarted=!!$('customer').value||enteredMaterials.length>0||$('serviceRows').querySelector('.entry')!==null||!!$('address').value.trim();
  if(!hasStarted)return;
  try{
    const r=collect();
    r.id=currentDraftId||Date.now();
    const existing=db.reports.find(x=>String(x.id)===String(r.id));
    r.createdAt=existing?.createdAt||r.id;r.updatedAt=Date.now();
    r.wizardStep=wizardStep;r.draft=true;r.pdf=false;r.autoSaved=true;
    if(existing){const i=db.reports.findIndex(x=>String(x.id)===String(r.id));db.reports[i]=r;}else db.reports.push(r);
    currentDraftId=r.id;save();
    setAutoSaveStatus('✓ Automatisch gespeichert · '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr');
  }catch(error){console.error('Automatisches Speichern fehlgeschlagen:',error);setAutoSaveStatus('Speichern fehlgeschlagen','error');}
}
function scheduleAutoSave(){if(autoSaveTimer)clearTimeout(autoSaveTimer);setAutoSaveStatus('Änderung wird gespeichert …','pending');autoSaveTimer=setTimeout(autoSaveDraft,450);}

let materialWizardStep=1;
function setMaterialWizardStep(step){
  materialWizardStep=step;
  $('materialStepSelect').hidden=step!==1;
  $('materialStepDetails').hidden=step!==2;
  $('materialStepIndicator').textContent=step===1?'Schritt 1 von 2 · Material':'Schritt 2 von 2 · Menge und Zeitstempel';
  $('materialModalCard').scrollTop=0;
}
function setMaterialUnit(unit){
  $('modalUnit').value=unit;
  document.querySelectorAll('[data-material-unit]').forEach(btn=>{
    const active=btn.dataset.materialUnit===unit;
    btn.classList.toggle('selected',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
  });
}
function openMaterialModal(type){
  activeMaterialType=type;
  const list=type==='haul'?(db.haulMaterials||[]):(db.deliveryMaterials||[]);
  $('materialModalTitle').textContent=type==='haul'?'Material abgefahren':'Material geliefert';
  $('materialChoiceCaption').textContent=type==='haul'?'Abfuhrmaterial':'Liefermaterial';
  fillSelect($('modalMaterial'),list,'Material wählen');
  renderMaterialChoiceButtons();
  $('materialChoiceText').textContent='Material auswählen';
  closeMaterialChoices();
  $('modalQuantity').value='';
  setMaterialUnit('to');
  $('modalIncludeDateTime').checked=false;
  $('modalMaterialDate').value=localDateValue();
  $('modalMaterialTime').value=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',hour12:false});
  $('modalDateTimeFields').hidden=true;
  $('selectedMaterialHeading').textContent='Menge für das ausgewählte Material';
  setMaterialWizardStep(1);
  $('materialModal').classList.add('open');
  $('materialModal').setAttribute('aria-hidden','false');
  if(!list.length){alert(type==='haul'?'Bitte zuerst unter Stammdaten Abfuhrmaterial anlegen.':'Bitte zuerst unter Stammdaten Liefermaterial anlegen.');closeMaterialModal();return;}
}
function closeMaterialModal(){$('materialModal').classList.remove('open');$('materialModal').setAttribute('aria-hidden','true')}
$('chooseDelivered').onclick=()=>openMaterialModal('delivery');
$('chooseHauled').onclick=()=>openMaterialModal('haul');
$('cancelMaterial').onclick=closeMaterialModal;
document.querySelectorAll('[data-close-material]').forEach(el=>el.onclick=closeMaterialModal);
function renderMaterialChoiceButtons(){
  const select=$('modalMaterial'),host=$('materialChoiceList');
  host.innerHTML='';
  Array.from(select.options).filter(option=>option.value).forEach(option=>{
    const button=document.createElement('button');
    button.type='button';button.className='materialChoiceOption';
    button.textContent=option.textContent;button.dataset.value=option.value;
    button.onclick=()=>{
      select.value=option.value;
      $('materialChoiceText').textContent=option.textContent;
      closeMaterialChoices();
      $('selectedMaterialHeading').textContent=`Menge für: ${option.textContent}`;
      setMaterialWizardStep(2);
    };
    host.appendChild(button);
  });
  if(!host.children.length){
    const empty=document.createElement('p');empty.className='materialChoiceEmpty';
    empty.textContent='Noch keine Materialien in den Stammdaten hinterlegt.';
    host.appendChild(empty);
  }
}
function openMaterialChoices(){
  const modal=$('materialChoiceModal');
  modal.hidden=false;modal.setAttribute('aria-hidden','false');
  $('openMaterialChoices').setAttribute('aria-expanded','true');
}
function closeMaterialChoices(){
  const modal=$('materialChoiceModal');
  if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}
  const trigger=$('openMaterialChoices');
  if(trigger)trigger.setAttribute('aria-expanded','false');
}
$('openMaterialChoices').onclick=openMaterialChoices;
$('cancelMaterialChoices').onclick=closeMaterialChoices;
document.querySelectorAll('[data-close-material-choices]').forEach(el=>el.onclick=closeMaterialChoices);
$('nextMaterialDetails').onclick=()=>{
  const name=$('modalMaterial').value;
  if(!name)return alert('Bitte zuerst ein Material auswählen.');
  $('selectedMaterialHeading').textContent=`Menge für: ${name}`;
  setMaterialWizardStep(2);
};
$('backToMaterialSelect').onclick=()=>setMaterialWizardStep(1);
document.querySelectorAll('[data-material-unit]').forEach(btn=>btn.onclick=()=>setMaterialUnit(btn.dataset.materialUnit));
document.querySelectorAll('[data-quantity-key]').forEach(btn=>btn.onclick=()=>{
  const input=$('modalQuantity'),key=btn.dataset.quantityKey;
  let value=input.value;
  if(key==='clear') value='';
  else if(key==='backspace') value=value.slice(0,-1);
  else if(key===','){if(!value.includes(','))value=value?value+',':'0,';}
  else if(key.length===1 && key>='0' && key<='9'){const parts=value.split(',');if(!value.includes(',') || parts[1].length<3)value+=key;}
  input.value=value;
});
$('modalIncludeDateTime').onchange=()=>{
  $('modalDateTimeFields').hidden=!$('modalIncludeDateTime').checked;
};
$('confirmMaterial').onclick=()=>{
  const name=$('modalMaterial').value,qty=$('modalQuantity').value.trim(),unit=$('modalUnit').value;
  if(!name)return alert('Bitte ein Material auswählen.');
  if(!qty||parseQuantity(qty)<=0)return alert('Bitte eine gültige Menge eingeben.');
  const includeDateTime=$('modalIncludeDateTime').checked;
  const date=$('modalMaterialDate').value,time=$('modalMaterialTime').value;
  if(includeDateTime&&(!date||!time))return alert('Bitte Datum und Uhrzeit vollständig eingeben.');
  enteredMaterials.push({name,type:activeMaterialType,qty,unit,includeDateTime,date:includeDateTime?date:'',time:includeDateTime?time:'',vehicle:''});
  renderMaterialSummary();closeMaterialModal();
};
function parseQuantity(value){let s=String(value||'').trim().replace(/\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');const n=Number(s);return Number.isFinite(n)&&n>0?n:0}
function formatQuantity(n){return n.toLocaleString('de-DE',{maximumFractionDigits:3})}
function formatMaterialDateTime(date,time){if(!date)return '';const p=date.split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2],12);const weekday=['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()];return weekday+' '+String(p[2]).padStart(2,'0')+'.'+String(p[1]).padStart(2,'0')+'.'+String(p[0]).slice(-2)+(time?' – '+time+' Uhr':'')}
function materialTotals(){const totals=new Map(),rows=[];enteredMaterials.forEach((m,index)=>{if(m.includeDateTime){rows.push({...m,qty:parseQuantity(m.qty),_sourceIndex:index});return;}const key=[m.type,m.name,m.unit].join('||');if(!totals.has(key))totals.set(key,{...m,qty:0,includeDateTime:false,_sourceIndices:[]});const row=totals.get(key);row.qty+=parseQuantity(m.qty);row._sourceIndices.push(index)});return [...totals.values(),...rows].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit)||(a.date||'').localeCompare(b.date||'')||(a.time||'').localeCompare(b.time||''))}
function renderMaterialSummary(){
  const el=$('materialRows');if(!el)return;
  const totals=materialTotals();
  if(!totals.length){el.innerHTML='<h3>Erfasste Materialien</h3><p class="hint">Noch keine Materialien erfasst.</p>';return;}
  const group=(type,title,cls)=>{const rows=totals.filter(t=>t.type===type);return rows.length?`<section class="materialGroup ${cls}"><h4>${title}</h4>${rows.map(t=>`<div class="swipeMaterial" data-swipe-type="${t.type}" data-swipe-name="${esc(t.name)}" data-swipe-unit="${t.unit}" data-swipe-stamp="${t.includeDateTime?esc([t.date||'',t.time||''].join('T')):''}" data-source-index="${t._sourceIndex===undefined?'':t._sourceIndex}"><button type="button" class="swipeDelete" aria-label="Material löschen">×</button><div class="summaryRow"><b>${esc(t.name)}${t.vehicle?`<small class="materialVehicle">Kennzeichen: ${esc(t.vehicle)}</small>`:''}${t.includeDateTime?`<small class="materialDateStamp">${esc(formatMaterialDateTime(t.date,t.time))}</small>`:''}</b><span>${formatQuantity(t.qty)} ${t.unit==='to'?'to':'m³'}</span></div></div>`).join('')}</section>`:''};
  el.innerHTML='<h3>Erfasste Materialien</h3><p class="swipeHint">Nach links wischen und zum Löschen auf das rote X tippen.</p>'+group('delivery','Material geliefert','deliveryGroup')+group('haul','Material abgefahren','haulGroup');
  el.querySelectorAll('.swipeMaterial').forEach(item=>{
    const row=item.querySelector('.summaryRow'),del=item.querySelector('.swipeDelete');
    let startX=0,startY=0,lastX=0,tracking=false;
    row.addEventListener('pointerdown',e=>{
      startX=e.clientX;startY=e.clientY;lastX=e.clientX;tracking=true;
      row.setPointerCapture?.(e.pointerId);
    });
    row.addEventListener('pointermove',e=>{
      if(!tracking)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.abs(dx)>Math.abs(dy)*1.2 && dx<0){
        row.style.transform=`translateX(${Math.max(-76,dx)}px)`;
      }
      lastX=e.clientX;
    });
    const finish=e=>{
      if(!tracking)return;tracking=false;
      const dx=(e?.clientX??lastX)-startX,dy=(e?.clientY??startY)-startY;
      if(dx < -42 && Math.abs(dx)>Math.abs(dy)*1.15){
        item.classList.add('swipe-open');row.style.transform='translateX(-68px)';
      }else if(dx>25){
        item.classList.remove('swipe-open');row.style.transform='';
      }else if(Math.abs(dx)<12){
        el.querySelectorAll('.swipeMaterial.swipe-open').forEach(other=>{
          if(other!==item){other.classList.remove('swipe-open');const r=other.querySelector('.summaryRow');if(r)r.style.transform='';}
        });
      }
    };
    row.addEventListener('pointerup',finish);
    row.addEventListener('pointercancel',finish);
    del.addEventListener('click',()=>{
      const type=item.dataset.swipeType,name=item.dataset.swipeName,unit=item.dataset.swipeUnit;
      if(confirm(`„${name}“ (${unit==='to'?'to':'cbm'}) wirklich aus den erfassten Materialien löschen?`)){
        const sourceIndex=item.dataset.sourceIndex;if(sourceIndex!==''){enteredMaterials.splice(Number(sourceIndex),1);}else{enteredMaterials=enteredMaterials.filter(m=>!(m.type===type&&m.name===name&&m.unit===unit&&!m.includeDateTime));}
        renderMaterialSummary();
      }
    });
  });
}
function timeOptions(value){
  let out='<option value="">--:--</option>';
  for(let h=0;h<24;h++)for(let m of [0,15,30,45]){
    const v=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
    out+=`<option value="${v}" ${value===v?'selected':''}>${v}</option>`;
  }
  return out;
}
function rowService(data={}){
  const wrap=document.createElement('div');wrap.className='serviceSwipeItem';
  const d=document.createElement('div');d.className='entry service';
  d.innerHTML=`<label class="job">Leistung<button type="button" class="jobv servicePickButton">${esc(data.job||'Leistung auswählen')} ▾</button></label>
  <label class="description">Leistungsbeschreibung<input class="descriptionv" type="text" value="${esc(data.description||'')}" placeholder="Beschreibung frei eingeben"></label>
  <label class="hours">Stunden<input class="hoursv" type="text" inputmode="decimal" autocomplete="off" value="${esc(data.hours||'')}" placeholder="Std."></label>
  <label class="start">Anfang<select class="startv">${timeOptions(data.start||'')}</select></label>
  <label class="end">Ende<select class="endv">${timeOptions(data.end||'')}</select></label>
  <label class="pause">Pause<select class="pausev"><option value="">—</option><option value="15" ${String(data.pause)==='15'?'selected':''}>15 Min.</option><option value="30" ${String(data.pause)==='30'?'selected':''}>30 Min.</option><option value="45" ${String(data.pause)==='45'?'selected':''}>45 Min.</option></select></label>`;
  if(data.job){d.querySelector('.servicePickButton').dataset.value=data.job;d.querySelector('.servicePickButton').textContent=data.job+' ▾';}
  d.querySelector('.servicePickButton').onclick=()=>openServiceModal(d);
  const hoursField=d.querySelector('.hoursv');
  // Manuelle Stundenangabe bleibt möglich. Sobald Anfang, Ende oder Pause
  // geändert werden, wird die automatische Berechnung wieder übernommen.
  let hoursEditedManually=false;
  hoursField.addEventListener('input',()=>{hoursEditedManually=true;});
  const recalcHours=()=>{
    if(hoursEditedManually)return;
    const start=d.querySelector('.startv').value, end=d.querySelector('.endv').value;
    if(!start||!end)return;
    const mins=v=>{const [h,m]=v.split(':').map(Number);return h*60+m;};
    let duration=mins(end)-mins(start);
    if(duration<0)duration+=24*60;
    duration=Math.max(0,duration-(Number(d.querySelector('.pausev').value)||0));
    hoursField.value=duration ? (duration/60).toLocaleString('de-DE',{minimumFractionDigits:duration%60?2:0,maximumFractionDigits:2}) : '0';
  };
  const timeChanged=()=>{hoursEditedManually=false;recalcHours();};
  d.querySelector('.startv').addEventListener('change',timeChanged);
  d.querySelector('.endv').addEventListener('change',timeChanged);
  d.querySelector('.pausev').addEventListener('change',timeChanged);
  wrap.append(d);
  const del=document.createElement('button');del.type='button';del.className='serviceSwipeDelete';del.setAttribute('aria-label','Zusatzleistung löschen');del.textContent='×';wrap.append(del);
  $('serviceRows').append(wrap);
  attachServiceSwipe(wrap);
}
function attachServiceSwipe(item){
  const row=item.querySelector('.entry.service'),del=item.querySelector('.serviceSwipeDelete');
  let sx=0,sy=0,lastX=0,tracking=false;
  row.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;lastX=e.clientX;tracking=true;});
  row.addEventListener('pointermove',e=>{
    if(!tracking)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(dx<0&&Math.abs(dx)>Math.abs(dy)*1.2)row.style.transform=`translateX(${Math.max(-68,dx)}px)`;
    lastX=e.clientX;
  });
  const finish=e=>{
    if(!tracking)return;tracking=false;
    const dx=(e?.clientX??lastX)-sx,dy=(e?.clientY??sy)-sy;
    if(dx < -42&&Math.abs(dx)>Math.abs(dy)*1.15){item.classList.add('swipe-open');row.style.transform='translateX(-68px)';}
    else if(dx>25){item.classList.remove('swipe-open');row.style.transform='';}
  };
  row.addEventListener('pointerup',finish);row.addEventListener('pointercancel',finish);
  del.onclick=()=>{
    const name=row.querySelector('.servicePickButton')?.dataset.value||'Zusatzleistung';
    if(confirm(`„${name}“ wirklich löschen?`))item.remove();
  };
}
let serviceTargetRow=null;
function openServiceModal(targetRow){
  const list=db.services||[];
  if(!list.length){alert('Bitte zuerst unter Stammdaten → Leistungen mindestens eine Leistung anlegen.');return;}
  serviceTargetRow=targetRow;
  $('serviceTiles').innerHTML=list.map(v=>`<button type="button" class="serviceTile" data-service-choice="${esc(v)}">${esc(v)}</button>`).join('');
  $('serviceTiles').querySelectorAll('[data-service-choice]').forEach(b=>b.onclick=()=>{
    if(serviceTargetRow){
      const field=serviceTargetRow.querySelector('.servicePickButton');
      field.textContent=b.dataset.serviceChoice+' ▾';
      field.dataset.value=b.dataset.serviceChoice;
    }
    closeServiceModal();
  });
  $('serviceModal').hidden=false;$('serviceModal').classList.add('open');$('serviceModal').setAttribute('aria-hidden','false');
}
function closeServiceModal(){$('serviceModal').classList.remove('open');$('serviceModal').setAttribute('aria-hidden','true');$('serviceModal').hidden=true;serviceTargetRow=null}
$('addServiceRow').onclick=()=>rowService();
$('cancelService').onclick=closeServiceModal;
document.querySelectorAll('[data-close-service]').forEach(el=>el.onclick=closeServiceModal);
function localDateValue(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function updateDateDisplay(){const value=$('date').value;const button=$('dateDisplay');if(!value){button.textContent='Datum auswählen';return;}const parts=value.split('-').map(Number);const d=new Date(parts[0],parts[1]-1,parts[2],12);button.textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});}
$('date').addEventListener('change',updateDateDisplay);
$('dateDisplay').addEventListener('click',()=>{const input=$('date');if(typeof input.showPicker==='function'){try{input.showPicker();return;}catch(e){}}input.click();});
let wizardStep=1;
function setWizardStep(step){wizardStep=step;document.querySelectorAll('.wizardStep').forEach(el=>el.classList.toggle('active',Number(el.dataset.wizard)===step));if($('wizardProgress'))$('wizardProgress').textContent=['','Schritt 1 von 5 · Auftraggeber','Schritt 2 von 5 · Material','Schritt 3 von 5 · Zusatzleistungen','Schritt 4 von 5 · Zusammenfassung','Schritt 5 von 5 · Abschluss'][step];window.scrollTo(0,0);}
$('toMaterials').onclick=()=>{if(!$('customer').value)return alert('Bitte zuerst einen Auftraggeber auswählen.');setWizardStep(2)};
$('backToCustomer').onclick=()=>setWizardStep(1);
$('toServices').onclick=()=>setWizardStep(3);
$('backToMaterials').onclick=()=>setWizardStep(2);
function renderReportSummary(){
  const r=collect(),el=$('reportSummary');if(!el)return;
  const mats=materialTotals(),delivered=mats.filter(m=>m.type!=='haul'),hauled=mats.filter(m=>m.type==='haul');
  const block=(title,list,cls)=>list.length?`<section class="summaryBlock ${cls}"><h3>${title}</h3>${list.map(m=>`<div class="summaryLine"><b>${esc(m.name)}${m.includeDateTime?`<small class="materialDateStamp">${esc(formatMaterialDateTime(m.date,m.time))}</small>`:''}</b><span>${formatQuantity(m.qty)} ${m.unit==='to'?'to':'m³'}</span></div>`).join('')}</section>`:'';
  const services=r.services.map(s=>`<div class="summaryService"><b>${esc(s.job||'Leistung')}</b>${s.description?`<div>${esc(s.description)}</div>`:''}<small>${esc(s.hours||'—')} Std. · ${esc(s.start||'—')} bis ${esc(s.end||'—')} · Pause ${esc(s.pause||'0')} Min.</small></div>`).join('');
  el.innerHTML=`<div class="summaryMeta"><b>${esc(r.customer||'—')}</b><div>${esc(r.address||'')}</div><div>Datum: ${esc(r.date||'—')}</div><div>Bauvorhaben: ${esc(r.project||'Kein Bauvorhaben')}</div></div>${block('Material geliefert',delivered,'deliveryGroup')}${block('Material abgefahren',hauled,'haulGroup')}${services?`<section class="summaryBlock"><h3>Zusatzleistungen</h3>${services}</section>`:'<p class="hint">Keine Zusatzleistungen erfasst.</p>'}`;
}
$('toSummary').onclick=()=>{renderReportSummary();setWizardStep(4)};
$('backToServices').onclick=()=>setWizardStep(3);
$('toFinish').onclick=()=>setWizardStep(5);
$('backToSummary').onclick=()=>{renderReportSummary();setWizardStep(4)};

function fresh(){ if(autoSaveTimer)clearTimeout(autoSaveTimer);currentDraftId=null;setAutoSaveStatus('Noch kein Entwurf begonnen'); $('date').value=localDateValue();updateDateDisplay();fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');$('address').value='';fillSelect($('project'),[],'Bauvorhaben wählen');enteredMaterials=[];$('materialRows').innerHTML='<p class="hint">Noch keine Materialien erfasst.</p>';$('serviceRows').innerHTML='';$('signer').value='';clearSig();closeSignature();setWizardStep(1);show('form')}
$('customer').onchange=()=>{let c=db.customers.find(c=>c.name===$('customer').value);$('address').value=c?.address||'';fillSelect($('project'),db.projects.filter(p=>p.owner===c?.name).map(p=>p.name),'Bauvorhaben wählen');scheduleAutoSave()};
function openQuickModal(id){
  const modal=$(id);modal.hidden=false;modal.setAttribute('aria-hidden','false');
}
function closeQuickModal(id){
  const modal=$(id);modal.hidden=true;modal.setAttribute('aria-hidden','true');
}
$('openQuickCustomer').onclick=()=>{
  $('quickCustomerName').value='';$('quickCustomerAddress').value='';
  openQuickModal('quickCustomerModal');
  setTimeout(()=> $('quickCustomerName').focus(),50);
};
$('cancelQuickCustomer').onclick=()=>closeQuickModal('quickCustomerModal');
document.querySelectorAll('[data-close-quick-customer]').forEach(el=>el.onclick=()=>closeQuickModal('quickCustomerModal'));
$('saveQuickCustomer').onclick=()=>{
  const name=$('quickCustomerName').value.trim();
  const address=$('quickCustomerAddress').value.trim();
  if(!name)return alert('Bitte einen Kundennamen eingeben.');
  const existing=db.customers.find(c=>c.name.toLocaleLowerCase()===name.toLocaleLowerCase());
  if(existing)return alert('Dieser Kunde ist bereits in den Stammdaten vorhanden.');
  db.customers.push({name,address});
  save();
  fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');
  $('customer').value=name;
  $('address').value=address;
  fillSelect($('project'),db.projects.filter(p=>p.owner===name).map(p=>p.name),'Bauvorhaben wählen');
  closeQuickModal('quickCustomerModal');
};
$('openQuickProject').onclick=()=>{
  const owner=$('customer').value;
  if(!owner)return alert('Bitte zuerst einen Auftraggeber auswählen oder hinzufügen.');
  $('quickProjectName').value='';
  $('quickProjectOwnerHint').textContent='Auftraggeber: '+owner;
  openQuickModal('quickProjectModal');
  setTimeout(()=> $('quickProjectName').focus(),50);
};
$('cancelQuickProject').onclick=()=>closeQuickModal('quickProjectModal');
document.querySelectorAll('[data-close-quick-project]').forEach(el=>el.onclick=()=>closeQuickModal('quickProjectModal'));
$('saveQuickProject').onclick=()=>{
  const name=$('quickProjectName').value.trim(),owner=$('customer').value;
  if(!owner)return alert('Bitte zuerst einen Auftraggeber auswählen.');
  if(!name)return alert('Bitte eine Bezeichnung für das Bauvorhaben eingeben.');
  const existing=db.projects.find(p=>p.owner===owner&&p.name.toLocaleLowerCase()===name.toLocaleLowerCase());
  if(existing)return alert('Dieses Bauvorhaben ist für den Auftraggeber bereits vorhanden.');
  db.projects.push({name,owner});
  save();
  fillSelect($('project'),db.projects.filter(p=>p.owner===owner).map(p=>p.name),'Bauvorhaben wählen');
  $('project').value=name;
  closeQuickModal('quickProjectModal');
};

$('newBtn').onclick=fresh;$('cancel').onclick=()=>show('home');
const serviceModal=$('serviceModal');serviceModal.hidden=true;serviceModal.classList.remove('open');
const signatureModal=$('signatureModal'); signatureModal.hidden=true; signatureModal.classList.remove('open');
const canvas=$('signature'),ctx=canvas.getContext('2d');let drawing=false,ink=false,signatureSaved=false;function pos(e){let r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}canvas.onpointerdown=e=>{drawing=true;ink=true;canvas.setPointerCapture(e.pointerId);let p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;let p=pos(e);ctx.lineWidth=4;ctx.lineCap='round';ctx.strokeStyle='#18212b';ctx.lineTo(p.x,p.y);ctx.stroke()};canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height);ink=false;signatureSaved=false;$('signatureStatus').textContent='Noch keine Unterschrift hinterlegt.';$('openSignature').classList.remove('signatureDone');$('openSignature').textContent='Unterschreiben'} $('clearSig').onclick=clearSig;
function openSignature(){ const modal=$('signatureModal'); modal.hidden=false; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeSignature(){ const modal=$('signatureModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); modal.hidden=true; }
$('openSignature').onclick=openSignature;$('cancelSignature').onclick=closeSignature;document.querySelectorAll('[data-close-signature]').forEach(el=>el.onclick=closeSignature);
$('confirmSignature').onclick=()=>{if(!ink)return alert('Bitte zuerst unterschreiben.');signatureSaved=true;$('signatureStatus').textContent='Unterschrift übernommen'+($('signer').value.trim()?' · '+$('signer').value.trim():'')+'.';$('openSignature').classList.add('signatureDone');$('openSignature').textContent='✓ Unterschrift erledigt';closeSignature();};
function collect(){return {id:currentDraftId||Date.now(),date:$('date').value,customer:$('customer').value,address:$('address').value,project:$('project').value||'',materials:enteredMaterials.map(m=>({...m})),services:[...$('serviceRows').querySelectorAll('.entry')].map(d=>({job:d.querySelector('.servicePickButton')?.dataset.value||'',description:d.querySelector('.descriptionv').value,hours:d.querySelector('.hoursv').value,start:d.querySelector('.startv').value,end:d.querySelector('.endv').value,pause:d.querySelector('.pausev').value})).filter(x=>Object.values(x).some(Boolean)),signature:signatureSaved&&ink?canvas.toDataURL('image/png'):null,signer:signatureSaved?$('signer').value:''}}

function persistDraft(){
  const r=collect();
  if(!r.customer){alert('Bitte zuerst einen Auftraggeber auswählen.');return false;}
  r.draft=true;r.pdf=false;
  if(currentDraftId){const i=db.reports.findIndex(x=>String(x.id)===String(currentDraftId));if(i>=0)db.reports[i]=r;else db.reports.push(r);}
  else {db.reports.push(r);currentDraftId=r.id;}
  save();renderArchive();alert('Zwischenstand wurde gespeichert. Du kannst den Liefernachweis später unter „Liefernachweise“ öffnen und weiterbearbeiten.');return true;
}
function openDraft(r){
  if(autoSaveTimer)clearTimeout(autoSaveTimer);currentDraftId=r.id;
  fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');
  $('customer').value=r.customer||'';
  $('date').value=r.date||localDateValue();updateDateDisplay();
  $('address').value=r.address||'';
  const owner=db.customers.find(c=>c.name===r.customer);
  fillSelect($('project'),db.projects.filter(p=>p.owner===owner?.name).map(p=>p.name),'Bauvorhaben wählen');
  $('project').value=r.project||'';
  enteredMaterials=(r.materials||[]).map(m=>({...m}));
  renderMaterialSummary();
  $('serviceRows').innerHTML='';
  (r.services||[]).forEach(v=>rowService(v));
  $('signer').value=r.signer||'';
  clearSig();
  if(r.signature){
    const img=new Image();
    img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);ink=true;signatureSaved=true;$('signatureStatus').textContent='Gespeicherte Unterschrift übernommen.';};
    img.src=r.signature;
  }
  closeSignature();setWizardStep(Number(r.wizardStep)||2);setAutoSaveStatus('✓ Entwurf geladen');show('form');
}
let pdfPreviewUrl=null; let pdfPreviewBlob=null; let archiveMode='customers',archiveCustomer='',archiveProject='';

function closeResumeDraftModal(){
  const modal=$('resumeDraftModal');
  if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}
}
function showResumeDraftModal(){
  const drafts=db.reports.filter(r=>r.draft).sort((a,b)=>Number(b.id)-Number(a.id));
  if(!drafts.length)return;
  const modal=$('resumeDraftModal'),list=$('resumeDraftList');
  if(!modal||!list)return;
  list.innerHTML=drafts.map((r,i)=>{
    const date=r.date?new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'):'';
    const updated=r.updatedAt?new Date(r.updatedAt).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):''; const details=[r.project,date,updated?'Aktualisiert: '+updated:''].filter(Boolean).join(' · ');
    const customer=r.customer||'Noch ohne Auftraggeber';
    return `<button type="button" class="resumeDraftItem" data-resume-draft="${esc(String(r.id))}">
      <span class="resumeDraftItemMain"><strong>${esc(customer)}</strong><small>${esc(details||'Unvollständiger Liefernachweis')}</small></span>
      <span class="resumeDraftArrow">Weiter ›</span>
    </button>`;
  }).join('');
  list.querySelectorAll('[data-resume-draft]').forEach(button=>{
    button.onclick=(event)=>{
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const draft=db.reports.find(r=>String(r.id)===button.dataset.resumeDraft&&r.draft);
      if(!draft)return;
      closeResumeDraftModal();
      openDraft(draft);
      setWizardStep(2);
      show('form');
    };
  });
  modal.hidden=false;modal.setAttribute('aria-hidden','false');
}

// Zusätzliche iOS-Safari-Absicherung: Entwurfsauswahl im Capture-Phase abfangen,
// bevor andere Klick-Handler oder Formularaktionen den Wechsel beeinflussen.
document.addEventListener('click',function(event){
  const button=event.target && event.target.closest ? event.target.closest('[data-resume-draft]') : null;
  if(!button)return;
  const modal=$('resumeDraftModal');
  if(!modal || modal.hidden)return;
  const draft=db.reports.find(r=>String(r.id)===button.getAttribute('data-resume-draft')&&r.draft);
  if(!draft)return;
  event.preventDefault();
  event.stopPropagation();
  if(event.stopImmediatePropagation)event.stopImmediatePropagation();
  closeResumeDraftModal();
  // Den Formularbildschirm zuerst öffnen, damit Safari nicht auf der Startseite bleibt.
  try{show('form');}catch(error){console.error('Formularansicht:',error);}
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.toggle('active',screen.id==='form'));
  try{
    openDraft(draft);
  }catch(error){
    console.error('Vollständiges Laden des Entwurfs:',error);
    // Robuster Fallback: Kerndaten laden, auch wenn z.B. eine optionale Signatur
    // oder ein Zusatzfeld beim vollständigen Wiederherstellen Probleme macht.
    try{currentDraftId=draft.id;}catch(e){}
    try{if($('customer')){$('customer').innerHTML='<option value="">Auftraggeber wählen</option>'+db.customers.map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');$('customer').value=draft.customer||'';}}catch(e){}
    try{if($('date'))$('date').value=draft.date||localDateValue();}catch(e){}
    try{if($('address'))$('address').value=draft.address||'';}catch(e){}
    try{if($('project')){$('project').innerHTML='<option value="">Bauvorhaben wählen</option>'+db.projects.filter(x=>x.owner===draft.customer).map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('');$('project').value=draft.project||'';}}catch(e){}
    try{enteredMaterials=(draft.materials||[]).map(m=>({...m}));renderMaterialSummary();}catch(e){}
    try{setAutoSaveStatus('✓ Entwurf teilweise geladen');}catch(e){}
  }
  try{setWizardStep(2);}catch(e){console.error('Material-Schritt:',e);}
  try{show('form');}catch(e){}
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.toggle('active',screen.id==='form'));
  const form=$('form');
  if(form)form.scrollIntoView({block:'start'});
},true);

const resumeSkipButton=$('skipResumeDrafts');
if(resumeSkipButton)resumeSkipButton.onclick=closeResumeDraftModal;
function archiveTabs(){return `<div class="archiveTabs"><button type="button" data-archive-tab="customers" class="${archiveMode==='customers'?'active':''}">Kunden / Nachweise</button><button type="button" data-archive-tab="drafts" class="${archiveMode==='drafts'?'active':''}">Zwischengespeichert</button></div>`}
function archiveCard(r,buttonLabel){
  const stamp=v=>{const n=Number(v);return Number.isFinite(n)&&n>100000000000?new Date(n).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})+' Uhr':''};
  const created=stamp(r.createdAt||r.id),updated=stamp(r.updatedAt);
  const history=r.draft?[created?'Angelegt: '+created:'',updated?'Zuletzt bearbeitet: '+updated:''].filter(Boolean).join(' · '):'';
  return `<div class="archiveSwipeItem" data-archive-id="${r.id}"><button type="button" class="archiveDelete" aria-label="Liefernachweis löschen">×</button><div class="archiveCard"><div><b>${esc(r.customer||'Ohne Auftraggeber')}</b><small>${esc(new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'))} · ${esc(r.project||'Ohne Bauvorhaben')} · ${r.draft?'Entwurf – weiterbearbeiten':'PDF erstellt'}${history?' · '+esc(history):''}</small></div><button class="soft" data-open-r="${r.id}">${buttonLabel|| (r.draft?'Weiterbearbeiten':'PDF öffnen')}</button></div></div>`;
}
function bindArchiveCards(){
  document.querySelectorAll('[data-open-r]').forEach(b=>b.onclick=(event)=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();let r=db.reports.find(x=>String(x.id)===b.dataset.openR);if(!r)return;if(r.draft){openDraft(r);setWizardStep(2);show('form');}else downloadPdf(r)});
  document.querySelectorAll('.archiveSwipeItem').forEach(item=>{
    const card=item.querySelector('.archiveCard'),del=item.querySelector('.archiveDelete');let sx=0,sy=0,tracking=false,lastX=0;
    card.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;lastX=e.clientX;tracking=true;});
    card.addEventListener('pointermove',e=>{if(!tracking)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(dx<0&&Math.abs(dx)>Math.abs(dy)*1.2)card.style.transform=`translateX(${Math.max(-72,dx)}px)`;lastX=e.clientX;});
    const finish=e=>{if(!tracking)return;tracking=false;const dx=(e?.clientX??lastX)-sx,dy=(e?.clientY??sy)-sy;if(dx < -42&&Math.abs(dx)>Math.abs(dy)*1.15){item.classList.add('archive-open');card.style.transform='translateX(-72px)'}else if(dx>25){item.classList.remove('archive-open');card.style.transform=''}};
    card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
    del.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const id=item.dataset.archiveId,report=db.reports.find(x=>String(x.id)===String(id));if(!report)return;askAppConfirm(`Liefernachweis vom ${new Date(report.date+'T12:00:00').toLocaleDateString('de-DE')} für „${report.customer||'Ohne Auftraggeber'}“ wirklich löschen?`,()=>{db.reports=db.reports.filter(x=>String(x.id)!==String(id));if(String(currentDraftId)===String(id))currentDraftId=null;save();renderArchive();},'Liefernachweis löschen?')},{once:true});
  });
}

// Version 87: in-app confirmation dialog for destructive actions (no native iOS confirm).
let appConfirmCallback = null;
function closeAppConfirm(){
  const modal=$('appConfirmModal');
  if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}
  appConfirmCallback=null;
}
function askAppConfirm(message, onAccept, title='Wirklich löschen?'){
  const modal=$('appConfirmModal');
  if(!modal){ if(window.confirm(message)) onAccept(); return; }
  $('appConfirmTitle').textContent=title;
  $('appConfirmMessage').textContent=message;
  appConfirmCallback=onAccept;
  modal.hidden=false;modal.setAttribute('aria-hidden','false');
}
$('appConfirmCancel').onclick=closeAppConfirm;
$('appConfirmAccept').onclick=()=>{
  const callback=appConfirmCallback;
  closeAppConfirm();
  if(typeof callback==='function')callback();
};

function renderArchive(){
  const host=$('archive');if(!host)return;
  const completed=db.reports.filter(r=>!r.draft).sort((a,b)=>b.id-a.id),drafts=db.reports.filter(r=>r.draft).sort((a,b)=>b.id-a.id);
  let body='';
  if(archiveMode==='drafts'){
    body=`<div class="archiveCrumb"><b>Zwischengespeicherte Liefernachweise</b><span>${drafts.length} Entwurf/Entwürfe</span></div>`+(drafts.map(r=>archiveCard(r,'Weiterbearbeiten')).join('')||'<div class="panel hint">Keine zwischengespeicherten Liefernachweise vorhanden.</div>');
  }else if(!archiveCustomer){
    const names=[...new Set(completed.map(r=>r.customer||'Ohne Auftraggeber'))].sort((a,b)=>a.localeCompare(b,'de'));
    body=`<div class="archiveCrumb"><b>Kunden</b><span>${names.length} Kunde/Kunden</span></div>`+(names.map(name=>{const count=completed.filter(r=>(r.customer||'Ohne Auftraggeber')===name).length;return `<button type="button" class="archiveNavCard" data-customer="${esc(name)}"><span><b>${esc(name)}</b><small>${count} abgeschlossene Nachweis${count===1?'':'e'}</small></span><strong>›</strong></button>`}).join('')||'<div class="panel hint">Noch keine abgeschlossenen Liefernachweise vorhanden.</div>');
  }else if(!archiveProject){
    const projects=[...new Set(completed.filter(r=>(r.customer||'Ohne Auftraggeber')===archiveCustomer).map(r=>r.project||'Ohne Bauvorhaben'))].sort((a,b)=>a.localeCompare(b,'de'));
    body=`<button type="button" class="archiveBack" data-archive-back="customers">‹ Alle Kunden</button><div class="archiveCrumb"><b>${esc(archiveCustomer)}</b><span>Bauvorhaben auswählen</span></div>`+(projects.map(project=>{const count=completed.filter(r=>(r.customer||'Ohne Auftraggeber')===archiveCustomer&&(r.project||'Ohne Bauvorhaben')===project).length;return `<button type="button" class="archiveNavCard" data-project="${esc(project)}"><span><b>${esc(project)}</b><small>${count} abgeschlossene Nachweis${count===1?'':'e'}</small></span><strong>›</strong></button>`}).join('')||'<div class="panel hint">Für diesen Kunden sind keine Bauvorhaben mit Nachweisen vorhanden.</div>');
  }else{
    const records=completed.filter(r=>(r.customer||'Ohne Auftraggeber')===archiveCustomer&&(r.project||'Ohne Bauvorhaben')===archiveProject);
    body=`<button type="button" class="archiveBack" data-archive-back="projects">‹ Zurück zu den Bauvorhaben</button><div class="archiveCrumb"><b>${esc(archiveProject)}</b><span>${esc(archiveCustomer)}</span></div>`+records.map(r=>archiveCard(r,'PDF öffnen')).join('');
  }
  host.innerHTML=archiveTabs()+body;
  host.querySelectorAll('[data-archive-tab]').forEach(b=>b.onclick=()=>{archiveMode=b.dataset.archiveTab;archiveCustomer='';archiveProject='';renderArchive()});
  host.querySelectorAll('[data-customer]').forEach(b=>b.onclick=()=>{archiveCustomer=b.dataset.customer;archiveProject='';renderArchive()});
  host.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{archiveProject=b.dataset.project;renderArchive()});
  host.querySelectorAll('[data-archive-back]').forEach(b=>b.onclick=()=>{if(b.dataset.archiveBack==='customers'){archiveCustomer='';archiveProject=''}else archiveProject='';renderArchive()});
  bindArchiveCards();
}

function txt(page,text,x,y,size=9,bold=false){if(!text)return;page.drawText(String(text).slice(0,110),{x,y,size,font:bold?fontBold:font,color:PDFLib.rgb(.12,.15,.18),maxWidth:500})}
let font,fontBold;
function aggregateReportMaterials(rows){const totals=new Map(),individual=[];(rows||[]).forEach(m=>{const name=String(m.name||'').trim(),type=m.type||'delivery',unit=m.unit||'to',qty=parseQuantity(m.qty),includeDateTime=!!m.includeDateTime,date=includeDateTime?(m.date||''):'',time=includeDateTime?(m.time||''):'';if(!name||!qty)return;if(includeDateTime){individual.push({name,type,unit,qty,includeDateTime,date,time});return;}const key=[type,name,unit].join('||');if(!totals.has(key))totals.set(key,{name,type,unit,qty:0,includeDateTime:false,date:'',time:''});totals.get(key).qty+=qty});return [...totals.values(),...individual].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit)||String(a.date).localeCompare(String(b.date))||String(a.time).localeCompare(String(b.time)))}
async function makePdf(r){
  const {PDFDocument,StandardFonts,rgb}=PDFLib;
  const pdf=await PDFDocument.create();
  font=await pdf.embedFont(StandardFonts.Helvetica);
  fontBold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const logoBytes=await fetch('logo.png').then(x=>x.arrayBuffer());
  const logo=await pdf.embedPng(logoBytes);
  const W=595.28,H=841.89,M=42;
  const C={
    red:rgb(.78,.08,.13),ink:rgb(.13,.16,.20),muted:rgb(.43,.47,.52),
    line:rgb(.84,.87,.90),pale:rgb(.96,.97,.98),green:rgb(.91,.96,.92),
    redPale:rgb(1,.94,.94),gold:rgb(.96,.72,.25),white:rgb(1,1,1)
  };
  let page=null,y=0,pageNo=0,signatureDrawn=false;
  let signatureImage=null;
  if(r.signature){
    try{
      const signatureBytes=await fetch(r.signature).then(x=>x.arrayBuffer());
      signatureImage=await pdf.embedPng(signatureBytes);
    }catch(error){console.warn('Unterschrift konnte nicht eingebettet werden:',error);}
  }
  const draw=(text,x,yy,size=9,bold=false,color=C.ink,maxWidth=500)=>{
    if(text===undefined||text===null||text==='')return;
    page.drawText(String(text),{x,y:yy,size,font:bold?fontBold:font,color,maxWidth});
  };
  const line=(x1,y1,x2,y2,color=C.line,thick=1)=>page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:thick,color});
  const rect=(x,yy,w,h,color,border=null)=>page.drawRectangle({x,y:yy,width:w,height:h,color,borderColor:border||color,borderWidth:border?0.8:0});
  // Die Unterschrift steht bei einseitigen Nachweisen auf Seite 1,
  // bei mehrseitigen Nachweisen gesammelt auf der letzten Seite.
  const drawSignatureBlock=targetPage=>{
    if(signatureDrawn||!targetPage)return;
    const sigLineY=92;
    if(signatureImage){
      targetPage.drawImage(signatureImage,{x:M+2,y:sigLineY+8,width:145,height:48});
    }
    targetPage.drawLine({start:{x:M,y:sigLineY},end:{x:M+230,y:sigLineY},thickness:.7,color:C.line});
    targetPage.drawText('Unterschrift Auftraggeber / Abholer',{
      x:M,y:sigLineY-13,size:7,font,color:C.muted,maxWidth:250
    });
    signatureDrawn=true;
  };
  const wrap=(text,maxWidth,size,bold=false)=>{
    const lines=[];
    String(text||'').split('\n').forEach(paragraph=>{
      const words=paragraph.split(/\s+/);let cur='';
      for(const word of words){if(!word)continue;const test=cur?cur+' '+word:word;if((bold?fontBold:font).widthOfTextAtSize(test,size)>maxWidth&&cur){lines.push(cur);cur=word}else cur=test}
      if(cur)lines.push(cur);
    });
    return lines;
  };
  const footer=()=>{
    line(M,35,W-M,35,C.line,.8);
    draw('Dählmann Sand • Kies • Baustoffe · Südring 11 · 27404 Zeven',M,22,7,false,C.muted);
    draw(`Seite ${pageNo}`,W-M-42,22,7,false,C.muted,42);
  };
  const newPage=()=>{
    page=pdf.addPage([W,H]);pageNo++;y=H-48;
    page.drawImage(logo,{x:W-M-174,y:H-104,width:174,height:54});
    draw('LIEFERNACHWEIS',M,H-72,20,true,C.ink);
    line(M,H-119,W-M,H-119,C.line,1);
    footer();
    if(pageNo===1){
      y=H-145;
    }else{
      draw('FORTSETZUNG ZUM LIEFERNACHWEIS',M,H-148,11,true,C.ink);
      draw('Fortsetzung zu Seite 1',M,H-165,8,false,C.muted);
      draw('AUFTRAGGEBER',M,H-188,7,true,C.muted);
      draw(String(r.customer||'—'),M,H-201,9,true,C.ink,260);
      draw('LIEFERDATUM',W-M-150,H-188,7,true,C.muted);
      const continuationDate=r.date?new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'):'—';
      draw(continuationDate,W-M-150,H-201,9,true,C.ink,150);
      if(r.project){
        draw('BAUVORHABEN',M,H-218,7,true,C.muted);
        draw(String(r.project),M,H-231,9,true,C.ink,400);
        line(M,H-244,W-M,H-244,C.line,.8);
        y=H-265;
      }else{
        line(M,H-218,W-M,H-218,C.line,.8);
        y=H-239;
      }
    }
  };
  const sectionTitle=(title,subtitle=null)=>{
    if(y<205)newPage();
    draw(title,M,y,14,true,C.ink);
    if(subtitle)draw(subtitle,M+title.length*6.4+8,y,8,false,C.muted);
    y-=12;line(M,y,W-M,y,C.line,.8);y-=14;
  };
  const materialSectionTitle=(title)=>{
    if(y<205)newPage();
    // Nur mehr Weißraum und eine feine neutrale Trennlinie – keine Farbflächen.
    y-=16;
    draw(title,M,y,14,true,C.ink);
    y-=13;
    line(M,y,W-M,y,C.line,.8);
    y-=18;
  };
  const drawTable=(headers,rows,widths,opts={})=>{
    const x=M,rowH=opts.rowH||25;
    const headerH=25;
    if(y<headerH+rowH+165)newPage();
    rect(x,y-headerH,W-2*M,headerH,rgb(.88,.91,.94));
    let xx=x+9;
    headers.forEach((h,i)=>{draw(h,xx,y-17,9.5,true,C.ink,widths[i]-12);xx+=widths[i]});
    y-=headerH;
    rows.forEach((row,ri)=>{
      const cells=row.map((v,i)=>String(v??''));
      const wrapped=cells.map((v,i)=>wrap(v,widths[i]-12,8,false));
      const maxLines=Math.max(1,...wrapped.map(a=>a.length));
      const h=Math.max(rowH,maxLines*10+12);
      if(y-h<165){newPage();rect(x,y-headerH,W-2*M,headerH,rgb(.88,.91,.94));let hx=x+9;headers.forEach((t,i)=>{draw(t,hx,y-17,9.5,true,C.ink,widths[i]-12);hx+=widths[i]});y-=headerH}
      rect(x,y-h,W-2*M,h,ri%2===0?C.white:C.pale);
      let cx=x+9;
      wrapped.forEach((ls,i)=>{ls.slice(0,4).forEach((t,j)=>draw(t,cx,y-15-j*10,8,false,C.ink,widths[i]-12));cx+=widths[i]});
      line(x,y-h,x+W-2*M,y-h,C.line,.45);y-=h;
    });
    y-=18;
  };
  newPage();
  const dateText=r.date?new Date(r.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}):'';
  // Empfänger und Dokumentdaten in zwei klar getrennten Spalten
  draw('AUFTRAGGEBER',M,y,8,true,C.ink);
  draw('LIEFERDATUM',W-M-150,y,8,true,C.ink);
  y-=18;
  draw(r.customer||'—',M,y,12,true,C.ink,300);
  draw(dateText,W-M-150,y,9,true,C.ink,150);
  y-=17;
  (r.address||'').split(/\n/).filter(Boolean).slice(0,3).forEach(s=>{draw(s,M,y,9,false,C.ink,290);y-=13});
  y-=12;
  rect(M,y-42,W-2*M,42,C.pale);
  draw('BAUVORHABEN',M+12,y-15,8,true,C.ink);
  draw(r.project||'Kein Bauvorhaben angegeben',M+12,y-31,10,true,r.project?C.ink:C.muted,W-2*M-24);
  y-=62;

  const materials=aggregateReportMaterials(r.materials||[]);
  const delivered=materials.filter(m=>m.type!=='haul');
  const hauled=materials.filter(m=>m.type==='haul');
  const drawMaterialTable=list=>{
    const hasTimestamps=list.some(m=>m.includeDateTime&&m.date);
    const hasVehicles=list.some(m=>m.vehicle);
    const headers=['Bezeichnung'];
    const widths=[hasTimestamps||hasVehicles?180:390];
    if(hasVehicles){headers.push('Fahrzeug');widths.push(105);}
    if(hasTimestamps){headers.push('Zeitstempel');widths.push(145);}
    headers.push('Menge');widths.push(81);
    const rows=list.map(m=>{
      const row=[m.name];
      if(hasVehicles)row.push(m.vehicle||'');
      if(hasTimestamps)row.push(m.includeDateTime?formatMaterialDateTime(m.date,m.time):'');
      row.push(formatQuantity(m.qty)+' '+(m.unit==='to'?'to':'m³'));
      return row;
    });
    drawTable(headers,rows,widths);
  };
  if(delivered.length){materialSectionTitle('Material geliefert');drawMaterialTable(delivered);}
  if(hauled.length){materialSectionTitle('Material abgefahren');drawMaterialTable(hauled);}
  if(!delivered.length&&!hauled.length){materialSectionTitle('Material');draw('Keine Materialien erfasst.',M+10,y,9,false,C.muted);y-=22;}

  if((r.services||[]).length){
    // Überschrift, Tabellenkopf und mindestens die erste Leistungszeile
    // müssen zusammen auf eine Seite passen.
    if(y<280)newPage();
    materialSectionTitle('Zusatzleistungen');
    const serviceRows=r.services.map(s=>[
      [s.job,s.description].filter(Boolean).join('\n')||'—',
      s.hours?String(s.hours)+' Std.':'—',
      s.start||'—',s.end||'—',
      s.pause?String(s.pause)+' Min.':'—'
    ]);
    drawTable(['Leistung / Beschreibung','Stunden','Anfang','Ende','Pause'],serviceRows,[235,65,65,65,81],{rowH:30});
  }
  // Bei mehrseitigen PDFs die Unterschrift auf der letzten Seite platzieren.
  // Bei einseitigen PDFs bleibt sie wie bisher auf Seite 1.
  drawSignatureBlock(page);
  return await pdf.save();
}
function cleanCustomerFilePart(value){
  return String(value||'').trim()
    .replace(/\b(GmbH\s*&\s*Co\.\s*KG|GmbH\s*&\s*Co\.?\s*KG|g\.?GmbH|GmbH|g\.Gmb\.H\.|mbH|AG|KG|OHG|UG(?:\s*\(haftungsbeschränkt\))?|KGaA|Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|PLC|e\.?K\.?|e\.?V\.)\b/gi,'')
    .replace(/[\\/:*?\"<>|]/g,'').replace(/\s+/g,' ').trim().replace(/^[, ._-]+|[, ._-]+$/g,'');
}
function cleanProjectFilePart(value){return String(value||'').trim().replace(/[\\/:*?\"<>|]/g,'').replace(/\s+/g,' ').replace(/\s*,\s*/g,', ').replace(/^[ ._-]+|[ ._-]+$/g,'')}
function pdfFileName(r){
  const customer=cleanCustomerFilePart(r.customer)||'Kunde';
  const project=cleanProjectFilePart(r.project)||'Ohne Bauvorhaben';
  const createdValue=Number(r.createdAt||r.id);
  const createdDate=Number.isFinite(createdValue)&&createdValue>0?new Date(createdValue):new Date();
  const date=String(createdDate.getDate()).padStart(2,'0')+'.'+String(createdDate.getMonth()+1).padStart(2,'0')+'.'+createdDate.getFullYear();
  return `${customer} - LN ${date} - ${project}.pdf`;
}
function savePreviewPdf(r){
  if(!pdfPreviewBlob){alert('Die PDF-Datei ist noch nicht bereit. Bitte öffne die Vorschau erneut.');return;}
  const filename=pdfFileName(r);
  const file=new File([pdfPreviewBlob],filename,{type:'application/pdf'});
  // Auf iPad/iPhone öffnet die Teilen-Funktion den iOS-Dialog „In Dateien sichern“.
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:filename}).catch(error=>{if(error&&error.name!=='AbortError')alert('Das Speichern wurde nicht abgeschlossen: '+error.message)});
    return;
  }
  // Browser mit nativem Dateiauswahldialog können den Speicherort direkt wählen lassen.
  if(window.showSaveFilePicker){
    (async()=>{try{const handle=await window.showSaveFilePicker({suggestedName:filename,types:[{description:'PDF-Dokument',accept:{'application/pdf':['.pdf']}}]});const writable=await handle.createWritable();await writable.write(pdfPreviewBlob);await writable.close();}catch(error){if(error&&error.name!=='AbortError')alert('Das PDF konnte nicht gespeichert werden: '+error.message)}})();
    return;
  }
  const url=URL.createObjectURL(pdfPreviewBlob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
async function downloadPdf(r){try{let bytes=await makePdf(r);let blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=pdfFileName(r);a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(e){alert('PDF konnte nicht erstellt werden: '+e.message)}}
function validateDocument(r){if(!r.customer){alert('Bitte einen Auftraggeber auswählen.');return false;}if(!r.materials.length&&!r.services.length){alert('Bitte mindestens ein Material oder eine Zusatzleistung eintragen.');return false;}return true}
async function openPdfPreview(r){
  try{
    const bytes=await makePdf(r);
    if(pdfPreviewUrl)URL.revokeObjectURL(pdfPreviewUrl);
    pdfPreviewBlob=new Blob([bytes],{type:'application/pdf'});
    pdfPreviewUrl=URL.createObjectURL(pdfPreviewBlob);
    $('pdfPreviewFrame').src=pdfPreviewUrl;
    $('pdfPreviewTitle').textContent=pdfFileName(r);
    $('pdfPreviewModal').hidden=false;
    $('pdfPreviewModal').setAttribute('aria-hidden','false');
    $('pdfPreviewModal').classList.add('open');
    $('downloadPreviewPdf').onclick=()=>savePreviewPdf(r);
  }catch(e){alert('PDF konnte nicht erstellt werden: '+e.message)}
}
function closePdfPreview(){
  $('pdfPreviewModal').classList.remove('open');
  $('pdfPreviewModal').hidden=true;
  $('pdfPreviewModal').setAttribute('aria-hidden','true');
  $('pdfPreviewFrame').src='about:blank';
  if(pdfPreviewUrl){URL.revokeObjectURL(pdfPreviewUrl);pdfPreviewUrl=null;}
  pdfPreviewBlob=null;
}
$('closePdfPreview').onclick=closePdfPreview;
$('savePdf').onclick=async()=>{
  if(autoSaveTimer)clearTimeout(autoSaveTimer);
  let r=collect();if(!validateDocument(r))return;
  r.id=currentDraftId||r.id;r.pdf=true;r.draft=false;
  const i=db.reports.findIndex(x=>String(x.id)===String(r.id));
  if(i>=0)db.reports[i]=r;else db.reports.push(r);
  save();currentDraftId=r.id;renderArchive();
setTimeout(showResumeDraftModal, 350);

// Automatische Entwurfssicherung: Änderungen im Formular werden nach kurzer Pause lokal gespeichert.
$('form').addEventListener('input',scheduleAutoSave,true);
$('form').addEventListener('change',scheduleAutoSave,true);
$('form').addEventListener('click',event=>{if(event.target.closest('button'))scheduleAutoSave()},true);
canvas.addEventListener('pointerup',scheduleAutoSave);
window.addEventListener('pagehide',()=>{if(autoSaveTimer)clearTimeout(autoSaveTimer);autoSaveDraft();});
window.addEventListener('beforeunload',()=>{if(autoSaveTimer)clearTimeout(autoSaveTimer);autoSaveDraft();});

  await openPdfPreview(r);
};
$('saveDocument').onclick=()=>{if(persistDraft())show('home')};
renderArchive();

// Automatische Entwurfssicherung: Änderungen im Formular werden nach kurzer Pause lokal gespeichert.
$('form').addEventListener('input',scheduleAutoSave,true);
$('form').addEventListener('change',scheduleAutoSave,true);
$('form').addEventListener('click',event=>{if(event.target.closest('button'))scheduleAutoSave()},true);
canvas.addEventListener('pointerup',scheduleAutoSave);
window.addEventListener('pagehide',()=>{if(autoSaveTimer)clearTimeout(autoSaveTimer);autoSaveDraft();});
window.addEventListener('beforeunload',()=>{if(autoSaveTimer)clearTimeout(autoSaveTimer);autoSaveDraft();});



// Explicitly wire the main create button. This also protects the primary action from stale handlers.
(function wireCreateDeliveryButton(){
  const button = $('goNew');
  if (!button) return;
  button.onclick = function(event){
    if (event) event.preventDefault();
    closeResumeDraftModal();
    try {
      fresh();
    } catch (error) {
      console.error('Neuer Liefernachweis konnte nicht initialisiert werden:', error);
      try {
        currentDraftId = null;
        setAutoSaveStatus('Neuer Liefernachweis');
        show('form');
      } catch (fallbackError) {
        console.error('Formular konnte nicht geöffnet werden:', fallbackError);
      }
    }
  };
})();



// Version 102: Wiegenote fotografieren, OCR prüfen und als einzelne Lieferung übernehmen.
(function setupWeighNoteScanner(){
  const scanButton=$('scanWeighNote'),fileInput=$('weighNoteFile'),modal=$('weighScanModal');
  if(!scanButton||!fileInput||!modal)return;
  let ocrScriptPromise=null;
  const loadTesseract=()=>new Promise((resolve,reject)=>{
    if(window.Tesseract)return resolve(window.Tesseract);
    if(ocrScriptPromise)return ocrScriptPromise.then(resolve,reject);
    ocrScriptPromise=new Promise((res,rej)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js';
      script.onload=()=>res(window.Tesseract);
      script.onerror=()=>rej(new Error('Texterkennung konnte nicht geladen werden.'));
      document.head.appendChild(script);
    });
    ocrScriptPromise.then(resolve,reject);
  });
  const setField=(id,value)=>{const el=$(id);if(el)el.value=value||'';};
  const parseTicket=text=>{
    const lines=String(text||'').split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
    const all=lines.join('\n');
    const valueAfter=(label)=>{
      const re=new RegExp(label,'i');
      for(const line of lines){
        const match=re.exec(line);
        if(!match)continue;
        const after=line.slice(match.index+match[0].length).replace(/^\\s*[:\\-]?\\s*/,'').trim();
        const before=line.slice(0,match.index).replace(/[|:;\\-]+\\s*$/,'').trim();
        // Thermodrucker setzen den Wert oft links und die Feldbezeichnung rechts.
        return after||before;
      }
      return '';
    };
    let bon=valueAfter('Bon\\s*[-.]?\\s*Nr\\.?').replace(/\s*Bon.*/i,'').trim();
    let weight=valueAfter('Gewicht').match(/\d+[.,]?\d*/)?.[0]||'';
    let customer=valueAfter('Kunde').replace(/Kunde.*/i,'').trim();
    let material=valueAfter('Material').replace(/Material.*/i,'').trim();
    let site=valueAfter('Baustelle').replace(/Baustelle.*/i,'').trim();
    let vehicle=valueAfter('Fahrzeug').replace(/Fahrzeug.*/i,'').trim().replace(/\s+/g,' ').toUpperCase();
    let date=valueAfter('Datum').match(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/)?.[0]||'';
    let time=valueAfter('Uhrzeit').match(/\d{1,2}[:.]\d{2}/)?.[0]||'';
    const dm=date.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if(dm){let year=dm[3].length===2?'20'+dm[3]:dm[3];date=year+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0');}
    time=time.replace('.',':');if(time&&!/^\d{2}:\d{2}$/.test(time))time='0'+time;
    // Fallback for thermal printer layouts where OCR puts value and label on separate lines.
    const afterLabel=(label)=>{const i=lines.findIndex(l=>new RegExp(label,'i').test(l));if(i<0)return '';const same=lines[i].replace(new RegExp('.*?'+label+'\\s*','i'),'').trim();return same||lines[i+1]||'';};
    bon=bon||afterLabel('Bon\\s*[-.]?\\s*Nr');weight=weight||afterLabel('Gewicht').match(/\d+[.,]?\d*/)?.[0]||'';
    customer=customer||afterLabel('Kunde');material=material||afterLabel('Material');site=site||afterLabel('Baustelle');vehicle=vehicle||afterLabel('Fahrzeug');
    return {bon,weight,customer,material,site,vehicle,date,time};
  };
  const close=()=>{modal.hidden=true;modal.setAttribute('aria-hidden','true');};
  document.querySelectorAll('[data-close-weigh]').forEach(el=>el.addEventListener('click',close));
  scanButton.addEventListener('click',()=>{fileInput.value='';fileInput.click();});
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files&&fileInput.files[0];if(!file)return;
    $('weighScanStatus').textContent='Wiegenote wird gelesen … Bitte einen Moment warten.';
    modal.hidden=false;modal.setAttribute('aria-hidden','false');
    try{
      const T=await loadTesseract();
      const result=await T.recognize(file,'deu+eng',{logger:m=>{if(m.status==='recognizing text')$('weighScanStatus').textContent='Texterkennung: '+Math.round((m.progress||0)*100)+' %';}});
      const data=parseTicket(result.data.text);
      setField('weighBon',data.bon);setField('weighCustomer',data.customer);setField('weighSite',data.site);
      setField('weighMaterial',data.material);setField('weighWeight',data.weight);setField('weighVehicle',data.vehicle);
      setField('weighDate',data.date);setField('weighTime',data.time);
      $('weighScanStatus').textContent='Erkennung abgeschlossen. Bitte Angaben prüfen und korrigieren.';
    }catch(error){
      console.error('Wiegenoten-Erkennung:',error);
      $('weighScanStatus').textContent='Die automatische Erkennung ist fehlgeschlagen. Du kannst die Angaben unten manuell eintragen.';
      ['weighBon','weighCustomer','weighSite','weighMaterial','weighWeight','weighVehicle','weighDate','weighTime'].forEach(id=>setField(id,''));
    }
  });
  $('addWeighScan').addEventListener('click',()=>{
    const name=$('weighMaterial').value.trim(),qty=$('weighWeight').value.trim(),date=$('weighDate').value,time=$('weighTime').value;
    if(!name)return alert('Bitte das Material kontrollieren oder eintragen.');
    if(!qty||parseQuantity(qty)<=0)return alert('Bitte ein gültiges Gewicht in Tonnen eintragen.');
    if(!date||!time)return alert('Bitte Datum und Uhrzeit der Wiegenote kontrollieren.');
    enteredMaterials.push({name,type:'delivery',qty,unit:'to',includeDateTime:true,date,time,vehicle:$('weighVehicle').value.trim().toUpperCase(),weighBon:$('weighBon').value.trim(),weighCustomer:$('weighCustomer').value.trim(),weighSite:$('weighSite').value.trim()});
    renderMaterialSummary();close();setAutoSaveStatus('Wiegenote übernommen – wird automatisch gespeichert');scheduleAutoSave();
  });
})();

// Version 87: reliably show the Dählmann draft chooser after app initialization and on Safari return.
function openStartupDraftChooser(){
  try{
    const drafts=(db && Array.isArray(db.reports)) ? db.reports.filter(r=>r && r.draft) : [];
    if(!drafts.length)return;
    const modal=$('resumeDraftModal');
    if(!modal || !modal.hidden)return;
    showResumeDraftModal();
    modal.style.display='flex';
  }catch(error){console.error('Entwurfsauswahl konnte nicht geöffnet werden:',error);}
}
if(document.readyState==="loading")window.addEventListener("DOMContentLoaded",()=>window.setTimeout(openStartupDraftChooser,500),{once:true}); else window.setTimeout(openStartupDraftChooser,500);

// Version 98: reliable draft opening and date/time in saved-draft archive.\n