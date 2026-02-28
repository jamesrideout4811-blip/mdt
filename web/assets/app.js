const app = document.getElementById('app');
const content = document.getElementById('content');
const me = document.getElementById('me');

const post = (event, data = {}) => fetch(`https://${GetParentResourceName()}/${event}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(data)
});

const CHARGES = [
  { code: 'T-LIC-01', label: 'Drive unlicensed (never held licence)', fine: 1200, jail: 6, description: 'Driving without ever holding a valid licence.' },
  { code: 'T-LIC-02', label: 'Drive while suspended/disqualified', fine: 3500, jail: 14, description: 'Driving while licence is suspended/disqualified.' },
  { code: 'T-LIC-03', label: 'Permit unlicensed driver (owner)', fine: 1000, jail: 4, description: 'Owner permits unlicensed driver.' },
  { code: 'T-LIC-04', label: 'Fail to produce licence / details', fine: 450, jail: 0, description: 'Failure to produce licence/details.' },
  { code: 'T-SPD-01', label: 'Speeding +1 to 10 km/h', fine: 250, jail: 0, description: 'Minor speeding offence.' },
  { code: 'T-SPD-02', label: 'Speeding 10–20 km/h', fine: 450, jail: 0, description: 'Moderate speeding offence.' },
  { code: 'T-SPD-03', label: 'Speeding 20–30 km/h', fine: 750, jail: 0, description: 'Serious speeding offence.' },
  { code: 'T-SPD-04', label: 'Speeding 30–45 km/h', fine: 1300, jail: 2, description: 'High-range speeding offence.' },
  { code: 'T-SPD-05', label: 'Speeding 45+ km/h', fine: 2800, jail: 6, description: 'Extreme speeding offence.' },
  { code: 'T-DRV-01', label: 'Negligent driving', fine: 1000, jail: 4, description: 'Driving without due care.' },
  { code: 'T-DRV-02', label: 'Reckless / hoon driving', fine: 2500, jail: 10, description: 'Reckless/hoon vehicle operation.' },
  { code: 'T-DRV-03', label: 'Dangerous driving (serious risk)', fine: 4500, jail: 18, description: 'Dangerous driving posing serious risk.' },
  { code: 'T-DRV-04', label: 'Police pursuit / fail to stop', fine: 3500, jail: 14, description: 'Failure to stop for police.' },
  { code: 'T-DRV-05', label: 'Evade police (aggravated)', fine: 6500, jail: 28, description: 'Aggravated police evasion.' },
  { code: 'T-RS-01', label: 'Red light', fine: 600, jail: 0, description: 'Failing to stop at red light.' },
  { code: 'T-RS-02', label: 'Fail to give way / dangerous merge', fine: 500, jail: 0, description: 'Unsafe merge or yield offence.' },
  { code: 'T-RS-03', label: 'Illegal U-turn', fine: 350, jail: 0, description: 'Prohibited U-turn.' },
  { code: 'T-RS-04', label: 'Use mobile while driving', fine: 450, jail: 0, description: 'Mobile use while driving.' },
  { code: 'T-RS-05', label: 'No seatbelt', fine: 350, jail: 0, description: 'Seatbelt offence.' },
  { code: 'T-RS-06', label: 'Unroadworthy vehicle / defects', fine: 650, jail: 0, description: 'Vehicle defect offence.' },
  { code: 'T-RS-07', label: 'Bald tyres / unsafe load', fine: 550, jail: 0, description: 'Unsafe tyres/load offence.' },
  { code: 'T-RS-08', label: 'Hit & run (property only)', fine: 1800, jail: 8, description: 'Leave scene with property damage.' },
  { code: 'T-RS-09', label: 'Hit & run (injury)', fine: 6000, jail: 26, description: 'Leave scene with injury.' },
  { code: 'T-DUI-01', label: 'Low range PCA', fine: 1200, jail: 3, description: 'Low-range alcohol offence.' },
  { code: 'T-DUI-02', label: 'Mid range PCA', fine: 2500, jail: 8, description: 'Mid-range alcohol offence.' },
  { code: 'T-DUI-03', label: 'High range PCA', fine: 4000, jail: 14, description: 'High-range alcohol offence.' },
  { code: 'T-DUI-04', label: 'Refuse breath analysis', fine: 4500, jail: 16, description: 'Refusal of breath analysis.' },
  { code: 'T-DUI-05', label: 'Drug driving (presence)', fine: 2000, jail: 6, description: 'Drug driving presence offence.' },
  { code: 'PO-01', label: 'Offensive language', fine: 300, jail: 0, description: 'Offensive language.' },
  { code: 'PO-02', label: 'Offensive conduct / disorderly', fine: 450, jail: 0, description: 'Disorderly conduct.' },
  { code: 'PO-03', label: 'Intoxicated in public (disturbance)', fine: 450, jail: 0, description: 'Public intoxication disturbance.' },
  { code: 'PO-04', label: 'Fail to move on / comply direction', fine: 600, jail: 0, description: 'Failing police direction.' },
  { code: 'PO-05', label: 'Trespass', fine: 650, jail: 0, description: 'Trespass offence.' },
  { code: 'PO-06', label: 'Resist police directions (low)', fine: 900, jail: 2, description: 'Low-level resistance.' },
  { code: 'PO-07', label: 'Resist arrest (standard)', fine: 1800, jail: 6, description: 'Resisting lawful arrest.' },
  { code: 'PO-08', label: 'Hinder / obstruct police', fine: 1500, jail: 5, description: 'Obstruct police.' },
  { code: 'W-01', label: 'Knife in public (no excuse)', fine: 1500, jail: 10, description: 'Knife in public without excuse.' },
  { code: 'W-02', label: 'Offensive implement in public', fine: 1800, jail: 10, description: 'Offensive implement offence.' },
  { code: 'W-03', label: 'Possess/use unlicensed firearm', fine: 6000, jail: 28, description: 'Unlicensed firearm offence.' },
  { code: 'W-04', label: 'Possess unregistered firearm', fine: 5000, jail: 24, description: 'Unregistered firearm offence.' },
  { code: 'W-05', label: 'Firearm in public place', fine: 10000, jail: 60, description: 'Aggravated public firearm offence.' },
  { code: 'W-06', label: 'Discharge firearm in public', fine: 15000, jail: 96, description: 'Discharging firearm in public.' },
  { code: 'D-01', label: 'Possess prohibited drug (personal)', fine: 1200, jail: 6, description: 'Drug possession (personal).' },
  { code: 'D-02', label: 'Possess drug utensils', fine: 600, jail: 0, description: 'Drug utensil possession.' },
  { code: 'D-03', label: 'Possess large personal qty', fine: 3500, jail: 16, description: 'Large personal quantity.' },
  { code: 'D-04', label: 'Supply prohibited drug', fine: 6500, jail: 36, description: 'Drug supply/dealing.' },
  { code: 'D-05', label: 'Supply commercial qty', fine: 12500, jail: 84, description: 'Commercial quantity supply.' },
  { code: 'D-06', label: 'Drug trafficking', fine: 25000, jail: 180, description: 'Organised trafficking.' },
  { code: 'D-07', label: 'Possess precursors (intent)', fine: 10000, jail: 60, description: 'Precursor possession with intent.' },
  { code: 'D-08', label: 'Manufacture prohibited drug', fine: 20000, jail: 120, description: 'Drug manufacture.' },
  { code: 'V-01', label: 'Common assault', fine: 1500, jail: 8, description: 'Common assault.' },
  { code: 'V-02', label: 'ABH assault', fine: 4000, jail: 22, description: 'Assault occasioning bodily harm.' },
  { code: 'V-03', label: 'Wounding / GBH', fine: 10000, jail: 72, description: 'Serious assault / GBH.' },
  { code: 'V-04', label: 'Stalk/intimidate', fine: 3500, jail: 18, description: 'Stalking or intimidation.' },
  { code: 'V-05', label: 'Threaten violence / threats to kill', fine: 6000, jail: 40, description: 'Serious threats offence.' },
  { code: 'P-01', label: 'Steal property (petty)', fine: 650, jail: 2, description: 'Petty theft.' },
  { code: 'P-02', label: 'Steal property (standard)', fine: 1800, jail: 8, description: 'Standard theft.' },
  { code: 'P-03', label: 'Steal motor vehicle', fine: 4000, jail: 20, description: 'Vehicle theft.' },
  { code: 'P-04', label: 'Receive stolen property', fine: 2500, jail: 12, description: 'Receiving stolen property.' },
  { code: 'P-05', label: 'Robbery / steal from person', fine: 7500, jail: 48, description: 'Street robbery.' },
  { code: 'P-06', label: 'Armed robbery', fine: 15000, jail: 120, description: 'Armed robbery.' },
  { code: 'P-07', label: 'Break & enter', fine: 6500, jail: 60, description: 'Break and enter.' },
  { code: 'P-09', label: 'Malicious damage / vandalism', fine: 1500, jail: 6, description: 'Property damage/vandalism.' },
  { code: 'P-10', label: 'Arson', fine: 20000, jail: 180, description: 'Arson offence.' },
  { code: 'F-01', label: 'Provide false name/details', fine: 1200, jail: 4, description: 'Provide false details.' },
  { code: 'F-02', label: 'Fraud / deception', fine: 6500, jail: 36, description: 'Fraud/deception.' },
  { code: 'F-03', label: 'Identity theft / possess ID docs', fine: 4000, jail: 18, description: 'Identity theft related offence.' },
  { code: 'F-04', label: 'Money laundering', fine: 12500, jail: 84, description: 'Money laundering.' },
  { code: 'F-05', label: 'Bribery of public official', fine: 10000, jail: 60, description: 'Public official bribery.' },
  { code: 'H-01', label: 'Manslaughter', fine: 25000, jail: 240, description: 'Manslaughter.' },
  { code: 'H-02', label: 'Murder', fine: 50000, jail: 480, description: 'Murder.' },
  { code: 'ADD-01', label: 'Fail to comply direction', fine: 600, jail: 0, description: 'Standard add-on offence.' },
  { code: 'ADD-02', label: 'Hinder/obstruct police', fine: 1500, jail: 5, description: 'Standard add-on offence.' },
  { code: 'ADD-03', label: 'Resist arrest', fine: 1800, jail: 6, description: 'Standard add-on offence.' },
  { code: 'ADD-04', label: 'Bail breach', fine: 2500, jail: 10, description: 'Standard add-on offence.' },
  { code: 'ADD-05', label: 'Possess proceeds of crime', fine: 2000, jail: 8, description: 'Standard add-on offence.' },
  { code: 'ADD-06', label: 'Destroy evidence', fine: 3500, jail: 16, description: 'Standard add-on offence.' },
  { code: 'ADD-07', label: 'Witness tampering / intimidate', fine: 7500, jail: 60, description: 'Standard add-on offence.' }
];

const caseState = {
  report: { criminals: [], victims: [], officers: [], charges: [] },
  incident: { criminals: [], victims: [], officers: [], charges: [] }
};

const chargeOptions = CHARGES.map(c => `<option value="${c.code}" title="${c.description}">${c.code} - ${c.label} | $${c.fine} | ${c.jail} mo</option>`).join('');

const templates = {
  reports: `<h2>Create Report</h2><div class="card"><input id="title" placeholder="Title"><textarea id="body" rows="5" placeholder="Report details"></textarea><div class="case-grid"><div class="card compact"><h3>Criminals Involved</h3><div id="report-criminals"></div></div><div class="card compact"><h3>Victims Involved</h3><div id="report-victims"></div></div><div class="card compact"><h3>Officers Involved</h3><div id="report-officers"></div></div></div><div class="card compact charge-box" id="report-charge-box"><button class="plus-charge" onclick="openChargePicker('report')">+</button><h3>Charges</h3><select id="report-charge-select">${chargeOptions}</select><div id="report-charges"></div></div><button onclick="saveSimple('report')">Save Report</button></div>`,
  incidents: `<h2>Create Incident</h2><div class="card"><input id="title" placeholder="Incident title"><textarea id="body" rows="5" placeholder="Narrative"></textarea><div class="case-grid"><div class="card compact"><h3>Criminals Involved</h3><div id="incident-criminals"></div></div><div class="card compact"><h3>Victims Involved</h3><div id="incident-victims"></div></div><div class="card compact"><h3>Officers Involved</h3><div id="incident-officers"></div></div></div><div class="card compact charge-box" id="incident-charge-box"><button class="plus-charge" onclick="openChargePicker('incident')">+</button><h3>Charges</h3><select id="incident-charge-select">${chargeOptions}</select><div id="incident-charges"></div></div><button onclick="saveSimple('incident')">Save Incident</button></div>`,
  bulletins: `<h2>Bulletin</h2><div class="card"><input id="title" placeholder="Bulletin title"><select id="priority"><option>low</option><option selected>normal</option><option>high</option></select><textarea id="body" rows="6" placeholder="Message"></textarea><button onclick="saveSimple('bulletin')">Post Bulletin</button></div>`,
  workers: `<h2>Active Workers</h2><div id="workers"></div>`,
  callsign: `<h2>Call Sign Menu</h2><div class="card"><input id="callsignInput" maxlength="24" placeholder="Set your call sign (e.g. P-212)"><button onclick="saveCallsign()">Save Call Sign</button></div><div class="card">Your current call sign: <strong id="currentCallsign">Not set</strong></div>`,
  dov: `<h2>DOV / BOLO Vehicle</h2><div class="card"><input id="plate" placeholder="Plate"><textarea id="note" rows="6" placeholder="DOV details"></textarea><button onclick="createDov()">Save DOV</button></div>`,
  reg: `<h2>Create Registration</h2><div class="card"><input id="ownerSource" placeholder="Player Source (optional)"><input id="ownerCid" placeholder="Owner Citizen ID"><input id="plate" placeholder="Plate"><select id="category"><option value="car">Car</option><option value="bike">Bike</option><option value="boat">Boat</option><option value="heli">Heli</option></select><input id="fee" type="number" placeholder="Fee Override"><input id="duration" type="number" placeholder="Duration Days"><button onclick="createRegistration()">Register Vehicle</button></div>`,
  impound: `<h2>Impound Lookup</h2><div class="card"><input id="impoundPlate" placeholder="Search by plate"><input id="impoundOwner" placeholder="Search by owner/citizen"><button onclick="loadImpounds()">Search Impounds</button></div><div id="impounds"></div>`,
  licensing: `<h2>License Enforcement</h2><div class="split"><div class="card"><h3>Record Gun / Vehicle License Action</h3><select id="licenseType"><option value="gun">Gun License</option><option value="vehicle">Vehicle License</option></select><select id="actionType"><option value="disqualified">Disqualified</option><option value="revoked">Revoked</option><option value="suspended">Suspended</option><option value="cleared">Cleared / Reinstated</option></select><input id="subjectName" placeholder="Citizen Name"><input id="subjectCid" placeholder="Citizen ID (optional)"><input id="reason" placeholder="Reason / statute"><textarea id="notes" rows="5" placeholder="Case notes"></textarea><input id="expiresAt" type="date" placeholder="Optional end date"><button onclick="createLicenseAction()">Save Licensing Action</button></div><div class="card"><h3>Disqualifications & Revocations Feed</h3><button onclick="refreshBootstrap()">Refresh Feed</button><div id="licenseActions"></div></div></div>`,
  justice: `<h2>Fine + Jail</h2><div class="card"><h3>Issue Fine</h3><input id="fineTarget" placeholder="Target Source"><input id="fineAmount" type="number" placeholder="Amount"><input id="fineReason" placeholder="Reason"><button onclick="issueFine()">Issue Fine</button><h3>Jail</h3><input id="jailTarget" placeholder="Target Source"><input id="jailTime" type="number" placeholder="Minutes"><input id="jailReason" placeholder="Reason"><button onclick="jailPlayer()">Send to Prison</button></div>`,
  dispatch: `<h2>Dispatch Alert</h2><div class="card"><input id="dispatchTitle" placeholder="Call title"><input id="dispatchCode" placeholder="Code (e.g. 10-80)"><select id="dispatchPriority"><option value="low">Low</option><option value="normal" selected>Normal</option><option value="high">High</option></select><input id="dispatchJobs" placeholder="Jobs csv (police,ambulance)"><textarea id="dispatchMessage" rows="4" placeholder="Dispatch details"></textarea><button onclick="sendDispatch()">Send Dispatch</button></div>`,
  corrections: `<h2>RCORE Custody Status</h2><div class="card"><button onclick="loadCorrections()">Refresh Jail / Community Service</button></div><div id="custody"></div><div class="card"><h3>Assign Community Service</h3><input id="serviceTarget" placeholder="Target Source"><input id="serviceActions" type="number" placeholder="Actions / Tasks"><input id="serviceReason" placeholder="Reason"><button onclick="assignCommunityService()">Assign Service</button></div>`,
  training: `<h2>PD Training Guide</h2><div id="training"></div>`,
  employment: `<h2>Hire / Fire</h2><div class="card"><select id="action"><option value="hire">Hire</option><option value="fire">Fire</option><option value="promote">Promote</option><option value="demote">Demote</option></select><input id="target" placeholder="Target Source"><input id="job" placeholder="Job (police/ambulance/doj)"><input id="grade" type="number" placeholder="Grade"><button onclick="employmentAction()">Submit Action</button></div>`
};

const findPeople = (query) => {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  return (window.__people || []).filter(p => (`${p.name} ${p.citizenId || ''} ${p.source || ''}`.toLowerCase().includes(q))).slice(0, 8);
};

function renderPersonManager(tab, group) {
  const target = document.getElementById(`${tab}-${group}`);
  if (!target) return;
  const selected = caseState[tab][group] || [];
  target.innerHTML = `<input id="${tab}-${group}-query" placeholder="Search player by name / CID / source"><div id="${tab}-${group}-results" class="search-results"></div><div id="${tab}-${group}-selected" class="chip-row"></div>`;
  const queryInput = document.getElementById(`${tab}-${group}-query`);
  const resultsEl = document.getElementById(`${tab}-${group}-results`);
  const selectedEl = document.getElementById(`${tab}-${group}-selected`);
  const renderSelected = () => {
    selectedEl.innerHTML = selected.map((p, idx) => `<span class="chip">${p.name}<button onclick="removePerson('${tab}','${group}',${idx})">×</button></span>`).join('') || '<small class="muted">No players added.</small>';
  };
  queryInput.addEventListener('input', () => {
    const rows = findPeople(queryInput.value);
    resultsEl.innerHTML = rows.map(p => `<button type="button" class="search-item" onclick="addPerson('${tab}','${group}',${p.source},'${(p.name || '').replace(/'/g, "\\'")}','${(p.citizenId || '').replace(/'/g, "\\'")}')">${p.name} (${p.citizenId || 'N/A'}) #${p.source}</button>`).join('');
  });
  renderSelected();
}

