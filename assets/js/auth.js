import { loadLocal, saveLocal, removeLocal, now } from './storage.js';
import { showToast, openModal } from './ui.js';
import { t } from './i18n.js';

const SESSION_KEY = 'epakalpojumi_session';
const USERS_KEY = 'epakalpojumi_users';
const SESSION_MS = 60 * 1000;

let sessionTimer;
let currentSession = loadLocal(SESSION_KEY, null);
let expireHandler;

function seedUsers() {
  const existing = loadLocal(USERS_KEY, null);
  if (existing) return existing;
  const demo = {
    user: {
      id: 'user',
      role: 'iedzivotajs',
      name: 'Ilze',
      surname: 'Kalniņa',
      pk: '010199-12345',
      address: 'Rīga, Demo iela 1',
      email: 'ilze@example.lv',
      phone: '+37120000001',
      balance: 0,
      settings: { lang: 'lv' }
    },
    admin: {
      id: 'admin',
      role: 'administrators',
      name: 'Andris',
      surname: 'Ozols',
      pk: '120305-67890',
      address: 'Rīga, Kontroles iela 7',
      email: 'admin@example.lv',
      phone: '+37129999999',
      balance: 0,
      settings: { lang: 'lv' }
    }
  };
  saveLocal(USERS_KEY, demo);
  return demo;
}

let users = seedUsers();

function persistUsers() {
  saveLocal(USERS_KEY, users);
}

export function getCurrentSession() {
  if (!currentSession) return null;
  if (Date.now() > currentSession.expiresAt) {
    clearSession();
    return null;
  }
  return currentSession;
}

export function getCurrentUser() {
  const session = getCurrentSession();
  if (!session) return null;
  return users[session.userId] ?? session.userData;
}

function clearSession() {
  currentSession = null;
  removeLocal(SESSION_KEY);
  if (sessionTimer) clearTimeout(sessionTimer);
}

function scheduleExpiry(onExpire) {
  if (onExpire) {
    expireHandler = onExpire;
  }
  if (!currentSession) return;
  if (sessionTimer) clearTimeout(sessionTimer);
  const timeout = currentSession.expiresAt - Date.now();
  sessionTimer = setTimeout(() => {
    clearSession();
    expireHandler?.();
  }, Math.max(timeout, 0));
}

function createSession(userId, role, onExpire) {
  currentSession = {
    userId,
    role,
    startedAt: now(),
    expiresAt: Date.now() + SESSION_MS
  };
  saveLocal(SESSION_KEY, currentSession);
  scheduleExpiry(onExpire);
}

function updateSessionExpiry(onExpire) {
  if (!currentSession) return;
  currentSession.expiresAt = Date.now() + SESSION_MS;
  saveLocal(SESSION_KEY, currentSession);
  scheduleExpiry(onExpire);
}

function authenticateDemo(form) {
  const user = form.user.value.trim();
  const pass = form.pass.value.trim();
  if (pass !== '1234') {
    throw new Error(t('login.password') + ': 1234');
  }
  if (!users[user]) {
    throw new Error('Nepazīstams lietotājs');
  }
  return { id: user, role: users[user].role };
}

function ensureUserRecord(id, overrides = {}) {
  if (!users[id]) {
    users[id] = {
      id,
      role: 'iedzivotajs',
      name: overrides.name || 'Demo',
      surname: overrides.surname || 'Lietotājs',
      pk: overrides.pk || '311299-00011',
      address: overrides.address || 'Rīga, Demonstrācijas iela 5',
      email: overrides.email || 'demo@example.lv',
      phone: overrides.phone || '+37120000002',
      balance: overrides.balance ?? 0,
      settings: { lang: overrides.lang || 'lv' }
    };
  }
  persistUsers();
  return users[id];
}

function showSessionBanner(message) {
  const banner = document.getElementById('session-banner');
  banner.textContent = message;
  banner.hidden = false;
  banner.classList.add('show');
}

function hideSessionBanner() {
  const banner = document.getElementById('session-banner');
  banner.hidden = true;
  banner.classList.remove('show');
}

