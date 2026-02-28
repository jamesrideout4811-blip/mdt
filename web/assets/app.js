const app = document.getElementById('app');
const content = document.getElementById('content');
const me = document.getElementById('me');

const post = (event, data = {}) => fetch(`https://${GetParentResourceName()}/${event}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(data)
});

const CHARGES = [
  { code: 'AU01', label: 'Assault Occasioning Bodily Harm', description: 'Assault causing actual bodily harm to another person.' },
  { code: 'AU02', label: 'Common Assault', description: 'Threatening or unlawful physical contact without lawful excuse.' },
  { code: 'AU03', label: 'Aggravated Assault', description: 'Assault with aggravating factors such as weapon or serious injury.' },
  { code: 'AU04', label: 'Affray / Public Violence', description: 'Fighting or threatening violence causing fear to the public.' },
  { code: 'AU05', label: 'Domestic Violence Assault', description: 'Assault committed in a domestic or family relationship.' },
  { code: 'AU06', label: 'Armed Robbery', description: 'Stealing with force or threat while armed.' },
  { code: 'AU07', label: 'Robbery in Company', description: 'Robbery committed with one or more offenders present.' },
  { code: 'AU08', label: 'Burglary / Break and Enter', description: 'Unlawful entry to premises with intent to commit an offence.' },
  { code: 'AU09', label: 'Theft / Stealing', description: 'Dishonestly taking property belonging to another.' },
  { code: 'AU10', label: 'Fraud / Deception', description: 'Obtaining property or financial advantage by deception.' },
  { code: 'AU11', label: 'Drug Possession (Schedule 1)', description: 'Possession of prohibited drugs without lawful authority.' },
  { code: 'AU12', label: 'Drug Supply / Trafficking', description: 'Supplying, distributing, or trafficking prohibited substances.' },
  { code: 'AU13', label: 'Unlicensed Firearm Possession', description: 'Possessing a firearm without a valid licence/authority.' },
  { code: 'AU14', label: 'Prohibited Weapon Possession', description: 'Possessing prohibited weapon/article without lawful reason.' },
  { code: 'AU15', label: 'Resist / Hinder Police', description: 'Resisting, obstructing, or hindering police in execution of duty.' },
  { code: 'AU16', label: 'Escape Lawful Custody', description: 'Escaping or attempting to escape lawful detention.' },
  { code: 'AU17', label: 'Dangerous Driving', description: 'Driving in a manner dangerous to the public.' },
  { code: 'AU18', label: 'Drive Under Influence (DUI)', description: 'Operating a vehicle while intoxicated by alcohol or drugs.' },
  { code: 'AU19', label: 'Drive While Disqualified', description: 'Driving while licence is suspended, cancelled, or disqualified.' },
  { code: 'AU20', label: 'Fail to Stop for Police', description: 'Failing to stop a vehicle when directed by police.' },
  { code: 'F501', label: 'Evading Police (FiveM)', description: 'Failing to pull over and attempting to evade in a pursuit.' },
  { code: 'F502', label: 'Illegal Street Racing (FiveM)', description: 'Participating in unauthorized races on public roads.' },
  { code: 'F503', label: 'Vehicle Theft (FiveM)', description: 'Taking or using a vehicle without owner consent.' },
  { code: 'F504', label: 'Possession of Dirty Money (FiveM)', description: 'Holding proceeds reasonably believed to be from criminal activity.' },
  { code: 'F505', label: 'Gang Activity / Criminal Association (FiveM)', description: 'Participation in organized criminal group activity.' }
];

const caseState = {
  report: { criminals: [], victims: [], officers: [], charges: [] },
  incident: { criminals: [], victims: [], officers: [], charges: [] }
};

const templates = {
  reports: `<h2>Create Report</h2>
    <div class="card">
      <input id="title" placeholder="Title">
      <textarea id="body" rows="5" placeholder="Report details"></textarea>
      <div class="case-grid">
        <div class="card compact"><h3>Criminals Involved</h3><div id="report-criminals"></div></div>
        <div class="card compact"><h3>Victims Involved</h3><div id="report-victims"></div></div>
        <div class="card compact"><h3>Officers Involved</h3><div id="report-officers"></div></div>
      </div>
      <div class="card compact charge-box" id="report-charge-box">
        <button class="plus-charge" onclick="openChargePicker('report')">+</button>
        <h3>Charges</h3>
        <select id="report-charge-select">${CHARGES.map(c => `<option value="${c.code}" title="${c.description}">${c.code} - ${c.label}</option>`).join('')}</select>
        <div id="report-charges"></div>
      </div>
      <button onclick="saveSimple('report')">Save Report</button>
    </div>`,
  incidents: `<h2>Create Incident</h2>
    <div class="card">
      <input id="title" placeholder="Incident title">
      <textarea id="body" rows="5" placeholder="Narrative"></textarea>
      <div class="case-grid">
        <div class="card compact"><h3>Criminals Involved</h3><div id="incident-criminals"></div></div>
        <div class="card compact"><h3>Victims Involved</h3><div id="incident-victims"></div></div>
        <div class="card compact"><h3>Officers Involved</h3><div id="incident-officers"></div></div>
      </div>
      <div class="card compact charge-box" id="incident-charge-box">
        <button class="plus-charge" onclick="openChargePicker('incident')">+</button>
        <h3>Charges</h3>
        <select id="incident-charge-select">${CHARGES.map(c => `<option value="${c.code}" title="${c.description}">${c.code} - ${c.label}</option>`).join('')}</select>
        <div id="incident-charges"></div>
      </div>
      <button onclick="saveSimple('incident')">Save Incident</button>
    </div>`,
  bulletins: `<h2>Bulletin</h2><div class="card"><input id="title" placeholder="Bulletin title"><select id="priority"><option>low</option><option selected>normal</option><option>high</option></select><textarea id="body" rows="6" placeholder="Message"></textarea><button onclick="saveSimple('bulletin')">Post Bulletin</button></div>`,
  workers: `<h2>Active Workers</h2><div id="workers"></div>`,
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
  return (window.__people || []).filter(p => (
    `${p.name} ${p.citizenId || ''} ${p.source || ''}`.toLowerCase().includes(q)
  )).slice(0, 8);
};

function renderPersonManager(tab, group) {
  const target = document.getElementById(`${tab}-${group}`);
  if (!target) return;
  const selected = caseState[tab][group] || [];
  target.innerHTML = `
    <input id="${tab}-${group}-query" placeholder="Search player by name / CID / source">
    <div id="${tab}-${group}-results" class="search-results"></div>
    <div id="${tab}-${group}-selected" class="chip-row"></div>
  `;

  const queryInput = document.getElementById(`${tab}-${group}-query`);
  const resultsEl = document.getElementById(`${tab}-${group}-results`);
  const selectedEl = document.getElementById(`${tab}-${group}-selected`);

  const renderSelected = () => {
    selectedEl.innerHTML = selected.map((p, idx) => `<span class="chip">${p.name} <button onclick="removePerson('${tab}','${group}',${idx})">×</button></span>`).join('') || '<small class="muted">No players added.</small>';
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
  wrap.innerHTML = charges.map((c, idx) => `<span class="chip charge-chip" title="${c.description}">${c.code} - ${c.label}<button onclick="removeCharge('${tab}',${idx})">×</button></span>`).join('') || '<small class="muted">No charges added yet.</small>';
}

window.addPerson = (tab, group, source, name, citizenId) => {
  const list = caseState[tab][group];
  if (list.some(x => x.source === Number(source))) return;
  list.push({ source: Number(source), name, citizenId });
  renderPersonManager(tab, group);
};

window.removePerson = (tab, group, idx) => {
  caseState[tab][group].splice(idx, 1);
  renderPersonManager(tab, group);
};

window.openChargePicker = (tab) => {
  const select = document.getElementById(`${tab}-charge-select`);
  const charge = CHARGES.find(c => c.code === select.value);
  if (!charge) return;
  caseState[tab].charges.push(charge);
  renderCharges(tab);
};

window.removeCharge = (tab, idx) => {
  caseState[tab].charges.splice(idx, 1);
  renderCharges(tab);
};

function initCaseBuilder(tab) {
  ['criminals', 'victims', 'officers'].forEach(group => renderPersonManager(tab, group));
  renderCharges(tab);
  const chargeBox = document.getElementById(`${tab}-charge-box`);
  if (chargeBox) {
    chargeBox.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openChargePicker(tab);
    });
  }
}

window.saveSimple = (kind) => {
  const payload = {
    title: document.getElementById('title').value,
    body: document.getElementById('body').value,
    priority: document.getElementById('priority')?.value
  };

  if (kind === 'report' || kind === 'incident') {
    const state = caseState[kind];
    payload.criminals = state.criminals;
    payload.victims = state.victims;
    payload.officers = state.officers;
    payload.charges = state.charges;
    payload.suspects = state.criminals;
  }

  return post('createEntry', { kind, payload });
};

window.createDov = () => post('createEntry', { kind: 'dov', payload: { plate: document.getElementById('plate').value, note: document.getElementById('note').value } });
window.createRegistration = () => post('createRegistration', {
  ownerSource: document.getElementById('ownerSource').value,
  ownerCid: document.getElementById('ownerCid').value,
  plate: document.getElementById('plate').value,
  category: document.getElementById('category').value,
  fee: document.getElementById('fee').value,
  duration: document.getElementById('duration').value
});
window.createLicenseAction = () => post('createLicenseAction', {
  licenseType: document.getElementById('licenseType').value,
  actionType: document.getElementById('actionType').value,
  subjectName: document.getElementById('subjectName').value,
  subjectCid: document.getElementById('subjectCid').value,
  reason: document.getElementById('reason').value,
  notes: document.getElementById('notes').value,
  expiresAt: document.getElementById('expiresAt').value
}).then(() => refreshBootstrap());
window.refreshBootstrap = () => post('refreshBootstrap');
window.issueFine = () => post('issueFine', {
  target: document.getElementById('fineTarget').value,
  amount: document.getElementById('fineAmount').value,
  reason: document.getElementById('fineReason').value
});
window.jailPlayer = () => post('jailPlayer', {
  target: document.getElementById('jailTarget').value,
  time: document.getElementById('jailTime').value,
  reason: document.getElementById('jailReason').value
});
window.employmentAction = () => post('employmentAction', {
  action: document.getElementById('action').value,
  target: document.getElementById('target').value,
  job: document.getElementById('job').value,
  grade: document.getElementById('grade').value
});
window.sendDispatch = () => post('sendDispatch', {
  title: document.getElementById('dispatchTitle').value,
  code: document.getElementById('dispatchCode').value,
  message: document.getElementById('dispatchMessage').value,
  priority: document.getElementById('dispatchPriority').value,
  jobs: (document.getElementById('dispatchJobs').value || 'police').split(',').map(v => v.trim()).filter(Boolean)
});
window.loadCorrections = () => post('getCorrectionsStatus');
window.assignCommunityService = () => post('assignCommunityService', {
  target: document.getElementById('serviceTarget').value,
  actions: document.getElementById('serviceActions').value,
  reason: document.getElementById('serviceReason').value
});
window.loadImpounds = () => post('getImpounds', {
  plate: document.getElementById('impoundPlate')?.value || '',
  owner: document.getElementById('impoundOwner')?.value || ''
});

function renderTraining() {
  const modules = window.__training?.modules || [];
  const out = modules.map(m => `<div class="card"><h3>${m.title}</h3><ul>${(m.tips || []).map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('');
  document.getElementById('training').innerHTML = out || '<div class="card">No training modules configured.</div>';
}

function renderLicenseActions() {
  const actions = window.__licenseActions || [];
  const out = actions.map((x) => `<div class="card action-card"><span class="badge ${x.license_type}">${x.license_type}</span><span class="badge ${x.action}">${x.action}</span><h4>${x.subject_name}</h4><p>${x.reason || ''}</p><small>CID: ${x.subject_cid || 'n/a'} | Exp: ${x.expires_at || 'none'} | By: ${x.author}</small></div>`).join('');
  document.getElementById('licenseActions').innerHTML = out || '<div class="card">No gun or vehicle disqualifications/revocations logged yet.</div>';
}

function renderImpounds() {
  const impounds = window.__impounds || [];
  const out = impounds.map((x) => `<div class="card impound-card"><h4>${x.plate} | ${x.model}</h4><p>Owner: ${x.owner}</p><p>Impounded: ${x.impoundedAt} by ${x.impoundedBy}</p><p>Reason: ${x.reason}</p><p>Lot: ${x.lot} | Fee: $${x.releaseFee}</p><p>Time Left: ${x.remainingMinutes == null ? 'Unknown' : `${x.remainingMinutes} min`}</p></div>`).join('');
  document.getElementById('impounds').innerHTML = out || '<div class="card">No impounded vehicles found for this search.</div>';
}

function renderCustody() {
  const custody = window.__custody || { jail: [], service: [] };
  const jail = (custody.jail || []).map(x => `<div class="card">JAIL | ${x.identifier || x.citizenid || 'Unknown'} | remaining: ${x.remaining || x.time || 'n/a'} | ${x.reason || ''}</div>`).join('');
  const service = (custody.service || []).map(x => `<div class="card">SERVICE | ${x.identifier || x.citizenid || 'Unknown'} | remaining: ${x.remaining || x.actions || 'n/a'} | ${x.reason || ''}</div>`).join('');
  document.getElementById('custody').innerHTML = `${jail || '<div class="card">No inmates currently in jail feed.</div>'}${service || '<div class="card">No community service entries currently in feed.</div>'}`;
}

function openTab(tab) {
  content.innerHTML = templates[tab] || '<p>Unavailable tab</p>';
  if (tab === 'workers' && window.__workers) {
    document.getElementById('workers').innerHTML = window.__workers.map(w => `<div class="card">${w.name} | ${w.job} (${w.grade})</div>`).join('');
  }
  if (tab === 'reports') initCaseBuilder('report');
  if (tab === 'incidents') initCaseBuilder('incident');
  if (tab === 'training') renderTraining();
  if (tab === 'licensing') renderLicenseActions();
  if (tab === 'impound') {
    renderImpounds();
    loadImpounds();
  }
  if (tab === 'corrections') {
    renderCustody();
    loadCorrections();
  }
}

document.querySelectorAll('aside button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => openTab(btn.dataset.tab));
});
document.getElementById('close').addEventListener('click', () => { app.classList.add('hidden'); post('close'); });


