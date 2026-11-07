
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
function renderMaterialSummary(){const el=$('materialRows');if(!el)return;const totals=materialTotals();el.innerHTML=totals.length?'<h3>Erfasste Materialien</h3>'+totals.map(t=>`<div class="summaryRow"><b>${t.type==='delivery'?'Material geliefert':'Material abgefahren'} · ${esc(t.name)}</b><span>${formatQuantity(t.qty)} ${t.unit==='to'?'to':'cbm'}</span></div>`).join(''):'<p class="hint">Noch keine Materialien erfasst.</p>'}
function rowService(data={}){let d=document.createElement('div');d.className='entry service';d.innerHTML=`<label class="job">Art der Arbeit<input class="jobv" value="${esc(data.job||'')}" placeholder="Zusatzleistung"></label><label class="hours">Stunden<input class="hoursv" inputmode="decimal" value="${esc(data.hours||'')}" placeholder="Std."></label><label class="start">Anfang<input class="startv" type="time" value="${esc(data.start||'')}"></label><label class="end">Ende<input class="endv" type="time" value="${esc(data.end||'')}"></label><label class="pause">Pause<input class="pausev" value="${esc(data.pause||'')}" placeholder="Min."></label><button type="button" aria-label="Entfernen">×</button>`;d.querySelector('button').onclick=()=>d.remove();$('serviceRows').append(d)}
$('addServiceRow').onclick=()=>rowService();
function localDateValue(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function updateDateDisplay(){const value=$('date').value;const button=$('dateDisplay');if(!value){button.textContent='Datum auswählen';return;}const parts=value.split('-').map(Number);const d=new Date(parts[0],parts[1]-1,parts[2],12);button.textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});}
$('date').addEventListener('change',updateDateDisplay);
$('dateDisplay').addEventListener('click',()=>{const input=$('date');if(typeof input.showPicker==='function'){try{input.showPicker();return;}catch(e){}}input.click();});
let wizardStep=1;
function setWizardStep(step){wizardStep=step;document.querySelectorAll('.wizardStep').forEach(el=>el.classList.toggle('active',Number(el.dataset.wizard)===step));$('wizardProgress').textContent=['','Schritt 1 von 3 · Auftraggeber','Schritt 2 von 3 · Material','Schritt 3 von 3 · Zusatzleistungen'][step];window.scrollTo(0,0);}
$('toMaterials').onclick=()=>{if(!$('customer').value)return alert('Bitte zuerst einen Auftraggeber auswählen.');setWizardStep(2)};
$('backToCustomer').onclick=()=>setWizardStep(1);
$('toServices').onclick=()=>setWizardStep(3);
$('backToMaterials').onclick=()=>setWizardStep(2);
function fresh(){ $('date').value=localDateValue();updateDateDisplay();fillSelect($('customer'),db.customers.map(c=>c.name),'Auftraggeber wählen');$('address').value='';fillSelect($('project'),[],'Bauvorhaben wählen');enteredMaterials=[];$('materialRows').innerHTML='<p class="hint">Noch keine Materialien erfasst.</p>';$('serviceRows').innerHTML='';$('signer').value='';clearSig();closeSignature();setWizardStep(1);show('form')}
$('customer').onchange=()=>{let c=db.customers.find(c=>c.name===$('customer').value);$('address').value=c?.address||'';fillSelect($('project'),db.projects.filter(p=>p.owner===c?.name).map(p=>p.name),'Bauvorhaben wählen')};
$('newBtn').onclick=fresh;$('cancel').onclick=()=>show('home');
const signatureModal=$('signatureModal'); signatureModal.hidden=true; signatureModal.classList.remove('open');
const canvas=$('signature'),ctx=canvas.getContext('2d');let drawing=false,ink=false,signatureSaved=false;function pos(e){let r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}canvas.onpointerdown=e=>{drawing=true;ink=true;canvas.setPointerCapture(e.pointerId);let p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;let p=pos(e);ctx.lineWidth=4;ctx.lineCap='round';ctx.strokeStyle='#18212b';ctx.lineTo(p.x,p.y);ctx.stroke()};canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height);ink=false;signatureSaved=false;$('signatureStatus').textContent='Noch keine Unterschrift hinterlegt.'} $('clearSig').onclick=clearSig;
function openSignature(){ const modal=$('signatureModal'); modal.hidden=false; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeSignature(){ const modal=$('signatureModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); modal.hidden=true; }
$('openSignature').onclick=openSignature;$('cancelSignature').onclick=closeSignature;document.querySelectorAll('[data-close-signature]').forEach(el=>el.onclick=closeSignature);
$('confirmSignature').onclick=()=>{if(!ink)return alert('Bitte zuerst unterschreiben.');signatureSaved=true;$('signatureStatus').textContent='Unterschrift übernommen'+($('signer').value.trim()?' · '+$('signer').value.trim():'')+'.';closeSignature();};
function collect(){return {id:Date.now(),date:$('date').value,customer:$('customer').value,address:$('address').value,project:$('project').value||'',materials:enteredMaterials.map(m=>({...m})),services:[...$('serviceRows').querySelectorAll('.entry')].map(d=>({job:d.querySelector('.jobv').value,hours:d.querySelector('.hoursv').value,start:d.querySelector('.startv').value,end:d.querySelector('.endv').value,pause:d.querySelector('.pausev').value})).filter(x=>Object.values(x).some(Boolean)),signature:signatureSaved&&ink?canvas.toDataURL('image/png'):null,signer:signatureSaved?$('signer').value:''}}
function renderArchive(){$('archive').innerHTML=db.reports.slice().sort((a,b)=>b.id-a.id).map(r=>`<div class="archiveCard"><div><b>${esc(r.customer||'Ohne Auftraggeber')}</b><small>${esc(new Date(r.date+'T12:00:00').toLocaleDateString('de-DE'))} · ${esc(r.project||'Ohne Bauvorhaben')} · ${r.pdf?'PDF erstellt':'Gespeichert'}</small></div><button class="soft" data-open-r="${r.id}">Öffnen</button></div>`).join('')||'<div class="panel hint">Noch keine Liefernachweise gespeichert.</div>';document.querySelectorAll('[data-open-r]').forEach(b=>b.onclick=()=>{let r=db.reports.find(x=>x.id==b.dataset.openR);downloadPdf(r)})}
function txt(page,text,x,y,size=9,bold=false){if(!text)return;page.drawText(String(text).slice(0,110),{x,y,size,font:bold?fontBold:font,color:PDFLib.rgb(.12,.15,.18),maxWidth:500})}
let font,fontBold;
function aggregateReportMaterials(rows){const totals=new Map();(rows||[]).forEach(m=>{const name=String(m.name||'').trim(),type=m.type||'delivery',unit=m.unit||'to',qty=parseQuantity(m.qty);if(!name||!qty)return;const key=[type,name,unit].join('||');if(!totals.has(key))totals.set(key,{name,type,unit,qty:0});totals.get(key).qty+=qty});return [...totals.values()].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'de')||a.unit.localeCompare(b.unit))}
async function makePdf(r){const {PDFDocument,StandardFonts,rgb}=PDFLib;let pdf=await PDFDocument.create();let page=pdf.addPage([595.28,841.89]);let bg=await pdf.embedPng(await (await fetch('template.png')).arrayBuffer());page.drawImage(bg,{x:0,y:0,width:595.28,height:841.89});font=await pdf.embedFont(StandardFonts.Helvetica);fontBold=await pdf.embedFont(StandardFonts.HelveticaBold);
// Vorbelegte Musterangaben in der Vorlage abdecken und mit aktuellen Formulardaten befüllen.
const white=rgb(1,1,1);const cover=(x,y,w,h)=>page.drawRectangle({x,y,width:w,height:h,color:white,borderWidth:0});
cover(25,720,285,65);txt(page,r.date?new Date(r.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}):'',30,786,8);
txt(page,r.customer,30,760,10,true);(r.address||'').split('\n').slice(0,2).forEach((s,i)=>txt(page,s,30,744-i*12,9));
cover(150,690,410,35);txt(page,r.project,155,706,9,true);
cover(25,470,545,175);let y=620;const materialRows=aggregateReportMaterials(r.materials||[]);materialRows.forEach(m=>{if(y<480)return;txt(page,(m.type==='haul'?'Abfuhr: ':'Lieferung: ')+m.name,43,y,8);txt(page,formatQuantity(m.qty)+' '+(m.unit==='to'?'to':'cbm'),280,y,8);y-=17});
cover(25,175,545,135);let sy=285;r.services.forEach(s=>{if(sy<180)return;txt(page,s.hours,48,sy,8);txt(page,s.job,145,sy,8);txt(page,s.start,330,sy,8);txt(page,s.end,405,sy,8);txt(page,s.pause,475,sy,8);sy-=17});
if(r.signature){let bytes=await fetch(r.signature).then(x=>x.arrayBuffer());let sig=await pdf.embedPng(bytes);page.drawImage(sig,{x:35,y:70,width:130,height:38})}if(r.signer)txt(page,r.signer,35,62,8);
return await pdf.save()}
async function downloadPdf(r){try{let bytes=await makePdf(r);let blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Liefernachweis-${r.date||'Datum'}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(e){alert('PDF konnte nicht erstellt werden: '+e.message)}}
function validateDocument(r){if(!r.customer){alert('Bitte einen Auftraggeber auswählen.');return false;}if(!r.materials.length&&!r.services.length){alert('Bitte mindestens ein Material oder eine Zusatzleistung eintragen.');return false;}return true}
$('savePdf').onclick=async()=>{let r=collect();if(!validateDocument(r))return;r.signature=null;r.signer='';r.pdf=true;db.reports.push(r);save();await downloadPdf(r);show('home')};
$('saveDocument').onclick=()=>{let r=collect();if(!validateDocument(r))return;r.pdf=false;db.reports.push(r);save();alert('Dokument wurde gespeichert.');show('home')};
renderArchive();
