(function (global) {
  const STORAGE_KEY_PREFIX = 'convictions_';
  const APPEALS_KEY_PREFIX = 'appeals_';

  const baseRecords = [
    { lv: 'Pārkāpa rindā bibliotēkā', en: 'Cut the line in a library', priority: 'low' },
    { lv: 'Nelikumīga siera krājumu uzglabāšana', en: 'Illegal cheese stockpiling', priority: 'medium' },
    { lv: 'Uzstādīja privātu hefteri pilsētas laukumā bez atļaujas', en: 'Installed a private stapler monument without permit', priority: 'medium' },
    { lv: 'Pārsniedza ātrumu ar skrejriteni', en: 'Exceeded speed limit on an e-scooter', priority: 'high' },
    { lv: 'Aizmirsa atdot bibliotēkas grāmatu 5 gadu laikā', en: 'Forgot to return a library book for 5 years', priority: 'medium' },
    { lv: 'Sarakstīja mīlestības dzeju uz pašvaldības sienas', en: 'Wrote love poetry on a municipal wall', priority: 'medium' },
    { lv: 'Negodprātīga pankūku cepšana sabiedriskā pasākumā', en: 'Dishonest pancake baking at a public event', priority: 'low' },
    { lv: 'Neapmaksāts kases kvīts par 0.99 € — sistemātisks', en: 'Unpaid receipt for €0.99 — systematic', priority: 'high' },
    { lv: 'Gandrīz kļuva par ministru, bet aizmiga', en: 'Almost became a minister but fell asleep', priority: 'low' },
    { lv: 'Sūdzība par pārāk skaļu smīnu naktī', en: 'Complaint about overly loud chuckling at night', priority: 'medium' },
    { lv: 'Aizmirsa izslēgt sevi no Zoom', en: 'Forgot to leave a Zoom meeting of themselves', priority: 'low' },
    { lv: 'Iekļuva attēlā bez maskas muzeja skaidrojuma laikā', en: 'Appeared maskless in a museum tour photo', priority: 'medium' },
    { lv: 'Pārkāpa mājas klusuma režīmu ar ukuleles solo', en: 'Violated home quiet hours with a ukulele solo', priority: 'medium' },
    { lv: 'Neoficiāla pergamenta izgatavošana', en: 'Unofficial parchment crafting', priority: 'low' },
    { lv: 'Apbildināšana par pārāk daudz selfijiem pie Brīvības pieminekļa', en: 'Charged for excessive selfies at the Freedom Monument', priority: 'medium' },
    { lv: 'Piesavinājās pašvaldības pildspalvu kolekciju', en: 'Appropriated the municipality pen collection', priority: 'medium' },
    { lv: 'Organizēja neautorizētu gaisa buķešu parādi', en: 'Organised an unauthorized air bouquet parade', priority: 'medium' },
    { lv: 'Nepareizi aizpildīja laimes nodokļa deklarāciju', en: 'Filed the happiness tax declaration incorrectly', priority: 'high' },
    { lv: 'Aizmirsa pieslēgties attālinātajai sanāksmei, jo bija citā attālinātā sanāksmē', en: 'Missed an online meeting due to another online meeting', priority: 'low' },
    { lv: 'Neievēroja kaktusu laistīšanas grafiku pašvaldības birojā', en: 'Ignored the cactus watering schedule at the municipal office', priority: 'medium' },
    { lv: 'Nelegāls tamborēšanas pulciņš bez licences', en: 'Illegal crocheting club without a license', priority: 'medium' },
    { lv: 'Pārsūtīja valsts mēroga memi bez anotācijas', en: 'Forwarded a state-level meme without annotation', priority: 'low' },
    { lv: 'Neatļauta dvieļu rezervācija pludmales solārijā', en: 'Unauthorized towel reservation at the beach solarium', priority: 'medium' },
    { lv: 'Deklarēja dzīvesvietu piknika grozā', en: 'Declared residency in a picnic basket', priority: 'high' },
    { lv: 'Snauda valdības preses konferencē pirmajā rindā', en: 'Dozed off in the first row of a government press conference', priority: 'low' },
    { lv: 'Patvaļīgi piešķīra sev titulu "Galvenais iedzīvotājs"', en: 'Self-appointed the title "Chief Resident"', priority: 'medium' },
    { lv: 'Uzskatīja birojā esošo printeri par savējo', en: 'Assumed office printer ownership', priority: 'medium' },
    { lv: 'Nepamatoti bieža uzslavas "labi padarīts" izmantošana', en: 'Unreasonably frequent use of the praise "well done"', priority: 'low' },
    { lv: 'Organizēja sapulci bez prezentācijas, bet ar orķestri', en: 'Organised a meeting without slides but with an orchestra', priority: 'high' },
    { lv: 'Nelegāli eksperimentēja ar biroja krēslu rotāciju', en: 'Illegally experimented with office chair rotation', priority: 'medium' },
    { lv: 'Mainīja parakstu katru reizi atkarībā no laikapstākļiem', en: 'Changed signature according to weather conditions', priority: 'low' },
    { lv: 'Pašrocīgi izdeva sev komandējuma rīkojumu uz Mēnesi', en: 'Issued a self-authorised business trip to the Moon', priority: 'high' }
  ];

  const statusOptions = [
    { code: 'Closed', lv: 'Slēgts', en: 'Closed' },
    { code: 'Active', lv: 'Aktīvs', en: 'Active' },
    { code: 'Appealed', lv: 'Pārsūdzēts', en: 'Appealed' }
  ];

  function randomDateWithinYears(years) {
    const now = Date.now();
    const range = years * 365 * 24 * 60 * 60 * 1000;
    const timestamp = now - Math.floor(Math.random() * range);
    return new Date(timestamp);
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function pickStatus() {
    return statusOptions[Math.floor(Math.random() * statusOptions.length)];
  }

  function generateRecordsForUser(user) {
    const mustInclude = baseRecords.slice(0, 10);
    const others = baseRecords.slice(10);
    const selected = [...mustInclude];
    while (selected.length < 16) {
      const candidate = others[Math.floor(Math.random() * others.length)];
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
    const mapped = selected.map((record, index) => {
      const date = randomDateWithinYears(10);
      const status = pickStatus();
      return {
        id: `${user}-${Date.now()}-${index}-${Math.floor(Math.random() * 9999)}`,
        date: formatDate(date),
        status: status.code,
        statusLv: status.lv,
        statusEn: status.en,
        lv: record.lv,
        en: record.en,
        priority: record.priority
      };
    });
    localStorage.setItem(STORAGE_KEY_PREFIX + user, JSON.stringify(mapped));
    return mapped;
  }

  function getRecords(user) {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + user);
    if (!raw) {
      return generateRecordsForUser(user);
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : generateRecordsForUser(user);
    } catch (error) {
      return generateRecordsForUser(user);
    }
  }

  function refreshRecords(user) {
    return generateRecordsForUser(user);
  }

  function saveAppeal(user, appeal) {
    const key = APPEALS_KEY_PREFIX + user;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(Object.assign({}, appeal, { timestamp: new Date().toISOString() }));
    localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
    return list[0];
  }

  function getAppeals(user) {
    const key = APPEALS_KEY_PREFIX + user;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  global.Convictions = {
    getRecords,
    refreshRecords,
    saveAppeal,
    getAppeals,
    statusOptions
  };
})(window);
