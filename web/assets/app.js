const app = document.getElementById('app');
const content = document.getElementById('content');
const me = document.getElementById('me');

const post = (event, data = {}) => fetch(`https://${GetParentResourceName()}/${event}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(data)
});

const templates = {
  reports: `<h2>Create Report</h2><div class="card"><input id="title" placeholder="Title"><textarea id="body" rows="8" placeholder="Report details"></textarea><button onclick="saveSimple('report')">Save Report</button></div>`,
  incidents: `<h2>Create Incident</h2><div class="card"><input id="title" placeholder="Incident title"><textarea id="body" rows="8" placeholder="Narrative"></textarea><button onclick="saveSimple('incident')">Save Incident</button></div>`,
  bulletins: `<h2>Bulletin</h2><div class="card"><input id="title" placeholder="Bulletin title"><select id="priority"><option>low</option><option selected>normal</option><option>high</option></select><textarea id="body" rows="6" placeholder="Message"></textarea><button onclick="saveSimple('bulletin')">Post Bulletin</button></div>`,
  workers: `<h2>Active Workers</h2><div id="workers"></div>`,
  dov: `<h2>DOV / BOLO Vehicle</h2><div class="card"><input id="plate" placeholder="Plate"><textarea id="note" rows="6" placeholder="DOV details"></textarea><button onclick="createDov()">Save DOV</button></div>`,
  reg: `<h2>Create Registration</h2><div class="card"><input id="ownerSource" placeholder="Player Source (optional)"><input id="ownerCid" placeholder="Owner Citizen ID"><input id="plate" placeholder="Plate"><select id="category"><option value="car">Car</option><option value="bike">Bike</option><option value="boat">Boat</option><option value="heli">Heli</option></select><input id="fee" type="number" placeholder="Fee Override"><input id="duration" type="number" placeholder="Duration Days"><button onclick="createRegistration()">Register Vehicle</button></div>`,
  justice: `<h2>Fine + Jail</h2><div class="card"><h3>Issue Fine</h3><input id="fineTarget" placeholder="Target Source"><input id="fineAmount" type="number" placeholder="Amount"><input id="fineReason" placeholder="Reason"><button onclick="issueFine()">Issue Fine</button><h3>Jail</h3><input id="jailTarget" placeholder="Target Source"><input id="jailTime" type="number" placeholder="Minutes"><input id="jailReason" placeholder="Reason"><button onclick="jailPlayer()">Send to Prison</button></div>`,
  dispatch: `<h2>Dispatch Alert</h2><div class="card"><input id="dispatchTitle" placeholder="Call title"><input id="dispatchCode" placeholder="Code (e.g. 10-80)"><select id="dispatchPriority"><option value="low">Low</option><option value="normal" selected>Normal</option><option value="high">High</option></select><input id="dispatchJobs" placeholder="Jobs csv (police,ambulance)"><textarea id="dispatchMessage" rows="4" placeholder="Dispatch details"></textarea><button onclick="sendDispatch()">Send Dispatch</button></div>`,
  corrections: `<h2>RCORE Custody Status</h2><div class="card"><button onclick="loadCorrections()">Refresh Jail / Community Service</button></div><div id="custody"></div><div class="card"><h3>Assign Community Service</h3><input id="serviceTarget" placeholder="Target Source"><input id="serviceActions" type="number" placeholder="Actions / Tasks"><input id="serviceReason" placeholder="Reason"><button onclick="assignCommunityService()">Assign Service</button></div>`,
  training: `<h2>PD Training Guide</h2><div id="training"></div>`,
  employment: `<h2>Hire / Fire</h2><div class="card"><select id="action"><option value="hire">Hire</option><option value="fire">Fire</option><option value="promote">Promote</option><option value="demote">Demote</option></select><input id="target" placeholder="Target Source"><input id="job" placeholder="Job (police/ambulance/doj)"><input id="grade" type="number" placeholder="Grade"><button onclick="employmentAction()">Submit Action</button></div>`
};

window.saveSimple = (kind) => post('createEntry', {
  kind,
  payload: {
    title: document.getElementById('title').value,
    body: document.getElementById('body').value,
    priority: document.getElementById('priority')?.value
  }
});

window.createDov = () => post('createEntry', { kind: 'dov', payload: { plate: document.getElementById('plate').value, note: document.getElementById('note').value } });
window.createRegistration = () => post('createRegistration', {
  ownerSource: document.getElementById('ownerSource').value,
  ownerCid: document.getElementById('ownerCid').value,
  plate: document.getElementById('plate').value,
  category: document.getElementById('category').value,
  fee: document.getElementById('fee').value,
  duration: document.getElementById('duration').value
});
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

function renderTraining() {
  const modules = window.__training?.modules || [];
  const out = modules.map(m => `<div class="card"><h3>${m.title}</h3><ul>${(m.tips || []).map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('');
  document.getElementById('training').innerHTML = out || '<div class="card">No training modules configured.</div>';
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
  if (tab === 'training') renderTraining();
  if (tab === 'corrections') {
    renderCustody();
    loadCorrections();
  }
}

document.querySelectorAll('aside button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => openTab(btn.dataset.tab));
});
document.getElementById('close').addEventListener('click', () => post('close'));

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
    document.documentElement.style.setProperty('--primary', payload.theme.primary);
    document.documentElement.style.setProperty('--accent', payload.theme.accent);
    if (payload.logo) {
      app.style.backgroundImage = `linear-gradient(rgba(5, 18, 35, 0.92), rgba(5, 18, 35, 0.92)), url('${payload.logo}')`;
      app.style.backgroundSize = 'contain';
      app.style.backgroundRepeat = 'no-repeat';
      app.style.backgroundPosition = 'center';
    }
  }

  if (action === 'correctionsStatus') {
    window.__custody = payload || { jail: [], service: [] };
    if (document.getElementById('custody')) renderCustody();
  }
});
