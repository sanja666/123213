import { initAuth } from './auth.js';
import { initProfile } from './profile.js';
import { initPayments } from './payments.js';
import { initCases } from './convictions.js';
import { initChatbot } from './chatbot.js';

const DB_NAME = 'epakalpojumi-demo';
const DB_VERSION = 1;
const STORE_PAYMENTS = 'payments';
const STORE_CASES = 'cases';
const STORE_GAMES = 'games';
const STORE_DOCS = 'documents';

const STORAGE_KEYS = {
  settings: 'ep_settings',
  session: 'ep_session',
  profile: 'ep_profile',
  catalog: 'ep_catalog',
  admin: 'ep_admin_prefs',
  logs: 'ep_logs',
  notices: 'ep_notices',
  serviceOrders: 'ep_service_orders',
  uiArrest: 'ep_ui_arrest'
};

const translations = {
  lv: {
    'header.subtitle': 'Simulēts valsts portālis',
    'nav.dashboard': 'Panelis',
    'nav.profile': 'Profils',
    'nav.services': 'Pakalpojumi',
    'nav.payments': 'Maksājumi',
    'nav.cases': 'Lietas',
    'nav.casino': 'Kazino',
    'nav.documents': 'Dokumenti',
    'nav.admin': 'Administrators',
    'common.logout': 'Izrakstīties',
    'auth.title': 'Droša pieslēgšanās',
    'auth.disclaimer': 'Šis ir demonstrācijas režīms. Visi dati ir simulēti.',
    'auth.demoTab': 'Demo konts',
    'auth.smartidTab': 'Smart-ID (sim)',
    'auth.eparakstsTab': 'eParaksts (sim)',
    'auth.smsTab': 'SMS-OTP (sim)',
    'auth.username': 'Lietotājvārds',
    'auth.password': 'Parole',
    'auth.demoHint': 'Lietotājs: user/admin, parole: 1234',
    'auth.submit': 'Apstiprināt',
    'auth.personId': 'Personas kods',
    'auth.fullName': 'Vārds, uzvārds',
    'auth.request': 'Apstiprināt',
    'auth.eparakstsId': 'eParaksts ID',
    'auth.sign': 'Parakstīt',
    'auth.phone': 'Tālrunis',
    'auth.sendCode': 'Sūtīt kodu',
    'auth.code': 'Apstiprinājuma kods',
    'auth.verify': 'Pieslēgties',
    'auth.sessionNote': 'Sesija ir aktīva 60 sekundes demonstrācijas drošības nolūkos.',
    'dashboard.title': 'Darbvirsma',
    'dashboard.notice': 'Šis ir demonstrācijas režīms. Rezultāti ir simulēti.',
    'profile.title': 'Profila dati',
    'profile.name': 'Vārds',
    'profile.surname': 'Uzvārds',
    'profile.personId': 'Personas kods',
    'profile.address': 'Deklarētā adrese',
    'profile.email': 'E-pasts',
    'profile.phone': 'Tālrunis',
    'profile.balance': 'Bilance',
    'profile.topup': 'Papildināt',
    'profile.withdraw': 'Izmaksāt',
    'profile.save': 'Saglabāt izmaiņas',
    'services.title': 'Pieejamie pakalpojumi',
    'services.disclaimer': 'Pasūtījumi un termiņi ir simulēti demonstrācijai.',
    'services.orders': 'Jūsu pasūtījumi',
    'services.table.id': 'ID',
    'services.table.title': 'Nosaukums',
    'services.table.status': 'Statuss',
    'services.table.updated': 'Atjaunināts',
    'payments.title': 'Maksājumi un parādi',
    'payments.topup': 'Papildināt bilanci',
    'payments.withdraw': 'Izmaksāt',
    'payments.open': 'Atvērtie maksājumi',
    'payments.history': 'Maksājumu vēsture',
    'payments.table.id': 'ID',
    'payments.table.type': 'Tips',
    'payments.table.amount': 'Summa',
    'payments.table.status': 'Statuss',
    'payments.table.due': 'Termiņš',
    'payments.table.actions': 'Darbības',
    'payments.table.date': 'Datums',
    'cases.title': 'Lietas un procesi',
    'cases.disclaimer': 'Lietu stāvokļi tiek simulēti un nav juridiski saistoši.',
    'cases.appeal': 'Reģistrēt apelāciju',
    'casino.title': 'Kazino pēdas',
    'casino.disclaimer': 'Spēļu rezultāti ietekmē simulētos maksājumus un lietas.',
    'casino.roulette': 'Rulete',
    'casino.lottery': 'Loterija',
    'casino.double': 'Double',
    'casino.spin': 'Griezt ruleti',
    'casino.play': 'Pirkt biļeti (1€)',
    'casino.doubleBtn': 'Double or Nothing',
    'casino.history': 'Kazino vēsture',
    'casino.table.time': 'Laiks',
    'casino.table.game': 'Spēle',
    'casino.table.outcome': 'Rezultāts',
    'casino.table.impact': 'Ietekme',
    'documents.title': 'Dokumenti un paziņojumi',
    'documents.disclaimer': 'PDF tiek ģenerēti klienta pusē un ir simulācija.',
    'admin.title': 'Administratora panelis',
    'admin.probabilities': 'Tiesu un kazino iznākumu iespējas',
    'admin.relief': 'Smaguma mazinājums (%)',
    'admin.increase': 'Soda palielinājums (%)',
    'admin.delay': 'Atlikšana (%)',
    'admin.arrest': 'Administratīvais arests (%)',
    'admin.refund': 'Daļējs atmaksājums (%)',
    'admin.forceFine': 'Izveidot jaunu maksu',
    'admin.forceCase': 'Izveidot lietu',
    'admin.forceHearing': 'Uzturēt sēdi',
    'admin.release': 'Noņemt UI arestu',
    'admin.reset': 'Dzēst visus datus',
    'admin.logs': 'Žurnāls',
    'admin.denied': 'Pieeja tikai administratoriem',
    'footer.disclaimer': 'Šis ir demonstrācijas režīms. Visi maksājumi un juridiskie rezultāti ir simulācija, tie nerada reālas saistības un neaizstāj oficiālos valsts pakalpojumus.'
  },
  ru: {
    'header.subtitle': 'Симулированный портал госуслуг',
    'nav.dashboard': 'Панель',
    'nav.profile': 'Профиль',
    'nav.services': 'Услуги',
    'nav.payments': 'Платежи',
    'nav.cases': 'Дела',
    'nav.casino': 'Казино',
    'nav.documents': 'Документы',
    'nav.admin': 'Администратор',
    'common.logout': 'Выйти',
    'auth.title': 'Безопасное подключение',
    'auth.disclaimer': 'Это демонстрационный режим. Все данные симулируются.',
    'auth.demoTab': 'Демо-аккаунт',
    'auth.smartidTab': 'Smart-ID (сим)',
    'auth.eparakstsTab': 'eParaksts (сим)',
    'auth.smsTab': 'SMS-OTP (сим)',
    'auth.username': 'Имя пользователя',
    'auth.password': 'Пароль',
    'auth.demoHint': 'Пользователь: user/admin, пароль: 1234',
    'auth.submit': 'Подтвердить',
    'auth.personId': 'Личный код',
    'auth.fullName': 'Имя и фамилия',
    'auth.request': 'Подтвердить',
    'auth.eparakstsId': 'eParaksts ID',
    'auth.sign': 'Подписать',
    'auth.phone': 'Телефон',
    'auth.sendCode': 'Отправить код',
    'auth.code': 'Код подтверждения',
    'auth.verify': 'Войти',
    'auth.sessionNote': 'Сессия активна 60 секунд в демонстрационных целях.',
    'dashboard.title': 'Рабочий стол',
    'dashboard.notice': 'Это демонстрационный режим. Результаты симулируются.',
    'profile.title': 'Данные профиля',
    'profile.name': 'Имя',
    'profile.surname': 'Фамилия',
    'profile.personId': 'Личный код',
    'profile.address': 'Адрес декларирования',
    'profile.email': 'Эл. почта',
    'profile.phone': 'Телефон',
    'profile.balance': 'Баланс',
    'profile.topup': 'Пополнить',
    'profile.withdraw': 'Вывести',
    'profile.save': 'Сохранить изменения',
    'services.title': 'Доступные услуги',
    'services.disclaimer': 'Заказы и сроки симулируются в демонстрационных целях.',
    'services.orders': 'Ваши заказы',
    'services.table.id': 'ID',
    'services.table.title': 'Название',
    'services.table.status': 'Статус',
    'services.table.updated': 'Обновлено',
    'payments.title': 'Платежи и задолженности',
    'payments.topup': 'Пополнить баланс',
    'payments.withdraw': 'Вывести',
    'payments.open': 'Открытые платежи',
    'payments.history': 'История платежей',
    'payments.table.id': 'ID',
    'payments.table.type': 'Тип',
    'payments.table.amount': 'Сумма',
    'payments.table.status': 'Статус',
    'payments.table.due': 'Срок',
    'payments.table.actions': 'Действия',
    'payments.table.date': 'Дата',
    'cases.title': 'Дела и процессы',
    'cases.disclaimer': 'Статусы дел симулируются и не имеют юридической силы.',
    'cases.appeal': 'Подать апелляцию',
    'casino.title': 'Казино последствий',
    'casino.disclaimer': 'Результаты игр влияют на симулированные платежи и дела.',
    'casino.roulette': 'Рулетка',
    'casino.lottery': 'Лотерея',
    'casino.double': 'Double',
    'casino.spin': 'Крутить рулетку',
    'casino.play': 'Купить билет (1€)',
    'casino.doubleBtn': 'Double or Nothing',
    'casino.history': 'История казино',
    'casino.table.time': 'Время',
    'casino.table.game': 'Игра',
    'casino.table.outcome': 'Результат',
    'casino.table.impact': 'Влияние',
    'documents.title': 'Документы и уведомления',
    'documents.disclaimer': 'PDF генерируются на стороне клиента и являются симуляцией.',
    'admin.title': 'Панель администратора',
    'admin.probabilities': 'Вероятности исходов суда и казино',
    'admin.relief': 'Смягчение (%)',
    'admin.increase': 'Ужесточение (%)',
    'admin.delay': 'Перенос (%)',
    'admin.arrest': 'Адм. арест (%)',
    'admin.refund': 'Частичный возврат (%)',
    'admin.forceFine': 'Создать новый платёж',
    'admin.forceCase': 'Создать дело',
    'admin.forceHearing': 'Провести заседание',
    'admin.release': 'Снять UI-блокировку',
    'admin.reset': 'Стереть данные',
    'admin.logs': 'Журнал',
    'admin.denied': 'Доступ только для администраторов',
    'footer.disclaimer': 'Это демонстрационный режим. Все платежи и юридические результаты симулируются, не создают обязательств и не заменяют официальные госуслуги.'
  }
};

