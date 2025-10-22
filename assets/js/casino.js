import { idbGetAll, idbPut, now, generateId } from './storage.js';
import { getOpenPayments, updatePayment, createPayment } from './payments.js';
import { createCase, getCases } from './cases.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './ui.js';

let history = [];
let onUiRestrict;
let onDocument;
let negativeStreak = 0;
let arrestUntil = null;

const rouletteSegments = [
  { outcome: 'refund50', label: 'Atmaksa 50%', chance: 0.08 },
  { outcome: 'discount10', label: 'Atlaide 10%', chance: 0.12 },
  { outcome: 'extraDebt', label: 'Papildparāds', chance: 0.3 },
  { outcome: 'newCase', label: 'Tiesa (lieta)', chance: 0.1 },
  { outcome: 'delay', label: 'Aizkavēšana', chance: 0.2 },
  { outcome: 'nothing', label: 'Nekas', chance: 0.2 }
];

const lotteryOutcomes = [
  { outcome: 'winSmall', min: 10, max: 50, chance: 0.15 },
  { outcome: 'winMedium', min: 51, max: 200, chance: 0.05 },
  { outcome: 'winBig', min: 201, max: 500, chance: 0.01 },
  { outcome: 'extraDebt', chance: 0.1 },
  { outcome: 'nothing', chance: 0.69 }
];

