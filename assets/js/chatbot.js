(function (global) {
  const RESPONSES = [
    {
      triggers: ['parole', 'password'],
      lv: 'Paroles atcerēties nav obligāti, bet iesakām pierakstīt uz kartupeļa.',
      en: 'Remembering passwords is optional here, but we suggest carving it into a potato.'
    },
    {
      triggers: ['nodok', 'tax'],
      lv: 'Nodokļu jautājumos konsultējieties ar tuvāko humora speciālistu.',
      en: 'For tax questions consult your nearest humour specialist.'
    },
    {
      triggers: ['sodi', 'fine'],
      lv: 'Sodījumi ir izdomāti. Ja jūtaties vainīgs, tas ir tikai nejaušība.',
      en: 'Convictions are fictional. If you feel guilty, it is purely coincidental.'
    },
    {
      triggers: ['palīdz', 'help'],
      lv: 'Palīdzības rindā jūs esat pirmais un vienīgais. Mēs jūs atbalstām morāli.',
      en: 'You are first and only in the help queue. Consider yourself morally supported.'
    },
    {
      triggers: ['paldies', 'thanks'],
      lv: 'Paldies atpakaļ! Mūsu virtuālais galds ir pieklājīgi sakārtots.',
      en: 'Thank you back! Our virtual desk is tidily appreciative.'
    }
  ];

  const FALLBACK = [
    {
      lv: 'Jūsu jautājums ir pievienots neesošai prioritāšu rindai.',
      en: 'Your query has been added to a queue of imaginary priorities.'
    },
    {
      lv: 'Mēs pārbaudām datubāzi... atradām tikai smilšu pili.',
      en: 'Checking the database... we only found a sandcastle.'
    },
    {
      lv: 'Atbilde tiks sagatavota nākamās saules aptumsuma laikā.',
      en: 'A reply will be prepared by the next solar eclipse.'
    }
  ];

  function matchResponse(message) {
    const normalized = message.toLowerCase();
    return RESPONSES.find((item) => item.triggers.some((trigger) => normalized.includes(trigger)));
  }

  function getResponse(message, lang) {
    const matched = matchResponse(message);
    if (matched) {
      return matched[lang] || matched.lv;
    }
    const random = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    return random[lang] || random.lv;
  }

  global.Chatbot = {
    getResponse
  };
})(window);
