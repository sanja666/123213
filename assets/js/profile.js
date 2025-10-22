import { context } from './main.js';

export function initProfile(ctx) {
  const form = document.getElementById('profile-form');
  const balanceEl = document.getElementById('wallet-balance');
  const topupBtn = document.getElementById('wallet-topup');
  const withdrawBtn = document.getElementById('wallet-withdraw');
  const paymentsTopup = document.getElementById('payments-topup');
  const paymentsWithdraw = document.getElementById('payments-withdraw');
  const arrestBanner = document.getElementById('ui-arrest');

  function populate() {
    const profile = ctx.getProfile();
    if (!profile) return;
    form.name.value = profile.name || '';
    form.surname.value = profile.surname || '';
    form.pk.value = profile.pk || '';
    form.address.value = profile.address || '';
    form.email.value = profile.email || '';
    form.phone.value = profile.phone || '';
    balanceEl.textContent = `${(profile.balance || 0).toFixed(2)} €`;
  }

  populate();

  ctx.on('auth:login', populate);
  ctx.on('payments:updated', populate);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const profile = ctx.getProfile();
    profile.name = form.name.value.trim();
    profile.surname = form.surname.value.trim();
    profile.pk = form.pk.value.trim();
    profile.address = form.address.value.trim();
    profile.email = form.email.value.trim();
    profile.phone = form.phone.value.trim();
    ctx.saveProfile(profile);
    ctx.showToast(ctx.getLanguage() === 'lv' ? 'Saglabāts' : 'Сохранено');
    const amount = +(3 + Math.random() * 6).toFixed(2);
    const payment = {
      id: `PAY-${Date.now()}-DATA`,
      type: 'fine',
      amount,
      createdAt: Date.now(),
      status: 'open',
      due: Date.now() + 5 * 24 * 3600 * 1000,
      meta: { reason: 'Nepareiza datu apstrāde' }
    };
    await ctx.addPayment(payment);
    ctx.pushLog('Reģistrēts administratīvais maksājums par datu apstrādi');
    ctx.registerNotice('Administratīvais maksājums', 'Nepareiza datu apstrāde', 'warn');
    ctx.updatePayments();
    ctx.scheduleRandomFine();
    populate();
  });

  const topupHandler = () => showTopupModal();
  topupBtn.addEventListener('click', topupHandler);
  paymentsTopup.addEventListener('click', topupHandler);

  const withdrawHandler = () => handleWithdraw();
  withdrawBtn.addEventListener('click', withdrawHandler);
  paymentsWithdraw.addEventListener('click', withdrawHandler);

  ctx.on('ui:arrest', until => {
    if (until && Date.now() < until) {
      arrestBanner.textContent = ctx.getLanguage() === 'lv'
        ? `Administratīvais arests (UI) līdz: ${new Date(until).toLocaleTimeString()}`
        : `Административная блокировка (UI) до: ${new Date(until).toLocaleTimeString()}`;
      arrestBanner.classList.remove('hidden');
      disableRestricted(true);
    } else {
      arrestBanner.classList.add('hidden');
      disableRestricted(false);
    }
  });

  if (ctx.state.uiArrestUntil && Date.now() < ctx.state.uiArrestUntil) {
    ctx.emit('ui:arrest', ctx.state.uiArrestUntil);
  }

  function disableRestricted(disabled) {
    document.querySelector('[data-section="services"]').disabled = disabled;
    document.getElementById('spin-roulette').disabled = disabled;
    document.getElementById('play-lottery').disabled = disabled;
    document.getElementById('play-double').disabled = disabled;
    withdrawBtn.disabled = disabled;
    paymentsWithdraw.disabled = disabled;
  }
}

