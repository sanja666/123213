import { loadLocal, saveLocal } from './storage.js';

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

export function showToast(message, duration = 3500) {
  const template = document.getElementById('toast-template');
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade');
    toast.remove();
  }, duration);
}

const viewCacheKey = 'epakalpojumi_last_view';

export function activateView(id) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === id);
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.view === id);
  });
  saveLocal(viewCacheKey, id);
}

export function restoreView(defaultView = 'services') {
  const saved = loadLocal(viewCacheKey, defaultView);
  activateView(saved);
}

export function bindNav(onGuard) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.dataset.view;
      if (onGuard?.(target) === false) {
        return;
      }
      activateView(target);
    });
  });
}

export function openModal({ title, content, confirmText, cancelText }) {
  const modal = document.getElementById('modal');
  const titleNode = document.getElementById('modal-title');
  const contentNode = document.getElementById('modal-content');
  titleNode.textContent = title;
  contentNode.innerHTML = '';
  if (typeof content === 'string') {
    contentNode.innerHTML = content;
  } else {
    contentNode.appendChild(content);
  }
  const [cancelButton, confirmButton] = modal.querySelectorAll('button');
  if (confirmText) confirmButton.textContent = confirmText;
  if (cancelText) cancelButton.textContent = cancelText;
  document.body.classList.add('dialog-open');
  modal.showModal();
  return new Promise((resolve) => {
    modal.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      resolve(modal.returnValue === 'confirm');
    }, { once: true });
  });
}

export function hideModal() {
  const modal = document.getElementById('modal');
  if (modal.open) {
    modal.close('cancel');
    document.body.classList.remove('dialog-open');
  }
}