const context = {
  state: {
    user: null,
    settings: {
      lang: 'lv'
    },
    dashboards: {},
    uiArrestUntil: null,
    serviceTimers: {}
  },
  translations,
  events: new Map()
};

(async function bootstrap() {
  await ensureDemoData();
  context.db = await openDatabase();
  loadSettings();
  setupLanguage();
  initNavigation();
  initTabs();
  initAuth(context);
  initProfile(context);
  initPayments(context);
  initCases(context);
  initChatbot(context);
  restoreSession();
  renderDocuments();
})();

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEYS.settings);
  if (stored) {
    try {
      context.state.settings = JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
  }
  const arrestData = localStorage.getItem(STORAGE_KEYS.uiArrest);
  if (arrestData) {
    try {
      const parsed = JSON.parse(arrestData);
      if (parsed && parsed.until && Date.now() < parsed.until) {
        context.state.uiArrestUntil = parsed.until;
      } else {
        localStorage.removeItem(STORAGE_KEYS.uiArrest);
      }
    } catch (e) {
      console.warn('Failed to parse arrest data', e);
    }
  }
}

function setupLanguage() {
  const langButtons = document.querySelectorAll('.lang');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  setLanguage(context.state.settings.lang || 'lv');
}

function setLanguage(lang) {
  if (!translations[lang]) {
    lang = 'lv';
  }
  context.state.settings.lang = lang;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(context.state.settings));
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });
}