export function initAuth({ onLogin, onLogout, onExpire }) {
  const demoForm = document.getElementById('demo-form');
  const smartIdForm = document.getElementById('smartid-form');
  const eparakstsForm = document.getElementById('eparaksts-form');
  const smsForm = document.getElementById('sms-form');
  const smsVerify = document.getElementById('sms-verify');
  const logoutBtn = document.getElementById('logout-btn');

  const activateTab = (target) => {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const match = btn.dataset.target === target;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match);
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `${target}-form` || panel.dataset.method === target);
    });
  };

  document.querySelectorAll('.login-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.target));
  });

  demoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const { id, role } = authenticateDemo(event.currentTarget);
      createSession(id, role, () => {
        showToast('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
        onExpire?.();
      });
      hideSessionBanner();
      updateSessionExpiry(onExpire);
      onLogin(users[id]);
      showToast('Sesija aktīva (demo).');
    } catch (error) {
      showToast(error.message || 'Neizdevās pieslēgties');
    }
  });

  smartIdForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const pk = smartIdForm.pk.value.trim();
    const name = smartIdForm.name.value.trim();
    const modalContent = document.createElement('div');
    modalContent.innerHTML = `<p>Smart-ID pieprasījums #A1B2</p><p>Kods: <strong>3841</strong></p><p>Ievadiet 1234, lai apstiprinātu.</p>`;
    const confirmed = await openModal({
      title: 'Smart-ID simulācija',
      content: modalContent,
      confirmText: 'Apstiprināt',
      cancelText: 'Atcelt'
    });
    if (!confirmed) return;
    const code = prompt('Ievadiet Smart-ID PIN2 (1234)');
    if (code !== '1234') {
      showToast('Smart-ID netika apstiprināts');
      return;
    }
    const id = `smart-${pk}`;
    const [given, family] = name.split(' ');
    ensureUserRecord(id, {
      name: given || 'Smart',
      surname: family || 'Lietotājs',
      pk,
      email: `${(given || 'smart').toLowerCase()}@example.lv`
    });
    createSession(id, 'iedzivotajs', () => {
      showSessionBanner('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
      onExpire?.();
    });
    onLogin(users[id]);
    showToast('Smart-ID sesija apstiprināta.');
  });

  eparakstsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const idValue = eparakstsForm.id.value.trim();
    const modalContent = document.createElement('div');
    modalContent.innerHTML = '<p>eParaksts klients (demo)</p><p>Apstrāde...</p>';
    const confirmed = await openModal({
      title: 'eParaksts',
      content: modalContent,
      confirmText: 'Turpināt',
      cancelText: 'Atcelt'
    });
    if (!confirmed) return;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    ensureUserRecord(idValue.toLowerCase(), { name: 'eParaksts', surname: 'Lietotājs', email: 'eparaksts@example.lv' });
    createSession(idValue.toLowerCase(), 'iedzivotajs', () => {
      showSessionBanner('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
      onExpire?.();
    });
    onLogin(users[idValue.toLowerCase()]);
    showToast('eParaksts pieprasījums apstiprināts.');
  });

  smsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    smsForm.querySelector('.otp-entry').hidden = false;
    smsForm.smsSendDisabled = true;
    showToast('SMS ar kodu nosūtīta (demo). Izmantojiet 0000 vai 123456.');
  });

  smsVerify.addEventListener('click', () => {
    const otp = smsForm.otp.value.trim();
    if (otp !== '0000' && otp !== '123456') {
      showToast('Nederīgs kods');
      return;
    }
    const phone = smsForm.phone.value.trim();
    const id = `sms-${phone}`;
    ensureUserRecord(id, { phone, name: 'SMS', surname: 'Lietotājs' });
    createSession(id, 'iedzivotajs', () => {
      showSessionBanner('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
      onExpire?.();
    });
    onLogin(users[id]);
    showToast('SMS-OTP sesija aktivizēta.');
  });

  logoutBtn.addEventListener('click', () => {
    clearSession();
    hideSessionBanner();
    onLogout?.();
  });

  if (getCurrentSession()) {
    onLogin(getCurrentUser());
    scheduleExpiry(() => {
      showSessionBanner('Sesija beigusies. Lūdzu pieslēdzieties atkārtoti.');
      onExpire?.();
    });
  }
}

export function updateUserRecord(id, updates) {
  users[id] = { ...users[id], ...updates };
  persistUsers();
}

export function logout(onLogout) {
  clearSession();
  hideSessionBanner();
  onLogout?.();
}

export function refreshSession(onExpire) {
  updateSessionExpiry(onExpire);
}