function renderHistory() {
  const list = document.getElementById('casino-history');
  list.innerHTML = '';
  history
    .slice()
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${new Date(item.ts).toLocaleString()} — ${item.description}`;
      list.appendChild(li);
    });
}

async function loadHistory() {
  const user = getCurrentUser();
  const all = await idbGetAll('gameResults');
  history = user ? all.filter((item) => item.userId === user.id) : [];
  renderHistory();
}

function recordHistory(entry) {
  history.push(entry);
  idbPut('gameResults', entry).then(renderHistory);
}

function pickOutcome(entries) {
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.chance;
    if (roll <= cumulative) return entry;
  }
  return entries[entries.length - 1];
}

function nearestOpenPayment() {
  const payments = getOpenPayments();
  return payments[0];
}

function applyNegative() {
  negativeStreak += 1;
  if (negativeStreak >= 3) {
    negativeStreak = 0;
    arrestUntil = new Date(Date.now() + 3 * 60 * 1000);
    onUiRestrict?.(true, `Administratīvais arests (UI) līdz: ${arrestUntil.toLocaleTimeString()}`);
  }
}

function clearNegative() {
  negativeStreak = 0;
}

function logResult(description, meta = {}) {
  const user = getCurrentUser();
  if (!user) return null;
  const entry = {
    id: generateId('game'),
    ts: now(),
    userId: user.id,
    description,
    ...meta
  };
  recordHistory(entry);
  return entry;
}

function adjustPayment(payment, factor) {
  if (!payment) return;
  const newAmount = Math.max(0, Number((payment.amount * factor).toFixed(2)));
  updatePayment(payment.id, { amount: newAmount, statusLabel: `Summa mainīta (${(factor * 100).toFixed(0)}%)` });
}

function delayCase() {
  const list = getCases().filter((entry) => ['Nosūtīts tiesai', 'Tiesas sēde ieplānota', 'Izpilde'].includes(entry.status));
  if (!list.length) return;
  const target = list[0];
  const newDate = new Date((target.hearingAt ? new Date(target.hearingAt).getTime() : Date.now()) + 30 * 24 * 3600 * 1000);
  target.hearingAt = newDate.toISOString();
  target.history.push({ ts: now(), status: 'Aizkavēšana', note: 'Kazino ietekme: +30 dienas' });
  idbPut('cases', target);
  logResult(`Aizkavēta lieta ${target.id} par 30 dienām`);
}

async function handleRoulette() {
  const outcomeEntry = pickOutcome(rouletteSegments);
  const payment = nearestOpenPayment();
  switch (outcomeEntry.outcome) {
    case 'refund50':
      adjustPayment(payment, 0.5);
      clearNegative();
      logResult('Rulete: atmaksa 50%');
      showToast('Atmaksa 50% piemērota tuvākajam maksājumam.');
      break;
    case 'discount10':
      adjustPayment(payment, 0.9);
      clearNegative();
      logResult('Rulete: atlaide 10%');
      showToast('Atlaide 10% piemērota.');
      break;
    case 'extraDebt':
      await createPayment({
        type: 'Papildparāds',
        description: 'Kazino sekas',
        amount: 10 + Math.random() * 40,
        status: 'open',
        statusLabel: 'Izveidots'
      });
      applyNegative();
      logResult('Rulete: papildparāds izveidots');
      showToast('Papildparāds pievienots.');
      break;
    case 'newCase':
      await createCase({ basis: 'Kazino riski', amount: 20 + Math.random() * 50, status: 'Izskatīšanā' });
      applyNegative();
      logResult('Rulete: izveidota jauna lieta');
      showToast('Izveidota jauna lieta par kazino riskiem.');
      break;
    case 'delay':
      delayCase();
      clearNegative();
      showToast('Lietas termiņš pagarināts par 30 dienām.');
      break;
    default:
      clearNegative();
      logResult('Rulete: bez izmaiņām');
      showToast('Šoreiz bez izmaiņām.');
  }
}

async function handleLottery() {
  const outcome = pickOutcome(lotteryOutcomes);
  switch (outcome.outcome) {
    case 'winSmall':
    case 'winMedium':
    case 'winBig': {
      const amount = outcome.min + Math.random() * (outcome.max - outcome.min || 0);
      logResult(`Loterija: laimēti ${amount.toFixed(2)} €`);
      await createPayment({
        type: 'Atmaksa',
        description: 'Kazino laimests',
        amount,
        status: 'paid',
        statusLabel: 'Izmaksāts'
      });
      clearNegative();
      showToast('Laimests ieskaitīts bilancē.');
      break;
    }
    case 'extraDebt':
      await createPayment({
        type: 'Papildparāds',
        description: 'Loterijas neizdošanās',
        amount: 5 + Math.random() * 20,
        status: 'open',
        statusLabel: 'Izveidots'
      });
      applyNegative();
      logResult('Loterija: papildparāds');
      showToast('Loterija pievienoja papildparādu.');
      break;
    default:
      clearNegative();
      logResult('Loterija: bez rezultāta');
      showToast('Šoreiz laimests netika reģistrēts.');
  }
}

async function handleDouble() {
  const payment = nearestOpenPayment();
  if (!payment) {
    showToast('Nav aktīvu maksājumu, ko dubultot.');
    return;
  }
  const win = Math.random() < 0.45;
  if (win) {
    adjustPayment(payment, 0.5);
    clearNegative();
    logResult(`Double: summa samazināta maksājumam ${payment.id}`);
    showToast('Veiksme! Maksājums samazināts.');
  } else {
    await createPayment({
      type: 'Dubultparāds',
      description: `Dubultošana attiecināta uz ${payment.id}`,
      amount: payment.amount,
      status: 'open',
      statusLabel: 'Izveidots'
    });
    applyNegative();
    logResult('Double: dubultparāds');
    showToast('Neveiksme. Dubultparāds pievienots.');
  }
}

export function initCasino({ onUiArrest, onDocumentCreated }) {
  onUiRestrict = onUiArrest;
  onDocument = onDocumentCreated;
  document.getElementById('spin-roulette').addEventListener('click', handleRoulette);
  document.getElementById('play-lottery').addEventListener('click', handleLottery);
  document.getElementById('play-double').addEventListener('click', handleDouble);
  loadHistory();
}

export function releaseArrest() {
  arrestUntil = null;
  onUiRestrict?.(false);
}

export function isUnderArrest() {
  if (!arrestUntil) return false;
  if (new Date() > arrestUntil) {
    releaseArrest();
    return false;
  }
  return true;
}

export function clearCasino() {
  history = [];
  renderHistory();
}

