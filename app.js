/* CareTrack Pro demo logic — all records are illustrative */
'use strict';
const today = new Date().toISOString().slice(0,10);
const feverThreshold = 37.5;
const capacity = 74;
const $ = (id) => document.getElementById(id);
const dateShift = (days) => { const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
const dateLabel = (date) => new Date(date+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
const esc = (s) => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = (name) => String(name).split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
let patients = [
{id:'P-1001',name:'Aarav Mehta',room:'R-01',admission:dateShift(-7),temps:[{date:dateShift(-3),value:36.7},{date:dateShift(-2),value:36.6},{date:dateShift(-1),value:36.8}],nurseToday:false,doctorToday:false,status:'Admitted',history:[]},
{id:'P-1002',name:'Mira Shah',room:'R-02',admission:dateShift(-5),temps:[{date:dateShift(-2),value:38.4},{date:dateShift(-1),value:37.9}],nurseToday:false,doctorToday:false,status:'Admitted',history:[]},
{id:'P-1003',name:'Kabir Joshi',room:'R-03',admission:dateShift(-4),temps:[{date:dateShift(-2),value:36.8},{date:dateShift(-1),value:36.7}],nurseToday:true,doctorToday:false,status:'Admitted',history:[{date:today,value:36.6,repeat:false,reason:''}]},
{id:'P-1004',name:'Anaya Rao',room:'R-04',admission:dateShift(-9),temps:[{date:dateShift(-4),value:36.5},{date:dateShift(-3),value:36.6},{date:dateShift(-2),value:36.5},{date:dateShift(-1),value:36.6}],nurseToday:false,doctorToday:false,status:'Admitted',history:[]},
{id:'P-1005',name:'Dev Patel',room:'R-05',admission:dateShift(-3),temps:[{date:dateShift(-1),value:39.1}],nurseToday:false,doctorToday:false,status:'Admitted',history:[]},
{id:'P-1006',name:'Isha Nair',room:'R-06',admission:dateShift(-8),temps:[{date:dateShift(-3),value:36.6},{date:dateShift(-2),value:36.5},{date:dateShift(-1),value:36.6}],nurseToday:true,doctorToday:true,status:'Admitted',history:[{date:today,value:36.7,repeat:false,reason:''}]}
];
let outcomes=[
{id:'P-0991',name:'Sample Patient A',outcome:'Recovered',date:dateShift(-4),notes:'Illustrative sample record'},
{id:'P-0992',name:'Sample Patient B',outcome:'Recovered',date:dateShift(-3),notes:'Illustrative sample record'},
{id:'P-0993',name:'Sample Patient C',outcome:'Death',date:dateShift(-2),notes:'Illustrative sample record'},
{id:'P-0994',name:'Sample Patient D',outcome:'Recovered',date:dateShift(-1),notes:'Illustrative sample record'}
];
function active(){return patients.filter(p=>p.status==='Admitted')}
function allTemps(p){return [...(p.temps||[]),...(p.history||[])].sort((a,b)=>a.date.localeCompare(b.date))}
function latest(p){const a=allTemps(p);return a.length?a[a.length-1]:null}
function todayTemp(p){return (p.history||[]).find(t=>t.date===today&&!t.repeat)||null}
function noFeverDays(p){
  let days=0,d=new Date();d.setDate(d.getDate()-1);
  for(let i=0;i<60;i++){const key=d.toISOString().slice(0,10);const entries=allTemps(p).filter(t=>t.date===key);const t=entries[entries.length-1];if(!t||Number(t.value)>=feverThreshold)break;days++;d.setDate(d.getDate()-1);}
  return days;
}
function eligible(p){return noFeverDays(p)>=3}
function statusPill(text,type='neutral'){return `<span class="status-pill status-${type}">${esc(text)}</span>`}
function patientCell(p){return `<div class="patient-cell"><span class="patient-avatar">${esc(initials(p.name))}</span><span><span class="patient-name">${esc(p.name)}</span><span class="patient-id">${esc(p.id)}</span></span></div>`}
function taskPill(done,label){return statusPill(done?`${label} done`:`${label} pending`,done?'green':'amber')}
function actionButton(text,action,id){return `<button class="row-action" data-action="${action}" data-id="${esc(id)}">${text}</button>`}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3000)}
function navigate(view){
  const target=$(view);if(!target)return;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
  target.classList.add('active-view');
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const activeNav=document.querySelector(`.nav-item[data-view="${view}"]`);
  $('breadcrumbCurrent').textContent=activeNav?activeNav.textContent.trim():view==='guide'?'Quick guide':'Overview';
  if(view==='guide')$('breadcrumbCurrent').textContent='Quick guide';
  $('sidebar')?.classList.remove('sidebar-open');
  window.scrollTo({top:0,behavior:'smooth'});
}
function render(){
  renderDashboard();renderPatients();renderNurse();renderDoctor();renderAdmin();renderOutcomes();
  $('navPatientCount').textContent=active().length;
}
function renderDashboard(){
  const a=active(),n=a.filter(p=>!p.nurseToday).length,d=a.filter(p=>!p.doctorToday).length,e=a.filter(eligible).length;
  const metrics=[
    {label:'Active patients',value:`${a.length}<small> / ${capacity}</small>`,icon:'♙',kind:'',foot:`${Math.round(a.length/capacity*100)}% of facility capacity`,trend:'↗'},
    {label:'Temperature pending',value:n,icon:'♨',kind:'amber',foot:'Routine checks remaining',trend:n?'Needs action':'All clear'},
    {label:'Doctor visits pending',value:d,icon:'⌕',kind:'purple',foot:'Daily reviews remaining',trend:d?'In progress':'All clear'},
    {label:'Discharge eligible',value:e,icon:'✓',kind:'green',foot:'3 full no-fever days documented',trend:'Review queue'}
  ];
  $('metrics').innerHTML=metrics.map(m=>`<article class="metric-card"><div class="metric-top"><span class="metric-label">${m.label}</span><span class="metric-icon ${m.kind}">${m.icon}</span></div><div class="metric-value">${m.value}</div><div class="metric-foot"><span class="metric-trend">${m.trend}</span> ${m.foot}</div></article>`).join('');
  const doneN=a.length-n,doneD=a.length-d;
  $('workflow').innerHTML=progressRow('Routine temperatures',doneN,a.length,'green')+progressRow('Doctor rounds',doneD,a.length,'blue')+`<div class="progress-sub">Progress updates when a task is recorded in the demo workflow.</div>`;
  const pct=Math.round(a.length/capacity*100),available=Math.max(0,capacity-a.length);
  $('occupancyPercent').textContent=pct+'%';$('occupiedRooms').textContent=a.length;$('availableRooms').textContent=available;
  $('occupancyDonut').style.background=`conic-gradient(#6578f5 0 ${pct}%,var(--surface-2) ${pct}% 100%)`;
  const rows=a.filter(p=>!p.nurseToday||!p.doctorToday||eligible(p));
  $('attention').innerHTML=rows.length?rows.map(p=>`<tr><td>${patientCell(p)}</td><td>${esc(p.room)}</td><td class="temp-value ${latest(p)&&latest(p).value>=feverThreshold?'temp-hot':''}">${latest(p)?Number(latest(p).value).toFixed(1)+'°C':'—'}</td><td>${taskPill(p.nurseToday,'Nurse')}</td><td>${taskPill(p.doctorToday,'Doctor')}</td><td>${eligible(p)?statusPill('Discharge eligible','green'):statusPill('In care','neutral')}</td><td>${actionButton('View','view',p.id)}</td></tr>`).join(''):`<tr><td colspan="7"><div class="empty-state">All daily tasks are complete.</div></td></tr>`;
}
function progressRow(label,done,total,color){const pct=total?Math.round(done/total*100):0;return `<div class="progress-item"><div class="progress-title"><span>${label}</span><b>${done} / ${total} <span class="muted">(${pct}%)</span></b></div><div class="progress-track"><div class="progress-fill ${color==='green'?'green-fill':''}" style="width:${pct}%"></div></div></div>`}
function renderPatients(){
 const q=($('search')?.value||'').trim().toLowerCase(),f=$('filterStatus')?.value||'all';
 const list=active().filter(p=>(p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q))&&(f==='all'||(f==='attention'&&(!p.nurseToday||!p.doctorToday))||(f==='eligible'&&eligible(p))));
 $('patientRows').innerHTML=list.length?list.map(p=>`<tr><td>${patientCell(p)}</td><td>${esc(p.room)}</td><td>${dateLabel(p.admission)}</td><td class="temp-value ${latest(p)&&latest(p).value>=feverThreshold?'temp-hot':''}">${latest(p)?Number(latest(p).value).toFixed(1)+'°C':'—'}</td><td>${noFeverDays(p)} days</td><td>${taskPill(p.nurseToday,'Nurse')} ${taskPill(p.doctorToday,'Doctor')}</td><td><div class="row-actions">${actionButton('Record temp','temp',p.id)} ${actionButton('View','view',p.id)}</div></td></tr>`).join(''):`<tr><td colspan="7"><div class="empty-state">No patients match these filters.</div></td></tr>`;
 $('patientSummary').textContent=`Showing ${list.length} of ${active().length} active patients`;
}
function renderNurse(){
 const q=($('nurseSearch')?.value||'').toLowerCase(),f=$('nurseFilter')?.value||'pending';
 const list=active().filter(p=>(p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q))&&(f==='all'||!p.nurseToday));
 $('nursePendingTag').textContent=`${active().filter(p=>!p.nurseToday).length} PENDING`;
 $('nurseRows').innerHTML=list.length?list.map(p=>`<tr><td>${patientCell(p)}</td><td>${esc(p.room)}</td><td>${latest(p)?`<span class="temp-value ${latest(p).value>=feverThreshold?'temp-hot':''}">${Number(latest(p).value).toFixed(1)}°C</span>`:'—'}</td><td>${p.nurseToday?statusPill('Recorded','green'):statusPill('Pending','amber')}</td><td>${p.nurseToday?actionButton('View record','view',p.id):`<button class="btn btn-primary" data-action="temp" data-id="${esc(p.id)}">＋ Record temperature</button>`}</td></tr>`).join(''):`<tr><td colspan="5"><div class="empty-state">All routine temperatures are recorded for this filter.</div></td></tr>`;
}
function renderDoctor(){
 const q=($('doctorSearch')?.value||'').toLowerCase(),f=$('doctorFilter')?.value||'pending';
 const list=active().filter(p=>(p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q))&&(f==='all'||!p.doctorToday));
 $('doctorRows').innerHTML=list.length?list.map(p=>`<tr><td>${patientCell(p)}</td><td>${esc(p.room)}</td><td>${todayTemp(p)?`<span class="temp-value ${todayTemp(p).value>=feverThreshold?'temp-hot':''}">${Number(todayTemp(p).value).toFixed(1)}°C</span>`:statusPill('Missing','amber')}</td><td>${taskPill(p.nurseToday,'Nurse')}</td><td>${taskPill(p.doctorToday,'Doctor')}</td><td>${p.doctorToday?statusPill('Complete','green'):`<button class="btn btn-quiet" data-action="visit" data-id="${esc(p.id)}">Complete visit</button>`}</td></tr>`).join(''):`<tr><td colspan="6"><div class="empty-state">No doctor visits pending for this filter.</div></td></tr>`;
}
function renderAdmin(){
 const a=active(),e=a.filter(eligible);
 $('adminMetrics').innerHTML=[
  {label:'Occupied rooms',value:`${a.length} / ${capacity}`,icon:'▤',kind:''},
  {label:'Available rooms',value:Math.max(0,capacity-a.length),icon:'⌂',kind:'green'},
  {label:'Eligible for discharge',value:e.length,icon:'✓',kind:'purple'}
 ].map(m=>`<article class="metric-card"><div class="metric-top"><span class="metric-label">${m.label}</span><span class="metric-icon ${m.kind}">${m.icon}</span></div><div class="metric-value">${m.value}</div><div class="metric-foot">Facility operational snapshot</div></article>`).join('');
 $('dischargeRows').innerHTML=e.length?e.map(p=>`<tr><td>${patientCell(p)}</td><td>${esc(p.room)}</td><td>${noFeverDays(p)} full days</td><td>${taskPill(p.doctorToday,'Doctor')}</td><td><button class="btn btn-primary" data-action="discharge" data-id="${esc(p.id)}">Review discharge →</button></td></tr>`).join(''):`<tr><td colspan="5"><div class="empty-state">No patients currently meet the three-day no-fever criterion.</div></td></tr>`;
}
function renderOutcomes(){
 const deaths=outcomes.filter(o=>o.outcome==='Death').length,rec=outcomes.filter(o=>o.outcome==='Recovered').length,total=outcomes.length,rate=total?deaths/total*100:0;
 const metrics=[{label:'Recorded outcomes',value:total,icon:'▤',kind:''},{label:'Recovered',value:rec,icon:'✓',kind:'green'},{label:'Deaths',value:deaths,icon:'＋',kind:'amber'},{label:'Mortality rate',value:rate.toFixed(1)+'%',icon:'◔',kind:'purple'}];
 $('outcomeMetrics').innerHTML=metrics.map(m=>`<article class="metric-card"><div class="metric-top"><span class="metric-label">${m.label}</span><span class="metric-icon ${m.kind}">${m.icon}</span></div><div class="metric-value">${m.value}</div><div class="metric-foot">Illustrative outcome dataset</div></article>`).join('');
 $('mortalityValue').textContent=rate.toFixed(1)+'%';$('benchmarkStatus').textContent=rate>15?'Above benchmark':'At or below benchmark';$('benchmarkTrack').style.width=Math.min(100,rate)+'%';
 $('benchmarkNotice').innerHTML=rate>15?`<b>Review recommended.</b> Demo mortality is ${rate.toFixed(1)}%, above the 15% benchmark. Review data quality and escalate through the facility's clinical governance process.`:`Demo mortality is ${rate.toFixed(1)}%, at or below the 15% benchmark. Continue monitoring and review sample size.`;
 $('outcomeChart').innerHTML=chartRow('Recovered',rec,total,'recovered')+chartRow('Deaths',deaths,total,'death');
 $('outcomeRows').innerHTML=outcomes.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(o=>`<tr><td>${patientCell({name:o.name,id:o.id})}</td><td>${statusPill(o.outcome,o.outcome==='Death'?'red':'green')}</td><td>${dateLabel(o.date)}</td><td>${esc(o.notes||'—')}</td></tr>`).join('')||`<tr><td colspan="4"><div class="empty-state">No outcomes have been recorded.</div></td></tr>`;
}
function chartRow(label,count,total,kind){const pct=total?count/total*100:0;return `<div class="chart-row"><span>${label}</span><div class="chart-track"><div class="chart-fill ${kind}" style="width:${pct}%"></div></div><b>${count}</b></div>`}
function openModal(content){$('modalRoot').innerHTML=`<div class="modal-backdrop" data-close-backdrop><div class="modal" role="dialog" aria-modal="true">${content}</div></div>`;const first=$('modalRoot').querySelector('input,button,select');first?.focus()}
function closeModal(){$('modalRoot').innerHTML=''}
function modalHead(title,subtitle=''){return `<div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="close-btn" type="button" data-action="close-modal">✕</button></div>`}
function openTemp(id){
 const p=patients.find(x=>x.id===id);if(!p)return;const existing=todayTemp(p);
 openModal(`${modalHead('Record temperature',`${esc(p.name)} · ${esc(p.id)} · Room ${esc(p.room)}`)}${existing?'<div class="callout callout-warning"><span class="callout-icon">⚠</span><div><b>Routine reading already exists</b><p>Choose repeat measurement and provide a reason if a new reading is clinically needed.</p></div></div>':''}<form id="tempForm" data-id="${esc(id)}"><div class="form-grid"><div class="field"><label for="tempValue">TEMPERATURE (°C)</label><input id="tempValue" name="temp" type="number" min="30" max="45" step=".1" required placeholder="e.g. 36.8"></div><div class="field"><label for="tempKind">MEASUREMENT TYPE</label><select id="tempKind" name="kind"><option value="routine" ${existing?'disabled':''}>Routine daily reading</option><option value="repeat">Repeat measurement</option></select></div><div class="field full"><label for="tempReason">REASON (REQUIRED FOR REPEAT)</label><textarea id="tempReason" name="reason" rows="3" placeholder="Explain why this repeat measurement is needed"></textarea></div></div><p class="form-help">Demo fever threshold: ${feverThreshold.toFixed(1)}°C. Confirm local clinical protocol before production use.</p><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save temperature</button></div></form>`);
}
function saveTemp(e){
 e.preventDefault();const form=e.currentTarget,p=patients.find(x=>x.id===form.dataset.id),fd=new FormData(form),v=Number(fd.get('temp')),kind=fd.get('kind'),reason=String(fd.get('reason')||'').trim();
 if(!p||!Number.isFinite(v)||v<30||v>45){toast('Enter a valid temperature between 30 and 45°C.');return}
 if(kind==='routine'&&todayTemp(p)){toast('Routine temperature already exists today.');return}
 if(kind==='repeat'&&!reason){toast('Add a reason for the repeat measurement.');$('tempReason').focus();return}
 p.history.push({date:today,value:v,repeat:kind==='repeat',reason});
 if(kind==='routine')p.nurseToday=true;
 closeModal();render();toast('Temperature saved successfully.');
}
function completeVisit(id){
 const p=patients.find(x=>x.id===id);if(!p)return;
 if(!todayTemp(p)){toast('Record today’s routine temperature before completing the routine visit.');return}
 if(p.doctorToday){toast('Doctor visit is already complete.');return}
 p.doctorToday=true;render();toast('Doctor visit marked complete.');
}
function discharge(id){
 const p=patients.find(x=>x.id===id);if(!p)return;
 if(!eligible(p)){toast('Discharge blocked: three full no-fever days are not documented.');return}
 openModal(`${modalHead('Review discharge',`${esc(p.name)} · ${esc(p.id)} · Room ${esc(p.room)}`)}<div class="callout callout-info"><span class="callout-icon">ⓘ</span><div><b>Criterion met in demo records</b><p>${noFeverDays(p)} consecutive no-fever days are documented. This is an eligibility flag, not a clinical clearance.</p></div></div><p class="form-help">Confirm that required clinical and administrative approvals have been completed before finalizing this demo discharge.</p><div class="modal-actions"><button class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="confirm-discharge" data-id="${esc(id)}">Confirm demo discharge</button></div>`);
}
function confirmDischarge(id){
 const p=patients.find(x=>x.id===id);if(!p||!eligible(p)){closeModal();toast('Discharge eligibility changed; please review again.');return}
 p.status='Discharged';p.dischargeDate=today;
 if(!outcomes.some(o=>o.id===p.id))outcomes.push({id:p.id,name:p.name,outcome:'Recovered',date:today,notes:'Demo discharge after no-fever criterion met'});
 closeModal();render();toast('Demo discharge recorded and room released.');
}
function openAddPatient(){
 openModal(`${modalHead('Admit patient','Add a demo patient to the facility directory.') }<form id="patientForm"><div class="form-grid"><div class="field"><label for="newName">PATIENT NAME</label><input id="newName" name="name" required placeholder="Full name"></div><div class="field"><label for="newId">PATIENT ID</label><input id="newId" name="id" required placeholder="e.g. P-1007"></div><div class="field"><label for="newRoom">ROOM</label><input id="newRoom" name="room" required placeholder="e.g. R-07"></div><div class="field"><label for="newDate">ADMISSION DATE</label><input id="newDate" name="date" type="date" value="${today}" required></div></div><p class="form-help">Admission is blocked if all 74 rooms are occupied, the ID is duplicated, or the room is already assigned.</p><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Admit patient</button></div></form>`);
}
function addPatient(e){
 e.preventDefault();const fd=new FormData(e.currentTarget),id=String(fd.get('id')).trim(),room=String(fd.get('room')).trim(),name=String(fd.get('name')).trim();
 if(active().length>=capacity){toast('Admission blocked: all 74 rooms are occupied.');return}
 if(patients.some(p=>p.id.toLowerCase()===id.toLowerCase())){toast('Patient ID already exists.');return}
 if(active().some(p=>p.room.toLowerCase()===room.toLowerCase())){toast('This room is already occupied.');return}
 if(!name||!id||!room){toast('Complete all required fields.');return}
 patients.push({id,name,room,admission:fd.get('date'),temps:[],history:[],nurseToday:false,doctorToday:false,status:'Admitted'});
 closeModal();render();toast('Patient admitted to demo workspace.');
}
function openOutcome(){
 openModal(`${modalHead('Record patient outcome','Add a final outcome to the illustrative quality dataset.') }<form id="outcomeForm"><div class="form-grid"><div class="field"><label for="outId">PATIENT ID</label><input id="outId" name="id" required placeholder="Patient ID"></div><div class="field"><label for="outName">PATIENT NAME</label><input id="outName" name="name" required placeholder="Patient name"></div><div class="field"><label for="outcomeType">FINAL OUTCOME</label><select id="outcomeType" name="outcome"><option>Recovered</option><option>Death</option></select></div><div class="field"><label for="outDate">OUTCOME DATE</label><input id="outDate" name="date" type="date" value="${today}" required></div><div class="field full"><label for="outNotes">NOTES</label><textarea id="outNotes" name="notes" rows="2" placeholder="Optional context"></textarea></div></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save outcome</button></div></form>`);
}
function saveOutcome(e){
 e.preventDefault();const fd=new FormData(e.currentTarget),id=String(fd.get('id')).trim();
 if(outcomes.some(o=>o.id.toLowerCase()===id.toLowerCase())){toast('An outcome already exists for this patient ID.');return}
 outcomes.push({id,name:String(fd.get('name')).trim(),outcome:fd.get('outcome'),date:fd.get('date'),notes:String(fd.get('notes')||'').trim()});
 closeModal();render();toast('Outcome recorded in demo dataset.');
}
function viewPatient(id){
 const p=patients.find(x=>x.id===id);if(!p)return;
 const history=allTemps(p).slice().sort((a,b)=>b.date.localeCompare(a.date));
 openModal(`${modalHead(esc(p.name),`${esc(p.id)} · Room ${esc(p.room)} · ${esc(p.status)}`)}<div class="form-grid"><div class="metric-card"><div class="metric-label">LATEST TEMPERATURE</div><div class="temp-large">${latest(p)?Number(latest(p).value).toFixed(1)+'°C':'—'}</div><div class="temp-small">${latest(p)?dateLabel(latest(p).date):'No reading yet'}</div></div><div class="metric-card"><div class="metric-label">DOCUMENTED NO-FEVER DAYS</div><div class="temp-large">${noFeverDays(p)}</div><div class="temp-small">Consecutive complete days</div></div></div><div class="history-table"><h3>Temperature history</h3><div class="table-wrap"><table><thead><tr><th>DATE</th><th>TEMP.</th><th>TYPE</th><th>REASON</th></tr></thead><tbody>${history.length?history.map(t=>`<tr><td>${dateLabel(t.date)}</td><td>${Number(t.value).toFixed(1)}°C</td><td>${t.repeat?'Repeat':'Routine'}</td><td>${esc(t.reason||'—')}</td></tr>`).join(''):'<tr><td colspan="4">No readings recorded.</td></tr>'}</tbody></table></div></div><div class="modal-actions"><button class="btn btn-quiet" data-action="close-modal">Close</button><button class="btn btn-primary" data-action="temp" data-id="${esc(p.id)}">＋ Record temperature</button></div>`);
}
function exportReport(){
 const lines=[['Patient ID','Name','Room','Status','Latest temperature C','No-fever days','Nurse complete','Doctor complete'],...active().map(p=>[p.id,p.name,p.room,p.status,latest(p)?.value??'',noFeverDays(p),p.nurseToday?'Yes':'No',p.doctorToday?'Yes':'No'])];
 const csv=lines.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`caretrack-demo-report-${today}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Demo report exported as CSV.');
}
function applyTheme(theme){
 document.documentElement.setAttribute('data-theme',theme);
 $('themeIcon').textContent=theme==='dark'?'☀':'☾';
 $('themeToggle').setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');
 try{localStorage.setItem('caretrack-theme',theme)}catch(e){}
}
function initTheme(){let theme='light';try{theme=localStorage.getItem('caretrack-theme')||'light'}catch(e){}applyTheme(theme)}
document.addEventListener('click',e=>{
 const viewBtn=e.target.closest('[data-view]');if(viewBtn){e.preventDefault();navigate(viewBtn.dataset.view);return}
 if(e.target.closest('[data-open-patient]')){openAddPatient();return}
 const act=e.target.closest('[data-action]');if(act){const action=act.dataset.action,id=act.dataset.id;
  if(action==='close-modal')closeModal();else if(action==='temp')openTemp(id);else if(action==='view')viewPatient(id);else if(action==='visit')completeVisit(id);else if(action==='discharge')discharge(id);else if(action==='confirm-discharge')confirmDischarge(id);return}
 if(e.target.matches('[data-close-backdrop]'))closeModal();
});
document.addEventListener('submit',e=>{
 if(e.target.id==='tempForm')saveTemp(e);
 if(e.target.id==='patientForm')addPatient(e);
 if(e.target.id==='outcomeForm')saveOutcome(e);
});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
$('themeToggle').addEventListener('click',()=>applyTheme((document.documentElement.getAttribute('data-theme')||'light')==='dark'?'light':'dark'));
$('search').addEventListener('input',renderPatients);$('filterStatus').addEventListener('change',renderPatients);
$('nurseSearch').addEventListener('input',renderNurse);$('nurseFilter').addEventListener('change',renderNurse);
$('doctorSearch').addEventListener('input',renderDoctor);$('doctorFilter').addEventListener('change',renderDoctor);
$('clearFilters').addEventListener('click',()=>{$('search').value='';$('filterStatus').value='all';renderPatients()});
$('openOutcomeBtn').addEventListener('click',openOutcome);$('exportBtn').addEventListener('click',exportReport);
$('notificationBtn').addEventListener('click',()=>toast(`${active().filter(p=>!p.nurseToday||!p.doctorToday).length} active patients have at least one pending daily task.`));
$('todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
initTheme();render();