function renderCharges(tab) {
  const wrap = document.getElementById(`${tab}-charges`);
  if (!wrap) return;
  const charges = caseState[tab].charges || [];
  wrap.innerHTML = charges.map((c, idx) => `<span class="chip charge-chip" title="${c.description}">${c.code} - ${c.label} ($${c.fine}, ${c.jail}mo)<button onclick="removeCharge('${tab}',${idx})">×</button></span>`).join('') || '<small class="muted">No charges added yet.</small>';
}

window.addPerson = (tab, group, source, name, citizenId) => {
  const list = caseState[tab][group];
  if (list.some(x => x.source === Number(source))) return;
  list.push({ source: Number(source), name, citizenId });
  renderPersonManager(tab, group);
};
window.removePerson = (tab, group, idx) => { caseState[tab][group].splice(idx, 1); renderPersonManager(tab, group); };
window.openChargePicker = (tab) => { const charge = CHARGES.find(c => c.code === document.getElementById(`${tab}-charge-select`).value); if (!charge) return; caseState[tab].charges.push(charge); renderCharges(tab); };
window.removeCharge = (tab, idx) => { caseState[tab].charges.splice(idx, 1); renderCharges(tab); };

function initCaseBuilder(tab) {
  ['criminals', 'victims', 'officers'].forEach(group => renderPersonManager(tab, group));
  renderCharges(tab);
  const chargeBox = document.getElementById(`${tab}-charge-box`);
  if (chargeBox) chargeBox.addEventListener('contextmenu', (e) => { e.preventDefault(); openChargePicker(tab); });
}