context.setLanguage = setLanguage;
context.getLanguage = () => context.state.settings.lang;

function initNavigation() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.role && context.state.user?.role !== btn.dataset.role) {
        showToast(translations[context.getLanguage()]['admin.denied'] || 'Nav piekļuves');
        return;
      }
      showSection(btn.dataset.section);
    });
  });
  document.getElementById('logout').addEventListener('click', () => logout(true));
}

function initTabs() {
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.parentElement;
      group.querySelectorAll('[role="tab"]').forEach(btn => btn.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      const panelId = tab.getAttribute('aria-controls');
      const container = tab.closest('.auth-card, #casino');
      container.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      document.getElementById(panelId).classList.remove('hidden');
    });
  });
}

function showSection(id) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === id);
  });
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === id);
  });
  if (id !== 'auth') {
    document.getElementById('app').focus();
  }
}

context.showSection = showSection;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

context.showToast = showToast;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PAYMENTS)) {
        db.createObjectStore(STORE_PAYMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CASES)) {
        db.createObjectStore(STORE_CASES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_GAMES)) {
        db.createObjectStore(STORE_GAMES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function ensureDemoData() {
  if (!localStorage.getItem('ep_demo_users')) {
    localStorage.setItem('ep_demo_users', JSON.stringify([
      {
        user: 'user',
        pass: '1234',
        role: 'iedzivotajs',
        name: 'Ilze Ozola'
      },
      {
        user: 'admin',
        pass: '1234',
        role: 'administrators',
        name: 'Sistēmas pārraugs'
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.profile)) {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({
      name: 'Ilze',
      surname: 'Ozola',
      pk: '010199-12345',
      address: 'Brīvības iela 1, Rīga',
      email: 'ilze.ozola@example.com',
      phone: '+37120000001',
      balance: 0
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.catalog)) {
    localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify([
      {
        id: 'service-clearance',
        title: 'Izziņa par nesodāmību',
        price: 4.99,
        minDays: 5,
        maxDays: 20
      },
      {
        id: 'service-address',
        title: 'Dzīvesvietas maiņa',
        price: 12,
        minDays: 7,
        maxDays: 45
      },
      {
        id: 'service-passport',
        title: 'Pase / ID karte',
        price: 29.99,
        minDays: 10,
        maxDays: 90
      },
      {
        id: 'service-income',
        title: 'Izziņa par ienākumiem',
        price: 3,
        minDays: 3,
        maxDays: 14
      },
      {
        id: 'service-queue',
        title: 'Elektroniskā rinda (prioritāte)',
        price: 1.5,
        minDays: 1,
        maxDays: 2,
        priority: true
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.admin)) {
    localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify({
      relief: 20,
      increase: 35,
      delay: 20,
      arrest: 10,
      refund: 5
    }));
  }
}

context.openTransaction = function(store, mode, operation) {
  return new Promise((resolve, reject) => {
    const tx = context.db.transaction(store, mode);
    const storeObj = tx.objectStore(store);
    const result = operation(storeObj);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
};

context.addPayment = async function(payment) {
  await context.openTransaction(STORE_PAYMENTS, 'readwrite', store => store.put(payment));
};

context.getPayments = async function() {
  return context.openTransaction(STORE_PAYMENTS, 'readonly', store => store.getAll());
};

context.getPayment = async function(id) {
  return context.openTransaction(STORE_PAYMENTS, 'readonly', store => store.get(id));
};

context.deletePayment = async function(id) {
  return context.openTransaction(STORE_PAYMENTS, 'readwrite', store => store.delete(id));
};

context.addCase = async function(legalCase) {
  await context.openTransaction(STORE_CASES, 'readwrite', store => store.put(legalCase));
};

context.getCases = async function() {
  return context.openTransaction(STORE_CASES, 'readonly', store => store.getAll());
};

context.getCase = async function(id) {
  return context.openTransaction(STORE_CASES, 'readonly', store => store.get(id));
};

context.addGameResult = async function(result) {
  await context.openTransaction(STORE_GAMES, 'readwrite', store => store.put(result));
};

context.getGameResults = async function() {
  return context.openTransaction(STORE_GAMES, 'readonly', store => store.getAll());
};

context.addDocument = async function(doc) {
  await context.openTransaction(STORE_DOCS, 'readwrite', store => store.put(doc));
};

context.getDocuments = async function() {
  return context.openTransaction(STORE_DOCS, 'readonly', store => store.getAll());
};

context.on = function(event, handler) {
  const listeners = context.events.get(event) || [];
  listeners.push(handler);
  context.events.set(event, listeners);
};

context.emit = function(event, payload) {
  const listeners = context.events.get(event) || [];
  listeners.forEach(listener => listener(payload));
};

function restoreSession() {
  const session = localStorage.getItem(STORAGE_KEYS.session);
  if (!session) {
    showSection('auth');
    document.getElementById('logout').classList.add('hidden');
    return;
  }
  try {
    const data = JSON.parse(session);
    if (data.expires && Date.now() < data.expires) {
      context.state.user = data.user;
      activateSession(data.expires - Date.now());
      document.getElementById('logout').classList.remove('hidden');
      afterLogin();
    } else {
      localStorage.removeItem(STORAGE_KEYS.session);
      showSection('auth');
    }
  } catch (e) {
    console.warn('Invalid session', e);
    localStorage.removeItem(STORAGE_KEYS.session);
  }
}

context.startSession = function(user) {
  const expires = Date.now() + 60 * 1000;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ user, expires }));
  context.state.user = user;
  activateSession(60 * 1000);
  document.getElementById('logout').classList.remove('hidden');
  afterLogin();
};

function activateSession(timeout) {
  showSection('dashboard');
  updateDashboard();
  showSessionBanner(true, timeout);
  if (context.sessionTimer) {
    clearTimeout(context.sessionTimer);
  }
  context.sessionTimer = setTimeout(() => {
    showToast(context.getLanguage() === 'lv' ? 'Sesija beigusies' : 'Сессия завершена');
    logout(false);
  }, timeout);
}

function showSessionBanner(show, timeLeft = 0) {
  const banner = document.getElementById('session-banner');
  if (show) {
    banner.textContent = `${context.getLanguage() === 'lv' ? 'Sesija aktīva līdz' : 'Сессия активна до'} ${new Date(Date.now() + timeLeft).toLocaleTimeString()}`;
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

context.refreshSessionBanner = () => {
  const session = localStorage.getItem(STORAGE_KEYS.session);
  if (session) {
    const data = JSON.parse(session);
    if (Date.now() < data.expires) {
      showSessionBanner(true, data.expires - Date.now());
    }
  }
};

context.getProfile = function() {
  const data = localStorage.getItem(STORAGE_KEYS.profile);
  return data ? JSON.parse(data) : null;
};

context.saveProfile = function(profile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
};

context.getCatalog = function() {
  const data = localStorage.getItem(STORAGE_KEYS.catalog);
  return data ? JSON.parse(data) : [];
};

context.getServiceOrders = function() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.serviceOrders) || '[]');
};

context.saveServiceOrders = function(orders) {
  localStorage.setItem(STORAGE_KEYS.serviceOrders, JSON.stringify(orders));
};

context.addServiceOrder = function(order) {
  const orders = context.getServiceOrders();
  orders.push(order);
  context.saveServiceOrders(orders);
};

context.updateServiceOrder = function(order) {
  const orders = context.getServiceOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
    context.saveServiceOrders(orders);
  }
};

context.getProbabilities = function() {
  const stored = localStorage.getItem(STORAGE_KEYS.admin);
  return stored ? JSON.parse(stored) : { relief: 20, increase: 35, delay: 20, arrest: 10, refund: 5 };
};

context.saveProbabilities = function(prob) {
  localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(prob));
};

context.getLogs = function() {
  const stored = localStorage.getItem(STORAGE_KEYS.logs);
  return stored ? JSON.parse(stored) : [];
};

context.pushLog = function(entry) {
  const logs = context.getLogs();
  logs.unshift({ time: Date.now(), entry });
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs.slice(0, 200)));
  context.emit('logs:updated');
};

context.registerNotice = function(title, body, severity = 'info', docId = null) {
  const notices = JSON.parse(localStorage.getItem(STORAGE_KEYS.notices) || '[]');
  notices.unshift({ id: crypto.randomUUID(), title, body, severity, ts: Date.now(), docId });
  localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(notices.slice(0, 100)));
  context.renderDocuments?.();
};

