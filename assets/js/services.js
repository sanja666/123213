import { idbGetAll, idbPut, now, generateId } from './storage.js';
import { getCurrentUser } from './auth.js';
import { createPayment, getPayments } from './payments.js';
import { showToast } from './ui.js';

let servicesCatalog = [
  { code: 'NOSOD', title: 'Izziņa par nesodāmību', price: 4.99, minDays: 5, maxDays: 20 },
  { code: 'ADR', title: 'Dzīvesvietas maiņa', price: 12.0, minDays: 7, maxDays: 45 },
  { code: 'ID', title: 'Pase / ID karte', price: 29.99, minDays: 30, maxDays: 90 },
  { code: 'INCOME', title: 'Izziņa par ienākumiem', price: 3.0, minDays: 3, maxDays: 14 },
  { code: 'QUEUE', title: 'Elektroniskā rinda (prioritāte)', price: 1.5, minDays: 1, maxDays: 3, priority: true }
];

let orders = [];
let onOrderUpdate;
let onCaseCreate;

function renderCatalog() {
  const container = document.getElementById('service-list');
  container.innerHTML = '';
  servicesCatalog.forEach((service) => {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>Maksa: ${service.price.toFixed(2)} €</p>
      <p>Termiņš: ${service.minDays}-${service.maxDays} darba dienas</p>
      ${service.priority ? '<p>Prioritātes karte samazina termiņu par 30%</p>' : ''}
      <button class="primary">Pieteikt</button>
    `;
    card.querySelector('button').addEventListener('click', () => orderService(service));
    container.appendChild(card);
  });
}

function renderOrders() {
  if (!orders.length) return;
  const container = document.getElementById('service-list');
  orders.forEach((order) => {
    const block = document.createElement('div');
    block.className = 'service-card';
    block.innerHTML = `
      <h4>${order.title}</h4>
      <p>Statuss: ${order.status}</p>
      <p>Vēsture:</p>
      <ul>${order.history.map((step) => `<li>${new Date(step.ts).toLocaleString()} — ${step.status}</li>`).join('')}</ul>
    `;
    container.appendChild(block);
  });
}

async function loadOrders() {
  const user = getCurrentUser();
  if (!user) return;
  const all = await idbGetAll('serviceOrders');
  orders = all.filter((order) => order.userId === user.id);
  renderCatalog();
  renderOrders();
}

function updateOrder(order, status) {
  order.status = status;
  order.history.push({ ts: now(), status });
  idbPut('serviceOrders', order).then(() => {
    renderCatalog();
    renderOrders();
  });
}

async function orderService(service) {
  const user = getCurrentUser();
  const order = {
    id: generateId('srv'),
    userId: user.id,
    code: service.code,
    title: service.title,
    price: service.price,
    status: 'Jauns',
    createdAt: now(),
    history: [{ ts: now(), status: 'Pieteikums saņemts' }]
  };
  orders.push(order);
  await idbPut('serviceOrders', order);
  renderCatalog();
  renderOrders();
  showToast('Pakalpojums reģistrēts. Rēķins izveidots sadaļā Maksājumi.');
  const invoice = await createPayment({
    type: 'Pakalpojums',
    description: service.title,
    amount: service.price,
    status: 'open',
    statusLabel: 'Izveidots'
  });
  onOrderUpdate?.(order, invoice);
  simulateProgress(order, service);
  simulatePaymentTimeout(order, invoice);
}

function simulateProgress(order, service) {
  const steps = ['Apstrādē', 'Pārskatīšanā', 'Sagatavots', 'Slēgts'];
  let index = 0;
  const timer = setInterval(() => {
    if (index >= steps.length) {
      clearInterval(timer);
      return;
    }
    updateOrder(order, steps[index]);
    if (steps[index] === 'Slēgts') {
      clearInterval(timer);
    }
    index += 1;
  }, 15000 + Math.random() * 30000);
}

function simulatePaymentTimeout(order, invoice) {
  setTimeout(() => {
    const latest = getPayments().find((item) => item.id === invoice.id);
    const paymentStillOpen = latest && (latest.status === 'open' || latest.status === 'deferred');
    if (paymentStillOpen) {
      createPayment({
        type: 'Papildparāds',
        description: `Neapmaksāts pakalpojums: ${order.title}`,
        amount: 5 + Math.random() * 20,
        status: 'open',
        statusLabel: 'Izveidots'
      });
      onCaseCreate?.(order, latest);
      showToast('Par neapmaksātu pakalpojumu reģistrēta lieta.');
    }
  }, 60000 + Math.random() * 60000);
}

export function initServices({ onInvoiceCreated, onServiceOrder }) {
  onOrderUpdate = onServiceOrder;
  onCaseCreate = onInvoiceCreated;
  loadOrders();
}

export function updateCatalog(list) {
  servicesCatalog = list;
  renderCatalog();
  renderOrders();
}

export function getCatalog() {
  return servicesCatalog;
}

export function resetServices() {
  orders = [];
  renderCatalog();
}

export function reloadServices() {
  loadOrders();
}