async function handleWithdraw() {
  const profile = context.getProfile();
  if ((profile.balance || 0) < 1) {
    context.showToast(context.getLanguage() === 'lv' ? 'Nepietiek bilances' : 'Недостаточно средств');
    return;
  }
  profile.balance = Math.max(0, (profile.balance || 0) - 1);
  context.saveProfile(profile);
  const payment = {
    id: `PAY-${Date.now()}-WD`,
    type: 'withdraw',
    amount: 1,
    createdAt: Date.now(),
    status: 'processing'
  };
  await context.addPayment(payment);
  context.updatePayments();
  context.showToast(context.getLanguage() === 'lv' ? 'Izmaksa reģistrēta. Komisija 1€.' : 'Выплата зарегистрирована. Комиссия 1€.');
  setTimeout(async () => {
    payment.status = 'declined';
    payment.note = 'Demo režīms';
    await context.addPayment(payment);
    context.updatePayments();
    context.showToast(context.getLanguage() === 'lv' ? 'Izmaksa atteikta (demo).' : 'Выплата отклонена (демо).');
  }, (10 + Math.random() * 20) * 1000);
}

function showTopupModal() {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  const content = document.createElement('div');
  content.className = 'modal-content';
  const title = document.createElement('h3');
  title.textContent = context.getLanguage() === 'lv' ? 'Papildināt bilanci' : 'Пополнение баланса';
  const form = document.createElement('form');
  form.innerHTML = `
    <label>${context.getLanguage() === 'lv' ? 'Vārds uz kartes' : 'Имя на карте'}</label>
    <input required value="Ilze Ozola">
    <label>${context.getLanguage() === 'lv' ? 'Kartes numurs' : 'Номер карты'}</label>
    <input required value="5454 5454 5454 5454" pattern="[0-9 ]{16,19}">
    <label>${context.getLanguage() === 'lv' ? 'Derīga līdz (MM/YY)' : 'Срок (MM/YY)'}</label>
    <input required value="12/29" pattern="[0-9]{2}/[0-9]{2}">
    <label>CVV</label>
    <input required value="123" pattern="[0-9]{3}">
    <label>${context.getLanguage() === 'lv' ? 'Summa' : 'Сумма'}</label>
    <select name="amount">
      <option value="5">5 €</option>
      <option value="10" selected>10 €</option>
      <option value="20">20 €</option>
      <option value="custom">${context.getLanguage() === 'lv' ? 'Cita summa' : 'Другая сумма'}</option>
    </select>
    <input name="custom" type="number" min="1" step="0.01" class="hidden" placeholder="EUR">
    <button type="submit" class="primary">OK</button>
  `;
  const close = document.createElement('button');
  close.className = 'modal-close';
  close.innerHTML = '&times;';
  close.addEventListener('click', destroy);
  content.append(close, title, form);
  modal.appendChild(content);
  overlay.addEventListener('click', destroy);
  document.body.append(overlay, modal);
  const amountSelect = form.querySelector('select[name="amount"]');
  const customInput = form.querySelector('input[name="custom"]');
  amountSelect.addEventListener('change', () => {
    const custom = amountSelect.value === 'custom';
    customInput.classList.toggle('hidden', !custom);
    customInput.required = custom;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const selected = amountSelect.value === 'custom' ? parseFloat(customInput.value) : parseFloat(amountSelect.value);
    if (Number.isNaN(selected) || selected <= 0) {
      context.showToast(context.getLanguage() === 'lv' ? 'Norādiet summu' : 'Укажите сумму');
      return;
    }
    const profile = context.getProfile();
    profile.balance = (profile.balance || 0) + selected;
    context.saveProfile(profile);
    await context.addPayment({
      id: `PAY-${Date.now()}-DEP`,
      type: 'deposit',
      amount: selected,
      createdAt: Date.now(),
      status: 'paid'
    });
    context.updatePayments();
    context.showToast(context.getLanguage() === 'lv' ? 'Bilance papildināta' : 'Баланс пополнен');
    destroy();
  });
  function destroy() {
    modal.remove();
    overlay.remove();
  }
}
