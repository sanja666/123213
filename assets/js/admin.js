import { showToast, openModal } from './ui.js';
import { getCatalog, updateCatalog } from './services.js';
import { resetPayments } from './payments.js';
import { clearCases, setProbabilities } from './cases.js';
import { clearCasino, releaseArrest } from './casino.js';
import { clearDocuments } from './documents.js';
import { resetDb, saveLocal, loadLocal } from './storage.js';

let onGenerateFine;
let onGenerateCase;
let onForceHearing;
let onReleaseRestriction;
let logEntries = [];
const probabilityKey = 'ep_probabilities';

function getCurrentProbabilities(defaults) {
  return { ...defaults, ...loadLocal(probabilityKey, {}) };
}

function renderProbabilities(probabilities) {
  const container = document.getElementById('probability-controls');
  container.innerHTML = '';
  Object.entries(probabilities).forEach(([key, value]) => {
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `
      <span>${key}</span>
      <input type="range" min="0" max="1" step="0.05" value="${value}" data-key="${key}">
      <strong>${Math.round(value * 100)}%</strong>
    `;
    const range = wrapper.querySelector('input');
    range.addEventListener('input', () => {
      wrapper.querySelector('strong').textContent = `${Math.round(range.value * 100)}%`;
    });
    range.addEventListener('change', () => {
      const value = Number(range.value);
      setProbabilities({ [key]: value });
      const stored = loadLocal(probabilityKey, {});
      saveLocal(probabilityKey, { ...stored, [key]: value });
      log(`Varbūtība ${key} mainīta uz ${range.value}`);
    });
    container.appendChild(wrapper);
  });
}

function renderCatalogEditor() {
  const container = document.getElementById('admin-services');
  const catalog = getCatalog();
  container.innerHTML = '';
  catalog.forEach((service, index) => {
    const block = document.createElement('div');
    block.className = 'service-card';
    block.innerHTML = `
      <h4>${service.title}</h4>
      <label>Cena<input type="number" min="0" step="0.01" value="${service.price}" data-index="${index}" data-field="price"></label>
      <label>Min dienas<input type="number" min="1" value="${service.minDays}" data-index="${index}" data-field="minDays"></label>
      <label>Max dienas<input type="number" min="1" value="${service.maxDays}" data-index="${index}" data-field="maxDays"></label>
    `;
    container.appendChild(block);
  });
  container.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      const idx = Number(input.dataset.index);
      const field = input.dataset.field;
      const value = Number(input.value);
      const catalogCopy = [...getCatalog()];
      catalogCopy[idx] = { ...catalogCopy[idx], [field]: value };
      updateCatalog(catalogCopy);
      log(`Pakalpojuma ${catalogCopy[idx].title} parametrs ${field} atjaunots.`);
    });
  });
}

function log(message) {
  logEntries.unshift({ ts: new Date(), message });
  const list = document.getElementById('admin-log');
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleString()} — ${message}`;
  list.prepend(item);
}

async function wipeData() {
  const confirmed = await openModal({
    title: 'Datu dzēšana',
    content: 'Vai tiešām dzēst visus datus?',
    confirmText: 'Dzēst',
    cancelText: 'Atcelt'
  });
  if (!confirmed) return;
  localStorage.clear();
  await resetDb();
  resetPayments();
  clearCases();
  clearCasino();
  clearDocuments();
  log('Dati dzēsti.');
  showToast('Dati dzēsti. Bet vai tiešām?');
  setTimeout(() => window.location.reload(), 600);
}

export function initAdmin({
  probabilities,
  onFine,
  onCase,
  onHearing,
  onRelease
}) {
  onGenerateFine = onFine;
  onGenerateCase = onCase;
  onForceHearing = onHearing;
  onReleaseRestriction = onRelease;
  renderProbabilities(getCurrentProbabilities(probabilities));
  renderCatalogEditor();

  document.querySelectorAll('[data-trigger="fine"]').forEach((btn) => btn.addEventListener('click', () => {
    onGenerateFine?.();
    log('Sistēmiski ģenerēts jauns maksājums.');
  }));
  document.querySelectorAll('[data-trigger="case"]').forEach((btn) => btn.addEventListener('click', () => {
    onGenerateCase?.();
    log('Izveidota jauna lieta (admins).');
  }));
  document.querySelectorAll('[data-trigger="hearing"]').forEach((btn) => btn.addEventListener('click', () => {
    onForceHearing?.();
    log('Rīkota tiesas sēde (admins).');
  }));
  document.querySelectorAll('[data-trigger="release"]').forEach((btn) => btn.addEventListener('click', () => {
    releaseArrest();
    onReleaseRestriction?.();
    log('UI ierobežojums noņemts.');
  }));
  document.querySelectorAll('[data-trigger="reset"]').forEach((btn) => btn.addEventListener('click', wipeData));
}

