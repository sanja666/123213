import { idbGetAll, idbPut, idbDelete, now, generateId } from './storage.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './ui.js';

let cases = [];
let onPaymentUpdate;
let onDocument;
let onUiRestrict;
let probabilities = {
  soften: 0.2,
  harden: 0.35,
  postpone: 0.2,
  arrest: 0.1,
  refund: 0.05,
  unchanged: 0.1
};

const STATUS_FLOW = [
  'Izveidots',
  'Izskatīšanā',
  'Pārsūtīts',
  'Nosūtīts tiesai',
  'Tiesas sēde ieplānota',
  'Spriedums',
  'Izpilde',
  'Slēgts'
];

function render() {
  const container = document.getElementById('case-list');
  container.innerHTML = '';
  cases
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'case-card';
      card.innerHTML = `
        <header>
          <strong>${entry.id}</strong>
          <div class="badge">${entry.status}</div>
        </header>
        <div><strong>Pamats:</strong> ${entry.basis}</div>
        <div><strong>Summa:</strong> ${entry.amount.toFixed(2)} €</div>
        <div><strong>Izveidots:</strong> ${new Date(entry.createdAt).toLocaleString()}</div>
        ${entry.hearingAt ? `<div><strong>Tiesas sēde:</strong> ${new Date(entry.hearingAt).toLocaleDateString()}</div>` : ''}
        <div><strong>Vēsture:</strong>
          <ul>${entry.history.map((h) => `<li>${new Date(h.ts).toLocaleString()} — ${h.status}${h.note ? ' (' + h.note + ')' : ''}</li>`).join('')}</ul>
        </div>
      `;
      if (!entry.appealPending && ['Spriedums', 'Izpilde'].includes(entry.status)) {
        const appealBtn = document.createElement('button');
        appealBtn.className = 'secondary';
        appealBtn.textContent = 'Apelācija';
        appealBtn.addEventListener('click', () => registerAppeal(entry.id));
        card.appendChild(appealBtn);
      } else if (entry.appealPending) {
        const info = document.createElement('div');
        info.textContent = 'Apelācija reģistrēta';
        card.appendChild(info);
      }
      container.appendChild(card);
    });
}

async function load() {
  const user = getCurrentUser();
  if (!user) return;
  const all = await idbGetAll('cases');
  cases = all.filter((item) => item.userId === user.id);
  render();
}

function addHistory(entry, status, note) {
  entry.history.push({ ts: now(), status, note });
}

function scheduleHearing(entry) {
  const nowMs = Date.now();
  const msUntil = Math.min(30000, Math.max(5000, entry.hearingDelay || 15000));
  setTimeout(() => conductHearing(entry.id), msUntil);
}

function rollOutcome() {
  const roll = Math.random();
  let cumulative = 0;
  for (const [key, value] of Object.entries(probabilities)) {
    cumulative += value;
    if (roll <= cumulative) {
      return key;
    }
  }
  return 'unchanged';
}

async function persist(entry) {
  await idbPut('cases', entry);
  render();
}

export async function initCases({ onPaymentChange, onDocumentCreated, onUiRestriction, probabilityConfig }) {
  onPaymentUpdate = onPaymentChange;
  onDocument = onDocumentCreated;
  onUiRestrict = onUiRestriction;
  probabilities = { ...probabilities, ...probabilityConfig };
  await load();
}

export function getCases() {
  return cases;
}

export async function createCase({ basis, amount, status = 'Izveidots', relatedPaymentId, sanctions = [], note }) {
  const user = getCurrentUser();
  const entry = {
    id: generateId('L-' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 8)),
    userId: user.id,
    basis,
    amount: Number(amount.toFixed(2)),
    status,
    statusLabel: status,
    createdAt: now(),
    hearingAt: null,
    sanctions,
    documents: [],
    relatedPaymentId,
    history: []
  };
  addHistory(entry, status, note);
  cases.push(entry);
  await persist(entry);
  if (status === 'Izskatīšanā') {
    entry.hearingAt = new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString();
    entry.hearingDelay = 10000 + Math.random() * 15000;
    await persist(entry);
    scheduleHearing(entry);
  }
  return entry;
}

