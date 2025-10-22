import { idbGetAll, idbPut, now } from './storage.js';
import { getCurrentUser } from './auth.js';

let documents = [];

function render() {
  const container = document.getElementById('document-list');
  container.innerHTML = '';
  documents
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((doc) => {
      const card = document.createElement('article');
      card.className = 'document-card';
      card.innerHTML = `
        <h3>${doc.title}</h3>
        <p>${new Date(doc.createdAt).toLocaleString()}</p>
        <button class="secondary">Lejupielādēt</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = `${doc.title.replace(/\s+/g, '-')}.pdf`;
        link.click();
      });
      container.appendChild(card);
    });
}

async function load() {
  const user = getCurrentUser();
  const all = await idbGetAll('documents');
  documents = user ? all.filter((doc) => doc.userId === user.id) : [];
  render();
}

export function initDocuments() {
  load();
}

export async function addDocument(document) {
  const user = getCurrentUser();
  if (!user) return;
  const entry = {
    id: document.id,
    userId: user.id,
    title: document.title,
    createdAt: document.createdAt || now(),
    url: document.url,
    type: document.type
  };
  documents.push(entry);
  await idbPut('documents', entry);
  render();
}

export function clearDocuments() {
  documents = [];
  render();
}

