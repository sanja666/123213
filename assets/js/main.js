import { initAuth, getCurrentUser, updateUserRecord } from './auth.js';
import { initProfile, populateProfile, setUiArrest } from './profile.js';
import { initPayments, createPayment, reloadPayments, setNewPaymentListener, updatePayment } from './payments.js';
import { initServices, reloadServices } from './services.js';
import { initCases, createCaseFromPayment, createCase, conductHearing, resolveCasePayment, reloadCases, getCases } from './cases.js';
import { initCasino, isUnderArrest, releaseArrest } from './casino.js';
import { initDocuments, addDocument } from './documents.js';
import { initAdmin } from './admin.js';
import { initI18n, setLanguage } from './i18n.js';
import { bindNav, activateView, restoreView, showToast } from './ui.js';
import { loadLocal, saveLocal, now } from './storage.js';

const probabilityDefaults = {
  soften: 0.2,
  harden: 0.35,
  postpone: 0.2,
  arrest: 0.1,
  refund: 0.05,
  unchanged: 0.1
};

let modulesInitialised = false;
let randomFineTimer;
let currentRole = 'iedzivotajs';
let adminInitialised = false;

initI18n();
setupLanguageSwitch();
setupNavigation();
initProfile({ onSave: handleProfileSave });
initDocuments();
document.querySelector('.app-header').style.display = 'none';

initAuth({
  onLogin: handleLogin,
  onLogout: handleLogout,
  onExpire: () => {
    handleLogout();
    showToast('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
  }
});

function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      const user = getCurrentUser();
      if (user) {
        const settings = { ...(user.settings || {}), lang: btn.dataset.lang };
        updateUserRecord(user.id, { settings });
      }
    });
  });
}

function setupNavigation() {
  bindNav((target) => {
    if (!getCurrentUser() && target !== 'login-view') {
      return false;
    }
    if (target === 'casino' && isUnderArrest()) {
      showToast('Administratīvais arests (UI) spēkā.');
      return false;
    }
    return true;
  });
}

async function handleLogin(user) {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  document.getElementById('login-view').classList.remove('active');
  document.querySelector('.app-header').style.display = 'flex';
  currentRole = user.role;
  populateProfile(user);
  if (user.settings?.lang) {
    setLanguage(user.settings.lang);
  }
  document.querySelector('[data-view="admin"]').style.display = currentRole === 'administrators' ? 'inline-flex' : 'none';

  if (!modulesInitialised) {
    setNewPaymentListener(scheduleFineTimer);
    initPayments({
      onCreateCase: (payment) => createCaseFromPayment(payment),
      onGenerateDocument: addDocument,
      onPaymentUpdate: (payment) => {
        if (payment.status === 'paid' && payment.relatedCaseId) {
          resolveCasePayment(payment.relatedCaseId);
        }
      }
    });
    initServices({
      onInvoiceCreated: (_order, invoice) => {
        if (invoice) {
          createCaseFromPayment(invoice, { basis: 'Neapmaksāts pakalpojums' });
        }
      },
      onServiceOrder: () => {}
    });
    await initCases({
      onPaymentChange: (paymentId, updates) => {
        updatePayment(paymentId, updates);
      },
      onDocumentCreated: addDocument,
      onUiRestriction: handleUiRestriction,
      probabilityConfig: loadLocal('ep_probabilities', probabilityDefaults)
    });
    initCasino({
      onUiArrest: handleUiRestriction,
      onDocumentCreated: addDocument
    });
    modulesInitialised = true;
  } else {
    reloadPayments();
    reloadServices();
    reloadCases();
    initDocuments();
  }

  if (currentRole === 'administrators' && !adminInitialised) {
    initAdmin({
      probabilities: probabilityDefaults,
      onFine: () => handleRandomFine(true),
      onCase: () => createCase({ basis: 'Administratīvais pārkāpums', amount: 15 + Math.random() * 40 }),
      onHearing: () => {
        const cases = getCases();
        const target = cases.find((entry) => entry.status === 'Tiesas sēde ieplānota' || entry.status === 'Izpilde');
        if (target) conductHearing(target.id);
        else showToast('Nav lietu, kurām rīkot sēdi.');
      },
      onRelease: () => handleUiRestriction(false)
    });
    adminInitialised = true;
  }

  initDocuments();
  restoreView('services');
  scheduleFineTimer();
}

function handleLogout() {
  clearTimeout(randomFineTimer);
  releaseArrest();
  handleUiRestriction(false);
  document.querySelectorAll('.view').forEach((view) => {
    if (view.id === 'login-view') view.classList.add('active');
    else view.classList.remove('active');
  });
  document.querySelector('.app-header').style.display = 'none';
  activateView('login-view');
}

async function handleProfileSave() {
  const amount = 3 + Math.random() * 6;
  const payment = await createPayment({
    type: 'Administratīvais maksājums',
    description: 'Nepareiza datu apstrāde',
    amount,
    status: 'open',
    statusLabel: 'Izveidots'
  });
  showToast('Reģistrēts administratīvais maksājums par datu apstrādi. Pieejams sadaļā Maksājumi.');
  saveLocal('last_profile_update', now());
  return payment;
}

function handleUiRestriction(active, message) {
  setUiArrest(active, message);
  document.getElementById('wallet-withdraw').disabled = active;
  document.getElementById('play-double').disabled = active;
}

function scheduleFineTimer() {
  clearTimeout(randomFineTimer);
  const interval = 60000 + Math.random() * 120000;
  randomFineTimer = setTimeout(() => handleRandomFine(false), interval);
}

async function handleRandomFine(force) {
  if (!force && Math.random() > 0.25) {
    scheduleFineTimer();
    return;
  }
  const amount = 1.5 + Math.random() * 3;
  await createPayment({
    type: 'Administratīvais brīdinājums',
    description: 'Uzraudzības sistēma konstatēja kavējumu',
    amount,
    status: 'open',
    statusLabel: 'Izveidots'
  });
  showToast('Administratīvais brīdinājums reģistrēts.');
  scheduleFineTimer();
}

