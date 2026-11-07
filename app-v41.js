
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
$('goNew').onclick=fresh;$('goDeliveries').onclick=()=>show('home');$('goMaster').onclick=()=>show('master');$('homeMaster').onclick=()=>show('master');$('homeWelcome').onclick=()=>show('welcome');document.querySelectorAll('.back').forEach(b=>b.onclick=()=>show(b.closest('#master')?'welcome':'master'));
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
let activeMaterialType='delivery';
let enteredMaterials=[];
let currentDraftId=null;
function openMaterialModal(type){
  activeMaterialType=type;
  const list=type==='haul'?(db.haulMaterials||[]):(db.deliveryMaterials||[]);
  $('materialModalTitle').textContent=type==='haul'?'Material abgefahren':'Material geliefert';
  $('modalMaterialLabel').firstChild.textContent=type==='haul'?'Abfuhrmaterial':'Liefermaterial';
  fillSelect($('modalMaterial'),list,'Material wählen');
  $('modalQuantity').value='';
  $('modalUnit').value='to';
  $('materialModal').classList.add('open');
  $('materialModal').setAttribute('aria-hidden','false');
  if(!list.length){alert(type==='haul'?'Bitte zuerst unter Stammdaten Abfuhrmaterial anlegen.':'Bitte zuerst unter Stammdaten Liefermaterial anlegen.');closeMaterialModal();return;}
}
function closeMaterialModal(){$('materialModal').classList.remove('open');$('materialModal').setAttribute('aria-hidden','true')}
$('chooseDelivered').onclick=()=>openMaterialModal('delivery');
$('chooseHauled').onclick=()=>openMaterialModal('haul');
$('cancelMaterial').onclick=closeMaterialModal;
document.querySelectorAll('[data-close-material]').forEach(el=>el.onclick=closeMaterialModal);
$('confirmMaterial').onclick=()=>{
  const name=$('modalMaterial').value,qty=$('modalQuantity').value.trim(),unit=$('modalUnit').value;
  if(!name)return alert('Bitte ein Material auswählen.');
  if(!qty||parseQuantity(qty)<=0)return alert('Bitte eine gültige Menge eingeben.');
  enteredMaterials.push({name,type:activeMaterialType,qty,unit});
  renderMaterialSummary();closeMaterialModal();
};
function parseQuantity(value){let s=String(value||'').trim().replace(/\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.replace(/\\./g,'').replace(',','.');else s=s.replace(',','.');const n=Number(s);return Number.isFinite(n)&&n>0?n:0}
function formatQuantity(n){return n.toLocaleString('de-DE',{maximumFractionDigits:3})}
function materialTotals(){const totals=new Map();enteredMaterials.forEach(m=>{const key=[m.type,m.name,m.unit].join('||');if(!totals.has(key))totals.set(key,{...m,qty:0});totals.get(key).qty+=parseQuantity(m.qty)});return [...totals.values()].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit))}
function renderMaterialSummary(){
  const el=$('materialRows');if(!el)return;
  const totals=materialTotals();
  if(!totals.length){el.innerHTML='<h3>Erfasste Materialien</h3><p class="hint">Noch keine Materialien erfasst.</p>';return;}
  const group=(type,title,cls)=>{const rows=totals.filter(t=>t.type===type);return rows.length?`<section class="materialGroup ${cls}"><h4>${title}</h4>${rows.map(t=>`<div class="swipeMaterial" data-swipe-type="${t.type}" data-swipe-name="${esc(t.name)}" data-swipe-unit="${t.unit}"><button type="button" class="swipeDelete" aria-label="Material löschen">×</button><div class="summaryRow"><b>${esc(t.name)}</b><span>${formatQuantity(t.qty)} ${t.unit==='to'?'to':'cbm'}</span></div></div>`).join('')}</section>`:''};
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
        enteredMaterials=enteredMaterials.filter(m=>!(m.type===type&&m.name===name&&m.unit===unit));
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
  <label class="hours">Stunden<input class="hoursv" type="number" inputmode="decimal" step="0.25" min="0" value="${esc(data.hours||'')}" placeholder="Std."></label>
  <label class="start">Anfang<select class="startv">${timeOptions(data.start||'')}</select></label>
  <label class="end">Ende<select class="endv">${timeOptions(data.end||'')}</select></label>
  <label class="pause">Pause<select class="pausev"><option value="">—</option><option value="15" ${String(data.pause)==='15'?'selected':''}>15 Min.</option><option value="30" ${String(data.pause)==='30'?'selected':''}>30 Min.</option><option value="45" ${String(data.pause)==='45'?'selected':''}>45 Min.</option></select></label>`;
  if(data.job){d.querySelector('.servicePickButton').dataset.value=data.job;d.querySelector('.servicePickButton').textContent=data.job+' ▾';}
  d.querySelector('.servicePickButton').onclick=()=>openServiceModal(d);
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
function setWizardStep(step){wizardStep=step;document.querySelectorAll('.wizardStep').forEach(el=>el.classList.toggle('active',Number(el.dataset.wizard)===step));$('wizardProgress').textContent=['','Schritt 1 von 5 · Auftraggeber','Schritt 2 von 5 · Material','Schritt 3 von 5 · Zusatzleistungen','Schritt 4 von 5 · Zusammenfassung','Schritt 5 von 5 · Abschluss'][step];window.scrollTo(0,0);}
$('toMaterials').onclick=()=>{if(!$('customer').value)return alert('Bitte zuerst einen Auftraggeber auswählen.');setWizardStep(2)};
$('backToCustomer').onclick=()=>setWizardStep(1);
$('toServices').onclick=()=>setWizardStep(3);
$('backToMaterials').onclick=()=>setWizardStep(2);
function renderReportSummary(){
  const r=collect(),el=$('reportSummary');if(!el)return;
  const mats=materialTotals(),delivered=mats.filter(m=>m.type!=='haul'),hauled=mats.filter(m=>m.type==='haul');
  const block=(title,list,cls)=>list.length?`<section class="summaryBlock ${cls}"><h3>${title}</h3>${list.map(m=>`<div class="summaryLine"><b>${esc(m.name)}</b><span>${formatQuantity(m.qty)} ${m.unit==='to'?'to':'cbm'}</span></div>`).join('')}</section>`:'';
  const services=r.services.map(s=>`<div class="summaryService"><b>${esc(s.job||'Leistung')}</b>${s.description?`<div>${esc(s.description)}</div>`:''}<small>${esc(s.hours||'—')} Std. · ${esc(s.start||'—')} bis ${esc(s.end||'—')} · Pause ${esc(s.pause||'0')} Min.</small></div>`).join('');
  el.innerHTML=`<div class="summaryMeta"><b>${esc(r.customer||'—')}</b><div>${esc(r.address||'')}</div><div>Datum: ${esc(r.date||'—')}</div><div>Bauvorhaben: ${esc(r.project||'Kein Bauvorhaben')}</div></div>${block('Material geliefert',delivered,'deliveryGroup')}${block('Material abgefahren',hauled,'haulGroup')}${services?`<section class="summaryBlock"><h3>Zusatzleistungen</h3>${services}</section>`:'<p class="hint">Keine Zusatzleistungen erfasst.</p>'}`;
}
$('toSummary').onclick=()=>{renderReportSummary();setWizardStep(4)};
$('backToServices').onclick=()=>setWizardStep(3);
$('toFinish').onclick=()=>setWizardStep(5);
$('backToSummary').onclick=()=>{renderReportSummary();setWizardStep(4)};

function fresh(){ currentDraftId=null; $('date').value=localDateValue();updateDateDisplay();fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');$('address').value='';fillSelect($('project'),[],'Bauvorhaben wählen');enteredMaterials=[];$('materialRows').innerHTML='<p class="hint">Noch keine Materialien erfasst.</p>';$('serviceRows').innerHTML='';$('signer').value='';clearSig();closeSignature();setWizardStep(1);show('form')}
$('customer').onchange=()=>{let c=db.customers.find(c=>c.name===$('customer').value);$('address').value=c?.address||'';fillSelect($('project'),db.projects.filter(p=>p.owner===c?.name).map(p=>p.name),'Bauvorhaben wählen')};
$('newBtn').onclick=fresh;$('cancel').onclick=()=>show('home');
const serviceModal=$('serviceModal');serviceModal.hidden=true;serviceModal.classList.remove('open');
const signatureModal=$('signatureModal'); signatureModal.hidden=true; signatureModal.classList.remove('open');
const canvas=$('signature'),ctx=canvas.getContext('2d');let drawing=false,ink=false,signatureSaved=false;function pos(e){let r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}canvas.onpointerdown=e=>{drawing=true;ink=true;canvas.setPointerCapture(e.pointerId);let p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;let p=pos(e);ctx.lineWidth=4;ctx.lineCap='round';ctx.strokeStyle='#18212b';ctx.lineTo(p.x,p.y);ctx.stroke()};canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height);ink=false;signatureSaved=false;$('signatureStatus').textContent='Noch keine Unterschrift hinterlegt.'} $('clearSig').onclick=clearSig;
function openSignature(){ const modal=$('signatureModal'); modal.hidden=false; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeSignature(){ const modal=$('signatureModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); modal.hidden=true; }
$('openSignature').onclick=openSignature;$('cancelSignature').onclick=closeSignature;document.querySelectorAll('[data-close-signature]').forEach(el=>el.onclick=closeSignature);
$('confirmSignature').onclick=()=>{if(!ink)return alert('Bitte zuerst unterschreiben.');signatureSaved=true;$('signatureStatus').textContent='Unterschrift übernommen'+($('signer').value.trim()?' · '+$('signer').value.trim():'')+'.';closeSignature();};
function collect(){return {id:Date.now(),date:$('date').value,customer:$('customer').value,address:$('address').value,project:$('project').value||'',materials:enteredMaterials.map(m=>({...m})),services:[...$('serviceRows').querySelectorAll('.entry')].map(d=>({job:d.querySelector('.servicePickButton')?.dataset.value||'',description:d.querySelector('.descriptionv').value,hours:d.querySelector('.hoursv').value,start:d.querySelector('.startv').value,end:d.querySelector('.endv').value,pause:d.querySelector('.pausev').value})).filter(x=>Object.values(x).some(Boolean)),signature:signatureSaved&&ink?canvas.toDataURL('image/png'):null,signer:signatureSaved?$('signer').value:''}}

function persistDraft(){
  const r=collect();
  if(!r.customer){alert('Bitte zuerst einen Auftraggeber auswählen.');return false;}
  r.draft=true;r.pdf=false;
  if(currentDraftId){const i=db.reports.findIndex(x=>String(x.id)===String(currentDraftId));if(i>=0)db.reports[i]=r;else db.reports.push(r);}
  else {db.reports.push(r);currentDraftId=r.id;}
  save();renderArchive();alert('Zwischenstand wurde gespeichert. Du kannst den Liefernachweis später unter „Liefernachweise“ öffnen und weiterbearbeiten.');return true;
}
function openDraft(r){
  currentDraftId=r.id;
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
  closeSignature();setWizardStep(2);show('form');
}
function renderArchive(){
  $('archive').innerHTML=db.reports.slice().sort((a,b)=>b.id-a.id).map(r=>`<div class="archiveSwipeItem" data-archive-id="${r.id}"><button type="button" class="archiveDelete" aria-label="Liefernachweis löschen">×</button><div class="archiveCard"><div><b>${esc(r.customer||'Ohne Auftraggeber')}</b><small>${esc(new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'))} · ${esc(r.project||'Ohne Bauvorhaben')} · ${r.draft?'Entwurf – weiterbearbeiten':r.pdf?'PDF erstellt':'Gespeichert'}</small></div><button class="soft" data-open-r="${r.id}">${r.draft?'Weiterbearbeiten':'PDF öffnen'}</button></div></div>`).join('')||'<div class="panel hint">Noch keine Liefernachweise gespeichert.</div>';
  document.querySelectorAll('[data-open-r]').forEach(b=>b.onclick=()=>{let r=db.reports.find(x=>String(x.id)===b.dataset.openR);if(!r)return;if(r.draft)openDraft(r);else downloadPdf(r)});
  document.querySelectorAll('.archiveSwipeItem').forEach(item=>{
    const card=item.querySelector('.archiveCard'),del=item.querySelector('.archiveDelete');
    let sx=0,sy=0,tracking=false,lastX=0;
    card.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;lastX=e.clientX;tracking=true;});
    card.addEventListener('pointermove',e=>{
      if(!tracking)return;
      const dx=e.clientX-sx,dy=e.clientY-sy;
      if(dx<0&&Math.abs(dx)>Math.abs(dy)*1.2)card.style.transform=`translateX(${Math.max(-72,dx)}px)`;
      lastX=e.clientX;
    });
    const finish=e=>{
      if(!tracking)return;tracking=false;
      const dx=(e?.clientX??lastX)-sx,dy=(e?.clientY??sy)-sy;
      if(dx < -42&&Math.abs(dx)>Math.abs(dy)*1.15){
        item.classList.add('archive-open');card.style.transform='translateX(-72px)';
      }else if(dx>25){
        item.classList.remove('archive-open');card.style.transform='';
      }
    };
    card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
    del.onclick=()=>{
      const id=item.dataset.archiveId;
      const report=db.reports.find(x=>String(x.id)===String(id));
      if(!report)return;
      if(confirm(`Liefernachweis vom ${new Date(report.date+'T12:00:00').toLocaleDateString('de-DE')} für „${report.customer||'Ohne Auftraggeber'}“ wirklich löschen?`)){
        db.reports=db.reports.filter(x=>String(x.id)!==String(id));
        if(String(currentDraftId)===String(id))currentDraftId=null;
        save();renderArchive();
      }
    };
  });
}
function txt(page,text,x,y,size=9,bold=false){if(!text)return;page.drawText(String(text).slice(0,110),{x,y,size,font:bold?fontBold:font,color:PDFLib.rgb(.12,.15,.18),maxWidth:500})}
let font,fontBold;
function aggregateReportMaterials(rows){const totals=new Map();(rows||[]).forEach(m=>{const name=String(m.name||'').trim(),type=m.type||'delivery',unit=m.unit||'to',qty=parseQuantity(m.qty);if(!name||!qty)return;const key=[type,name,unit].join('||');if(!totals.has(key))totals.set(key,{name,type,unit,qty:0});totals.get(key).qty+=qty});return [...totals.values()].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit))}
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
  let page=null,y=0,pageNo=0;
  const draw=(text,x,yy,size=9,bold=false,color=C.ink,maxWidth=500)=>{
    if(text===undefined||text===null||text==='')return;
    page.drawText(String(text),{x,y:yy,size,font:bold?fontBold:font,color,maxWidth});
  };
  const line=(x1,y1,x2,y2,color=C.line,thick=1)=>page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:thick,color});
  const rect=(x,yy,w,h,color,border=null)=>page.drawRectangle({x,y:yy,width:w,height:h,color,borderColor:border||color,borderWidth:border?0.8:0});
  const wrap=(text,maxWidth,size,bold=false)=>{
    const words=String(text||'').split(/\s+/);const lines=[];let cur='';
    for(const word of words){const test=cur?cur+' '+word:word;if((bold?fontBold:font).widthOfTextAtSize(test,size)>maxWidth&&cur){lines.push(cur);cur=word}else cur=test}
    if(cur)lines.push(cur);return lines;
  };
  const footer=()=>{
    line(M,35,W-M,35,C.line,.8);
    draw('Dählmann ErdBau GmbH · Südring 11 · 27404 Zeven',M,22,7,false,C.muted);
    draw(`Seite ${pageNo}`,W-M-42,22,7,false,C.muted,42);
  };
  const newPage=()=>{
    page=pdf.addPage([W,H]);pageNo++;y=H-48;
    page.drawImage(logo,{x:W-M-174,y:H-104,width:174,height:54});
    draw('LIEFerNACHWEIS'.toUpperCase(),M,H-72,20,true,C.ink);
    line(M,H-119,W-M,H-119,C.line,1);
    footer();
    y=H-145;
  };
  const sectionTitle=(title,subtitle=null)=>{
    if(y<100)newPage();
    draw(title,M,y,14,true,C.ink);
    if(subtitle)draw(subtitle,M+title.length*6.4+8,y,8,false,C.muted);
    y-=12;line(M,y,W-M,y,C.line,.8);y-=14;
  };
  const drawTable=(headers,rows,widths,opts={})=>{
    const x=M,rowH=opts.rowH||25;
    const headerH=25;
    if(y<headerH+rowH+58)newPage();
    rect(x,y-headerH,W-2*M,headerH,rgb(.88,.91,.94));
    let xx=x+9;
    headers.forEach((h,i)=>{draw(h,xx,y-17,9.5,true,C.ink,widths[i]-12);xx+=widths[i]});
    y-=headerH;
    rows.forEach((row,ri)=>{
      const cells=row.map((v,i)=>String(v??''));
      const wrapped=cells.map((v,i)=>wrap(v,widths[i]-12,8,false));
      const maxLines=Math.max(1,...wrapped.map(a=>a.length));
      const h=Math.max(rowH,maxLines*10+12);
      if(y-h<55){newPage();rect(x,y-headerH,W-2*M,headerH,rgb(.88,.91,.94));let hx=x+9;headers.forEach((t,i)=>{draw(t,hx,y-17,9.5,true,C.ink,widths[i]-12);hx+=widths[i]});y-=headerH}
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
  const matRows=list=>list.map(m=>[m.name,formatQuantity(m.qty)+' '+(m.unit==='to'?'to':'cbm')]);
  if(delivered.length){sectionTitle('Material geliefert');drawTable(['Material','Menge'],matRows(delivered),[390,121]);}
  if(hauled.length){sectionTitle('Material abgefahren');drawTable(['Material','Menge'],matRows(hauled),[390,121]);}
  if(!delivered.length&&!hauled.length){sectionTitle('Material');draw('Keine Materialien erfasst.',M,y,9,false,C.muted);y-=22;}

  if((r.services||[]).length){
    sectionTitle('Zusatzleistungen');
    const serviceRows=r.services.map(s=>[
      [s.job,s.description].filter(Boolean).join(' – ')||'—',
      s.hours?String(s.hours)+' Std.':'—',
      s.start||'—',s.end||'—',
      s.pause?String(s.pause)+' Min.':'—'
    ]);
    drawTable(['Leistung / Beschreibung','Stunden','Anfang','Ende','Pause'],serviceRows,[235,65,65,65,81],{rowH:30});
  }
  // Unterschrift nur anzeigen, wenn vorhanden
  if(r.signature||r.signer){
    if(y<150)newPage();
    y-=4;sectionTitle('Unterschrift');
    if(r.signature){
      try{const bytes=await fetch(r.signature).then(x=>x.arrayBuffer());const sig=await pdf.embedPng(bytes);page.drawImage(sig,{x:M,y:y-58,width:145,height:48});}catch(e){}
    }
    line(M,y-64,M+210,y-64,C.line,.8);
    if(r.signer)draw(r.signer,M,y-78,8,false,C.ink);
    y-=95;
  }
  return await pdf.save();
}
async function downloadPdf(r){try{let bytes=await makePdf(r);let blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Liefernachweis-${r.date||'Datum'}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(e){alert('PDF konnte nicht erstellt werden: '+e.message)}}
function validateDocument(r){if(!r.customer){alert('Bitte einen Auftraggeber auswählen.');return false;}if(!r.materials.length&&!r.services.length){alert('Bitte mindestens ein Material oder eine Zusatzleistung eintragen.');return false;}return true}
$('saveDraftCustomer').onclick=()=>{if(persistDraft())show('home')};
$('saveDraftMaterials').onclick=()=>{if(persistDraft())show('home')};
$('saveDraftServices').onclick=()=>{if(persistDraft())show('home')};
$('savePdf').onclick=async()=>{let r=collect();if(!validateDocument(r))return;r.signature=null;r.signer='';r.pdf=true;r.draft=false;const i=currentDraftId?db.reports.findIndex(x=>String(x.id)===String(currentDraftId)):-1;if(i>=0)db.reports[i]=r;else db.reports.push(r);save();await downloadPdf(r);currentDraftId=null;show('home')};
$('saveDocument').onclick=()=>{if(persistDraft())show('home')};
renderArchive();
