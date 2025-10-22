import { context } from './main.js';

export function initPayments(ctx) {
  const adminSection = document.getElementById('admin');
  const sliders = {
    relief: document.getElementById('prob-relief'),
    increase: document.getElementById('prob-increase'),
    delay: document.getElementById('prob-delay'),
    arrest: document.getElementById('prob-arrest'),
    refund: document.getElementById('prob-refund')
  };
  const buttons = {
    fine: document.getElementById('admin-generate-fine'),
    case: document.getElementById('admin-generate-case'),
    hearing: document.getElementById('admin-hold-hearing'),
    release: document.getElementById('admin-release-ui'),
    reset: document.getElementById('admin-reset')
  };
  const logList = document.getElementById('admin-log');

  function applyProbabilities() {
    const prob = ctx.getProbabilities();
    sliders.relief.value = prob.relief;
    sliders.increase.value = prob.increase;
    sliders.delay.value = prob.delay;
    sliders.arrest.value = prob.arrest;
    sliders.refund.value = prob.refund;
  }

  applyProbabilities();

  Object.entries(sliders).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      const prob = ctx.getProbabilities();
      prob[key] = Number(input.value);
      ctx.saveProbabilities(prob);
      ctx.pushLog(`Mainīta ${key} varbūtība uz ${input.value}%`);
    });
  });

  buttons.fine.addEventListener('click', async () => {
    const amount = +(5 + Math.random() * 20).toFixed(2);
    await ctx.addPayment({
      id: `PAY-${Date.now()}-ADMIN`,
      type: 'fine',
      amount,
      createdAt: Date.now(),
      status: 'open',
      due: Date.now() + 7 * 24 * 3600 * 1000,
      meta: { reason: 'Administrators izveidoja sodu' }
    });
    ctx.updatePayments();
    ctx.showToast(ctx.getLanguage() === 'lv' ? 'Jauns sods izveidots' : 'Создан новый штраф');
  });

  buttons.case.addEventListener('click', async () => {
    const legalCase = {
      id: `L-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 99999)}`,
      basis: 'Administratīvais pārkāpums',
      amount: +(10 + Math.random() * 50).toFixed(2),
      status: 'izskatīšanā',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hearingAt: Date.now() + 20 * 24 * 3600 * 1000,
      sanctions: [],
      docs: [],
      history: [{ status: 'izskatīšanā', ts: Date.now(), note: 'Izveidots manuāli' }]
    };
    await ctx.addCase(legalCase);
    ctx.updateCases();
    ctx.showToast(ctx.getLanguage() === 'lv' ? 'Lieta izveidota' : 'Дело создано');
  });

  buttons.hearing.addEventListener('click', async () => {
    const cases = await ctx.getCases();
    const pending = cases.find(c => c.status !== 'slēgts');
    if (!pending) {
      ctx.showToast(ctx.getLanguage() === 'lv' ? 'Nav lietu' : 'Нет дел');
      return;
    }
    pending.status = 'spriedums';
    pending.history.push({ status: 'spriedums', ts: Date.now(), note: 'Administratīvi paātrināts' });
    await ctx.addCase(pending);
    ctx.updateCases();
    ctx.pushLog(`Administratora sēde lietai ${pending.id}`);
  });

  buttons.release.addEventListener('click', () => {
    ctx.setUiArrest(null);
    ctx.showToast(ctx.getLanguage() === 'lv' ? 'Ierobežojumi atcelti' : 'Ограничения сняты');
  });

  buttons.reset.addEventListener('click', async () => {
    if (!confirm(ctx.getLanguage() === 'lv' ? 'Dzēst datus?' : 'Очистить данные?')) {
      return;
    }
    Object.values(localStorage).forEach(() => {});
    localStorage.clear();
    const db = ctx.db;
    db.close();
    await indexedDB.deleteDatabase('epakalpojumi-demo');
    location.reload();
  });

  function renderLog() {
    const logs = ctx.getLogs();
    logList.innerHTML = '';
    logs.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${new Date(entry.time).toLocaleString()} — ${entry.entry}`;
      logList.appendChild(li);
    });
  }

  renderLog();
  ctx.on('logs:updated', renderLog);

  ctx.on('auth:login', user => {
    if (user.role === 'administrators') {
      adminSection.classList.remove('hidden');
    }
  });
  ctx.on('auth:logout', () => adminSection.classList.add('hidden'));
}