window.saveSimple = (kind) => {
  const payload = { title: document.getElementById('title').value, body: document.getElementById('body').value, priority: document.getElementById('priority')?.value };
  if (kind === 'report' || kind === 'incident') {
    const state = caseState[kind];
    payload.criminals = state.criminals; payload.victims = state.victims; payload.officers = state.officers; payload.charges = state.charges; payload.suspects = state.criminals;
  }
  return post('createEntry', { kind, payload });
};

window.createDov = () => post('createEntry', { kind: 'dov', payload: { plate: document.getElementById('plate').value, note: document.getElementById('note').value } });
window.createRegistration = () => post('createRegistration', { ownerSource: document.getElementById('ownerSource').value, ownerCid: document.getElementById('ownerCid').value, plate: document.getElementById('plate').value, category: document.getElementById('category').value, fee: document.getElementById('fee').value, duration: document.getElementById('duration').value });
window.createLicenseAction = () => post('createLicenseAction', { licenseType: document.getElementById('licenseType').value, actionType: document.getElementById('actionType').value, subjectName: document.getElementById('subjectName').value, subjectCid: document.getElementById('subjectCid').value, reason: document.getElementById('reason').value, notes: document.getElementById('notes').value, expiresAt: document.getElementById('expiresAt').value }).then(() => refreshBootstrap());
window.refreshBootstrap = () => post('refreshBootstrap');
window.saveCallsign = () => post('setCallsign', { callsign: document.getElementById('callsignInput').value }).then(() => refreshBootstrap());
window.issueFine = () => post('issueFine', { target: document.getElementById('fineTarget').value, amount: document.getElementById('fineAmount').value, reason: document.getElementById('fineReason').value });
window.jailPlayer = () => post('jailPlayer', { target: document.getElementById('jailTarget').value, time: document.getElementById('jailTime').value, reason: document.getElementById('jailReason').value });
window.employmentAction = () => post('employmentAction', { action: document.getElementById('action').value, target: document.getElementById('target').value, job: document.getElementById('job').value, grade: document.getElementById('grade').value });
window.sendDispatch = () => post('sendDispatch', { title: document.getElementById('dispatchTitle').value, code: document.getElementById('dispatchCode').value, message: document.getElementById('dispatchMessage').value, priority: document.getElementById('dispatchPriority').value, jobs: (document.getElementById('dispatchJobs').value || 'police').split(',').map(v => v.trim()).filter(Boolean) });
window.loadCorrections = () => post('getCorrectionsStatus');
window.assignCommunityService = () => post('assignCommunityService', { target: document.getElementById('serviceTarget').value, actions: document.getElementById('serviceActions').value, reason: document.getElementById('serviceReason').value });
window.loadImpounds = () => post('getImpounds', { plate: document.getElementById('impoundPlate')?.value || '', owner: document.getElementById('impoundOwner')?.value || '' });