context.getNotices = function() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.notices) || '[]');
};

context.setUiArrest = function(until) {
  context.state.uiArrestUntil = until;
  if (until) {
    localStorage.setItem(STORAGE_KEYS.uiArrest, JSON.stringify({ until }));
  } else {
    localStorage.removeItem(STORAGE_KEYS.uiArrest);
  }
  context.emit('ui:arrest', until);
};

function logout(showAuth) {
  localStorage.removeItem(STORAGE_KEYS.session);
  context.state.user = null;
  if (context.sessionTimer) {
    clearTimeout(context.sessionTimer);
  }
  showSessionBanner(false);
  document.getElementById('logout').classList.add('hidden');
  if (showAuth) {
    showSection('auth');
  }
  context.emit('auth:logout');
}

context.logout = logout;

function afterLogin() {
  renderDashboard();
  renderServices();
  renderServiceOrders();
  updatePayments();
  updateCases();
  renderDocuments();
  context.emit('auth:login', context.state.user);
  scheduleRandomFine();
}

context.updateDashboard = updateDashboard;
context.renderServices = renderServices;
context.renderServiceOrders = renderServiceOrders;
context.updatePayments = updatePayments;
context.updateCases = updateCases;
context.renderDocuments = renderDocuments;
context.scheduleRandomFine = scheduleRandomFine;

