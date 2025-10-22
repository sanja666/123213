import { context } from './main.js';

let negativeStreak = 0;

export function initCases(ctx) {
  const appealBtn = document.getElementById('case-appeal');
  const rouletteBtn = document.getElementById('spin-roulette');
  const lotteryBtn = document.getElementById('play-lottery');
  const doubleBtn = document.getElementById('play-double');

  appealBtn.addEventListener('click', async () => {
    const caseId = document.getElementById('case-detail').dataset.caseId;
    if (!caseId) return;
    const text = prompt(ctx.getLanguage() === 'lv' ? 'Aprakstiet apelācijas pamatojumu' : 'Опишите причину апелляции');
    if (!text) return;
    const legalCase = await ctx.getCase(caseId);
    if (!legalCase) return;
    legalCase.status = 'apelācija reģistrēta';
    legalCase.history.push({ status: 'apelācija reģistrēta', ts: Date.now(), note: text });
    await ctx.addCase(legalCase);
    ctx.updateCases();
    ctx.showToast(ctx.getLanguage() === 'lv' ? 'Apelācija reģistrēta' : 'Апелляция зарегистрирована');
    ctx.pushLog(`Apelācija lietai ${caseId}`);
    setTimeout(async () => {
      const result = Math.random() < 0.1 ? 'daļēji apmierināta' : 'noraidīta';
      const updated = await ctx.getCase(caseId);
      if (!updated) return;
      updated.status = `apelācija ${result}`;
      updated.history.push({ status: updated.status, ts: Date.now() });
      await ctx.addCase(updated);
      ctx.updateCases();
      ctx.showToast(ctx.getLanguage() === 'lv' ? `Apelācija ${result}` : `Апелляция ${result === 'noraidīta' ? 'отклонена' : 'частично удовлетворена'}`);
    }, (10 + Math.random() * 110) * 1000);
  });

  rouletteBtn.addEventListener('click', playRoulette);
  lotteryBtn.addEventListener('click', playLottery);
  doubleBtn.addEventListener('click', playDouble);

  renderCasinoHistory();
  ctx.on('payments:updated', renderCasinoHistory);
  ctx.on('cases:updated', renderCasinoHistory);
}

async function playRoulette() {
  if (isUiLocked()) {
    context.showToast(context.getLanguage() === 'lv' ? 'Kazino bloķēts' : 'Казино заблокировано');
    return;
  }
  const roll = Math.random() * 100;
  let outcome;
  if (roll < 8) {
    outcome = 'refund50';
  } else if (roll < 20) {
    outcome = 'discount10';
  } else if (roll < 50) {
    outcome = 'extraDebt';
  } else if (roll < 60) {
    outcome = 'newCase';
  } else if (roll < 80) {
    outcome = 'delay';
  } else {
    outcome = 'nothing';
  }
  const impact = await resolveRouletteOutcome(outcome);
  await logGame('roulette', outcome, impact);
  document.getElementById('roulette-result').textContent = impact.message;
  handleNegative(outcome);
}