document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !app.classList.contains('hidden')) {
    app.classList.add('hidden');
    post('close');
  }
});

window.addEventListener('message', (event) => {
  const { action, state, payload } = event.data;
  if (action === 'toggle') {
    app.classList.toggle('hidden', !state);
    if (state) openTab('reports');
  }

  if (action === 'bootstrap') {
    me.textContent = `${payload.user} | ${payload.framework.toUpperCase()}`;
    window.__workers = payload.workers;
    window.__training = payload.training;
    window.__licenseActions = payload.licenseActions || [];
    window.__people = payload.people || [];
    document.documentElement.style.setProperty('--primary', payload.theme.primary);
    document.documentElement.style.setProperty('--accent', payload.theme.accent);
    if (payload.logo) {
      app.style.backgroundImage = `linear-gradient(rgba(5, 18, 35, 0.92), rgba(5, 18, 35, 0.92)), url('${payload.logo}')`;
      app.style.backgroundSize = 'contain';
      app.style.backgroundRepeat = 'no-repeat';
      app.style.backgroundPosition = 'center';
    }

    if (document.getElementById('licenseActions')) {
      renderLicenseActions();
    }
  }

  if (action === 'impoundStatus') {
    window.__impounds = payload || [];
    if (document.getElementById('impounds')) renderImpounds();
  }

  if (action === 'correctionsStatus') {
    window.__custody = payload || { jail: [], service: [] };
    if (document.getElementById('custody')) renderCustody();
  }
});