async function renderDashboard() {
  const cards = document.getElementById('dashboard-cards');
  const profile = context.getProfile();
  const payments = await context.getPayments();
  const cases = await context.getCases();
  const openPayments = payments.filter(p => p.status !== 'paid');
  const openCases = cases.filter(c => c.status !== 'slēgts');
  cards.innerHTML = '';
  const data = [
    { title: context.getLanguage() === 'lv' ? 'Bilance' : 'Баланс', value: `${(profile?.balance || 0).toFixed(2)} €` },
    { title: context.getLanguage() === 'lv' ? 'Atvērtie maksājumi' : 'Открытые платежи', value: openPayments.length },
    { title: context.getLanguage() === 'lv' ? 'Aktīvās lietas' : 'Активные дела', value: openCases.length },
    { title: context.getLanguage() === 'lv' ? 'Pēdējie paziņojumi' : 'Последние уведомления', value: context.getNotices().length }
  ];
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${item.title}</h3><p>${item.value}</p>`;
    cards.appendChild(card);
  });
}

function updateDashboard() {
  renderDashboard();
}

function renderServices() {
  const list = document.getElementById('services-list');
  const catalog = context.getCatalog();
  list.innerHTML = '';
  catalog.forEach(service => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${context.getLanguage() === 'lv' ? 'Cena' : 'Цена'}: ${service.price.toFixed(2)} €</p>
      <p>${context.getLanguage() === 'lv' ? 'Termiņš' : 'Срок'}: ${service.minDays}-${service.maxDays} ${context.getLanguage() === 'lv' ? 'dienas' : 'дней'}</p>
      <button class="primary" data-service="${service.id}">${context.getLanguage() === 'lv' ? 'Pasūtīt' : 'Заказать'}</button>
    `;
    card.querySelector('button').addEventListener('click', () => orderService(service));
    list.appendChild(card);
  });
  renderServiceOrders();
}

async function orderService(service) {
  if (context.state.uiArrestUntil && Date.now() < context.state.uiArrestUntil) {
    showToast(context.getLanguage() === 'lv' ? 'Pakalpojumi šobrīd ierobežoti' : 'Заказ услуг временно ограничен');
    return;
  }
  const profile = context.getProfile();
  const orderId = `S-${Date.now()}`;
  const dueDate = Date.now() + 24 * 60 * 60 * 1000;
  const payment = {
    id: `PAY-${Date.now()}`,
    type: 'service',
    amount: service.price,
    createdAt: Date.now(),
    status: 'open',
    due: dueDate,
    relatedService: orderId,
    meta: {
      title: service.title,
      priorityQueue: !!service.priority
    }
  };
  await context.addPayment(payment);
  context.addServiceOrder({
    id: orderId,
    serviceId: service.id,
    title: service.title,
    price: service.price,
    status: 'gaida apmaksu',
    paid: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deadlines: { min: service.minDays, max: service.maxDays },
    history: [{ status: 'gaida apmaksu', ts: Date.now() }]
  });
  context.pushLog(`Pasūtīts pakalpojums: ${service.title}`);
  context.registerNotice('Jauns rēķins', `${service.title} (${service.price.toFixed(2)} €)`, 'info');
  scheduleServiceProgress(orderId);
  scheduleServiceExpiration(orderId, payment.id);
  showToast(context.getLanguage() === 'lv' ? 'Rēķins izveidots' : 'Счёт создан');
  updatePayments();
  renderServiceOrders();
}

function scheduleServiceProgress(orderId) {
  const stages = ['apstrādē', 'pārskatīšanā', 'sagatavots', 'slēgts'];
  let index = 0;
  const key = `progress-${orderId}`;
  if (context.state.serviceTimers[key]) {
    clearTimeout(context.state.serviceTimers[key]);
  }
  const advance = () => {
    const orders = context.getServiceOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!order.paid) {
      return;
    }
    if (index >= stages.length) return;
    order.status = stages[index];
    order.updatedAt = Date.now();
    order.history.push({ status: stages[index], ts: Date.now() });
    context.updateServiceOrder(order);
    renderServiceOrders();
    index += 1;
    if (index < stages.length) {
      context.state.serviceTimers[key] = setTimeout(advance, (15 + Math.random() * 30) * 1000);
    }
  };
  context.state.serviceTimers[key] = setTimeout(advance, 3000);
}

