/* ─────────────────────────────────────────────
   dog-profile-view.js  –  Editable Dog Profile
   ───────────────────────────────────────────── */

const params = new URLSearchParams(window.location.search);
const dogId  = params.get('id');

// Will hold the original data so we can revert on Cancel
let originalDog   = null;
let isEditMode    = false;
let pendingImage  = null;   // File object if user picks a new photo
let currentTags   = [];     // live tag list while editing

/* ── helpers ── */
const $ = (id) => document.getElementById(id);
const getToken = () => sessionStorage.getItem('token');

function showToast(msg, type = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('bg-green-500', 'bg-red-500');
  t.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
  t.classList.remove('opacity-0');
  t.classList.add('opacity-100');
  setTimeout(() => {
    t.classList.remove('opacity-100');
    t.classList.add('opacity-0');
  }, 3000);
}

/* ══════════════════════════════════════════════
   1.  LOAD PROFILE
   ══════════════════════════════════════════════ */
async function loadDogProfile() {
  if (!dogId) { console.error('No dog ID in URL'); return; }

  try {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`http://localhost:3000/api/dogprofile/${dogId}`, { headers });
    const dog      = await response.json();
    //dog.isOwner = true; // TEMP: force owner view for testing
    if (!response.ok) { console.error('Dog not found'); return; }

    originalDog = structuredClone(dog);   // deep copy for revert
    currentTags = [...(dog.tags || [])];
    renderProfile(dog);

    // ── Ownership check ──
    // The API should return `isOwner: true` when the logged-in user
    // owns this shelter / business account.
    if (dog.isOwner) {
      $('owner-toolbar').classList.remove('hidden');
      $('owner-toolbar').classList.add('flex');
    }
  } catch (err) {
    console.error('Error loading dog profile:', err);
  }
}

/* ══════════════════════════════════════════════
   2.  RENDER (read-only)
   ══════════════════════════════════════════════ */
function renderProfile(dog) {
  $('dog-name').textContent        = dog.name  || 'Unknown';
  $('dog-breed').textContent       = dog.breed || 'Unknown breed';
  $('dog-age').textContent         = dog.age   || 'N/A';
  $('dog-weight').textContent      = dog.weight || 'N/A';
  $('dog-energy').textContent      = dog.energy || 'N/A';
  $('dog-gender').textContent      = dog.gender || 'N/A';
  $('dog-color').textContent       = dog.color  || 'N/A';
  $('dog-description').textContent = dog.description || 'No description available.';
  $('dog-about-heading').textContent = `About ${dog.name || ''}`;

  // Image
  if (dog.photos && dog.photos[0]) {
    const img = $('dog-image');
    img.src = dog.photos[0];
    img.alt = dog.name;
    img.classList.remove('hidden');
  }

  // Health check icons
  setHealthIcon('dog-vaccinated', !!dog.vaccinated);
  setHealthIcon('dog-neutered',   !!dog.neutered);

  // Tags
  renderTags(dog.tags || []);

  // Shelter
  if (dog.shelter) {
    $('shelter-name').textContent    = dog.shelter.name    || 'N/A';
    $('shelter-address').textContent = dog.shelter.address || 'N/A';
    $('shelter-phone').textContent   = dog.shelter.phone   || 'N/A';
    $('shelter-email').textContent   = dog.shelter.email   || 'N/A';
  }
}

function setHealthIcon(containerId, isActive) {
  const svg = $(containerId).querySelector('svg');
  svg.classList.remove('text-gray-300', 'text-green-500');
  svg.classList.add(isActive ? 'text-green-500' : 'text-gray-300');
}

function renderTags(tags) {
  $('dog-tags').innerHTML = tags.map(tag => `
    <div class="tag-item flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-2">
      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
        <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-sm text-gray-700">${tag}</span>
    </div>
  `).join('');
}

function renderTagsEditable(tags) {
  $('dog-tags').innerHTML = tags.map((tag, i) => `
    <div class="tag-item flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-2">
      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
        <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-sm text-gray-700">${tag}</span>
      <button type="button" data-tag-index="${i}"
        class="remove-tag-btn ml-1 text-red-400 hover:text-red-600 text-xs font-bold leading-none"
        title="Remove tag">&times;</button>
    </div>
  `).join('');

  // Bind remove buttons
  $('dog-tags').querySelectorAll('.remove-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.tagIndex, 10);
      currentTags.splice(idx, 1);
      renderTagsEditable(currentTags);
    });
  });
}

