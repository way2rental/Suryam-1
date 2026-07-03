import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { store } from './store.js';

/* ============================================================
   SUPABASE INIT
   ============================================================ */
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   UTILITIES
   ============================================================ */
function esc(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtCurrency(n) {
  if (n == null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* Toast */
function toast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${esc(msg)}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

/* Modal */
function showModal(title, bodyHtml, size = '') {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'dynamic-modal';
  overlay.innerHTML = `
    <div class="modal ${size}">
      <button class="modal-close" data-action="close-modal">&times;</button>
      <div class="modal-title">${esc(title)}</div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('[data-action="close-modal"]')) closeModal();
  });
}
function closeModal() {
  const m = document.getElementById('dynamic-modal');
  if (m) m.remove();
}

/* ============================================================
   CONSTANTS
   ============================================================ */
const ENQ_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const JOB_STATUSES = ['new', 'assigned', 'in_progress', 'collecting', 'verifying', 'approved', 'closed'];
const CASH_STATUSES = ['pending', 'verified', 'approved', 'rejected'];
const SR_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
const INV_TYPES = ['used', 'replaced', 'damaged'];
const CASH_CATEGORIES = ['installation', 'maintenance', 'equipment', 'salary', 'rental', 'transport', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const ROLES = ['admin', 'manager', 'employee', 'customer'];
const SOURCES = ['website', 'referral', 'walkin', 'phone', 'social'];

const MODULE_MAP = {
  admin: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
    { id: 'cashflow', icon: 'fa-money-bill-wave', label: 'Cash Flow' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory' },
    { id: 'users', icon: 'fa-users-gear', label: 'User Management' }
  ],
  manager: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
    { id: 'cashflow', icon: 'fa-money-bill-wave', label: 'Cash Flow' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory' }
  ],
  employee: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'My Jobs' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory Log' }
  ],
  customer: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'My Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'My Jobs' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' }
  ]
};

const JOB_STEPS = [
  { key: 'new', icon: 'fa-plus', label: 'New' },
  { key: 'assigned', icon: 'fa-user-plus', label: 'Assigned' },
  { key: 'in_progress', icon: 'fa-hammer', label: 'In Progress' },
  { key: 'collecting', icon: 'fa-money-bill', label: 'Collecting' },
  { key: 'verifying', icon: 'fa-check-double', label: 'Verifying' },
  { key: 'approved', icon: 'fa-stamp', label: 'Approved' },
  { key: 'closed', icon: 'fa-flag-checkered', label: 'Closed' }
];

/* ============================================================
   STATUS / BADGE HELPERS
   ============================================================ */
function badgeCls(status) {
  const map = {
    new: 'blue', contacted: 'blue', qualified: 'orange', converted: 'green', lost: 'gray',
    assigned: 'blue', in_progress: 'orange', collecting: 'orange', verifying: 'blue', approved: 'green', closed: 'green',
    pending: 'orange', verified: 'blue', rejected: 'red',
    open: 'blue', resolved: 'green',
    used: 'blue', replaced: 'orange', damaged: 'red',
    low: 'gray', medium: 'blue', high: 'orange', critical: 'red',
    income: 'green', expense: 'red',
    admin: 'red', manager: 'orange', employee: 'blue', customer: 'gray'
  };
  return map[status] || 'gray';
}
function badge(status) {
  return `<span class="badge badge-${badgeCls(status)}">${esc(status)}</span>`;
}
/* ============================================================
   UI COMPONENTS
   ============================================================ */
function statCard({ label, value, icon, color = 'green', sub = '' }) {
  return `<div class="stat-card">
    <div class="stat-info">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${esc(value)}</div>
      ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}
    </div>
    <div class="stat-icon ${color}"><i class="fa-solid ${icon}"></i></div>
  </div>`;
}

function field({ name, label, type = 'text', value = '', options = [], required = false, placeholder = '' }) {
  const req = required ? 'required' : '';
  const val = value != null ? `value="${esc(String(value))}"` : '';
  if (type === 'select') {
    const opts = options.map(o => {
      const v = typeof o === 'object' ? o.value : o;
      const l = typeof o === 'object' ? o.label : o;
      const sel = String(v) === String(value) ? 'selected' : '';
      return `<option value="${esc(v)}" ${sel}>${esc(l)}</option>`;
    }).join('');
    return `<div class="form-group"><label>${esc(label)}</label><select name="${esc(name)}" ${req}><option value="">Select...</option>${opts}</select></div>`;
  }
  if (type === 'textarea') {
    return `<div class="form-group"><label>${esc(label)}</label><textarea name="${esc(name)}" rows="3" ${req} placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`;
  }
  return `<div class="form-group"><label>${esc(label)}</label><input type="${type}" name="${esc(name)}" ${val} ${req} placeholder="${esc(placeholder)}"></div>`;
}

function dataTable({ cols, rows, actions, empty = 'No records found' }) {
  if (!rows || !rows.length) {
    return `<div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>Nothing here</h3><p>${esc(empty)}</p></div>`;
  }
  let h = '<div class="table-wrap"><table><thead><tr>';
  cols.forEach(c => { h += `<th>${esc(c.label)}</th>`; });
  if (actions) h += '<th>Actions</th>';
  h += '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>';
    cols.forEach(c => { h += `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`; });
    if (actions) h += `<td><div class="table-actions">${actions(r)}</div></td>`;
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

function jobStepper(status) {
  const idx = JOB_STATUSES.indexOf(status);
  return `<div class="stepper">${JOB_STEPS.map((s, i) => {
    let cls = 'step';
    if (i < idx) cls += ' completed';
    else if (i === idx) cls += ' active';
    const line = i < JOB_STEPS.length - 1 ? `<div class="step-line${i < idx ? ' done' : ''}"></div>` : '';
    return `<div class="${cls}"><div class="step-icon"><i class="fa-solid ${s.icon}"></i></div><div class="step-label">${s.label}</div></div>${line}`;
  }).join('')}</div>`;
}

/* ============================================================
   AUTH
   ============================================================ */
async function handleLogin(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { toast(error.message, 'error'); return; }
  toast('Logged in successfully');
}

async function handleRegister(data) {
  const { data: authData, error } = await sb.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.full_name, phone: data.phone || '', role: 'customer' } }
  });
  if (error) { toast(error.message, 'error'); return; }
  toast('Account created. Please check your email to verify.', 'info');
  document.getElementById('login-form').reset();
  document.getElementById('register-form').reset();
  switchTab('login');
}

async function handleLogout() {
  await sb.auth.signOut();
  store.setState({ user: null, profile: null, module: 'dashboard', itemId: null, enquiries: [], jobs: [], cashEntries: [], serviceRequests: [], inventoryLogs: [], profiles: [] });
  toast('Logged out', 'info');
}
/* ============================================================
   DATA LAYER
   ============================================================ */
async function fetchProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) { console.error('Profile fetch error', error); return null; }
  return data;
}

async function fetchAllData() {
  store.setState({ loading: true });
  const { profile } = store.getState();
  const role = profile?.role;
  try {
    const [eqRes, jobRes, cashRes, srRes, invRes, profRes] = await Promise.all([
      sb.from('enquiries').select('*').order('created_at', { ascending: false }),
      sb.from('jobs').select('*').order('created_at', { ascending: false }),
      sb.from('cash_entries').select('*').order('created_at', { ascending: false }),
      sb.from('service_requests').select('*').order('created_at', { ascending: false }),
      sb.from('inventory_logs').select('*').order('created_at', { ascending: false }),
      role === 'admin' || role === 'manager' ? sb.from('profiles').select('*').order('created_at', { ascending: false }) : Promise.resolve([])
    ]);
    store.setState({
      enquiries: eqRes.data || [],
      jobs: jobRes.data || [],
      cashEntries: cashRes.data || [],
      serviceRequests: srRes.data || [],
      inventoryLogs: invRes.data || [],
      profiles: profRes.data || [],
      loading: false
    });
  } catch (err) {
    console.error(err);
    store.setState({ loading: false });
    toast('Failed to load data', 'error');
  }
}

/* ============================================================
   CRUD OPERATIONS
   ============================================================ */
async function createEnquiry(data) {
  const { error } = await sb.from('enquiries').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry created'); return true;
}
async function updateEnquiry(id, data) {
  const { error } = await sb.from('enquiries').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry updated'); return true;
}
async function deleteEnquiry(id) {
  const { error } = await sb.from('enquiries').delete().eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry deleted'); return true;
}

async function createJob(data) {
  const { error } = await sb.from('jobs').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Job created'); return true;
}
async function updateJob(id, data) {
  const { error } = await sb.from('jobs').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Job updated'); return true;
}

async function createCashEntry(data) {
  const { error } = await sb.from('cash_entries').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Cash entry created'); return true;
}
async function updateCashEntry(id, data) {
  const { error } = await sb.from('cash_entries').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Cash entry updated'); return true;
}

async function createServiceRequest(data) {
  const { error } = await sb.from('service_requests').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Service request created'); return true;
}
async function updateServiceRequest(id, data) {
  const { error } = await sb.from('service_requests').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Service request updated'); return true;
}

async function createInventoryLog(data) {
  const { error } = await sb.from('inventory_logs').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Inventory logged'); return true;
}
async function updateProfile(id, data) {
  const { error } = await sb.from('profiles').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Profile updated'); return true;
}

/* ============================================================
   WORKFLOW
   ============================================================ */
async function convertToJob(enqId) {
  const { enquiries, profile } = store.getState();
  const enq = enquiries.find(e => e.id === enqId);
  if (!enq) return;
  const jobData = {
    enquiry_id: enqId,
    customer_name: enq.customer_name,
    customer_phone: enq.customer_phone,
    customer_email: enq.customer_email,
    address: enq.address,
    description: enq.requirements,
    status: 'new',
    created_by: profile.id
  };
  const ok = await createJob(jobData);
  if (ok) {
    await updateEnquiry(enqId, { status: 'converted' });
    await fetchAllData();
    closeModal();
  }
}

async function advanceJob(jobId, newStatus, extra = {}) {
  const ok = await updateJob(jobId, { status: newStatus, ...extra });
  if (ok) { await fetchAllData(); closeModal(); }
}

async function collectPayment(jobId) {
  const form = document.querySelector('[data-form="collect-payment"]');
  if (!form) return;
  const fd = new FormData(form);
  const amount = parseFloat(fd.get('amount'));
  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  const { profile } = store.getState();
  const ok = await createCashEntry({
    job_id: jobId,
    amount,
    type: 'income',
    category: 'installation',
    description: fd.get('description') || 'Payment collected',
    collected_by: profile.id,
    status: 'pending'
  });
  if (ok) {
    await advanceJob(jobId, 'verifying');
  }
}

async function verifyJob(jobId) {
  const { profile, jobs } = store.getState();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  /* Verify associated cash entries */
  const { cashEntries } = store.getState();
  const related = cashEntries.filter(c => c.job_id === jobId && c.status === 'pending');
  for (const ce of related) {
    await updateCashEntry(ce.id, { verified_by: profile.id, status: 'verified' });
  }
  await advanceJob(jobId, 'approved');
}

async function approveJob(jobId) {
  const { profile, jobs, cashEntries } = store.getState();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  const related = cashEntries.filter(c => c.job_id === jobId && c.status === 'verified');
  for (const ce of related) {
    await updateCashEntry(ce.id, { approved_by: profile.id, status: 'approved' });
  }
  await advanceJob(jobId, 'closed', { completed_date: new Date().toISOString() });
}
/* ============================================================
   MODULE: DASHBOARD
   ============================================================ */
function renderDashboard() {
  const { profile, enquiries, jobs, cashEntries, serviceRequests, inventoryLogs } = store.getState();
  const role = profile.role;
  const myJobs = role === 'employee' ? jobs.filter(j => j.assigned_to === profile.id) : jobs;
  const myEnq = role === 'customer' ? enquiries.filter(e => e.customer_email === profile.email) : enquiries;
  const mySr = role === 'customer' ? serviceRequests.filter(s => s.customer_email === profile.email) :
               role === 'employee' ? serviceRequests.filter(s => s.assigned_to === profile.id) : serviceRequests;

  let html = '';
  if (role === 'admin') {
    const revenue = cashEntries.filter(c => c.type === 'income' && c.status === 'approved').reduce((s, c) => s + Number(c.amount), 0);
    const expenses = cashEntries.filter(c => c.type === 'expense').reduce((s, c) => s + Number(c.amount), 0);
    const activeJobs = jobs.filter(j => !['closed', 'approved'].includes(j.status)).length;
    const pendingApproval = jobs.filter(j => j.status === 'approved').length + cashEntries.filter(c => c.status === 'verified').length;
    const openEnq = enquiries.filter(e => ['new', 'contacted', 'qualified'].includes(e.status)).length;
    const openSr = serviceRequests.filter(s => !['closed', 'resolved'].includes(s.status)).length;
    html += `<div class="stats-grid">
      ${statCard({ label: 'Total Revenue', value: fmtCurrency(revenue), icon: 'fa-arrow-trend-up', color: 'green', sub: `Expenses: ${fmtCurrency(expenses)}` })}
      ${statCard({ label: 'Active Jobs', value: activeJobs, icon: 'fa-briefcase', color: 'blue' })}
      ${statCard({ label: 'Pending Approval', value: pendingApproval, icon: 'fa-clock', color: 'orange' })}
      ${statCard({ label: 'Open Enquiries', value: openEnq, icon: 'fa-magnifying-glass', color: 'blue' })}
      ${statCard({ label: 'Service Requests', value: openSr, icon: 'fa-wrench', color: 'orange' })}
    </div>`;
    html += `<div class="section-header"><h2>Recent Jobs</h2></div>`;
    html += dataTable({
      cols: [
        { key: 'customer_name', label: 'Customer' },
        { key: 'address', label: 'Address' },
        { key: 'status', label: 'Status', render: r => badge(r.status) },
        { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
      ],
      rows: jobs.slice(0, 8),
      actions: r => `<button class="btn btn-xs btn-ghost" data-action="view-job" data-id="${r.id}">View</button>`
    });
  } else if (role === 'manager') {
    const toVerify = jobs.filter(j => j.status === 'verifying').length;
    const revenue = cashEntries.filter(c => c.type === 'income' && c.status === 'approved').reduce((s, c) => s + Number(c.amount), 0);
    const teamJobs = jobs.filter(j => !['closed', 'new'].includes(j.status)).length;
    const openSr = serviceRequests.filter(s => !['closed', 'resolved'].includes(s.status)).length;
    html += `<div class="stats-grid">
      ${statCard({ label: 'Jobs to Verify', value: toVerify, icon: 'fa-check-double', color: 'orange' })}
      ${statCard({ label: 'Team Jobs Active', value: teamJobs, icon: 'fa-briefcase', color: 'blue' })}
      ${statCard({ label: 'Revenue (Approved)', value: fmtCurrency(revenue), icon: 'fa-arrow-trend-up', color: 'green' })}
      ${statCard({ label: 'Open Service Requests', value: openSr, icon: 'fa-wrench', color: 'blue' })}
    </div>`;
    html += `<div class="section-header"><h2>Jobs Requiring Verification</h2></div>`;
    html += dataTable({
      cols: [
        { key: 'customer_name', label: 'Customer' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status', render: r => badge(r.status) },
        { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
      ],
      rows: jobs.filter(j => ['verifying', 'collecting', 'in_progress'].includes(j.status)),
      actions: r => `<button class="btn btn-xs btn-ghost" data-action="view-job" data-id="${r.id}">View</button>`
    });
  } else if (role === 'employee') {
    const active = myJobs.filter(j => !['closed', 'approved'].includes(j.status));
    const today = myJobs.filter(j => j.scheduled_date === new Date().toISOString().split('T')[0]);
    const usedItems = inventoryLogs.filter(i => i.logged_by === profile.id).length;
    const mySrOpen = mySr.filter(s => !['closed', 'resolved'].includes(s.status)).length;
    html += `<div class="stats-grid">
      ${statCard({ label: 'Active Jobs', value: active.length, icon: 'fa-briefcase', color: 'blue' })}
      ${statCard({ label: "Today's Jobs", value: today.length, icon: 'fa-calendar-day', color: 'green' })}
      ${statCard({ label: 'Items Logged', value: usedItems, icon: 'fa-boxes-stacked', color: 'orange' })}
      ${statCard({ label: 'Service Requests', value: mySrOpen, icon: 'fa-wrench', color: 'blue' })}
    </div>`;
    html += `<div class="section-header"><h2>My Active Jobs</h2></div>`;
    html += dataTable({
      cols: [
        { key: 'customer_name', label: 'Customer' },
        { key: 'address', label: 'Address' },
        { key: 'status', label: 'Status', render: r => badge(r.status) },
        { key: 'scheduled_date', label: 'Scheduled', render: r => fmtDate(r.scheduled_date) }
      ],
      rows: active,
      actions: r => `<button class="btn btn-xs btn-ghost" data-action="view-job" data-id="${r.id}">View</button>`
    });
  } else {
    const activeJobs = myJobs.filter(j => !['closed', 'approved'].includes(j.status)).length;
    const openSr = mySr.filter(s => !['closed', 'resolved'].includes(s.status)).length;
    html += `<div class="stats-grid">
      ${statCard({ label: 'My Enquiries', value: myEnq.length, icon: 'fa-magnifying-glass', color: 'blue' })}
      ${statCard({ label: 'Active Jobs', value: activeJobs, icon: 'fa-briefcase', color: 'green' })}
      ${statCard({ label: 'Service Requests', value: openSr, icon: 'fa-wrench', color: 'orange' })}
    </div>`;
    html += `<div class="section-header"><h2>My Jobs</h2></div>`;
    html += dataTable({
      cols: [
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status', render: r => badge(r.status) },
        { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
      ],
      rows: myJobs.slice(0, 8),
      actions: r => `<button class="btn btn-xs btn-ghost" data-action="view-job" data-id="${r.id}">View</button>`
    });
  }
  return html;
}

/* ============================================================
   MODULE: ENQUIRIES
   ============================================================ */
function renderEnquiries() {
  const { profile, enquiries } = store.getState();
  const role = profile.role;
  const list = role === 'customer' ? enquiries.filter(e => e.customer_email === profile.email) : enquiries;
  const canCreate = ['admin', 'manager'].includes(role);
  const canEdit = ['admin', 'manager'].includes(role);

  let html = `<div class="toolbar">
    <div class="search-box"><i class="fa-solid fa-search"></i><input type="text" placeholder="Search enquiries..." data-filter="enq-search"></div>
    <select class="filter-select" data-filter="enq-status"><option value="">All Statuses</option>${ENQ_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
    <div class="toolbar-spacer"></div>
    ${canCreate ? '<button class="btn btn-accent btn-sm" data-action="create-enquiry"><i class="fa-solid fa-plus"></i> New Enquiry</button>' : ''}
  </div>`;

  const filtered = list.filter(e => {
    const search = document.querySelector('[data-filter="enq-search"]')?.value?.toLowerCase() || '';
    const status = document.querySelector('[data-filter="enq-status"]')?.value || '';
    if (search && !`${e.customer_name} ${e.customer_email} ${e.customer_phone} ${e.address}`.toLowerCase().includes(search)) return false;
    if (status && e.status !== status) return false;
    return true;
  });

  html += dataTable({
    cols: [
      { key: 'customer_name', label: 'Customer' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'source', label: 'Source', render: r => badge(r.source) },
      { key: 'status', label: 'Status', render: r => badge(r.status) },
      { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
    ],
    rows: filtered,
    actions: r => {
      let btns = `<button class="btn btn-xs btn-ghost" data-action="view-enquiry" data-id="${r.id}">View</button>`;
      if (canEdit && r.status !== 'converted') btns += `<button class="btn btn-xs btn-ghost" data-action="edit-enquiry" data-id="${r.id}">Edit</button>`;
      if (canEdit && ['new', 'contacted', 'qualified'].includes(r.status)) btns += `<button class="btn btn-xs btn-success" data-action="convert-enquiry" data-id="${r.id}">Convert</button>`;
      if (canEdit && role === 'admin') btns += `<button class="btn btn-xs btn-danger" data-action="delete-enquiry" data-id="${r.id}">Del</button>`;
      return btns;
    },
    empty: 'No enquiries found'
  });
  return html;
}

function enquiryFormHtml(enq) {
  const e = enq || {};
  return `${field({ name: 'customer_name', label: 'Customer Name', value: e.customer_name, required: true })}
  ${field({ name: 'customer_email', label: 'Email', type: 'email', value: e.customer_email, required: true })}
  ${field({ name: 'customer_phone', label: 'Phone', type: 'tel', value: e.customer_phone, required: true })}
  ${field({ name: 'address', label: 'Address', value: e.address, required: true })}
  ${field({ name: 'source', label: 'Source', type: 'select', value: e.source, options: SOURCES, required: true })}
  ${field({ name: 'requirements', label: 'Requirements', type: 'textarea', value: e.requirements, placeholder: 'Describe CCTV requirements...' })}
  ${enq ? field({ name: 'status', label: 'Status', type: 'select', value: e.status, options: ENQ_STATUSES }) : ''}
  ${field({ name: 'notes', label: 'Notes', type: 'textarea', value: e.notes, placeholder: 'Internal notes...' })}
  <button type="submit" class="btn btn-accent btn-block" style="margin-top:12px">${enq ? 'Update Enquiry' : 'Create Enquiry'}</button>`;
}

function viewEnquiryHtml(id) {
  const { enquiries, jobs, profile } = store.getState();
  const e = enquiries.find(x => x.id === id);
  if (!e) return '<p>Not found.</p>';
  const relatedJob = jobs.find(j => j.enquiry_id === id);
  const canConvert = ['admin', 'manager'].includes(profile.role) && ['new', 'contacted', 'qualified'].includes(e.status);
  return `<div class="detail-grid">
    <div class="detail-item"><label>Customer</label><span>${esc(e.customer_name)}</span></div>
    <div class="detail-item"><label>Phone</label><span>${esc(e.customer_phone)}</span></div>
    <div class="detail-item"><label>Email</label><span>${esc(e.customer_email)}</span></div>
    <div class="detail-item"><label>Source</label><span>${badge(e.source)}</span></div>
    <div class="detail-item"><label>Status</label><span>${badge(e.status)}</span></div>
    <div class="detail-item"><label>Created</label><span>${fmtDate(e.created_at)}</span></div>
    <div class="detail-item detail-full"><label>Address</label><span>${esc(e.address)}</span></div>
    <div class="detail-item detail-full"><label>Requirements</label><span>${esc(e.requirements)}</span></div>
    ${e.notes ? `<div class="detail-item detail-full"><label>Notes</label><span>${esc(e.notes)}</span></div>` : ''}
  </div>
  ${relatedJob ? `<p style="margin-bottom:16px"><strong>Converted to Job:</strong> <a href="#" data-action="view-job" data-id="${relatedJob.id}">${relatedJob.id.slice(0,8)}...</a> ${badge(relatedJob.status)}</p>` : ''}
  ${canConvert ? `<button class="btn btn-success" data-action="convert-enquiry" data-id="${e.id}"><i class="fa-solid fa-arrow-right"></i> Convert to Job</button>` : ''}`;
}

/* ============================================================
   MODULE: JOBS
   ============================================================ */
function renderJobs() {
  const { profile, jobs } = store.getState();
  const role = profile.role;
  let list = jobs;
  if (role === 'employee') list = jobs.filter(j => j.assigned_to === profile.id);
  if (role === 'customer') list = jobs.filter(j => j.customer_email === profile.email);
  const canCreate = ['admin', 'manager'].includes(role);

  let html = `<div class="toolbar">
    <div class="search-box"><i class="fa-solid fa-search"></i><input type="text" placeholder="Search jobs..." data-filter="job-search"></div>
    <select class="filter-select" data-filter="job-status"><option value="">All Statuses</option>${JOB_STATUSES.map(s => `<option value="${s}">${s.replace('_', ' ')}</option>`).join('')}</select>
    <div class="toolbar-spacer"></div>
    ${canCreate ? '<button class="btn btn-accent btn-sm" data-action="create-job"><i class="fa-solid fa-plus"></i> New Job</button>' : ''}
  </div>`;

  const filtered = list.filter(j => {
    const search = document.querySelector('[data-filter="job-search"]')?.value?.toLowerCase() || '';
    const status = document.querySelector('[data-filter="job-status"]')?.value || '';
    if (search && !`${j.customer_name} ${j.address} ${j.description}`.toLowerCase().includes(search)) return false;
    if (status && j.status !== status) return false;
    return true;
  });

  const empName = (id) => {
    const p = store.getState().profiles.find(x => x.id === id);
    return p ? p.full_name : 'Unassigned';
  };

  html += dataTable({
    cols: [
      { key: 'customer_name', label: 'Customer' },
      { key: 'description', label: 'Description', render: r => esc((r.description || '').slice(0, 50)) },
      ...(role !== 'customer' ? [{ key: 'assigned_to', label: 'Assigned To', render: r => esc(empName(r.assigned_to)) }] : []),
      { key: 'status', label: 'Status', render: r => badge(r.status) },
      { key: 'scheduled_date', label: 'Scheduled', render: r => fmtDate(r.scheduled_date) }
    ],
    rows: filtered,
    actions: r => `<button class="btn btn-xs btn-ghost" data-action="view-job" data-id="${r.id}">View</button>`,
    empty: 'No jobs found'
  });
  return html;
}

function jobFormHtml(job) {
  const j = job || {};
  const { profiles, profile } = store.getState();
  const employees = profiles.filter(p => ['employee', 'manager'].includes(p.role));
  return `${field({ name: 'customer_name', label: 'Customer Name', value: j.customer_name, required: true })}
  ${field({ name: 'customer_phone', label: 'Phone', type: 'tel', value: j.customer_phone, required: true })}
  ${field({ name: 'customer_email', label: 'Email', type: 'email', value: j.customer_email })}
  ${field({ name: 'address', label: 'Address', value: j.address, required: true })}
  ${field({ name: 'description', label: 'Description', type: 'textarea', value: j.description, required: true, placeholder: 'Job scope and details...' })}
  ${field({ name: 'assigned_to', label: 'Assign To', type: 'select', value: j.assigned_to, options: employees.map(e => ({ value: e.id, label: e.full_name })) })}
  ${field({ name: 'scheduled_date', label: 'Scheduled Date', type: 'date', value: j.scheduled_date ? j.scheduled_date.split('T')[0] : '' })}
  ${job ? field({ name: 'status', label: 'Status', type: 'select', value: j.status, options: JOB_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') })) }) : ''}
  ${field({ name: 'notes', label: 'Notes', type: 'textarea', value: j.notes })}
  <input type="hidden" name="enquiry_id" value="${j.enquiry_id || ''}">
  <button type="submit" class="btn btn-accent btn-block" style="margin-top:12px">${job ? 'Update Job' : 'Create Job'}</button>`;
}

function viewJobHtml(id) {
  const { jobs, profile, profiles, cashEntries, inventoryLogs, serviceRequests } = store.getState();
  const j = jobs.find(x => x.id === id);
  if (!j) return '<p>Not found.</p>';
  const role = profile.role;
  const emp = profiles.find(p => p.id === j.assigned_to);
  const relatedCash = cashEntries.filter(c => c.job_id === id);
  const relatedInv = inventoryLogs.filter(i => i.job_id === id);

  let actionBtns = '';
  if (role === 'admin') {
    if (j.status === 'new') actionBtns += `<button class="btn btn-info btn-sm" data-action="assign-job" data-id="${j.id}"><i class="fa-solid fa-user-plus"></i> Assign</button> `;
    if (j.status === 'approved') actionBtns += `<button class="btn btn-success btn-sm" data-action="approve-job" data-id="${j.id}"><i class="fa-solid fa-stamp"></i> Approve &amp; Close</button> `;
  }
  if (role === 'manager') {
    if (j.status === 'new') actionBtns += `<button class="btn btn-info btn-sm" data-action="assign-job" data-id="${j.id}"><i class="fa-solid fa-user-plus"></i> Assign</button> `;
    if (j.status === 'verifying') actionBtns += `<button class="btn btn-success btn-sm" data-action="verify-job" data-id="${j.id}"><i class="fa-solid fa-check-double"></i> Verify</button> `;
  }
  if (role === 'employee') {
    if (j.status === 'assigned') actionBtns += `<button class="btn btn-info btn-sm" data-action="start-job" data-id="${j.id}"><i class="fa-solid fa-play"></i> Start Work</button> `;
    if (j.status === 'in_progress') actionBtns += `<button class="btn btn-warning btn-sm" data-action="collect-job" data-id="${j.id}"><i class="fa-solid fa-money-bill"></i> Collect Payment</button> `;
    actionBtns += ` <button class="btn btn-ghost btn-sm" data-action="log-inventory" data-id="${j.id}"><i class="fa-solid fa-boxes-stacked"></i> Log Inventory</button>`;
  }

  return `${jobStepper(j.status)}
  <div class="detail-grid">
    <div class="detail-item"><label>Customer</label><span>${esc(j.customer_name)}</span></div>
    <div class="detail-item"><label>Phone</label><span>${esc(j.customer_phone)}</span></div>
    <div class="detail-item"><label>Email</label><span>${esc(j.customer_email || '')}</span></div>
    <div class="detail-item"><label>Assigned To</label><span>${emp ? esc(emp.full_name) : 'Unassigned'}</span></div>
    <div class="detail-item"><label>Scheduled</label><span>${fmtDate(j.scheduled_date)}</span></div>
    <div class="detail-item"><label>Completed</label><span>${fmtDate(j.completed_date)}</span></div>
    <div class="detail-item detail-full"><label>Address</label><span>${esc(j.address)}</span></div>
    <div class="detail-item detail-full"><label>Description</label><span>${esc(j.description)}</span></div>
    ${j.notes ? `<div class="detail-item detail-full"><label>Notes</label><span>${esc(j.notes)}</span></div>` : ''}
  </div>
  ${actionBtns ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">${actionBtns}</div>` : ''}
  <h3 style="font-size:15px;font-weight:600;margin-bottom:12px">Cash Entries</h3>
  ${dataTable({
    cols: [
      { key: 'amount', label: 'Amount', render: r => `<span class="mono">${fmtCurrency(r.amount)}</span>` },
      { key: 'type', label: 'Type', render: r => badge(r.type) },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', render: r => badge(r.status) }
    ],
    rows: relatedCash,
    empty: 'No cash entries'
  })}
  <h3 style="font-size:15px;font-weight:600;margin:20px 0 12px">Inventory Used</h3>
  ${dataTable({
    cols: [
      { key: 'item_name', label: 'Item' },
      { key: 'quantity', label: 'Qty', render: r => `<span class="mono">${r.quantity}</span>` },
      { key: 'type', label: 'Type', render: r => badge(r.type) },
      { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
    ],
    rows: relatedInv,
    empty: 'No inventory logged'
  })}`;
                                                                                                                         }
/* ============================================================
   MODULE: CASH FLOW
   ============================================================ */
function renderCashFlow() {
  const { profile, cashEntries, jobs } = store.getState();
  const role = profile.role;
  const canCreate = ['admin', 'manager', 'employee'].includes(role);
  const canVerify = role === 'manager';
  const canApprove = role === 'admin';
  const totalIncome = cashEntries.filter(c => c.type === 'income' && c.status === 'approved').reduce((s, c) => s + Number(c.amount), 0);
  const totalExpense = cashEntries.filter(c => c.type === 'expense').reduce((s, c) => s + Number(c.amount), 0);
  const pendingAmount = cashEntries.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0);
  const verifiedAmount = cashEntries.filter(c => c.status === 'verified').reduce((s, c) => s + Number(c.amount), 0);

  let html = `<div class="stats-grid">
    ${statCard({ label: 'Approved Income', value: fmtCurrency(totalIncome), icon: 'fa-arrow-trend-up', color: 'green' })}
    ${statCard({ label: 'Total Expenses', value: fmtCurrency(totalExpense), icon: 'fa-arrow-trend-down', color: 'red' })}
    ${statCard({ label: 'Pending Collection', value: fmtCurrency(pendingAmount), icon: 'fa-hourglass-half', color: 'orange' })}
    ${statCard({ label: 'Awaiting Approval', value: fmtCurrency(verifiedAmount), icon: 'fa-stamp', color: 'blue' })}
  </div>`;

  html += `<div class="toolbar">
    <div class="search-box"><i class="fa-solid fa-search"></i><input type="text" placeholder="Search cash entries..." data-filter="cash-search"></div>
    <select class="filter-select" data-filter="cash-type"><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
    <select class="filter-select" data-filter="cash-status"><option value="">All Statuses</option>${CASH_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
    <div class="toolbar-spacer"></div>
    ${canCreate ? '<button class="btn btn-accent btn-sm" data-action="create-cash"><i class="fa-solid fa-plus"></i> New Entry</button>' : ''}
  </div>`;

  const filtered = cashEntries.filter(c => {
    const search = document.querySelector('[data-filter="cash-search"]')?.value?.toLowerCase() || '';
    const type = document.querySelector('[data-filter="cash-type"]')?.value || '';
    const status = document.querySelector('[data-filter="cash-status"]')?.value || '';
    if (search && !`${c.description} ${c.category}`.toLowerCase().includes(search)) return false;
    if (type && c.type !== type) return false;
    if (status && c.status !== status) return false;
    return true;
  });

  const empName = (id) => { const p = store.getState().profiles.find(x => x.id === id); return p ? p.full_name : '—'; };

  html += dataTable({
    cols: [
      { key: 'amount', label: 'Amount', render: r => `<span class="mono" style="font-weight:600">${fmtCurrency(r.amount)}</span>` },
      { key: 'type', label: 'Type', render: r => badge(r.type) },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description', render: r => esc((r.description || '').slice(0, 40)) },
      { key: 'collected_by', label: 'Collected By', render: r => esc(empName(r.collected_by)) },
      { key: 'status', label: 'Status', render: r => badge(r.status) },
      { key: 'created_at', label: 'Date', render: r => fmtDate(r.created_at) }
    ],
    rows: filtered,
    actions: r => {
      let btns = '';
      if (canVerify && r.status === 'pending') btns += `<button class="btn btn-xs btn-success" data-action="verify-cash" data-id="${r.id}">Verify</button> `;
      if (canApprove && r.status === 'verified') btns += `<button class="btn btn-xs btn-success" data-action="approve-cash" data-id="${r.id}">Approve</button> `;
      if (canApprove && r.status !== 'rejected') btns += `<button class="btn btn-xs btn-danger" data-action="reject-cash" data-id="${r.id}">Reject</button> `;
      return btns;
    },
    empty: 'No cash entries found'
  });
  return html;
}

function cashFormHtml() {
  const { jobs, profile } = store.getState();
  const jobOpts = jobs.filter(j => !['closed', 'approved'].includes(j.status)).map(j => ({ value: j.id, label: `${j.customer_name} — ${(j.description || '').slice(0, 30)}` }));
  return `${field({ name: 'job_id', label: 'Linked Job', type: 'select', options: jobOpts })}
  ${field({ name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' })}
  ${field({ name: 'type', label: 'Type', type: 'select', value: 'income', options: [{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }], required: true })}
  ${field({ name: 'category', label: 'Category', type: 'select', options: CASH_CATEGORIES, required: true })}
  ${field({ name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Payment details...' })}
  <input type="hidden" name="collected_by" value="${profile.id}">
  <button type="submit" class="btn btn-accent btn-block" style="margin-top:12px">Create Cash Entry</button>`;
}


/* Service Requests */
    if (action === 'create-sr') {
      showModal('New Service Request', `<form data-form="sr">${srFormHtml()}</form>`, 'modal-lg');
      return;
    }
    if (action === 'view-sr') {
      showModal('Service Request Details', viewSrHtml(id), 'modal-lg');
      return;
    }
    if (action === 'assign-sr') {
      const { profiles } = store.getState();
      const sr = store.getState().serviceRequests.find(s => s.id === id);
      const employees = profiles.filter(p => ['employee', 'manager'].includes(p.role));
      showModal('Assign Service Request', `<form data-form="assign-sr">
        <input type="hidden" name="id" value="${id}">
        ${field({ name: 'assigned_to', label: 'Assign To', type: 'select', value: sr?.assigned_to, options: employees.map(e => ({ value: e.id, label: e.full_name })), required: true })}
        <button type="submit" class="btn btn-accent btn-block" style="margin-top:12px">Assign</button>
      </form>`);
      return;
    }
    if (action === 'start-sr') {
      await updateServiceRequest(id, { status: 'in_progress' });
      await fetchAllData();
      closeModal();
      return;
    }
    if (action === 'resolve-sr') {
      await updateServiceRequest(id, { status: 'resolved', resolved_at: new Date().toISOString() });
      await fetchAllData();
      closeModal();
      return;
    }
    if (action === 'close-sr') {
      await updateServiceRequest(id, { status: 'closed' });
      await fetchAllData();
      closeModal();
      return;
    }

    /* Inventory */
    if (action === 'create-inventory') {
      showModal('Log Inventory', `<form data-form="inventory">${inventoryFormHtml()}</form>`, 'modal-lg');
      return;
    }
    if (action === 'log-inventory') {
      showModal('Log Inventory', `<form data-form="inventory">${inventoryFormHtml(id)}</form>`, 'modal-lg');
      return;
    }

    /* Users */
    if (action === 'edit-user') {
      const user = store.getState().profiles.find(p => p.id === id);
      if (user) showModal('Edit User', `<form data-form="user-edit"><input type="hidden" name="id" value="${user.id}">${userFormHtml(user)}</form>`);
      return;
    }
  });

  /* Form submissions inside modals */
  document.body.addEventListener('submit', async e => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const formType = form.dataset.form;
    const { profile } = store.getState();

    if (formType === 'enquiry') {
      const ok = await createEnquiry({
        customer_name: fd.get('customer_name'), customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'), address: fd.get('address'),
        requirements: fd.get('requirements'), source: fd.get('source'),
        status: 'new', notes: fd.get('notes'), created_by: profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'enquiry-edit') {
      const id = fd.get('id');
      const ok = await updateEnquiry(id, {
        customer_name: fd.get('customer_name'), customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'), address: fd.get('address'),
        requirements: fd.get('requirements'), source: fd.get('source'),
        status: fd.get('status'), notes: fd.get('notes')
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'job') {
      const ok = await createJob({
        customer_name: fd.get('customer_name'), customer_phone: fd.get('customer_phone'),
        customer_email: fd.get('customer_email'), address: fd.get('address'),
        description: fd.get('description'), assigned_to: fd.get('assigned_to') || null,
        scheduled_date: fd.get('scheduled_date') || null, status: 'new',
        notes: fd.get('notes'), enquiry_id: fd.get('enquiry_id') || null, created_by: profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'assign-job') {
      const id = fd.get('id');
      const ok = await updateJob(id, {
        assigned_to: fd.get('assigned_to') || null,
        scheduled_date: fd.get('scheduled_date') || null,
        status: 'assigned'
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'collect-payment') {
      await collectPayment(fd.get('job_id'));
    }
    else if (formType === 'cash') {
      const ok = await createCashEntry({
        job_id: fd.get('job_id') || null, amount: parseFloat(fd.get('amount')),
        type: fd.get('type'), category: fd.get('category'),
        description: fd.get('description'), collected_by: fd.get('collected_by') || profile.id,
        status: 'pending'
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'sr') {
      const ok = await createServiceRequest({
        customer_name: fd.get('customer_name'), customer_phone: fd.get('customer_phone'),
        customer_email: fd.get('customer_email'), address: fd.get('address'),
        amc_number: fd.get('amc_number') || null, priority: fd.get('priority'),
        issue_description: fd.get('issue_description'), status: 'open',
        created_by: fd.get('created_by') || profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'assign-sr') {
      const id = fd.get('id');
      await updateServiceRequest(id, { assigned_to: fd.get('assigned_to') || null, status: 'assigned' });
      await fetchAllData();
      closeModal();
    }
    else if (formType === 'inventory') {
      const ok = await createInventoryLog({
        job_id: fd.get('job_id'), item_name: fd.get('item_name'),
        quantity: parseInt(fd.get('quantity')) || 1, type: fd.get('type'),
        description: fd.get('description'), logged_by: fd.get('logged_by') || profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'user-edit') {
      const id = fd.get('id');
      await updateProfile(id, {
        full_name: fd.get('full_name'), phone: fd.get('phone'), role: fd.get('role')
      });
      await fetchAllData();
      closeModal();
    }
  });
}

function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

function closeSidebarMobile() {
  document.getElementById('sidebar')?.classList.remove('open');
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  setupEventListeners();

  /* Listen for auth state changes */
  sb.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        store.setState({ user: session.user, profile });
        await fetchAllData();
      } else {
        /* Profile might not exist yet (just registered) */
        store.setState({ user: session.user, profile: null });
      }
    } else {
      store.setState({ user: null, profile: null });
    }
  });

  /* Check existing session */
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    const profile = await fetchProfile(session.user.id);
    if (profile) {
      store.setState({ user: session.user, profile });
      await fetchAllData();
    }
  }

  /* Subscribe to store for rendering */
  store.subscribe(() => render());

  /* Initial render */
  render();
}

init();
