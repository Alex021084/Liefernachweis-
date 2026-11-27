
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
const canvas=$('signature');
const ctx=canvas?canvas.getContext('2d'):null;
let drawing=false,ink=false,signatureSaved=false;
let appAlertTimer=null;
function showAppAlert(message){
  const modal=$('appAlertModal');
  if(!modal){console.log(message);return;}
  const text=String(message??'');
  const success=/(gespeichert|erfolgreich|abgeschlossen|erstellt|übernommen)/i.test(text);
  const warning=/(bitte|fehler|nicht möglich|konnte nicht|ungültig|zuerst)/i.test(text)&&!success;
  $('appAlertTitle').textContent=success?'Erfolgreich':warning?'Bitte beachten':'Hinweis';
  $('appAlertMessage').textContent=text;
  $('appAlertIcon').textContent=success?'✓':warning?'!':'i';
  $('appAlertIcon').className='appAlertIcon '+(success?'is-success':warning?'is-warning':'is-info');
  modal.hidden=false;modal.setAttribute('aria-hidden','false');
  document.body.classList.add('dialogOpen');
  clearTimeout(appAlertTimer);
}
function closeAppAlert(){
  const modal=$('appAlertModal');
  if(!modal)return;
  modal.hidden=true;modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('dialogOpen');
}
$('appAlertClose').onclick=closeAppAlert;
document.querySelectorAll('[data-close-app-alert]').forEach(el=>el.addEventListener('click',closeAppAlert));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('appAlertModal').hidden)closeAppAlert();});
window.alert=showAppAlert;
const EMPTY_DB={customers:[],materials:['Sand SE gesiebt','Schottertragschicht Naturstein'],services:[],reports:[],deliveryMaterials:null,haulMaterials:[]};
// Defensives Laden: Ein beschädigter oder unvollständiger lokaler Speicher darf nicht die gesamte App lahmlegen.
function loadDatabase(){try{const raw=localStorage.getItem(KEY);const parsed=raw?JSON.parse(raw):{};if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {...EMPTY_DB};delete parsed.projects;return {...EMPTY_DB,...parsed,customers:Array.isArray(parsed.customers)?parsed.customers:[],materials:Array.isArray(parsed.materials)?parsed.materials:EMPTY_DB.materials,services:Array.isArray(parsed.services)?parsed.services:[],reports:Array.isArray(parsed.reports)?parsed.reports:[],deliveryMaterials:Array.isArray(parsed.deliveryMaterials)?parsed.deliveryMaterials:(Array.isArray(parsed.materials)?parsed.materials:EMPTY_DB.materials),haulMaterials:Array.isArray(parsed.haulMaterials)?parsed.haulMaterials:[]};}catch(error){console.error('Lokale Daten konnten nicht gelesen werden:',error);return {...EMPTY_DB};}}
let db=loadDatabase();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db));}catch(error){console.error('Speichern fehlgeschlagen:',error);alert('Die Daten konnten nicht im Browser gespeichert werden. Bitte prüfen Sie den freien Speicherplatz.');}};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id==='home')renderArchive();if(id==='customers')renderCustomers();if(id==='deliveryMaterials')renderDeliveryMaterials();if(id==='haulMaterials')renderHaulMaterials();if(id==='services')renderServices()}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>show(b.dataset.open));
$('masterBackButton').onclick=()=>show('welcome');
$('goNew').onclick=fresh;$('goDeliveries').onclick=()=>show('home');$('goMaster').onclick=()=>show('master');$('archiveHomeButton').addEventListener('click',()=>show('welcome'));document.querySelectorAll('.back').forEach(b=>b.onclick=()=>show(b.closest('#master')?'welcome':'master'));
function fillSelect(el,items,placeholder){el.innerHTML=`<option value="">${placeholder}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}
function renderCustomers(){
  $('customerList').innerHTML=db.customers.map((c,i)=>`<div class="archiveCard sortableCard swipeRow" data-sort-index="${i}"><div class="swipeContent"><span class="dragGrip" aria-label="Gedrückt halten und verschieben" title="Gedrückt halten und verschieben"><i></i><i></i><i></i><i></i><i></i><i></i></span><div><b>${esc(c.name)}</b><small>${esc(c.address)}</small></div></div><button class="remove swipeDelete" data-del-c="${i}" aria-label="Kunde löschen">Löschen</button></div>`).join('')||'<p class="hint">Noch keine Kunden angelegt.</p>';
  document.querySelectorAll('[data-del-c]').forEach(b=>b.onclick=()=>{
    const index=+b.dataset.delC, customer=db.customers[index];
    if(!customer)return;
    askAppConfirm(`Möchtest du den Kunden „${customer.name}“ wirklich löschen?`,()=>{db.customers.splice(index,1);save();renderCustomers();},'Kunden löschen?');
  });
  enableLongPressSorting('customerList','customers',renderCustomers);
  enableSwipeToDelete('customerList');
}
function renderDeliveryMaterials(){
  db.deliveryMaterials=db.deliveryMaterials||[];
  $('deliveryMaterialsList').innerHTML=db.deliveryMaterials.map((m,i)=>`<div class="archiveCard sortableCard swipeRow" data-sort-index="${i}" data-sort-value="${esc(m)}"><div class="swipeContent"><span class="dragGrip" aria-label="Gedrückt halten und verschieben" title="Gedrückt halten und verschieben"><i></i><i></i><i></i><i></i><i></i><i></i></span><b>${esc(m)}</b></div><button class="remove swipeDelete" data-del-dm="${i}" aria-label="Liefermaterial löschen">Löschen</button></div>`).join('')||'<p class="hint">Noch keine Liefermaterialien angelegt.</p>';
  document.querySelectorAll('[data-del-dm]').forEach(b=>b.onclick=()=>{
    const index=+b.dataset.delDm, material=db.deliveryMaterials[index];
    if(material===undefined)return;
    askAppConfirm(`Möchtest du „${material}“ wirklich löschen?`,()=>{db.deliveryMaterials.splice(index,1);save();renderDeliveryMaterials();},'Liefermaterial löschen?');
  });
  enableLongPressSorting('deliveryMaterialsList','deliveryMaterials',renderDeliveryMaterials);
  enableSwipeToDelete('deliveryMaterialsList');
}
function renderHaulMaterials(){
  db.haulMaterials=db.haulMaterials||[];
  $('haulMaterialsList').innerHTML=db.haulMaterials.map((m,i)=>`<div class="archiveCard sortableCard swipeRow" data-sort-index="${i}" data-sort-value="${esc(m)}"><div class="swipeContent"><span class="dragGrip" aria-label="Gedrückt halten und verschieben" title="Gedrückt halten und verschieben"><i></i><i></i><i></i><i></i><i></i><i></i></span><b>${esc(m)}</b></div><button class="remove swipeDelete" data-del-hm="${i}" aria-label="Abfuhrmaterial löschen">Löschen</button></div>`).join('')||'<p class="hint">Noch keine Abfuhrmaterialien angelegt.</p>';
  document.querySelectorAll('[data-del-hm]').forEach(b=>b.onclick=()=>{
    const index=+b.dataset.delHm, material=db.haulMaterials[index];
    if(material===undefined)return;
    askAppConfirm(`Möchtest du „${material}“ wirklich löschen?`,()=>{db.haulMaterials.splice(index,1);save();renderHaulMaterials();},'Abfuhrmaterial löschen?');
  });
  enableLongPressSorting('haulMaterialsList','haulMaterials',renderHaulMaterials);
  enableSwipeToDelete('haulMaterialsList');
}
function renderServices(){
  db.services=db.services||[];
  $('servicesList').innerHTML=db.services.map((v,i)=>`<div class="archiveCard sortableCard swipeRow" data-sort-index="${i}" data-sort-value="${esc(v)}"><div class="swipeContent"><span class="dragGrip" aria-label="Gedrückt halten und verschieben" title="Gedrückt halten und verschieben"><i></i><i></i><i></i><i></i><i></i><i></i></span><b>${esc(v)}</b></div><button class="remove swipeDelete" data-del-s="${i}" aria-label="Leistung löschen">Löschen</button></div>`).join('')||'<p class="hint">Noch keine Leistungen angelegt.</p>';
  document.querySelectorAll('[data-del-s]').forEach(b=>b.onclick=()=>{
    const index=+b.dataset.delS, service=db.services[index];
    if(service===undefined)return;
    askAppConfirm(`Möchtest du „${service}“ wirklich löschen?`,()=>{db.services.splice(index,1);save();renderServices();},'Leistung löschen?');
  });
  enableLongPressSorting('servicesList','services',renderServices);
  enableSwipeToDelete('servicesList');
}

// Nach links wischen zeigt die Löschen-Aktion. Gelöscht wird erst nach Tippen
// auf „Löschen“ und anschließender Bestätigung im Popup.
function enableSwipeToDelete(hostId){
  const host=$(hostId);
  if(!host||host.dataset.swipeBound==='1')return;
  host.dataset.swipeBound='1';
  let gesture=null;
  host.addEventListener('pointerdown',event=>{
    if(event.target.closest('.dragGrip,.swipeDelete'))return;
    const row=event.target.closest('.swipeRow');
    if(!row)return;
    gesture={row,id:event.pointerId,x:event.clientX,y:event.clientY,axis:null};
  });
  host.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.axis&&Math.max(Math.abs(dx),Math.abs(dy))>9){
      gesture.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
    }
    if(gesture.axis!=='x')return;
    if(dx<0)event.preventDefault();
    gesture.row.classList.toggle('swipe-open',dx<-14);
  },{passive:false});
  const finish=event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x;
    if(gesture.axis==='x'){
      if(dx<-55)gesture.row.classList.add('swipe-open');
      else if(dx>35)gesture.row.classList.remove('swipe-open');
      else if(Math.abs(dx)<8&&gesture.row.classList.contains('swipe-open')){}
      else gesture.row.classList.remove('swipe-open');
    }
    gesture=null;
  };
  host.addEventListener('pointerup',finish);
  host.addEventListener('pointercancel',()=>{gesture=null;});
}

// Sortierung per Gedrückthalten am Griff. Die Reihenfolge wird nach dem Loslassen lokal gespeichert.
let activeLongPressSort=null;
function enableLongPressSorting(hostId,dbKey,renderFn){
  const host=$(hostId);
  if(!host||host.dataset.sortBound==='1')return;
  host.dataset.sortBound='1';
  host.addEventListener('pointerdown',event=>{
    const grip=event.target.closest('.dragGrip');
    if(!grip||event.button!==0)return;
    const card=grip.closest('.sortableCard');
    if(!card)return;
    if(activeLongPressSort)clearTimeout(activeLongPressSort.timer);
    const state={host,dbKey,renderFn,card,pointerId:event.pointerId,started:false,timer:null};
    activeLongPressSort=state;
    state.timer=setTimeout(()=>{
      if(activeLongPressSort!==state)return;
      state.started=true;
      card.classList.add('is-dragging');
      if(navigator.vibrate)navigator.vibrate(35);
    },380);
  });
}
document.addEventListener('pointermove',event=>{
  const state=activeLongPressSort;
  if(!state||event.pointerId!==state.pointerId||!state.started)return;
  event.preventDefault();
  const target=document.elementFromPoint(event.clientX,event.clientY);
  const over=target&&target.closest?target.closest('.sortableCard'):null;
  if(!over||over===state.card||over.parentElement!==state.host)return;
  const rect=over.getBoundingClientRect();
  const after=event.clientY>rect.top+rect.height/2;
  state.host.insertBefore(state.card,after?over.nextSibling:over);
},{passive:false});
function finishLongPressSort(event){
  const state=activeLongPressSort;
  if(!state||event.pointerId!==state.pointerId)return;
  clearTimeout(state.timer);
  activeLongPressSort=null;
  if(!state.started)return;
  state.card.classList.remove('is-dragging');
  const cards=[...state.host.querySelectorAll('.sortableCard')];
  const original=db[state.dbKey]||[];
  const ordered=cards.map(card=>card.dataset.sortIndex!==undefined?Number(card.dataset.sortIndex):original.findIndex(value=>String(value)===card.dataset.sortValue));
  if(ordered.every(index=>Number.isInteger(index)&&index>=0&&index<original.length)){
    db[state.dbKey]=ordered.map(index=>original[index]);
    save();
    state.renderFn();
  }
}
document.addEventListener('pointerup',finishLongPressSort);
document.addEventListener('pointercancel',finishLongPressSort);

$('saveCustomer').onclick=()=>{let name=$('newCustomer').value.trim();if(!name)return alert('Bitte einen Kundennamen eingeben.');db.customers.push({name,address:$('newAddress').value.trim()});$('newCustomer').value='';$('newAddress').value='';save();renderCustomers()};
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
let wizardStep=1;
let activeMaterialType='delivery';
let pendingMaterialName='';
let materialSessionEntries=[];
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
    if(isFinalized(existing))return;
    r.createdAt=existing?.createdAt||r.id;r.updatedAt=Date.now();
    r.wizardStep=wizardStep;r.draft=existing?!!existing.draft:true;r.finalized=false;r.pdf=false;r.autoSaved=true;
    if(existing){const i=db.reports.findIndex(x=>String(x.id)===String(r.id));db.reports[i]={...existing,...r};}else db.reports.push(r);
    currentDraftId=r.id;save();
    setAutoSaveStatus('✓ Automatisch gespeichert · '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr');
  }catch(error){console.error('Automatisches Speichern fehlgeschlagen:',error);setAutoSaveStatus('Speichern fehlgeschlagen','error');}
}
function scheduleAutoSave(){if(autoSaveTimer)clearTimeout(autoSaveTimer);setAutoSaveStatus('Änderung wird gespeichert …','pending');autoSaveTimer=setTimeout(autoSaveDraft,450);}

let materialWizardStep=1;
let deliveryLocation='';
let temporaryDeliveryLocation='';
let materialDeliveryRequested=false;
let pendingMaterialDelivered=false;
let pendingMaterialClassification='stock';
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
  pendingMaterialName='';
  // Eine neue Öffnung startet eine frische Auswahlrunde. Bereits zuvor
  // übernommene Materialien bleiben im Nachweis, sind hier aber nicht mehr grün markiert.
  materialSessionEntries=[];
  pendingMaterialDelivered=false;
  pendingMaterialClassification=type==='haul'?'disposed':'stock';
  const list=type==='haul'?(db.haulMaterials||[]):(db.deliveryMaterials||[]);
  $('materialModalTitle').textContent=type==='haul'?'Material abgefahren':type==='stock'?'Material ab Grube/Lager':'';
  $('materialChoiceCaption').textContent=type==='haul'?'Abfuhrmaterial':'';
  fillSelect($('modalMaterial'),list,'Material wählen');
  renderMaterialChoiceButtons();
  $('modalQuantity').value='';
  setMaterialUnit('to');
  $('modalIncludeDateTime').checked=false;
  // Die alte globale Liefer-Kachel wurde durch die Kennzeichnung pro Material ersetzt.
  materialDeliveryRequested=false;
  pendingMaterialDelivered=false;
  updateMaterialToggle();
  pendingMaterialDelivered=false;
  updateMaterialToggle();
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
function updateMaterialToggle(){
  const delivery=$('classifyAsDelivery'),stock=$('classifyAsStock');
  const hauled=$('classifyAsHauled'),disposed=$('classifyAsDisposed');
  const group=$('deliveryClassification');
  const isDelivery=activeMaterialType==='delivery';
  const isHaul=activeMaterialType==='haul';
  if(group){
    group.hidden=false;
    const heading=group.querySelector('h3');
    if(heading)heading.textContent=isDelivery?'Wie soll dieses Material erfasst werden?':'Wie soll das Abfuhrmaterial erfasst werden?';
  }
  if(delivery)delivery.hidden=!isDelivery;
  if(stock)stock.hidden=!isDelivery;
  if(hauled)hauled.hidden=!isHaul;
  if(disposed)disposed.hidden=!isHaul;
  if(delivery&&stock){
    const selected=pendingMaterialClassification==='delivery';
    delivery.setAttribute('aria-pressed',selected?'true':'false');
    stock.setAttribute('aria-pressed',selected?'false':'true');
    delivery.classList.toggle('is-selected',selected);
    stock.classList.toggle('is-selected',!selected);
  }
  if(hauled&&disposed){
    const selected=pendingMaterialClassification==='haul_disposed';
    hauled.setAttribute('aria-pressed',selected?'true':'false');
    disposed.setAttribute('aria-pressed',selected?'false':'true');
    hauled.classList.toggle('is-selected',selected);
    disposed.classList.toggle('is-selected',!selected);
  }
}
function setMaterialDelivered(value){
  pendingMaterialDelivered=Boolean(value);
  if(activeMaterialType==='delivery'){
    pendingMaterialClassification=pendingMaterialDelivered?'delivery':'stock';
  }else{
    pendingMaterialClassification=pendingMaterialDelivered?'haul_disposed':'disposed';
  }
  materialDeliveryRequested=activeMaterialType==='delivery'&&pendingMaterialDelivered;
  updateMaterialToggle();
  if(activeMaterialType==='delivery'&&pendingMaterialDelivered){
    const invoiceAddress=$('address').value.trim();
    const existingLocation=deliveryLocation||temporaryDeliveryLocation||'';
    $('deliveryLocationInput').value=existingLocation;
    $('deliverySameAsInvoice').checked=!!invoiceAddress&&existingLocation===invoiceAddress;
    $('deliveryLocationModal').classList.add('open');
    $('deliveryLocationModal').setAttribute('aria-hidden','false');
  }else if(activeMaterialType==='delivery'&&!pendingMaterialDelivered){
    deliveryLocation='';
    temporaryDeliveryLocation='';
  }
}
// Legacy-Schalter entfernt: Die Kennzeichnung erfolgt jetzt über classifyAsDelivery/classifyAsStock.
function openDeliveryLocationModal(){
  const invoiceAddress=$('address').value.trim();
  const existingLocation=deliveryLocation||temporaryDeliveryLocation||'';
  $('deliveryLocationInput').value=existingLocation;
  $('deliverySameAsInvoice').checked=!!invoiceAddress&&existingLocation===invoiceAddress;
  const modal=$('deliveryLocationModal');
  modal.hidden=false;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
$('classifyAsDelivery').onclick=()=>{
  pendingMaterialClassification='delivery';
  pendingMaterialDelivered=true;
  materialDeliveryRequested=true;
  updateMaterialToggle();
  openDeliveryLocationModal();
};
$('classifyAsStock').onclick=()=>{
  pendingMaterialClassification='stock';
  pendingMaterialDelivered=false;
  materialDeliveryRequested=false;
  deliveryLocation='';
  temporaryDeliveryLocation='';
  updateMaterialToggle();
};
$('classifyAsHauled').onclick=()=>{
  pendingMaterialClassification='haul_disposed';
  pendingMaterialDelivered=true;
  updateMaterialToggle();
};
$('classifyAsDisposed').onclick=()=>{
  pendingMaterialClassification='disposed';
  pendingMaterialDelivered=false;
  updateMaterialToggle();
};
$('deliverySameAsInvoice').onchange=()=>{
  if($('deliverySameAsInvoice').checked){
    const invoiceAddress=$('address').value.trim();
    if(!invoiceAddress){$('deliverySameAsInvoice').checked=false;return alert('Bitte zuerst eine Rechnungsadresse beim Auftraggeber hinterlegen.');}
    $('deliveryLocationInput').value=invoiceAddress;
  }
};
function closeDeliveryLocationModal(){ const modal=$('deliveryLocationModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
$('cancelDeliveryLocation').onclick=()=>{ materialDeliveryRequested=false;setMaterialDelivered(false);closeDeliveryLocationModal(); };
document.querySelectorAll('[data-close-delivery-location]').forEach(el=>el.onclick=()=>{materialDeliveryRequested=false;setMaterialDelivered(false);closeDeliveryLocationModal();});
$('confirmDeliveryLocation').onclick=()=>{
  const location=$('deliveryLocationInput').value.trim();
  if(!location)return alert('Bitte den Lieferort eingeben.');
  temporaryDeliveryLocation=location;
  deliveryLocation=location;
  materialDeliveryRequested=true;
  pendingMaterialDelivered=true;
  pendingMaterialClassification='delivery';
  updateMaterialToggle();
  closeDeliveryLocationModal();
};
$('cancelMaterial').onclick=closeMaterialModal;
document.querySelectorAll('[data-close-material]').forEach(el=>el.onclick=closeMaterialModal);
function renderMaterialChoiceButtons(){
  const select=$('modalMaterial'),host=$('materialChoiceList');
  host.innerHTML='';
  const options=Array.from(select.options).filter(option=>option.value);
  options.forEach(option=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='materialChoiceOption';
    button.dataset.value=option.value;
    const name=document.createElement('span');
    name.className='materialChoiceName';
    name.textContent=option.textContent;
    button.appendChild(name);
    const related=materialSessionEntries.filter(m=>m.name===option.value&&(
      activeMaterialType==='delivery'?['delivery','stock'].includes(m.type):['haul_disposed','disposed'].includes(m.type)
    ));
    if(related.length||pendingMaterialName===option.value){
      button.classList.add('is-selected');
      const qty=document.createElement('small');
      qty.className='materialChoiceQuantity';
      const byUnit=new Map();
      related.forEach(m=>byUnit.set(m.unit,(byUnit.get(m.unit)||0)+parseQuantity(m.qty)));
      qty.textContent=[...byUnit.entries()].map(([unit,total])=>`${formatQuantity(total)} ${unit==='cbm'?'m³':'to'}`).join(' · ');
      button.appendChild(qty);
    }
    button.setAttribute('aria-pressed',(related.length||pendingMaterialName===option.value)?'true':'false');
    button.onclick=()=>{
      pendingMaterialName=option.value;
      // Checkbox-Status beim Verlassen der Auswahlseite sichern, bevor der Mengen-Schritt geöffnet wird.
      pendingMaterialDelivered=Boolean(pendingMaterialDelivered);
      host.querySelectorAll('.materialChoiceOption').forEach(tile=>{
        const active=tile.dataset.value===option.value||materialSessionEntries.some(m=>m.name===tile.dataset.value);
        tile.classList.toggle('is-selected',active);
        tile.setAttribute('aria-pressed',active?'true':'false');
      });
      select.value=option.value;
      $('materialChoiceText')?.replaceChildren(document.createTextNode(option.textContent));
      $('selectedMaterialHeading').textContent=`Menge für: ${option.textContent}`;
      $('modalQuantity').value='';
      setMaterialUnit('to');
      $('modalIncludeDateTime').checked=false;
      $('modalDateTimeFields').hidden=true;
      $('modalMaterialDate').value=localDateValue();
      $('modalMaterialTime').value=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',hour12:false});
      updateMaterialToggle();
    };
    host.appendChild(button);
  });
  if(!host.children.length){
    const empty=document.createElement('p');
    empty.className='materialChoiceEmpty';
    empty.textContent='Noch keine Materialien in den Stammdaten hinterlegt.';
    host.appendChild(empty);
  }
}
$('continueMaterialSelection').onclick=()=>{
  if(!pendingMaterialName)return alert('Bitte zuerst ein Material auswählen.');
  setMaterialWizardStep(2);
};
// Nach dem Übernehmen einer Position schließt sich das Materialfenster automatisch.
$('nextMaterialDetails')?.remove();
$('backToMaterialSelect').onclick=()=>{
  pendingMaterialName='';
  renderMaterialChoiceButtons();
  setMaterialWizardStep(1);
};
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
  // Der aktuelle Schalterzustand ist die maßgebliche Quelle für die Zuordnung.
  // So bleibt "Material geliefert" auch dann erhalten, wenn es erst nach
  // Zurückgehen vom Mengenschritt aktiviert wird.
  const materialType=activeMaterialType==='delivery'
    ?(pendingMaterialClassification==='delivery'?'delivery':'stock')
    :(pendingMaterialClassification==='haul_disposed'?'haul_disposed':'disposed');
  const isDelivery=materialType==='delivery';
  if(isDelivery&&!temporaryDeliveryLocation&&!deliveryLocation)return alert('Bitte zuerst den Lieferort eingeben.');
  const entry={name,type:materialType,qty,unit,includeDateTime,date:includeDateTime?date:'',time:includeDateTime?time:'',vehicle:'',deliveryLocation:isDelivery?(temporaryDeliveryLocation||deliveryLocation):''};
  enteredMaterials.push(entry);
  materialSessionEntries.push(entry);
  renderMaterialSummary();
  pendingMaterialName='';
  pendingMaterialDelivered=false;
  pendingMaterialClassification=activeMaterialType==='haul'?'disposed':'stock';
  deliveryLocation='';
  temporaryDeliveryLocation='';
  materialDeliveryRequested=false;
  updateMaterialToggle();
  closeMaterialModal();
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
  el.innerHTML='<h3>Erfasste Materialien</h3>'+group('delivery','Material geliefert','deliveryGroup')+group('stock','Material ab Grube/Lager','deliveryGroup')+group('haul_disposed','Material abgefahren und entsorgt','haulGroup')+group('disposed','Material entsorgt','haulGroup')+group('haul','Material abgefahren','haulGroup');
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
      askAppConfirm(`„${name}“ (${unit==='to'?'to':'cbm'}) wirklich aus den erfassten Materialien löschen?`,()=>{
        const sourceIndex=item.dataset.sourceIndex;if(sourceIndex!==''){enteredMaterials.splice(Number(sourceIndex),1);}else{enteredMaterials=enteredMaterials.filter(m=>!(m.type===type&&m.name===name&&m.unit===unit&&!m.includeDateTime));}
        renderMaterialSummary();
      });
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
    askAppConfirm(`„${name}“ wirklich löschen?`,()=>item.remove());
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
function setWizardStep(step){wizardStep=step;document.querySelectorAll('.wizardStep').forEach(el=>el.classList.toggle('active',Number(el.dataset.wizard)===step));if($('wizardProgress'))$('wizardProgress').textContent=['','Schritt 1 von 4 · Auftraggeber','Schritt 2 von 4 · Material','Schritt 3 von 4 · Zusatzleistungen','Schritt 4 von 4 · Zusammenfassung'][step];window.scrollTo(0,0);}
$('toMaterials').onclick=()=>{if(!$('customer').value)return alert('Bitte zuerst einen Auftraggeber auswählen.');setWizardStep(2)};
$('backToCustomer').onclick=()=>setWizardStep(1);
$('toServices').onclick=()=>setWizardStep(3);
$('backToMaterials').onclick=()=>setWizardStep(2);
function renderReportSummary(){
  const r=collect(),el=$('reportSummary');if(!el)return;
  const mats=materialTotals(),delivered=mats.filter(m=>m.type==='delivery'),stock=mats.filter(m=>m.type==='stock'),haulDisposed=mats.filter(m=>m.type==='haul_disposed'),disposed=mats.filter(m=>m.type==='disposed'),hauled=mats.filter(m=>m.type==='haul');
  const block=(title,list,cls)=>list.length?`<section class="summaryBlock ${cls}"><h3>${title}</h3>${list.map(m=>`<div class="summaryLine"><b>${esc(m.name)}${m.includeDateTime?`<small class="materialDateStamp">${esc(formatMaterialDateTime(m.date,m.time))}</small>`:''}</b><span>${formatQuantity(m.qty)} ${m.unit==='to'?'to':'m³'}</span></div>`).join('')}</section>`:'';
  const services=r.services.map(s=>`<div class="summaryService"><b>${esc(s.job||'Leistung')}</b>${s.description?`<div>${esc(s.description)}</div>`:''}<small>${esc(s.hours||'—')} Std. · ${esc(s.start||'—')} bis ${esc(s.end||'—')} · Pause ${esc(s.pause||'0')} Min.</small></div>`).join('');
  el.innerHTML=`<div class="summaryMeta"><b>${esc(r.customer||'—')}</b><div>${esc(r.address||'')}</div><div>Datum: ${esc(r.date||'—')}</div>${r.deliveryLocation?`<div>Lieferort: ${esc(r.deliveryLocation)}</div>`:''}</div>${block('Material geliefert',delivered,'deliveryGroup')}${block('Material ab Grube/Lager',stock,'deliveryGroup')}${block('Material abgefahren und entsorgt',haulDisposed,'haulGroup')}${block('Material entsorgt',disposed,'haulGroup')}${block('Material abgefahren',hauled,'haulGroup')}${services?`<section class="summaryBlock"><h3>Zusatzleistungen</h3>${services}</section>`:'<p class="hint">Keine Zusatzleistungen erfasst.</p>'}`;
}
$('toSummary').onclick=()=>{renderReportSummary();setWizardStep(4)};
$('backToServices').onclick=()=>setWizardStep(3);
$('summaryHomeButton').onclick=()=>{try{autoSaveDraft();}finally{show('welcome');}};

$('formHomeButton').addEventListener('click',()=>{try{autoSaveDraft();}finally{show('welcome');}});
function fresh(){ if(autoSaveTimer)clearTimeout(autoSaveTimer);currentDraftId=null;setAutoSaveStatus('Noch kein Entwurf begonnen'); $('date').value=localDateValue();updateDateDisplay();fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');$('address').value='';enteredMaterials=[];materialSessionEntries=[];deliveryLocation='';temporaryDeliveryLocation='';materialDeliveryRequested=false;$('materialRows').innerHTML='<p class="hint">Noch keine Materialien erfasst.</p>';$('serviceRows').innerHTML='';$('signer').value='';clearSig();closeSignature();setWizardStep(1);show('form')}
$('customer').onchange=()=>{let c=db.customers.find(c=>c.name===$('customer').value);$('address').value=c?.address||'';scheduleAutoSave()};
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
  closeQuickModal('quickCustomerModal');
};

if($('newBtn'))$('newBtn').onclick=fresh;if($('cancel'))$('cancel').onclick=()=>show('home');
const serviceModal=$('serviceModal');serviceModal.hidden=true;serviceModal.classList.remove('open');
const signatureModal=$('signatureModal'); signatureModal.hidden=true; signatureModal.classList.remove('open');
function pos(e){let r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}canvas.onpointerdown=e=>{drawing=true;ink=true;canvas.setPointerCapture(e.pointerId);let p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;let p=pos(e);ctx.lineWidth=4;ctx.lineCap='round';ctx.strokeStyle='#18212b';ctx.lineTo(p.x,p.y);ctx.stroke()};canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;function clearSig(){if(!canvas||!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);ink=false;signatureSaved=false;$('signatureStatus').textContent='× Noch nicht unterschrieben';$('signatureStatus').classList.remove('signed');$('openSignature').classList.remove('signatureDone');$('openSignature').textContent='✍ Unterschreiben'} $('clearSig').onclick=clearSig;
function openSignature(){ const modal=$('signatureModal'); modal.hidden=false; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeSignature(){ const modal=$('signatureModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); modal.hidden=true; }
$('openSignature').onclick=openSignature;$('cancelSignature').onclick=closeSignature;document.querySelectorAll('[data-close-signature]').forEach(el=>el.onclick=closeSignature);
$('confirmSignature').onclick=()=>{if(!ink)return alert('Bitte zuerst unterschreiben.');signatureSaved=true;$('signatureStatus').textContent='✓ Unterschrift übernommen'+($('signer').value.trim()?' · '+$('signer').value.trim():'');$('signatureStatus').classList.add('signed');$('openSignature').classList.add('signatureDone');$('openSignature').textContent='✓ Unterschrift erledigt';closeSignature();};
function collect(){return {id:currentDraftId||Date.now(),date:$('date').value,customer:$('customer').value,address:$('address').value,deliveryLocation,materials:enteredMaterials.map(m=>({...m})),services:[...$('serviceRows').querySelectorAll('.entry')].map(d=>({job:d.querySelector('.servicePickButton')?.dataset.value||'',description:d.querySelector('.descriptionv').value,hours:d.querySelector('.hoursv').value,start:d.querySelector('.startv').value,end:d.querySelector('.endv').value,pause:d.querySelector('.pausev').value})).filter(x=>Object.values(x).some(Boolean)),signature:signatureSaved&&ink?canvas.toDataURL('image/png'):null,signer:signatureSaved?$('signer').value:''}}

function persistDraft(){
  const r=collect();
  if(!r.customer){alert('Bitte zuerst einen Auftraggeber auswählen.');return false;}
  r.draft=true;r.pdf=false;
  if(currentDraftId){const i=db.reports.findIndex(x=>String(x.id)===String(currentDraftId));if(i>=0)db.reports[i]=r;else db.reports.push(r);}
  else {db.reports.push(r);currentDraftId=r.id;}
  save();renderArchive();alert('Zwischenstand wurde gespeichert. Du kannst den Liefernachweis später unter „Liefernachweise“ öffnen und weiterbearbeiten.');return true;
}
function persistDocument(){
  if(autoSaveTimer)clearTimeout(autoSaveTimer);
  const r=collect();
  if(!r.customer){alert('Bitte zuerst einen Auftraggeber auswählen.');return false;}
  const existingIndex=currentDraftId?db.reports.findIndex(x=>String(x.id)===String(currentDraftId)):-1;
  const existing=existingIndex>=0?db.reports[existingIndex]:null;
  if(isFinalized(existing)){
    alert('Dieser Liefernachweis ist bereits unterschrieben und gesperrt. Es kann nur noch eine PDF erstellt werden.');
    return false;
  }
  r.draft=false;
  r.finalized=!!r.signature;
  r.pdf=false;
  r.createdAt=existing?.createdAt||r.id;
  r.updatedAt=Date.now();
  r.wizardStep=wizardStep;
  if(existingIndex>=0)db.reports[existingIndex]={...existing,...r};
  else db.reports.push(r);
  currentDraftId=r.id;
  archiveMode='customers';archiveCustomer='';
  save();renderArchive();
  alert(r.finalized
    ? 'Der unterschriebene Liefernachweis wurde unter „Nachweise“ abgeschlossen und ist jetzt gesperrt.'
    : 'Der Liefernachweis wurde unter „Nachweise“ gespeichert und kann weiter bearbeitet werden.');
  return true;
}
function isFinalized(r){return !!(r&&(r.finalized===true||(!r.draft&&r.signature)));}
function openDraft(r){
  if(isFinalized(r)){alert('Dieser Liefernachweis ist bereits unterschrieben und gesperrt. Es kann nur noch eine PDF erstellt werden.');return;}
  if(autoSaveTimer)clearTimeout(autoSaveTimer);currentDraftId=r.id;
  fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');
  $('customer').value=r.customer||'';
  $('date').value=r.date||localDateValue();updateDateDisplay();
  $('address').value=r.address||'';
  const owner=db.customers.find(c=>c.name===r.customer);
  deliveryLocation=r.deliveryLocation||'';temporaryDeliveryLocation=deliveryLocation;materialDeliveryRequested=(r.materials||[]).some(m=>m.type==='delivery');
  enteredMaterials=(r.materials||[]).map(m=>({...m}));materialSessionEntries=[];
  renderMaterialSummary();
  $('serviceRows').innerHTML='';
  (r.services||[]).forEach(v=>rowService(v));
  $('signer').value=r.signer||'';
  clearSig();
  if(r.signature){
    const img=new Image();
    img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);ink=true;signatureSaved=true;$('signatureStatus').textContent='✓ Unterschrift übernommen'+($('signer').value.trim()?' · '+$('signer').value.trim():'');$('signatureStatus').classList.add('signed');$('openSignature').classList.add('signatureDone');$('openSignature').textContent='✓ Unterschrift erledigt';};
    img.src=r.signature;
  }
  closeSignature();setWizardStep(Number(r.wizardStep)||2);setAutoSaveStatus('✓ Entwurf geladen');show('form');
}
let pdfPreviewUrl=null; let pdfPreviewBlob=null; let archiveMode='customers',archiveCustomer='';

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
    const updated=r.updatedAt?new Date(r.updatedAt).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):''; const details=[date,updated?'Aktualisiert: '+updated:''].filter(Boolean).join(' · ');
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
function archiveTabs(){return `<div class="archiveTabs"><button type="button" data-archive-tab="customers" class="${archiveMode==='customers'?'active':''}">Nachweise</button><button type="button" data-archive-tab="drafts" class="${archiveMode==='drafts'?'active':''}">Zwischengespeichert</button></div>`}
function archiveCard(r,buttonLabel){
  const stamp=v=>{const n=Number(v);return Number.isFinite(n)&&n>100000000000?new Date(n).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})+' Uhr':''};
  const created=stamp(r.createdAt||r.id),updated=stamp(r.updatedAt);
  const history=r.draft?[created?'Angelegt: '+created:'',updated?'Zuletzt bearbeitet: '+updated:''].filter(Boolean).join(' · '):'';
  const locked=isFinalized(r);
  const status=locked?'Unterschrieben · gesperrt':(r.draft?'Entwurf · weiterbearbeiten':'Gespeichert · bearbeitbar');
  const action=buttonLabel||(locked?'PDF erstellen':'Bearbeiten');
  return `<div class="archiveSwipeItem" data-archive-id="${r.id}"><button type="button" class="archiveDelete" aria-label="Liefernachweis löschen">×</button><div class="archiveCard"><div><b>${esc(r.customer||'Ohne Auftraggeber')}</b><small>${esc(new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'))} · ${status}${history?' · '+esc(history):''}</small></div><button class="soft" data-open-r="${r.id}">${action}</button></div></div>`;
}
function bindArchiveCards(){
  document.querySelectorAll('[data-open-r]').forEach(b=>b.onclick=(event)=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();let r=db.reports.find(x=>String(x.id)===b.dataset.openR);if(!r)return;if(isFinalized(r)){openPdfPreview(r);}else{openDraft(r);setWizardStep(Number(r.wizardStep)||2);show('form');}});
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
  }else{
    const names=[...new Set(completed.map(r=>r.customer||'Ohne Auftraggeber'))].sort((a,b)=>a.localeCompare(b,'de'));
    if(!archiveCustomer){
      body=`<div class="archiveCrumb"><b>Kunden</b><span>${names.length} Kunde/Kunden</span></div>`+(names.map(name=>{const count=completed.filter(r=>(r.customer||'Ohne Auftraggeber')===name).length;return `<button type="button" class="archiveNavCard" data-customer="${esc(name)}"><span><b>${esc(name)}</b><small>${count} abgeschlossene Nachweis${count===1?'':'e'}</small></span><strong>›</strong></button>`}).join('')||'<div class="panel hint">Noch keine abgeschlossenen Liefernachweise vorhanden.</div>');
    }else{
      const records=completed.filter(r=>(r.customer||'Ohne Auftraggeber')===archiveCustomer);
      body=`<button type="button" class="archiveBack" data-archive-back="customers">‹ Alle Kunden</button><div class="archiveCrumb"><b>${esc(archiveCustomer)}</b><span>Liefernachweise</span></div>`+records.map(r=>archiveCard(r)).join('');
    }
  }
  host.innerHTML=archiveTabs()+body;
  host.querySelectorAll('[data-archive-tab]').forEach(b=>b.onclick=()=>{archiveMode=b.dataset.archiveTab;archiveCustomer='';renderArchive()});
  host.querySelectorAll('[data-customer]').forEach(b=>b.onclick=()=>{archiveCustomer=b.dataset.customer;renderArchive()});
    host.querySelectorAll('[data-archive-back]').forEach(b=>b.onclick=()=>{if(b.dataset.archiveBack==='customers'){archiveCustomer=''}renderArchive()});
  bindArchiveCards();
}

