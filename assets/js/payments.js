import { idbGetAll, idbPut, now, generateId } from './storage.js';
import { updateUserRecord, getCurrentUser } from './auth.js';
import { showToast, openModal } from './ui.js';

let payments = [];
let onPayLater;
let onDocument;
let onCasePaid;
let onNewPayment;

function formatAmount(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${amount.toFixed(2)} €`;
}

function splitPayments() {
  const open = payments.filter((payment) => payment.status === 'open' || payment.status === 'deferred');
  const history = payments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { open, history };
}

async function loadPayments() {
  const user = getCurrentUser();
  if (!user) return;
  const all = await idbGetAll('payments');
  payments = all.filter((item) => item.userId === user.id);
  render();
}

function render() {
  const { open, history } = splitPayments();
  const openBody = document.getElementById('open-payments');
  openBody.innerHTML = '';
  open.forEach((payment) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(payment.createdAt).toLocaleString()}</td>
      <td>${payment.description}</td>
      <td>${formatAmount(payment.amount)}</td>
      <td>${payment.statusLabel || payment.status}</td>
      <td></td>
    `;
    const actionsCell = row.lastElementChild;
    if (payment.status === 'open') {
      const payBtn = document.createElement('button');
      payBtn.className = 'primary';
      payBtn.textContent = 'Apmaksāt';
      payBtn.disabled = getCurrentUser().balance < payment.amount;
      payBtn.addEventListener('click', () => handlePayNow(payment));
      const deferBtn = document.createElement('button');
      deferBtn.className = 'secondary';
      deferBtn.textContent = 'Apmaksāt vēlāk';
      deferBtn.addEventListener('click', () => handlePayLater(payment));
      actionsCell.append(payBtn, deferBtn);
    } else {
      actionsCell.textContent = '—';
    }
    openBody.appendChild(row);
  });

  const historyBody = document.getElementById('payment-history');
  historyBody.innerHTML = '';
  history.forEach((payment) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(payment.createdAt).toLocaleString()}</td>
      <td>${payment.type}</td>
      <td>${formatAmount(payment.amount)}</td>
      <td>${payment.statusLabel || payment.status}</td>
    `;
    historyBody.appendChild(row);
  });

  const balanceEl = document.getElementById('wallet-balance');
  const user = getCurrentUser();
  balanceEl.textContent = formatAmount(user?.balance || 0);
}

async function persist(payment) {
  await idbPut('payments', payment);
  await loadPayments();
}

export function initPayments({ onCreateCase, onGenerateDocument, onPaymentUpdate }) {
  onPayLater = onCreateCase;
  onDocument = onGenerateDocument;
  onCasePaid = onPaymentUpdate;
  document.getElementById('wallet-topup').addEventListener('click', showTopupModal);
  document.getElementById('wallet-withdraw').addEventListener('click', handleWithdraw);
  loadPayments();
}

export function setNewPaymentListener(handler) {
  onNewPayment = handler;
}

function updateBalance(delta) {
  const user = getCurrentUser();
  const newBalance = Math.max(0, (user.balance || 0) + delta);
  updateUserRecord(user.id, { balance: newBalance });
  render();
}

function createReceipt(payment) {
  const content = `Kvitanses Nr.: ${payment.id}\nDatums: ${new Date(payment.updatedAt || payment.createdAt).toLocaleString()}\nSumma: ${formatAmount(payment.amount)}\nStatuss: ${payment.statusLabel}`;
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  onDocument?.({
    id: `${payment.id}-pdf`,
    title: `Maksājuma kvīts ${payment.id}`,
    createdAt: payment.updatedAt || payment.createdAt,
    url,
    type: 'receipt'
  });
}

async function handlePayNow(payment) {
  const user = getCurrentUser();
  if (user.balance < payment.amount) {
    showToast('Nepietiek līdzekļu.');
    return;
  }
  updateBalance(-payment.amount);
  payment.status = 'paid';
  payment.statusLabel = 'Samaksāts';
  payment.updatedAt = now();
  await persist(payment);
  createReceipt(payment);
  onCasePaid?.(payment);
  showToast('Maksājums reģistrēts. Tiek gaidīta apstrāde.');
}

async function handlePayLater(payment) {
  payment.status = 'deferred';
  payment.statusLabel = 'Nosūtīts tiesai';
  payment.updatedAt = now();
  await persist(payment);
  onPayLater?.(payment);
  showToast('Lieta nosūtīta tiesai. Sēde ieplānota pēc 30 dienām.');
}

async function showTopupModal() {
  const modalForm = document.createElement('form');
  modalForm.innerHTML = `
    <label>Vārds uz kartes<input name="cardName" required></label>
    <label>Kartes numurs<input name="cardNumber" pattern="[0-9 ]{16,19}" placeholder="5454 5454 5454 5454" required></label>
    <label>Derīga līdz<input name="expiry" placeholder="12/29" required></label>
    <label>CVV<input name="cvv" pattern="[0-9]{3}" placeholder="123" required></label>
    <label>Summa<select name="amount">
      <option value="5">5 €</option>
      <option value="10">10 €</option>
      <option value="20">20 €</option>
      <option value="custom">Cita summa</option>
    </select></label>
    <label class="custom" hidden>Cita summa<input name="customAmount" type="number" min="1" step="0.01"></label>
  `;
  const customContainer = modalForm.querySelector('.custom');
  const amountSelect = modalForm.querySelector('[name="amount"]');
  amountSelect.addEventListener('change', () => {
    customContainer.hidden = amountSelect.value !== 'custom';
  });
  const confirmed = await openModal({
    title: 'Bilances papildināšana',
    content: modalForm,
    confirmText: 'Apstiprināt',
    cancelText: 'Atcelt'
  });
  if (!confirmed) return;
  const amount = amountSelect.value === 'custom'
    ? Number(modalForm.customAmount.value || 0)
    : Number(amountSelect.value);
  if (!amount || Number.isNaN(amount)) {
    showToast('Norādiet summu.');
    return;
  }
  const payment = {
    id: generateId('pay'),
    userId: getCurrentUser().id,
    type: 'Depozīts',
    description: 'Bilances papildinājums',
    amount,
    status: 'paid',
    statusLabel: 'Reģistrēts',
    createdAt: now(),
    updatedAt: now()
  };
  payments.push(payment);
  await persist(payment);
  updateBalance(amount);
  showToast('Jūsu maksājums reģistrēts. Tiek gaidīta apstrāde.');
}

async function handleWithdraw() {
  const amount = Number(prompt('Ievadiet izmaksas summu (min 1€)', '5'));
  if (!amount || Number.isNaN(amount)) return;
  const user = getCurrentUser();
  const commission = 1;
  if (user.balance < amount + commission) {
    showToast('Nepietiek līdzekļu komisijai.');
    return;
  }
  updateBalance(-(amount + commission));
  const payment = {
    id: generateId('wd'),
    userId: user.id,
    type: 'Izmaksāt',
    description: 'Izmaksas pieprasījums',
    amount,
    status: 'processing',
    statusLabel: 'Gaida apstrādi',
    createdAt: now()
  };
  payments.push(payment);
  await persist(payment);
  showToast('Pieprasījums pieņemts. Komisija 1€ ieturēta.');
  setTimeout(async () => {
    payment.status = 'cancelled';
    payment.statusLabel = 'Atteikts (Demo režīms)';
    payment.updatedAt = now();
    await persist(payment);
    showToast('Izmaksu pieprasījums atteikts (demo).');
  }, 10000 + Math.random() * 20000);
}

export async function createPayment(data) {
  const payment = {
    id: generateId('inv'),
    userId: getCurrentUser().id,
    type: data.type || 'Maksājums',
    description: data.description,
    amount: Number(Number(data.amount).toFixed(2)),
    status: data.status || 'open',
    statusLabel: data.statusLabel || 'Izveidots',
    createdAt: data.createdAt || now(),
    dueAt: data.dueAt
  };
  payments.push(payment);
  await persist(payment);
  onNewPayment?.(payment);
  return payment;
}

export async function updatePayment(paymentId, updates) {
  const idx = payments.findIndex((p) => p.id === paymentId);
  if (idx === -1) return;
  payments[idx] = { ...payments[idx], ...updates, updatedAt: now() };
  await persist(payments[idx]);
}

export function getOpenPayments() {
  return payments.filter((payment) => payment.status === 'open' || payment.status === 'deferred');
}

export function getPayments() {
  return payments;
}

export function resetPayments() {
  payments = [];
  render();
}

export function reloadPayments() {
  loadPayments();
}