function scheduleServiceExpiration(orderId, paymentId) {
  const key = `expire-${orderId}`;
  if (context.state.serviceTimers[key]) {
    clearTimeout(context.state.serviceTimers[key]);
  }
  const timeout = setTimeout(async () => {
    const orders = context.getServiceOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || order.paid) return;
    order.status = 'pārsūtīts parādu nodaļai';
    order.updatedAt = Date.now();
    order.history.push({ status: order.status, ts: Date.now(), note: 'Neapmaksāts termiņā' });
    context.updateServiceOrder(order);
    renderServiceOrders();
    const amount = order.price * 0.5 + 5;
    await context.addPayment({
      id: `PAY-${Date.now()}-LATE`,
      type: 'fine',
      amount,
      createdAt: Date.now(),
      status: 'open',
      due: Date.now() + 7 * 24 * 3600 * 1000,
      meta: { reason: 'Neapmaksāts pakalpojums' }
    });
    const legalCase = createCaseFromPayment({
      id: paymentId,
      type: 'service',
      amount,
      createdAt: Date.now(),
      status: 'open'
    });
    await context.addCase(legalCase);
    context.updateCases();
    context.updatePayments();
    context.showToast(context.getLanguage() === 'lv' ? 'Izveidota lieta par neapmaksātu pakalpojumu.' : 'Создано дело за неоплаченный заказ.');
  }, (60 + Math.random() * 60) * 1000);
  context.state.serviceTimers[key] = timeout;
}

async function updatePayments() {
  const openBody = document.getElementById('open-payments');
  const historyBody = document.getElementById('payment-history');
  const payments = await context.getPayments();
  const profile = context.getProfile();
  openBody.innerHTML = '';
  historyBody.innerHTML = '';
  payments.sort((a, b) => b.createdAt - a.createdAt);
  payments.forEach(payment => {
    const due = payment.due ? new Date(payment.due).toLocaleDateString() : '-';
    if (payment.status === 'open') {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${payment.id}</td>
        <td>${describePaymentType(payment)}</td>
        <td>${payment.amount.toFixed(2)} €</td>
        <td>${translateStatus(payment.status)}</td>
        <td>${due}</td>
        <td>
          <button class="secondary" data-action="pay">${context.getLanguage() === 'lv' ? 'Apmaksāt' : 'Оплатить'}</button>
          <button class="secondary" data-action="later">${context.getLanguage() === 'lv' ? 'Apmaksāt vēlāk' : 'Позже'}</button>
        </td>
      `;
      const payBtn = row.querySelector('[data-action="pay"]');
      const laterBtn = row.querySelector('[data-action="later"]');
      payBtn.disabled = (profile.balance || 0) < payment.amount;
      payBtn.addEventListener('click', () => payPayment(payment));
      laterBtn.addEventListener('click', () => deferPayment(payment));
      openBody.appendChild(row);
    } else {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(payment.createdAt).toLocaleString()}</td>
        <td>${describePaymentType(payment)}</td>
        <td>${payment.amount.toFixed(2)} €</td>
        <td>${translateStatus(payment.status)}</td>
      `;
      historyBody.appendChild(row);
    }
  });
  context.emit('payments:updated', payments);
}