/* ══════════════════════════════════════════════
   3.  ENTER / EXIT EDIT MODE
   ══════════════════════════════════════════════ */
function enterEditMode() {
  isEditMode = true;
  pendingImage = null;

  // Toolbar buttons
  $('btn-edit').classList.add('hidden');
  $('btn-cancel').classList.remove('hidden');
  $('btn-save').classList.remove('hidden');

  // Show image upload overlay
  $('image-upload-btn').classList.remove('hidden');
  $('image-upload-btn').classList.add('flex');

  // Swap text elements → inputs
  replaceWithInput('dog-name',   'text',   'text-3xl font-bold text-gray-900');
  replaceWithInput('dog-breed',  'text',   'text-sm text-gray-400 mt-0.5');
  replaceWithInput('dog-age',    'text',   'text-sm font-semibold text-gray-800');
  replaceWithInput('dog-weight', 'text',   'text-sm font-semibold text-gray-800');
  replaceWithInput('dog-gender', 'select', 'text-sm font-semibold text-gray-800 mt-0.5',
    ['Male', 'Female', 'Unknown']);
  replaceWithInput('dog-color',  'text',   'text-sm font-semibold text-gray-800 mt-0.5');
  replaceWithInput('dog-energy', 'select', 'text-sm font-semibold text-gray-800',
    ['Low', 'Medium', 'High']);
  replaceWithTextarea('dog-description', 'text-sm text-gray-500 leading-relaxed');

  // Health toggles — make clickable
  makeHealthToggle('dog-vaccinated');
  makeHealthToggle('dog-neutered');

  // Tags — show editor + remove buttons
  renderTagsEditable(currentTags);
  $('tag-editor').classList.remove('hidden');
}

function exitEditMode() {
  isEditMode = false;

  // Toolbar
  $('btn-edit').classList.remove('hidden');
  $('btn-cancel').classList.add('hidden');
  $('btn-save').classList.add('hidden');

  // Hide image overlay
  $('image-upload-btn').classList.add('hidden');

  // Restore original data
  currentTags = [...(originalDog.tags || [])];
  renderProfile(originalDog);

  // Restore static elements that were replaced
  restoreElement('dog-name',        'h1', 'text-3xl font-bold text-gray-900');
  restoreElement('dog-breed',       'p',  'text-sm text-gray-400 mt-0.5');
  restoreElement('dog-age',         'p',  'text-sm font-semibold text-gray-800');
  restoreElement('dog-weight',      'p',  'text-sm font-semibold text-gray-800');
  restoreElement('dog-gender',      'p',  'text-sm font-semibold text-gray-800 mt-0.5');
  restoreElement('dog-color',       'p',  'text-sm font-semibold text-gray-800 mt-0.5');
  restoreElement('dog-energy',      'p',  'text-sm font-semibold text-gray-800');
  restoreElement('dog-description', 'p',  'text-sm text-gray-500 leading-relaxed');

  // Remove health-toggle cursors
  removeHealthToggle('dog-vaccinated');
  removeHealthToggle('dog-neutered');

  // Hide tag editor
  $('tag-editor').classList.add('hidden');

  // Re-render with original
  renderProfile(originalDog);
}

/* ── DOM swap helpers ── */
const INPUT_CLASSES = 'w-full border border-gray-300 rounded-lg px-2 py-1.5 text-inherit font-inherit bg-gray-50 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors';

function replaceWithInput(id, type, extraClasses, options) {
  const el    = $(id);
  const value = el.textContent.trim();

  let input;
  if (type === 'select' && options) {
    input = document.createElement('select');
    input.className = `${INPUT_CLASSES} appearance-auto ${extraClasses}`;
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      if (opt.toLowerCase() === value.toLowerCase()) o.selected = true;
      input.appendChild(o);
    });
  } else {
    input = document.createElement('input');
    input.type      = 'text';
    input.value     = value === 'N/A' ? '' : value;
    input.className = `${INPUT_CLASSES} ${extraClasses}`;
  }
  input.id = id;
  el.replaceWith(input);
}

