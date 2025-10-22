(function () {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const loginSection = document.getElementById('login-section');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');
  const dashboardCards = document.getElementById('dashboard-cards');
  const servicesList = document.getElementById('services-list');
  const convictionList = document.getElementById('conviction-list');
  const refreshConvictionsBtn = document.getElementById('refresh-convictions');
  const downloadConvictionsBtn = document.getElementById('download-convictions');
  const paymentsHistory = document.getElementById('payments-history');
  const topupButtons = document.querySelectorAll('.topup-buttons button');
  const activityLog = document.getElementById('activity-log');
  const chatForm = document.getElementById('chat-form');
  const chatLog = document.getElementById('chat-log');
  const chatInput = document.getElementById('chat-input');
  const notificationBox = document.getElementById('notification');
  const appealModal = document.getElementById('appeal-modal');
  const appealForm = document.getElementById('appeal-form');
  const closeAppealBtn = document.getElementById('close-appeal');
  const appealMessageInput = document.getElementById('appeal-message');
  const appealIdInput = document.getElementById('appeal-id');
  const welcomeTitle = document.getElementById('welcome-title');
  const walletBalance = document.getElementById('wallet-balance');
  const userTagline = document.getElementById('user-tagline');
  const userAvatar = document.getElementById('user-avatar');
  const logo = document.getElementById('logo');
  const easterEggText = document.getElementById('easter-egg');
  const langButtons = document.querySelectorAll('.language-switcher button');

  let currentUser = Auth.getCurrentUser();
  let currentLang = 'lv';
  let logoClickCount = 0;

  const translations = {
    lv: {
      'header.title': 'Latvijas E-pakalpojumi',
      'header.subtitle': 'oficiālā neoficiālā versija',
      'nav.dashboard': 'Panelis',
      'nav.services': 'Pakalpojumi',
      'nav.convictions': 'Ieraksti',
      'nav.payments': 'Maksājumi',
      'nav.history': 'Vēsture',
      'nav.support': 'Atbalsts',
      'login.title': 'Drošais pieslēgšanās portāls*',
      'login.notice': '*Drošība ir relatīva. Šis ir parodijas projekts. Visi dati ir izdomāti.',
      'login.username': 'Lietotājvārds',
      'login.password': 'Parole',
      'login.submit': 'Ienākt',
      'login.testUsers': 'Testa lietotāji: <strong>janis.berzins / 1234</strong>, <strong>evita.liepina / 1234</strong>.',
      'global.disclaimer': 'Šis ir parodijas projekts. Visi dati ir izdomāti.',
      'dashboard.welcome': 'Sveicināts!',
      'dashboard.tagline': '"Valsts pakalpojumi ar humora pieskaņu."',
      'dashboard.logout': 'Izlogoties',
      'dashboard.clear': 'Notīrīt datus',
      'services.title': 'Pakalpojumi',
      'services.notice': 'Šis ir humoristisks saturs. Pakalpojumi ir tikai idejiski.',
      'convictions.title': 'Ieraksti par tevi',
      'convictions.disclaimer': 'Šis ir humoristisks saturs. Ieraksti nav reāli.',
      'convictions.notice': 'Šie ir izdomāti ieraksti humora dēļ. Lūdzu, neņemiet nopietni, pat ja nedaudz atbilst patiesībai.',
      'convictions.refresh': 'Atjaunot ierakstus',
      'convictions.download': 'Lejupielādēt PDF ar ierakstiem',
      'convictions.date': 'Datums',
      'convictions.status': 'Statuss',
      'convictions.priority.label': 'Prioritāte',
      'convictions.priority.low': 'Zema',
      'convictions.priority.medium': 'Vidēja',
      'convictions.priority.high': 'Augsta',
      'convictions.appeal': 'Apstrīdēt',
      'convictions.tooltip': 'Ja šis šķiet patiesība — mēs nedaudz nožēlojam.',
      'payments.title': 'Maksājumi',
      'payments.notice': 'Maksājumi ir tikai vizuāli. Jūsu reālais maciņš ir drošībā (cerams).',
      'payments.add5': 'Pievienot 5 €',
      'payments.add10': 'Pievienot 10 €',
      'payments.add20': 'Pievienot 20 €',
      'payments.historyTitle': 'Maksājumu vēsture',
      'history.title': 'Darbību vēsture',
      'history.notice': 'Katrs klikšķis tiek reģistrēts. Simulēti ieraksti tikai humoram.',
      'support.title': 'Atbalsta čatbots',
      'support.notice': 'Jautājiet jebko. Atbilžu nopietnība nav garantēta.',
      'support.placeholder': 'Rakstiet jautājumu...',
      'support.send': 'Nosūtīt',
      'footer.diploma': 'Diploms par pacietību piešķirts!',
      'appeal.title': 'Apstrīdēt ierakstu',
      'appeal.notice': 'Šī ir simulēta sūdzība. Patiesībā neviens to nepārskatīs.',
      'appeal.reason': 'Pamatojums',
      'appeal.submit': 'Iesniegt apstrīdēšanu',
      'notification.cleared': 'Dati dzēsti. Bet vai tiešām?',
      'notification.loginError': 'Nederīgs lietotājvārds vai parole (bet mēs nevienam neteiksim).',
      'notification.loginSuccess': 'Veiksmīga pieslēgšanās humora departamentam.',
      'notification.appealSubmitted': 'Apstrīdēšana iesniegta. Tuvākajā laikā tiks ignorēta.',
      'notification.paymentAdded': 'Maksājuma simulācija pievienota.'
    },
    en: {
      'header.title': 'Latvian E-services',
      'header.subtitle': 'official unofficial version',
      'nav.dashboard': 'Dashboard',
      'nav.services': 'Services',
      'nav.convictions': 'Records',
      'nav.payments': 'Payments',
      'nav.history': 'History',
      'nav.support': 'Support',
      'login.title': 'Secure-ish login portal*',
      'login.notice': '*Security is relative. This is a parody project. All data is fictional.',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.submit': 'Sign in',
      'login.testUsers': 'Test users: <strong>janis.berzins / 1234</strong>, <strong>evita.liepina / 1234</strong>.',
      'global.disclaimer': 'This is a parody project. All data is made up.',
      'dashboard.welcome': 'Welcome!',
      'dashboard.tagline': '"Government services with a dash of humour."',
      'dashboard.logout': 'Log out',
      'dashboard.clear': 'Clear data',
      'services.title': 'Services',
      'services.notice': 'This is humorous content. Services are purely conceptual.',
      'convictions.title': 'Records about you',
      'convictions.disclaimer': 'This is humorous content. Records are not real.',
      'convictions.notice': 'These records are invented for humour. Please do not take them seriously, even if they feel accurate.',
      'convictions.refresh': 'Regenerate records',
      'convictions.download': 'Download records PDF',
      'convictions.date': 'Date',
      'convictions.status': 'Status',
      'convictions.priority.label': 'Priority',
      'convictions.priority.low': 'Low',
      'convictions.priority.medium': 'Medium',
      'convictions.priority.high': 'High',
      'convictions.appeal': 'Appeal',
      'convictions.tooltip': 'If this feels true — we are slightly sorry.',
      'payments.title': 'Payments',
      'payments.notice': 'Payments are for show only. Your real wallet is (hopefully) safe.',
      'payments.add5': 'Add €5',
      'payments.add10': 'Add €10',
      'payments.add20': 'Add €20',
      'payments.historyTitle': 'Payment history',
      'history.title': 'Activity history',
      'history.notice': 'Every click is logged. Simulated entries purely for humour.',
      'support.title': 'Support chatbot',
      'support.notice': 'Ask anything. Serious answers not guaranteed.',
      'support.placeholder': 'Type your question...',
      'support.send': 'Send',
      'footer.diploma': 'Diploma for patience awarded!',
      'appeal.title': 'Appeal record',
      'appeal.notice': 'This is a simulated complaint. Nobody will actually review it.',
      'appeal.reason': 'Justification',
      'appeal.submit': 'Submit appeal',
      'notification.cleared': 'Data wiped. Or was it?',
      'notification.loginError': 'Invalid username or password (we will not tell anyone).',
      'notification.loginSuccess': 'Successfully connected to the humour department.',
      'notification.appealSubmitted': 'Appeal submitted. It will be ignored shortly.',
      'notification.paymentAdded': 'Payment simulation added.'
    }
  };

  const services = [
    {
      icon: '🛂',
      lv: 'E-pases pieteikums ar improvizācijas elementiem',
      en: 'E-passport application with improvisation elements',
      detailsLv: 'Iesniedziet foto, kas atgādina jums pašiem vismaz 51%.',
      detailsEn: 'Submit a photo resembling yourself by at least 51%.'
    },
    {
      icon: '🍼',
      lv: 'Iedomātā pabalsta pieteikums par īpašu pacietību',
      en: 'Imaginary allowance for exceptional patience',
      detailsLv: 'Saņemiet sertifikātu par mieru rindā stāvēšanā.',
      detailsEn: 'Receive a certificate for calm queue standing.'
    },
    {
      icon: '🚗',
      lv: 'Skrejriteņu pārreģistrācija uz kosmosa ekspluatāciju',
      en: 'Scooter re-registration for space operations',
      detailsLv: 'Nepieciešams kosmiskais ķiveres selfijs.',
      detailsEn: 'Requires a selfie wearing a space helmet.'
    },
    {
      icon: '🏛️',
      lv: 'Mazās valdības simulators',
      en: 'Mini-government simulator',
      detailsLv: 'Pārvaldiet vienu kaimiņu un vienu kaķi likuma ietvaros.',
      detailsEn: 'Manage one neighbour and one cat within legal frames.'
    },
    {
      icon: '🎓',
      lv: 'Diploms par pasīvo dalību sabiedriskajos procesos',
      en: 'Diploma for passive participation in civic processes',
      detailsLv: 'Pietiek piekrist vismaz trīs reizes gadā.',
      detailsEn: 'Agree at least three times a year to qualify.'
    }
  ];

  function t(key) {
    return translations[currentLang][key] || translations.lv[key] || key;
  }

  function updateTexts() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang] && translations[currentLang][key]) {
        el.innerHTML = translations[currentLang][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[currentLang] && translations[currentLang][key]) {
        el.setAttribute('placeholder', translations[currentLang][key]);
      }
    });
    renderServices();
    if (currentUser) {
      populateDashboard();
      renderConvictions();
      renderPayments();
      renderActivity();
      updateDashboard();
    }
  }

  function showSection(id) {
    sections.forEach((section) => {
      section.classList.toggle('active', section.id === id);
    });
  }

  function showNotification(message) {
    notificationBox.textContent = message;
    notificationBox.classList.add('show');
    setTimeout(() => notificationBox.classList.remove('show'), 3000);
  }

  function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      Auth.login(username, password);
      currentUser = Auth.getCurrentUser();
      Profile.ensureProfile(currentUser.user);
      Profile.pushHistory(currentUser.user, 'Pieslēgšanās portālam (simulācija).');
      updateTexts();
      populateDashboard();
      renderServices();
      renderConvictions();
      renderPayments();
      renderActivity();
      updateDashboard();
      loginSection.classList.remove('active');
      showSection('dashboard');
      document.body.classList.add('authenticated');
      showNotification(t('notification.loginSuccess'));
    } catch (error) {
      showNotification(t('notification.loginError'));
    }
  }

  function handleLogout() {
    Auth.logout();
    currentUser = null;
    document.body.classList.remove('authenticated');
    showSection('login-section');
  }

  function populateDashboard() {
    dashboardCards.innerHTML = '';
    const cards = [
      {
        icon: '📘',
        lv: 'Valsts dokumentu bibliotēka — visas instrukcijas vienā 934 lappušu dokumentā.',
        en: 'State document library — every instruction in a single 934-page file.'
      },
      {
        icon: '💬',
        lv: 'Oficiālais čatbots: atbildes ar 42% precizitāti, 100% humoru.',
        en: 'Official chatbot: answers 42% precise, 100% humorous.'
      },
      {
        icon: '🗂️',
        lv: 'Elektroniskā lietvedība: izmantojiet mapes kā dekoru.',
        en: 'Electronic filing: use folders as décor pieces.'
      }
    ];
    cards.forEach((card) => {
      const element = document.createElement('div');
      element.className = 'conviction-card';
      element.innerHTML = `
        <div class="priority low"><span>${card.icon}</span> <span>${currentLang === 'lv' ? 'Informācija' : 'Information'}</span></div>
        <p>${currentLang === 'lv' ? card.lv : card.en}</p>
      `;
      dashboardCards.appendChild(element);
    });
  }

  function renderServices() {
    servicesList.innerHTML = '';
    services.forEach((service) => {
      const card = document.createElement('div');
      card.className = 'conviction-card';
      card.innerHTML = `
        <div class="priority medium"><span>${service.icon}</span> <span>${currentLang === 'lv' ? 'Pakalpojums' : 'Service'}</span></div>
        <h3>${currentLang === 'lv' ? service.lv : service.en}</h3>
        <p>${currentLang === 'lv' ? service.detailsLv : service.detailsEn}</p>
      `;
      servicesList.appendChild(card);
    });
  }

  function renderConvictions() {
    if (!currentUser) return;
    const records = Convictions.getRecords(currentUser.user);
    convictionList.innerHTML = '';
    const tooltip = t('convictions.tooltip');
    records.forEach((record) => {
      const statusText = currentLang === 'lv' ? record.statusLv : record.statusEn;
      const description = currentLang === 'lv' ? record.lv : record.en;
      const priorityText = t(`convictions.priority.${record.priority}`);
      const card = document.createElement('div');
      card.className = `conviction-card`;
      card.title = tooltip;
      card.innerHTML = `
        <div class="priority ${record.priority}"><span>⚖️</span> <span>${priorityText}</span></div>
        <h3>${description}</h3>
        <p><strong>${t('convictions.date')}:</strong> ${record.date}</p>
        <p><span class="status-chip status-${record.status}">${statusText}</span></p>
        <button class="secondary appeal-btn" data-id="${record.id}">${t('convictions.appeal')}</button>
      `;
      convictionList.appendChild(card);
    });
    convictionList.querySelectorAll('.appeal-btn').forEach((btn) => {
      btn.addEventListener('click', () => openAppealModal(btn.getAttribute('data-id')));
    });
  }

  function renderPayments() {
    if (!currentUser) return;
    const payments = Payments.getPayments(currentUser.user);
    paymentsHistory.innerHTML = '';
    payments.forEach((payment) => {
      const li = document.createElement('li');
      const message = currentLang === 'lv' ? payment.messageLv : payment.messageEn;
      li.textContent = `${new Date(payment.timestamp).toLocaleString()} — ${message}`;
      paymentsHistory.appendChild(li);
    });
  }

  function renderActivity() {
    if (!currentUser) return;
    const history = Profile.getHistory(currentUser.user);
    activityLog.innerHTML = '';
    history.forEach((entry) => {
      const li = document.createElement('li');
      const date = new Date(entry.timestamp).toLocaleString();
      li.textContent = `${date} — ${entry.message}`;
      activityLog.appendChild(li);
    });
  }

  function updateDashboard() {
    if (!currentUser) return;
    const profile = Profile.getProfile(currentUser.user);
    welcomeTitle.textContent = currentLang === 'lv' ? `Sveiks, ${currentUser.name}!` : `Hello, ${currentUser.name}!`;
    walletBalance.textContent = `${Profile.getWallet(currentUser.user).toFixed(2)} €`;
    userTagline.textContent = currentLang === 'lv' ? profile.tagline : '"Government services with a dash of humour."';
    userAvatar.src = profile.avatar || 'assets/img/avatar-placeholder.svg';
  }

  function handleTopup(event) {
    const amount = Number(event.target.getAttribute('data-amount'));
    if (!currentUser || isNaN(amount)) return;
    Payments.addPayment(currentUser.user, amount);
    renderPayments();
    updateDashboard();
    renderActivity();
    showNotification(t('notification.paymentAdded'));
  }

  function openAppealModal(id) {
    appealIdInput.value = id;
    appealMessageInput.value = '';
    appealModal.classList.add('active');
    appealModal.setAttribute('aria-hidden', 'false');
  }

  function closeAppealModal() {
    appealModal.classList.remove('active');
    appealModal.setAttribute('aria-hidden', 'true');
  }

  function handleAppealSubmit(event) {
    event.preventDefault();
    if (!currentUser) return;
    const id = appealIdInput.value;
    const message = appealMessageInput.value.trim();
    if (!message) return;
    Convictions.saveAppeal(currentUser.user, { convictionId: id, message });
    Profile.pushHistory(currentUser.user, `Apstrīdēts ieraksts ${id}.`);
    closeAppealModal();
    showNotification(t('notification.appealSubmitted'));
    chatLog.insertAdjacentHTML('beforeend', `<div class="chat-message bot">${currentLang === 'lv' ? 'Jūsu apstrīdēšana tika nosūtīta sapņu komisijai.' : 'Your appeal has been forwarded to the dream committee.'}</div>`);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function handleChatSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
      showNotification(t('notification.loginError'));
      return;
    }
    const text = chatInput.value.trim();
    if (!text) return;
    chatLog.insertAdjacentHTML('beforeend', `<div class="chat-message user">${text}</div>`);
    const reply = Chatbot.getResponse(text, currentLang);
    setTimeout(() => {
      chatLog.insertAdjacentHTML('beforeend', `<div class="chat-message bot">${reply}</div>`);
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 400);
    chatInput.value = '';
    Profile.pushHistory(currentUser.user, 'Sazinājās ar čatbotu.');
    renderActivity();
  }

  function handleRefreshConvictions() {
    if (!currentUser) return;
    Convictions.refreshRecords(currentUser.user);
    Profile.pushHistory(currentUser.user, 'Atjaunoti humoristiskie sodījumi.');
    renderConvictions();
    renderActivity();
  }

  function handleDownloadConvictions() {
    if (!currentUser) return;
    const records = Convictions.getRecords(currentUser.user);
    const lines = records.map((record, index) => {
      const description = currentLang === 'lv' ? record.lv : record.en;
      const status = currentLang === 'lv' ? record.statusLv : record.statusEn;
      return `${index + 1}. ${description} — ${status} (${record.date})`;
    });
    const disclaimer = t('global.disclaimer');
    const blob = new Blob([`${disclaimer}\n\n${lines.join('\n')}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ieraksti-parodija.pdf';
    a.click();
    URL.revokeObjectURL(url);
    Profile.pushHistory(currentUser.user, 'Lejupielādēts humoristiskais PDF.');
    renderActivity();
  }

  function handleClearData() {
    if (!currentUser) return;
    const userId = currentUser.user;
    Profile.clearProfileData(userId);
    Payments.reset(userId);
    localStorage.removeItem('current_user');
    showNotification(t('notification.cleared'));
    setTimeout(() => window.location.reload(), 600);
  }

  function setLanguage(lang) {
    currentLang = lang;
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    updateTexts();
  }

  function initNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const section = link.getAttribute('data-section');
        if (!currentUser) {
          showSection('login-section');
        } else {
          showSection(section);
        }
      });
    });
  }

  function initLanguageSwitcher() {
    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
      });
    });
  }

  function initLogoEasterEgg() {
    logo.addEventListener('click', () => {
      logoClickCount += 1;
      if (logoClickCount === 7) {
        easterEggText.hidden = false;
        if (currentUser) {
          Profile.pushHistory(currentUser.user, 'Izpildīts pacietības tests ar logo.');
          renderActivity();
        }
        showNotification(currentLang === 'lv' ? 'Apsveicam! Pacietības diploms piešķirts.' : 'Congrats! Patience diploma granted.');
      }
    });
  }

  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  clearDataBtn.addEventListener('click', handleClearData);
  refreshConvictionsBtn.addEventListener('click', handleRefreshConvictions);
  downloadConvictionsBtn.addEventListener('click', handleDownloadConvictions);
  topupButtons.forEach((btn) => btn.addEventListener('click', handleTopup));
  chatForm.addEventListener('submit', handleChatSubmit);
  closeAppealBtn.addEventListener('click', closeAppealModal);
  appealModal.addEventListener('click', (event) => {
    if (event.target === appealModal) {
      closeAppealModal();
    }
  });
  appealForm.addEventListener('submit', handleAppealSubmit);
  initNavigation();
  initLanguageSwitcher();
  initLogoEasterEgg();

  if (currentUser) {
    Profile.ensureProfile(currentUser.user);
    populateDashboard();
    updateTexts();
    renderConvictions();
    renderPayments();
    renderActivity();
    updateDashboard();
    showSection('dashboard');
    document.body.classList.add('authenticated');
  } else {
    updateTexts();
    showSection('login-section');
  }
})();