function renderServiceOrders() {
  const body = document.getElementById('services-orders');
  if (!body) return;
  const orders = context.getServiceOrders();
  body.innerHTML = '';
  orders.sort((a, b) => b.updatedAt - a.updatedAt);
  orders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.title}</td>
      <td>${order.status}</td>
      <td>${new Date(order.updatedAt).toLocaleString()}</td>
    `;
    body.appendChild(row);
  });
}

function describePaymentType(payment) {
  const lang = context.getLanguage();
  const types = {
    service: { lv: 'Pakalpojums', ru: 'Услуга' },
    fine: { lv: 'Sods', ru: 'Штраф' },
    fee: { lv: 'Komisija', ru: 'Комиссия' },
    deposit: { lv: 'Depozīts', ru: 'Депозит' },
    withdraw: { lv: 'Izmaksa', ru: 'Вывод' },
    extra: { lv: 'Papildparāds', ru: 'Доп. долг' },
    refund: { lv: 'Atmaksa', ru: 'Возврат' }
  };
  return types[payment.type]?.[lang] || payment.type;
}

function translateStatus(status) {
  const lang = context.getLanguage();
  const statuses = {
    open: { lv: 'Atvērts', ru: 'Открыт' },
    paid: { lv: 'Samaksāts', ru: 'Оплачен' },
    canceled: { lv: 'Atcelts', ru: 'Отменён' },
    processing: { lv: 'Apstrādē', ru: 'Обрабатывается' },
    declined: { lv: 'Atteikts', ru: 'Отклонён' }
  };
  return statuses[status]?.[lang] || status;
}

async function payPayment(payment) {
  const profile = context.getProfile();
  if ((profile.balance || 0) < payment.amount) {
    showToast(context.getLanguage() === 'lv' ? 'Nepietiek bilances' : 'Недостаточно средств');
    return;
  }
  profile.balance -= payment.amount;
  context.saveProfile(profile);
  payment.status = 'paid';
  payment.paidAt = Date.now();
  await context.addPayment(payment);
  context.pushLog(`Apmaksāts rēķins ${payment.id}`);
  await createPdfDocument('Kvīts', `Maksājums ${payment.id}`, payment.amount);
  showToast(context.getLanguage() === 'lv' ? 'Maksājums reģistrēts. Tiek gaidīta apstrāde.' : 'Ваш платёж зарегистрирован. Ожидается обработка.');
  if (payment.relatedService) {
    const orders = context.getServiceOrders();
    const order = orders.find(o => o.id === payment.relatedService);
    if (order) {
      order.paid = true;
      order.status = 'apstrādē';
      order.updatedAt = Date.now();
      order.history.push({ status: 'apstrādē', ts: Date.now(), note: 'Maksājums apstiprināts' });
      context.updateServiceOrder(order);
      renderServiceOrders();
      scheduleServiceProgress(order.id, { minDays: order.deadlines.min, maxDays: order.deadlines.max });
    }
  }
  updatePayments();
  renderDashboard();
  context.emit('payments:paid', payment);
}

async function deferPayment(payment) {
  payment.status = 'open';
  payment.deferred = true;
  await context.addPayment(payment);
  const legalCase = createCaseFromPayment(payment);
  await context.addCase(legalCase);
  context.pushLog(`Apmaksas atlikšana ${payment.id}, lieta ${legalCase.id}`);
  context.registerNotice('Lieta nosūtīta tiesai', `Sēde ieplānota pēc 30 dienām (${legalCase.id})`, 'warn', legalCase.id);
  scheduleCaseProgress(legalCase.id, 'nosūtīts tiesai');
  updateCases();
  if (payment.relatedService) {
    const orders = context.getServiceOrders();
    const order = orders.find(o => o.id === payment.relatedService);
    if (order) {
      order.status = 'gaida tiesu';
      order.updatedAt = Date.now();
      order.history.push({ status: 'gaida tiesu', ts: Date.now(), note: 'Apmaksa atlikta' });
      context.updateServiceOrder(order);
      renderServiceOrders();
    }
  }
  showToast(context.getLanguage() === 'lv' ? 'Lieta nosūtīta tiesai. Sēde ieplānota pēc 30 dienām.' : 'Дело направлено в суд. Заседание назначено через 30 дней.');
}

function createCaseFromPayment(payment) {
  const id = `L-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 99999)}`;
  return {
    id,
    basis: payment.type === 'service' ? 'Neapmaksāts pakalpojums' : 'Administratīvais pārkāpums',
    amount: payment.amount,
    status: 'nosūtīts tiesai',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hearingAt: Date.now() + 30 * 24 * 3600 * 1000,
    sanctions: [],
    docs: [],
    relatedPaymentId: payment.id,
    history: [{ status: 'nosūtīts tiesai', ts: Date.now(), note: 'Apmaksas atlikšana' }]
  };
}

async function scheduleCaseProgress(caseId, startStatus) {
  const steps = ['izskatīšanā', 'pārsūtīts', 'nosūtīts tiesai', 'tiesas sēde ieplānota', 'spriedums', 'izpilde', 'slēgts'];
  let index = steps.indexOf(startStatus);
  if (index < 0) index = 0;
  const advance = async () => {
    index += 1;
    if (index >= steps.length) return;
    const legalCase = await context.getCase(caseId);
    if (!legalCase) return;
    legalCase.status = steps[index];
    legalCase.updatedAt = Date.now();
    legalCase.history.push({ status: steps[index], ts: Date.now() });
    await context.addCase(legalCase);
    context.emit('cases:updated');
    updateCases();
    if (steps[index] === 'spriedums') {
      applyCaseOutcome(legalCase);
    }
    if (index < steps.length - 1) {
      setTimeout(advance, (30 + Math.random() * 60) * 1000);
    }
  };
  setTimeout(advance, (30 + Math.random() * 60) * 1000);
}

async function applyCaseOutcome(legalCase) {
  const probs = context.getProbabilities();
  const roll = Math.random() * 100;
  let cumulative = probs.relief;
  if (roll < cumulative) {
    const discount = legalCase.amount * (0.1 + Math.random() * 0.5);
    legalCase.sanctions.push({ kind: 'discount', value: discount });
    legalCase.amount = Math.max(0, legalCase.amount - discount);
    context.pushLog(`Lietai ${legalCase.id} piemērota atlaide`);
  } else if (roll < (cumulative += probs.increase)) {
    const increase = legalCase.amount * (0.1 + Math.random());
    legalCase.sanctions.push({ kind: 'extraDebt', value: increase });
    legalCase.amount += increase;
    await createExtraPayment(legalCase, increase);
  } else if (roll < (cumulative += probs.delay)) {
    legalCase.sanctions.push({ kind: 'postpone', value: 15 });
    legalCase.hearingAt = Date.now() + 15 * 24 * 3600 * 1000;
  } else if (roll < (cumulative += probs.arrest)) {
    const until = Date.now() + 3 * 60 * 1000;
    legalCase.sanctions.push({ kind: 'uiArrest', until });
    context.setUiArrest(until);
    context.pushLog(`Piemērots UI arests līdz ${new Date(until).toLocaleString()}`);
  } else if (roll < (cumulative += probs.refund)) {
    const refund = Math.min(legalCase.amount * 0.5, legalCase.amount);
    legalCase.sanctions.push({ kind: 'refund', value: refund });
    await createRefund(refund);
  }
  legalCase.updatedAt = Date.now();
  legalCase.history.push({ status: 'spriedums', ts: Date.now(), note: 'Rezultāts piemērots' });
  await context.addCase(legalCase);
  context.emit('cases:updated');
}

async function createExtraPayment(legalCase, amount) {
  const payment = {
    id: `PAY-${Date.now()}-EXTRA`,
    type: 'extra',
    amount,
    createdAt: Date.now(),
    status: 'open',
    due: Date.now() + 7 * 24 * 3600 * 1000,
    relatedCaseId: legalCase.id
  };
  await context.addPayment(payment);
  updatePayments();
  context.registerNotice('Papildparāds', `Lieta ${legalCase.id}: ${amount.toFixed(2)} €`, 'critical');
}

async function createRefund(amount) {
  const profile = context.getProfile();
  profile.balance += amount;
  context.saveProfile(profile);
  const payment = {
    id: `PAY-${Date.now()}-REF`,
    type: 'refund',
    amount,
    createdAt: Date.now(),
    status: 'paid'
  };
  await context.addPayment(payment);
  updatePayments();
  renderDashboard();
}

async function updateCases() {
  const list = document.getElementById('cases-list');
  list.innerHTML = '';
  const cases = await context.getCases();
  cases.sort((a, b) => b.createdAt - a.createdAt);
  cases.forEach(legalCase => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${legalCase.id}</h3>
      <p>${legalCase.basis}</p>
      <p>${context.getLanguage() === 'lv' ? 'Statuss' : 'Статус'}: ${legalCase.status}</p>
      <p>${context.getLanguage() === 'lv' ? 'Summa' : 'Сумма'}: ${legalCase.amount.toFixed(2)} €</p>
      <button class="primary">${context.getLanguage() === 'lv' ? 'Detalizēti' : 'Подробнее'}</button>
    `;
    card.querySelector('button').addEventListener('click', () => openCaseModal(legalCase));
    list.appendChild(card);
  });
}