async function resolveRouletteOutcome(outcome) {
  const lang = context.getLanguage();
  if (outcome === 'refund50') {
    const target = await findOpenTarget();
    if (target) {
      const amount = target.item.amount * 0.5;
      await applyDiscount(target, amount);
      return { message: lang === 'lv' ? 'Atmaksa 50% piemērota' : 'Возврат 50% применён' };
    }
    return { message: lang === 'lv' ? 'Nav maksājumu atlaidei' : 'Нет платежей для возврата' };
  }
  if (outcome === 'discount10') {
    const target = await findOpenTarget();
    if (target) {
      const amount = target.item.amount * 0.1;
      await applyDiscount(target, amount);
      return { message: lang === 'lv' ? 'Atlaide 10% piemērota' : 'Скидка 10% применена' };
    }
    return { message: lang === 'lv' ? 'Nav maksājumu atlaižu piemērošanai' : 'Нет платежей для скидки' };
  }
  if (outcome === 'extraDebt') {
    const amount = +(5 + Math.random() * 25).toFixed(2);
    await context.addPayment({
      id: `PAY-${Date.now()}-KAZ`,
      type: 'extra',
      amount,
      createdAt: Date.now(),
      status: 'open',
      due: Date.now() + 10 * 24 * 3600 * 1000,
      meta: { reason: 'Kazino sekas' }
    });
    context.updatePayments();
    return { message: lang === 'lv' ? `Papildparāds ${amount.toFixed(2)} €` : `Доп. долг ${amount.toFixed(2)} €` };
  }
  if (outcome === 'newCase') {
    const legalCase = {
      id: `L-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 99999)}`,
      basis: 'Kazino riski',
      amount: +(10 + Math.random() * 40).toFixed(2),
      status: 'izskatīšanā',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hearingAt: Date.now() + 25 * 24 * 3600 * 1000,
      sanctions: [],
      docs: [],
      history: [{ status: 'izskatīšanā', ts: Date.now(), note: 'Kazino rezultāts' }]
    };
    await context.addCase(legalCase);
    context.updateCases();
    return { message: lang === 'lv' ? 'Jauna lieta par kazino riskiem' : 'Новое дело «риски казино»' };
  }
  if (outcome === 'delay') {
    const cases = await context.getCases();
    const active = cases.find(c => c.status !== 'slēgts');
    if (active) {
      active.hearingAt = (active.hearingAt || Date.now()) + 30 * 24 * 3600 * 1000;
      active.history.push({ status: 'pagarināts', ts: Date.now(), note: 'Kazino aizkavēšana' });
      await context.addCase(active);
      context.updateCases();
      return { message: lang === 'lv' ? 'Lietas termiņš pagarināts par 30 dienām' : 'Срок дела продлён на 30 дней' };
    }
    return { message: lang === 'lv' ? 'Nav lietu aizkavēšanai' : 'Нет дел для переноса' };
  }
  return { message: lang === 'lv' ? 'Nekas nenotika' : 'Ничего не произошло' };
}

async function playLottery() {
  if (isUiLocked()) {
    context.showToast(context.getLanguage() === 'lv' ? 'Kazino bloķēts' : 'Казино заблокировано');
    return;
  }
  const profile = context.getProfile();
  if ((profile.balance || 0) < 1) {
    context.showToast(context.getLanguage() === 'lv' ? 'Nepietiek bilances' : 'Недостаточно средств');
    return;
  }
  profile.balance -= 1;
  context.saveProfile(profile);
  let outcome;
  const roll = Math.random() * 100;
  if (roll < 15) {
    outcome = 'winSmall';
  } else if (roll < 20) {
    outcome = 'winMedium';
  } else if (roll < 21) {
    outcome = 'winBig';
  } else if (roll < 31) {
    outcome = 'extraDebt';
  } else {
    outcome = 'nothing';
  }
  const impact = await resolveLotteryOutcome(outcome);
  await logGame('lottery', outcome, impact);
  document.getElementById('lottery-result').textContent = impact.message;
  handleNegative(outcome);
}

async function resolveLotteryOutcome(outcome) {
  const profile = context.getProfile();
  const lang = context.getLanguage();
  if (outcome === 'winSmall') {
    const delta = +(10 + Math.random() * 40).toFixed(2);
    profile.balance += delta;
    context.saveProfile(profile);
    return { message: lang === 'lv' ? `Laimests ${delta.toFixed(2)} €` : `Выигрыш ${delta.toFixed(2)} €` };
  }
  if (outcome === 'winMedium') {
    const delta = +(51 + Math.random() * 150).toFixed(2);
    profile.balance += delta;
    context.saveProfile(profile);
    return { message: lang === 'lv' ? `Liels laimests ${delta.toFixed(2)} €` : `Крупный выигрыш ${delta.toFixed(2)} €` };
  }
  if (outcome === 'winBig') {
    const delta = +(200 + Math.random() * 200).toFixed(2);
    profile.balance += delta;
    context.saveProfile(profile);
    return { message: lang === 'lv' ? `Ievērojams laimests ${delta.toFixed(2)} €` : `Выигрыш ${delta.toFixed(2)} €` };
  }
  if (outcome === 'extraDebt') {
    const amount = +(5 + Math.random() * 25).toFixed(2);
    await context.addPayment({
      id: `PAY-${Date.now()}-LOT`,
      type: 'extra',
      amount,
      createdAt: Date.now(),
      status: 'open',
      due: Date.now() + 7 * 24 * 3600 * 1000,
      meta: { reason: 'Loterijas risks' }
    });
    context.updatePayments();
    return { message: lang === 'lv' ? `Papildparāds ${amount.toFixed(2)} €` : `Доп. долг ${amount.toFixed(2)} €` };
  }
  return { message: lang === 'lv' ? 'Šoreiz neveicās' : 'В этот раз не повезло' };
}