function txt(page,text,x,y,size=9,bold=false){if(!text)return;page.drawText(String(text).slice(0,110),{x,y,size,font:bold?fontBold:font,color:PDFLib.rgb(.12,.15,.18),maxWidth:500})}
let font,fontBold;
function aggregateReportMaterials(rows){
  const totals=new Map(),individual=[];
  (rows||[]).forEach(m=>{
    const name=String(m.name||'').trim(),type=m.type||'delivery',unit=m.unit||'to',
      qty=parseQuantity(m.qty),includeDateTime=!!m.includeDateTime,
      date=includeDateTime?(m.date||''):'',time=includeDateTime?(m.time||''):'',
      location=String(m.deliveryLocation||'').trim();
    if(!name||!qty)return;
    if(includeDateTime){
      individual.push({name,type,unit,qty,includeDateTime,date,time,deliveryLocation:location});
      return;
    }
    const key=[type,name,unit].join('||');
    if(!totals.has(key))totals.set(key,{name,type,unit,qty:0,includeDateTime:false,date:'',time:'',deliveryLocations:[]});
    const total=totals.get(key);
    total.qty+=qty;
    if(location&&!total.deliveryLocations.includes(location))total.deliveryLocations.push(location);
  });
  return [...totals.values(),...individual].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit)||String(a.date).localeCompare(String(b.date))||String(a.time).localeCompare(String(b.time)));
}
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
      line(M,H-218,W-M,H-218,C.line,.8);
      y=H-239;
    }
  };
  const sectionTitle=(title,subtitle=null)=>{
    if(y<205)newPage();
    draw(title,M,y,14,true,C.ink);
    if(subtitle)draw(subtitle,M+title.length*6.4+8,y,8,false,C.muted);
    y-=12;line(M,y,W-M,y,C.line,.8);y-=14;
  };
  const materialSectionTitle=(title)=>{
    // Genug Platz für Überschrift, Lieferort, Tabellenkopf und erste Materialzeile reservieren.
    if(y<265)newPage();
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
  y-=12;

  const materials=aggregateReportMaterials(r.materials||[]);
  const delivered=materials.filter(m=>m.type==='delivery');
  const stock=materials.filter(m=>m.type==='stock');
  const haulDisposed=materials.filter(m=>m.type==='haul_disposed');
  const disposed=materials.filter(m=>m.type==='disposed');
  const hauled=materials.filter(m=>m.type==='haul');
  const drawMaterialTable=list=>{
    const hasVehicles=list.some(m=>m.vehicle);
    const headers=['Bezeichnung'];
    let widths;
    if(hasVehicles){
      headers.push('Fahrzeug');
      headers.push('Zeitstempel');
      widths=[145,70,105,95,96.28];
    }else{
      headers.push('Zeitstempel');
      widths=[190,105,108,108.28];
    }
    headers.push('Menge (m³)','Menge (to)');
    const rows=list.map(m=>{
      const row=[m.name||''];
      if(hasVehicles)row.push(m.vehicle||'');
      row.push(m.includeDateTime&&m.date?formatMaterialDateTime(m.date,m.time):'');
      const unit=String(m.unit||'').toLowerCase();
      const isTonnes=unit==='to'||unit==='tonne'||unit==='tonnen'||unit==='t';
      row.push(isTonnes?'':`${formatQuantity(m.qty)} m³`);
      row.push(isTonnes?`${formatQuantity(m.qty)} to`:'');
      return row;
    });
    drawTable(headers,rows,widths);
  };
  const drawMaterialSection=(title,list,showDeliveryLocations=false)=>{
    materialSectionTitle(title);
    if(showDeliveryLocations){
      const locations=[...new Set([
        ...list.flatMap(m=>Array.isArray(m.deliveryLocations)?m.deliveryLocations:[m.deliveryLocation||'']),
        r.deliveryLocation||''
      ].map(location=>String(location||'').trim()).filter(Boolean))];
      locations.forEach(location=>{
        draw('Lieferort:',M,y,8,true,C.ink);
        draw(String(location).replace(/\s*\n\s*/g,', '),M+58,y,9,false,C.ink,W-2*M-58);
        y-=15;
      });
    }
    drawMaterialTable(list);
  };
  if(delivered.length){drawMaterialSection('Material geliefert',delivered,true);}
  if(stock.length){drawMaterialSection('Material ab Grube/Lager',stock);}
  if(haulDisposed.length){drawMaterialSection('Material abgefahren und entsorgt',haulDisposed);}
  if(disposed.length){drawMaterialSection('Material entsorgt',disposed);}
  if(hauled.length){drawMaterialSection('Material abgefahren',hauled);}
  if(!delivered.length&&!stock.length&&!haulDisposed.length&&!disposed.length&&!hauled.length){materialSectionTitle('Material');draw('Keine Materialien erfasst.',M+10,y,9,false,C.muted);y-=22;}

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
function pdfFileName(r){
  const customer=cleanCustomerFilePart(r.customer)||'Kunde';
  const createdValue=Number(r.createdAt||r.id);
  const createdDate=Number.isFinite(createdValue)&&createdValue>0?new Date(createdValue):new Date();
  const date=String(createdDate.getDate()).padStart(2,'0')+'.'+String(createdDate.getMonth()+1).padStart(2,'0')+'.'+createdDate.getFullYear();
  return `${customer} - LN ${date}.pdf`;
}
function savePreviewPdf(r){
  if(!pdfPreviewBlob){alert('Die PDF-Datei ist noch nicht bereit. Bitte öffne die Vorschau erneut.');return;}
  const filename=pdfFileName(r);
  const file=new File([pdfPreviewBlob],filename,{type:'application/pdf'});
  // Auf iPad/iPhone öffnet die Teilen-Funktion den iOS-Dialog „In Dateien sichern“.
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file]}).catch(error=>{if(error&&error.name!=='AbortError')alert('Das Speichern wurde nicht abgeschlossen: '+error.message)});
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
    $('closePdfPreview').textContent=isFinalized(r)?'Zurück zu Nachweisen':'Zurück zur Bearbeitung';
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
async function createAndSavePdf(r){
  try{
    const bytes=await makePdf(r);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const filename=pdfFileName(r);
    const file=new File([blob],filename,{type:'application/pdf'});
    // iPad/iPhone: direkt den iOS-Teilen-Dialog öffnen; dort „In Dateien sichern“ wählen.
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file]});
      return;
    }
    // Unterstützte Browser: nativen Dialog zur Wahl des Speicherorts öffnen.
    if(window.showSaveFilePicker){
      const handle=await window.showSaveFilePicker({
        suggestedName:filename,
        types:[{description:'PDF-Dokument',accept:{'application/pdf':['.pdf']}}]
      });
      const writable=await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
    // Fallback für Browser ohne Teilen- oder Dateiauswahldialog.
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }catch(e){
    if(e&&e.name!=='AbortError')alert('PDF konnte nicht erstellt oder gespeichert werden: '+e.message);
  }
}
$('savePdf').onclick=async()=>{
  const r=collect();
  if(!validateDocument(r))return;
  const existing=currentDraftId
    ? db.reports.find(x=>String(x.id)===String(currentDraftId))
    : null;
  if(isFinalized(existing)){
    await createAndSavePdf(existing);
    return;
  }
  if(!persistDocument())return;
  const saved=db.reports.find(x=>String(x.id)===String(r.id));
  if(saved)await createAndSavePdf(saved);
};
$('saveDocument').onclick=()=>{if(persistDocument())show('home')};
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



// Version 87: reliably show the Dählmann draft chooser after app initialization and on Safari return.
function openStartupDraftChooser(){
  try{
    // Die Entwurfsauswahl nur auf der Startseite anbieten – niemals im
    // laufenden Liefernachweis oder während der PDF-Erstellung/ -Vorschau.
    const form=$('form');
    const pdfModal=$('pdfPreviewModal');
    if((form && form.classList.contains('active')) || (pdfModal && !pdfModal.hidden))return;
    const welcome=$('welcome');
    if(welcome && !welcome.classList.contains('active'))return;
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
// Version 118: public entry point for the create-delivery action.
window.startNewDelivery = function(){ return fresh(); };