function replaceWithTextarea(id, extraClasses) {
  const el    = $(id);
  const value = el.textContent.trim();
  const ta    = document.createElement('textarea');
  ta.id        = id;
  ta.value     = value === 'No description available.' ? '' : value;
  ta.className = `${INPUT_CLASSES} min-h-[5rem] resize-y leading-relaxed ${extraClasses}`;
  el.replaceWith(ta);
}

function restoreElement(id, tag, classes) {
  const el  = $(id);
  if (!el || el.tagName.toLowerCase() === tag) return;  // already correct
  const neo = document.createElement(tag);
  neo.id        = id;
  neo.className = classes;
  el.replaceWith(neo);
}

/* ── Health-check toggle ── */

function makeHealthToggle(containerId) {
  const container = $(containerId);
  container.style.cursor = 'pointer';
  container._toggleHandler = () => {
    const svg = container.querySelector('svg');
    const active = svg.classList.contains('text-green-500');
    svg.classList.remove('text-green-500', 'text-gray-300');
    svg.classList.add(active ? 'text-gray-300' : 'text-green-500');
  };
  container.addEventListener('click', container._toggleHandler);
}

function removeHealthToggle(containerId) {
  const container = $(containerId);
  container.style.cursor = '';
  if (container._toggleHandler) {
    container.removeEventListener('click', container._toggleHandler);
    delete container._toggleHandler;
  }
}

/* ══════════════════════════════════════════════
   4.  COLLECT EDITED DATA & SAVE
   ══════════════════════════════════════════════ */
function collectFormData() {
  return {
    name:        ($('dog-name').value   ?? $('dog-name').textContent).trim()   || null,
    breed:       ($('dog-breed').value  ?? $('dog-breed').textContent).trim()  || null,
    age:         ($('dog-age').value    ?? $('dog-age').textContent).trim()    || null,
    weight:      ($('dog-weight').value ?? $('dog-weight').textContent).trim() || null,
    energy:      ($('dog-energy').value ?? $('dog-energy').textContent).trim() || null,
    gender:      ($('dog-gender').value ?? $('dog-gender').textContent).trim() || null,
    color:       ($('dog-color').value  ?? $('dog-color').textContent).trim()  || null,
    description: ($('dog-description').value ?? $('dog-description').textContent).trim() || null,
    vaccinated:  $('dog-vaccinated').querySelector('svg').classList.contains('text-green-500'),
    neutered:    $('dog-neutered').querySelector('svg').classList.contains('text-green-500'),
    tags:        [...currentTags],
  };
}

async function saveProfile() {
  const data = collectFormData();

  $('btn-save').disabled   = true;
  $('btn-save').textContent = 'Saving…';

  try {
    const token = getToken();
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // If user selected a new image, upload it first (multipart)
    if (pendingImage) {
      const fd = new FormData();
      fd.append('photo', pendingImage);
      const imgRes = await fetch(`http://localhost:3000/api/dogprofile/${dogId}/photo`, {
        method: 'PUT',
        headers: authHeaders,
        body: fd,
      });
      if (!imgRes.ok) throw new Error('Photo upload failed');
    }

    // Save the rest as JSON
    const res = await fetch(`http://localhost:3000/api/dogprofile/${dogId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Save failed');

    const updated = await res.json();
    originalDog = structuredClone(updated);
    currentTags = [...(updated.tags || [])];

    // Exit edit mode and re-render with fresh data
    exitEditMode();
    renderProfile(updated);
    showToast('Profile updated!');
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Could not save changes', 'error');
  } finally {
    $('btn-save').disabled    = false;
    $('btn-save').textContent = 'Save Changes';
  }
}

/* ══════════════════════════════════════════════
   5.  EVENT LISTENERS
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Toolbar
  $('btn-edit').addEventListener('click',   enterEditMode);
  $('btn-cancel').addEventListener('click', exitEditMode);
  $('btn-save').addEventListener('click',   saveProfile);

  // Image picker
  $('image-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      const img = $('dog-image');
      img.src = reader.result;
      img.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Add-tag button
  $('add-tag-btn').addEventListener('click', () => {
    const input = $('new-tag-input');
    const tag   = input.value.trim();
    if (tag && !currentTags.includes(tag)) {
      currentTags.push(tag);
      renderTagsEditable(currentTags);
    }
    input.value = '';
    input.focus();
  });

  // Allow pressing Enter in tag input
  $('new-tag-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('add-tag-btn').click(); }
  });
});

/* ── Bootstrap ── */
loadDogProfile();