async function playDouble() {
  if (isUiLocked()) {
    context.showToast(context.getLanguage() === 'lv' ? 'Kazino bloķēts' : 'Казино заблокировано');
    return;
  }
  const payments = await context.getPayments();
  const targetPayment = payments.find(p => p.status === 'open');
  const stake = targetPayment ? targetPayment.amount : 10;
  const outcome = Math.random() < 0.45 ? 'win' : 'lose';
  const impact = await resolveDoubleOutcome(outcome, targetPayment, stake);
  await logGame('double', outcome, impact);
  document.getElementById('double-result').textContent = impact.message;
  handleNegative(outcome);
}

async function resolveDoubleOutcome(outcome, target, stake) {
  const lang = context.getLanguage();
  if (outcome === 'win') {
    if (target) {
      await applyDiscount({ type: 'payment', item: target }, stake);
      return { message: lang === 'lv' ? 'Maksājums samazināts' : 'Платёж уменьшен' };
    }
    const profile = context.getProfile();
    profile.balance += stake;
    context.saveProfile(profile);
    return { message: lang === 'lv' ? 'Bilance palielināta' : 'Баланс увеличен' };
  }
  const amount = target ? target.amount : stake;
  await context.addPayment({
    id: `PAY-${Date.now()}-DBL`,
    type: 'extra',
    amount,
    createdAt: Date.now(),
    status: 'open',
    due: Date.now() + 5 * 24 * 3600 * 1000,
    meta: { reason: 'Double zaudējums' }
  });
  context.updatePayments();
  return { message: lang === 'lv' ? 'Dubults parāds' : 'Двойной долг' };
}

async function applyDiscount(targetWrapper, amount) {
  if (targetWrapper.type === 'payment') {
    const payment = targetWrapper.item;
    if (payment.relatedCaseId) {
      const legalCase = await context.getCase(payment.relatedCaseId);
      if (legalCase) {
        legalCase.amount = Math.max(0, legalCase.amount - amount);
        legalCase.history.push({ status: 'samazināts', ts: Date.now(), note: 'Kazino ietekme' });
        await context.addCase(legalCase);
      }
    }
    payment.amount = Math.max(0, payment.amount - amount);
    if (payment.amount === 0) {
      payment.status = 'paid';
      payment.paidAt = Date.now();
    }
    await context.addPayment(payment);
    context.updatePayments();
  } else if (targetWrapper.type === 'case') {
    const legalCase = targetWrapper.item;
    legalCase.amount = Math.max(0, legalCase.amount - amount);
    legalCase.history.push({ status: 'samazināts', ts: Date.now(), note: 'Kazino ietekme' });
    await context.addCase(legalCase);
    context.updateCases();
  }
}

async function findOpenTarget() {
  const payments = await context.getPayments();
  const open = payments.find(p => p.status === 'open');
  if (open) {
    return { type: 'payment', item: open };
  }
  const cases = await context.getCases();
  const active = cases.find(c => c.status !== 'slēgts');
  if (active) {
    return { type: 'case', item: active };
  }
  return null;
}

async function logGame(game, outcome, impact) {
  const entry = {
    id: `GAME-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    game,
    outcome,
    impact: impact.message,
    ts: Date.now()
  };
  await context.addGameResult(entry);
  renderCasinoHistory();
  context.pushLog(`Kazino ${game} — ${impact.message}`);
}

async function renderCasinoHistory() {
  const historyBody = document.getElementById('casino-history');
  const results = await context.getGameResults();
  results.sort((a, b) => b.ts - a.ts);
  historyBody.innerHTML = '';
  results.forEach(result => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(result.ts).toLocaleString()}</td>
      <td>${result.game}</td>
      <td>${result.outcome}</td>
      <td>${result.impact}</td>
    `;
    historyBody.appendChild(row);
  });
}

function handleNegative(outcome) {
  if (['extraDebt', 'newCase', 'lose'].includes(outcome)) {
    negativeStreak += 1;
    if (negativeStreak >= 3) {
      const until = Date.now() + (3 + Math.random() * 2) * 60 * 1000;
      context.setUiArrest(until);
      context.showToast(context.getLanguage() === 'lv'
        ? `Administratīvais arests (UI) līdz: ${new Date(until).toLocaleTimeString()}`
        : `Административная блокировка (UI) до: ${new Date(until).toLocaleTimeString()}`);
      negativeStreak = 0;
    }
  } else if (!['nothing'].includes(outcome)) {
    negativeStreak = 0;
  }
}

function isUiLocked() {
  return context.state.uiArrestUntil && Date.now() < context.state.uiArrestUntil;
}
