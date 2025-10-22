import { loadLocal, saveLocal } from './storage.js';

const translations = {
  lv: {
    'header.title': 'ePakalpojumi+ DEMO',
    'header.subtitle': 'Oficiāla simulācija apmācībai',
    'header.logout': 'Izrakstīties',
    'nav.services': 'Pakalpojumi',
    'nav.payments': 'Maksājumi',
    'nav.cases': 'Lietas',
    'nav.casino': 'Kazino',
    'nav.documents': 'Dokumenti',
    'nav.profile': 'Profils',
    'nav.admin': 'Administrators',
    'login.title': 'Droša pieslēgšana',
    'login.demo': 'Demo konts',
    'login.smartId': 'Smart-ID',
    'login.eparaksts': 'eParaksts',
    'login.sms': 'SMS-OTP',
    'login.username': 'Lietotājs',
    'login.password': 'Parole',
    'login.demoHint': 'Pieejams: user/1234 vai admin/1234',
    'login.submit': 'Pieslēgties',
    'login.smartIdPk': 'Personas kods',
    'login.smartIdName': 'Vārds, uzvārds',
    'login.smartIdSubmit': 'Apstiprināt',
    'login.eparakstsId': 'eParaksts ID',
    'login.eparakstsSubmit': 'Parakstīt',
    'login.smsPhone': 'Tālrunis',
    'login.smsSend': 'Sūtīt kodu',
    'login.smsCode': 'Ievadiet kodu',
    'login.smsVerify': 'Apstiprināt',
    'services.title': 'Pakalpojumi',
    'services.subtitle': 'Izvēlieties un piesakiet nepieciešamo pakalpojumu. Viss tiek apstrādāts simulācijā.',
    'payments.title': 'Maksājumi un parādi',
    'payments.balance': 'Bilance:',
    'payments.topup': 'Papildināt bilanci',
    'payments.withdraw': 'Izmaksāt',
    'payments.open': 'Atvērtie maksājumi',
    'payments.history': 'Maksājumu vēsture',
    'profile.title': 'Profils',
    'profile.name': 'Vārds',
    'profile.surname': 'Uzvārds',
    'profile.pk': 'Personas kods',
    'profile.address': 'Deklarētā adrese',
    'profile.email': 'E-pasts',
    'profile.phone': 'Tālrunis',
    'profile.save': 'Saglabāt izmaiņas',
    'profile.restricted': 'Pagaidu ierobežojums',
    'cases.title': 'Lietas un sankcijas',
    'cases.disclaimer': 'Visi tiesvedības dati ir simulēti mācību nolūkiem.',
    'casino.title': 'Kazino "Sekas"',
    'casino.disclaimer': 'Spēles rezultāts ietekmē jūsu simulētos maksājumus un lietas.',
    'casino.roulette': 'Rulete',
    'casino.lottery': 'Loterija',
    'casino.double': 'Double',
    'casino.play': 'Spēlēt',
    'casino.buyTicket': 'Pirkt biļeti (1€)',
    'casino.doublePlay': 'Mēģināt dubultot',
    'casino.history': 'Kazino vēsture',
    'documents.title': 'Dokumenti un paziņojumi',
    'admin.title': 'Administrators',
    'admin.probabilities': 'Izmaiņu varbūtības',
    'admin.triggers': 'Ātrie rīki',
    'admin.triggerFine': 'Ģenerēt jaunu maksu',
    'admin.triggerCase': 'Izveidot lietu',
    'admin.triggerHearing': 'Uzreiz rīkot sēdi',
    'admin.triggerRelease': 'Noņemt UI ierobežojumu',
    'admin.triggerReset': 'Dzēst datus',
    'admin.catalog': 'Pakalpojumu katalogs',
    'admin.logs': 'Žurnāls',
    'modal.cancel': 'Atcelt',
    'modal.confirm': 'Apstiprināt',
    'global.disclaimer': 'Šis ir demonstrācijas režīms. Visi dati ir simulēti.',
    'global.footer': 'Šis ir demonstrācijas režīms. Visi maksājumi un juridiskie rezultāti ir simulēti.',
    'table.date': 'Datums',
    'table.description': 'Apraksts',
    'table.amount': 'Summa',
    'table.status': 'Statuss',
    'table.actions': 'Darbības',
    'table.type': 'Tips'
  },
  ru: {
    'header.title': 'ePakalpojumi+ ДЕМО',
    'header.subtitle': 'Официальная симуляция для обучения',
    'header.logout': 'Выйти',
    'nav.services': 'Услуги',
    'nav.payments': 'Платежи',
    'nav.cases': 'Дела',
    'nav.casino': 'Казино',
    'nav.documents': 'Документы',
    'nav.profile': 'Профиль',
    'nav.admin': 'Администратор',
    'login.title': 'Безопасное подключение',
    'login.demo': 'Демо аккаунт',
    'login.smartId': 'Smart-ID',
    'login.eparaksts': 'eParaksts',
    'login.sms': 'SMS-OTP',
    'login.username': 'Пользователь',
    'login.password': 'Пароль',
    'login.demoHint': 'Доступно: user/1234 или admin/1234',
    'login.submit': 'Войти',
    'login.smartIdPk': 'Персональный код',
    'login.smartIdName': 'Имя, фамилия',
    'login.smartIdSubmit': 'Подтвердить',
    'login.eparakstsId': 'eParaksts ID',
    'login.eparakstsSubmit': 'Подписать',
    'login.smsPhone': 'Телефон',
    'login.smsSend': 'Отправить код',
    'login.smsCode': 'Введите код',
    'login.smsVerify': 'Подтвердить',
    'services.title': 'Услуги',
    'services.subtitle': 'Выберите и закажите услугу. Все процессы выполняются в симуляции.',
    'payments.title': 'Платежи и задолженности',
    'payments.balance': 'Баланс:',
    'payments.topup': 'Пополнить баланс',
    'payments.withdraw': 'Вывести',
    'payments.open': 'Открытые платежи',
    'payments.history': 'История платежей',
    'profile.title': 'Профиль',
    'profile.name': 'Имя',
    'profile.surname': 'Фамилия',
    'profile.pk': 'Персональный код',
    'profile.address': 'Адрес регистрации',
    'profile.email': 'Эл. почта',
    'profile.phone': 'Телефон',
    'profile.save': 'Сохранить изменения',
    'profile.restricted': 'Временное ограничение',
    'cases.title': 'Дела и санкции',
    'cases.disclaimer': 'Все данные судопроизводства являются симуляцией для обучения.',
    'casino.title': 'Казино «Последствия»',
    'casino.disclaimer': 'Результаты игр влияют на ваши симулированные платежи и дела.',
    'casino.roulette': 'Рулетка',
    'casino.lottery': 'Лотерея',
    'casino.double': 'Double',
    'casino.play': 'Играть',
    'casino.buyTicket': 'Купить билет (1€)',
    'casino.doublePlay': 'Попробовать удвоить',
    'casino.history': 'История казино',
    'documents.title': 'Документы и уведомления',
    'admin.title': 'Администратор',
    'admin.probabilities': 'Вероятности исходов',
    'admin.triggers': 'Быстрые действия',
    'admin.triggerFine': 'Сгенерировать новый штраф',
    'admin.triggerCase': 'Создать дело',
    'admin.triggerHearing': 'Провести заседание сейчас',
    'admin.triggerRelease': 'Снять UI-блокировку',
    'admin.triggerReset': 'Очистить данные',
    'admin.catalog': 'Каталог услуг',
    'admin.logs': 'Журнал',
    'modal.cancel': 'Отмена',
    'modal.confirm': 'Подтвердить',
    'global.disclaimer': 'Это демонстрационный режим. Все данные симулированы.',
    'global.footer': 'Это демонстрационный режим. Все платежи и юридические результаты симулированы.',
    'table.date': 'Дата',
    'table.description': 'Описание',
    'table.amount': 'Сумма',
    'table.status': 'Статус',
    'table.actions': 'Действия',
    'table.type': 'Тип'
  }
};

const langKey = 'epakalpojumi_lang';
let currentLang = loadLocal(langKey, 'lv');

export function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    applyTranslation(node, key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    const translation = translations[currentLang]?.[key] ?? translations.lv[key] ?? '';
    node.setAttribute('placeholder', translation);
  });
  document.documentElement.lang = currentLang;
  updateActiveButton();
}

function applyTranslation(node, key) {
  const translation = translations[currentLang]?.[key] ?? translations.lv[key];
  if (translation) {
    node.textContent = translation;
  }
}

function updateActiveButton() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

export function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  saveLocal(langKey, lang);
  initI18n();
}

export function translateFragment(fragment) {
  fragment.querySelectorAll?.('[data-i18n]').forEach((node) => {
    applyTranslation(node, node.dataset.i18n);
  });
}

export function t(key, fallback = '') {
  return translations[currentLang]?.[key] ?? translations.lv[key] ?? fallback;
}

export function getCurrentLang() {
  return currentLang;
}