function openCaseModal(legalCase) {
  const modal = document.getElementById('case-detail');
  const overlay = document.getElementById('modal-layer');
  document.getElementById('case-detail-title').textContent = legalCase.id;
  const body = document.getElementById('case-detail-body');
  body.innerHTML = `
    <p>${legalCase.basis}</p>
    <p>${context.getLanguage() === 'lv' ? 'Summa' : 'Сумма'}: ${legalCase.amount.toFixed(2)} €</p>
    <p>${context.getLanguage() === 'lv' ? 'Statuss' : 'Статус'}: ${legalCase.status}</p>
    <p>${context.getLanguage() === 'lv' ? 'Vēsture' : 'История'}:</p>
    <ul>${legalCase.history.map(h => `<li>${new Date(h.ts).toLocaleString()}: ${h.status}${h.note ? ' - ' + h.note : ''}</li>`).join('')}</ul>
  `;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  modal.dataset.caseId = legalCase.id;
}

document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', closeModal);
});

document.getElementById('modal-layer').addEventListener('click', closeModal);

function closeModal() {
  document.getElementById('modal-layer').classList.add('hidden');
  document.getElementById('case-detail').classList.add('hidden');
}

context.closeModal = closeModal;

context.emit('context:ready', context);

async function renderDocuments() {
  const list = document.getElementById('documents-list');
  if (!list) return;
  const docs = await context.getDocuments();
  const notices = context.getNotices();
  list.innerHTML = '';
  notices.forEach(notice => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${notice.title}</h3>
      <p>${notice.body}</p>
      <p>${new Date(notice.ts).toLocaleString()}</p>
    `;
    list.appendChild(card);
  });
  docs.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'card';
    const buttonText = context.getLanguage() === 'lv' ? 'Lejupielādēt PDF' : 'Скачать PDF';
    card.innerHTML = `
      <h3>${doc.title}</h3>
      <p>${doc.body}</p>
      <button class="primary">${buttonText}</button>
    `;
    card.querySelector('button').addEventListener('click', () => downloadBlob(doc));
    list.appendChild(card);
  });
}

async function createPdfDocument(title, body, amount) {
  const content = `PDF DEMO\n${title}\n${body}\nSumma: ${amount.toFixed(2)} €\nParaksts: eParaksts+ DEMO`;
  const doc = {
    id: `DOC-${Date.now()}`,
    title,
    body: `${body} (${new Date().toLocaleString()})`,
    createdAt: Date.now(),
    data: content
  };
  await context.addDocument(doc);
  renderDocuments();
  return doc;
}

function downloadBlob(doc) {
  const blob = new Blob([doc.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

context.createPdfDocument = createPdfDocument;
context.downloadBlob = downloadBlob;

function scheduleRandomFine() {
  if (context.randomFineTimer) {
    clearTimeout(context.randomFineTimer);
  }
  const delay = (60 + Math.random() * 120) * 1000;
  context.randomFineTimer = setTimeout(async () => {
    if (Math.random() < 0.25) {
      const amount = 1.5 + Math.random() * 3;
      const payment = {
        id: `PAY-${Date.now()}-RAND`,
        type: 'fine',
        amount,
        createdAt: Date.now(),
        status: 'open',
        due: Date.now() + 5 * 24 * 3600 * 1000,
        meta: { reason: 'Administratīvais brīdinājums' }
      };
      await context.addPayment(payment);
      context.registerNotice('Administratīvais brīdinājums', `Maksājums ${payment.amount.toFixed(2)} €`, 'warn');
      showToast(context.getLanguage() === 'lv' ? 'Reģistrēts administratīvais maksājums par datu apstrādi.' : 'Зарегистрирован административный платёж за обработку данных.');
      updatePayments();
    }
    scheduleRandomFine();
  }, delay);
}

context.getContext = () => context;

export { context };