export async function createCaseFromPayment(payment, options = {}) {
  const entry = await createCase({
    basis: options.basis || 'Neapmaksāts pakalpojums',
    amount: payment.amount,
    status: 'Nosūtīts tiesai',
    relatedPaymentId: payment.id,
    note: 'Apmaksāt vēlāk'
  });
  entry.hearingAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  entry.hearingDelay = 12000 + Math.random() * 18000;
  addHistory(entry, 'Nosūtīts tiesai', 'Sēde ieplānota pēc 30 dienām');
  await persist(entry);
  onPaymentUpdate?.(payment.id, { relatedCaseId: entry.id });
  scheduleHearing(entry);
  onDocument?.({
    id: `${entry.id}-summons`,
    title: 'Tiesas ielūgums',
    createdAt: now(),
    type: 'notice',
    url: makeDocumentBlob(`Lieta: ${entry.id}\nDatums: ${new Date().toLocaleDateString()}\nStatuss: Nosūtīts tiesai`)
  });
  return entry;
}

function makeDocumentBlob(text) {
  const blob = new Blob([text], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export async function conductHearing(caseId, modifier) {
  const entry = cases.find((c) => c.id === caseId);
  if (!entry) return;
  if (entry.status === 'Slēgts') return;
  entry.status = 'Spriedums';
  addHistory(entry, 'Tiesas sēde', 'Sēde norisinājās (simulācija)');
  const outcome = modifier || rollOutcome();
  let note = '';
  switch (outcome) {
    case 'soften':
      entry.amount = Math.max(0, entry.amount * 0.7);
      note = 'Naudas sods samazināts';
      break;
    case 'harden':
      entry.amount = Number((entry.amount * 1.4).toFixed(2));
      note = 'Naudas sods palielināts';
      break;
    case 'postpone':
      entry.hearingAt = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString();
      entry.status = 'Tiesas sēde ieplānota';
      addHistory(entry, entry.status, 'Izskatīšana atlikta');
      await persist(entry);
      scheduleHearing(entry);
      return;
    case 'arrest': {
      const until = new Date(Date.now() + 3 * 60 * 1000);
      entry.sanctions.push({ kind: 'uiArrest', until: until.toISOString() });
      onUiRestrict?.(true, `Administratīvais arests (UI) līdz: ${until.toLocaleTimeString()}`);
      note = 'Administratīvais arests (UI)';
      break;
    }
    case 'refund':
      entry.amount = Math.max(0, entry.amount - 10);
      note = 'Daļēja atmaksa';
      break;
    default:
      note = 'Bez izmaiņām';
      break;
  }
  addHistory(entry, 'Spriedums', note);
  entry.status = 'Izpilde';
  await persist(entry);
  if (entry.relatedPaymentId) {
    onPaymentUpdate?.(entry.relatedPaymentId, { statusLabel: 'Tiesas spriedums', status: 'open', amount: entry.amount });
  }
  onDocument?.({
    id: `${entry.id}-decision`,
    title: `Spriedums ${entry.id}`,
    createdAt: now(),
    type: 'decision',
    url: makeDocumentBlob(`Spriedums: ${entry.id}\nRezultāts: ${note}\nSumma: ${entry.amount.toFixed(2)}€`)
  });
}

export async function resolveCasePayment(caseId) {
  const entry = cases.find((c) => c.id === caseId);
  if (!entry) return;
  entry.status = 'Slēgts';
  addHistory(entry, 'Slēgts', 'Saistības izpildītas');
  await persist(entry);
}

export async function registerAppeal(caseId) {
  const entry = cases.find((c) => c.id === caseId);
  if (!entry) return;
  entry.appealPending = true;
  addHistory(entry, 'Apelācija', 'Apelācija reģistrēta');
  await persist(entry);
  showToast('Apelācija reģistrēta. Tiks izskatīta drīzumā.');
  const decisionTime = 10000 + Math.random() * 60000;
  setTimeout(async () => {
    const granted = Math.random() < 0.1;
    entry.appealPending = false;
    addHistory(entry, 'Apelācija', granted ? 'Daļēji apmierināta' : 'Noraidīta');
    if (granted) {
      entry.amount = Math.max(0, entry.amount * 0.8);
    }
    await persist(entry);
  }, decisionTime);
}

export function setProbabilities(newProbabilities) {
  probabilities = { ...probabilities, ...newProbabilities };
}

export async function deleteCase(caseId) {
  cases = cases.filter((entry) => entry.id !== caseId);
  await idbDelete('cases', caseId);
  render();
}

export function clearCases() {
  cases = [];
  render();
}

export function reloadCases() {
  load();
}

