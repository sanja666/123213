import { updateUserRecord, getCurrentUser, refreshSession } from './auth.js';
import { showToast } from './ui.js';
import { now } from './storage.js';

let onProfileSave;

export function initProfile({ onSave }) {
  onProfileSave = onSave;
  const form = document.getElementById('profile-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const updates = {
      name: document.getElementById('profile-name').value.trim(),
      surname: document.getElementById('profile-surname').value.trim(),
      pk: document.getElementById('profile-pk').value.trim(),
      address: document.getElementById('profile-address').value.trim(),
      email: document.getElementById('profile-email').value.trim(),
      phone: document.getElementById('profile-phone').value.trim(),
      updatedAt: now()
    };
    updateUserRecord(user.id, updates);
    refreshSession();
    onProfileSave?.(updates);
    showToast('Dati saglabāti. Reģistrēts administratīvais maksājums.');
  });
}

export function populateProfile(user) {
  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-surname').value = user.surname || '';
  document.getElementById('profile-pk').value = user.pk || '';
  document.getElementById('profile-address').value = user.address || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-phone').value = user.phone || '';
}

export function setUiArrest(active, untilText) {
  const badge = document.getElementById('ui-arrest');
  badge.hidden = !active;
  if (active && untilText) {
    badge.textContent = untilText;
  }
}