function renderTraining() { const modules = window.__training?.modules || []; document.getElementById('training').innerHTML = modules.map(m => `<div class="card"><h3>${m.title}</h3><ul>${(m.tips || []).map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('') || '<div class="card">No training modules configured.</div>'; }
function renderLicenseActions() { const actions = window.__licenseActions || []; document.getElementById('licenseActions').innerHTML = actions.map((x) => `<div class="card action-card"><span class="badge ${x.license_type}">${x.license_type}</span><span class="badge ${x.action}">${x.action}</span><h4>${x.subject_name}</h4><p>${x.reason || ''}</p><small>CID: ${x.subject_cid || 'n/a'} | Exp: ${x.expires_at || 'none'} | By: ${x.author}</small></div>`).join('') || '<div class="card">No gun or vehicle disqualifications/revocations logged yet.</div>'; }
function renderImpounds() { const impounds = window.__impounds || []; document.getElementById('impounds').innerHTML = impounds.map((x) => `<div class="card impound-card"><h4>${x.plate} | ${x.model}</h4><p>Owner: ${x.owner}</p><p>Impounded: ${x.impoundedAt} by ${x.impoundedBy}</p><p>Reason: ${x.reason}</p><p>Lot: ${x.lot} | Fee: $${x.releaseFee}</p><p>Time Left: ${x.remainingMinutes == null ? 'Unknown' : `${x.remainingMinutes} min`}</p></div>`).join('') || '<div class="card">No impounded vehicles found for this search.</div>'; }
function renderCustody() { const custody = window.__custody || { jail: [], service: [] }; const jail = (custody.jail || []).map(x => `<div class="card">JAIL | ${x.identifier || x.citizenid || 'Unknown'} | remaining: ${x.remaining || x.time || 'n/a'} | ${x.reason || ''}</div>`).join(''); const service = (custody.service || []).map(x => `<div class="card">SERVICE | ${x.identifier || x.citizenid || 'Unknown'} | remaining: ${x.remaining || x.actions || 'n/a'} | ${x.reason || ''}</div>`).join(''); document.getElementById('custody').innerHTML = `${jail || '<div class="card">No inmates currently in jail feed.</div>'}${service || '<div class="card">No community service entries currently in feed.</div>'}`; }

function openTab(tab) {
  content.innerHTML = templates[tab] || '<p>Unavailable tab</p>';
  if (tab === 'workers' && window.__workers) document.getElementById('workers').innerHTML = window.__workers.map(w => `<div class="card">${w.name} | ${w.job} (${w.grade})${w.callsign ? ` | ${w.callsign}` : ''}</div>`).join('');
  if (tab === 'callsign') { document.getElementById('currentCallsign').textContent = window.__callsign || 'Not set'; const i = document.getElementById('callsignInput'); if (window.__callsign) i.value = window.__callsign; }
  if (tab === 'reports') initCaseBuilder('report');
  if (tab === 'incidents') initCaseBuilder('incident');
  if (tab === 'training') renderTraining();
  if (tab === 'licensing') renderLicenseActions();
  if (tab === 'impound') { renderImpounds(); loadImpounds(); }
  if (tab === 'corrections') { renderCustody(); loadCorrections(); }
}

document.querySelectorAll('aside button[data-tab]').forEach(btn => btn.addEventListener('click', () => openTab(btn.dataset.tab)));
document.getElementById('close').addEventListener('click', () => { app.classList.add('hidden'); post('close'); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !app.classList.contains('hidden')) { app.classList.add('hidden'); post('close'); } });

window.addEventListener('message', (event) => {
  const { action, state, payload } = event.data;
  if (action === 'toggle') { app.classList.toggle('hidden', !state); if (state) openTab('reports'); }
  if (action === 'bootstrap') {
    me.textContent = `${payload.user}${payload.callsign ? ` [${payload.callsign}]` : ''} | ${payload.framework.toUpperCase()}`;
    window.__workers = payload.workers; window.__training = payload.training; window.__licenseActions = payload.licenseActions || []; window.__people = payload.people || []; window.__callsign = payload.callsign || '';
    document.documentElement.style.setProperty('--primary', payload.theme.primary);
    document.documentElement.style.setProperty('--accent', payload.theme.accent);
    if (payload.logo) { app.style.backgroundImage = `linear-gradient(rgba(5, 18, 35, 0.92), rgba(5, 18, 35, 0.92)), url('${payload.logo}')`; app.style.backgroundSize = 'contain'; app.style.backgroundRepeat = 'no-repeat'; app.style.backgroundPosition = 'center'; }
    if (document.getElementById('licenseActions')) renderLicenseActions();
  }
  if (action === 'impoundStatus') { window.__impounds = payload || []; if (document.getElementById('impounds')) renderImpounds(); }
  if (action === 'correctionsStatus') { window.__custody = payload || { jail: [], service: [] }; if (document.getElementById('custody')) renderCustody(); }
});
