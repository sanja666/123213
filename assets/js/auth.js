const smsCodes = new Map();

export function initAuth(ctx) {
  const demoForm = document.getElementById('demo-login');
  const smartIdForm = document.getElementById('smartid-login');
  const eparakstsForm = document.getElementById('eparaksts-login');
  const smsForm = document.getElementById('sms-login');
  const smsSendBtn = document.getElementById('sms-send');

  demoForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(demoForm);
    const username = formData.get('username');
    const password = formData.get('password');
    const users = JSON.parse(localStorage.getItem('ep_demo_users') || '[]');
    const user = users.find(u => u.user === username && u.pass === password);
    if (user) {
      ctx.startSession({
        id: user.user,
        role: user.role,
        displayName: user.name
      });
      ctx.pushLog(`Pieslēgšanās ar demo kontu (${user.user})`);
    } else {
      ctx.showToast(ctx.getLanguage() === 'lv' ? 'Nepareizi dati' : 'Неверные данные');
    }
  });

  smartIdForm.addEventListener('submit', event => {
    event.preventDefault();
    const code = `${Math.floor(1000 + Math.random() * 9000)}`;
    const modal = buildModal('Smart-ID pieprasījums #A1B2', `Apstiprinājuma kods: ${code}`);
    document.body.appendChild(modal.overlay);
    document.body.appendChild(modal.modal);
    const input = document.createElement('input');
    input.placeholder = '1234';
    input.className = 'code-input';
    input.addEventListener('keyup', () => {
      if (input.value.trim() === '1234') {
        modal.destroy();
        ctx.startSession({
          id: `smartid-${Date.now()}`,
          role: 'iedzivotajs',
          displayName: document.getElementById('smartid-name').value || 'Smart-ID lietotājs'
        });
        ctx.registerNotice('Smart-ID sesija apstiprināta', 'Smart-ID pieprasījums #A1B2', 'info');
        ctx.pushLog('Smart-ID sesija apstiprināta');
      }
    });
    modal.content.appendChild(input);
    input.focus();
  });

  eparakstsForm.addEventListener('submit', event => {
    event.preventDefault();
    const modal = buildModal('eParaksts klients (demo)', 'Notiek parakstīšana...');
    document.body.appendChild(modal.overlay);
    document.body.appendChild(modal.modal);
    setTimeout(() => {
      modal.destroy();
      ctx.startSession({
        id: `eparaksts-${Date.now()}`,
        role: 'iedzivotajs',
        displayName: 'eParaksts lietotājs'
      });
      ctx.pushLog('eParaksts klients (demo) apstiprināja sesiju');
    }, 1200);
  });

  smsSendBtn.addEventListener('click', () => {
    const phone = document.getElementById('sms-phone').value.trim();
    if (!phone) {
      ctx.showToast(ctx.getLanguage() === 'lv' ? 'Norādiet telefonu' : 'Укажите телефон');
      return;
    }
    const code = Math.random() > 0.5 ? '0000' : '123456';
    smsCodes.set(phone, code);
    ctx.showToast(ctx.getLanguage() === 'lv' ? `Kods nosūtīts: ${code}` : `Код отправлен: ${code}`);
    ctx.pushLog(`SMS kods ${code} nosūtīts ${phone}`);
  });

  smsForm.addEventListener('submit', event => {
    event.preventDefault();
    const phone = document.getElementById('sms-phone').value.trim();
    const code = document.getElementById('sms-code').value.trim();
    if (!smsCodes.has(phone) || !['0000', '123456'].includes(code)) {
      ctx.showToast(ctx.getLanguage() === 'lv' ? 'Nederīgs kods' : 'Неверный код');
      return;
    }
    ctx.startSession({
      id: `sms-${phone}`,
      role: 'iedzivotajs',
      displayName: `SMS lietotājs ${phone}`
    });
    ctx.pushLog('SMS-OTP autorizācija pabeigta');
  });

  ctx.on('auth:logout', () => {
    smsCodes.clear();
    ctx.showSection('auth');
  });
}

function buildModal(title, body) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  const content = document.createElement('div');
  content.className = 'modal-content';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = body;
  const close = document.createElement('button');
  close.className = 'modal-close';
  close.innerHTML = '&times;';
  close.addEventListener('click', destroy);
  overlay.addEventListener('click', destroy);
  content.append(close, heading, paragraph);
  modal.appendChild(content);
  function destroy() {
    modal.remove();
    overlay.remove();
  }
  return { overlay, modal, content, destroy };
}
