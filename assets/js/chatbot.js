import { context } from './main.js';

export function initChatbot(ctx) {
  const brand = document.getElementById('brand');
  const footer = document.querySelector('footer p');
  let clicks = 0;

  brand.addEventListener('click', () => {
    clicks += 1;
    if (clicks === 7) {
      ctx.showToast(ctx.getLanguage() === 'lv' ? 'Diploms par pacietību piešķirts!' : 'Выдан диплом за терпение!');
      clicks = 0;
    }
  });

  ctx.on('auth:login', () => ctx.refreshSessionBanner());
  setInterval(() => ctx.refreshSessionBanner(), 5000);

  if (footer) {
    footer.setAttribute('tabindex', '0');
  }
}
