/* ─────────────────────────────────────────────
   createaccount.js  –  Adopter Profile
   Modes: setup (first time), view (returning), edit
   ───────────────────────────────────────────── */

const userId = sessionStorage.getItem('userId');
const token  = sessionStorage.getItem('token');

const $ = (id) => document.getElementById(id);

let isSetupMode = false;   // true when coming from signup
let originalData = null;   // for reverting on cancel
let pendingPhoto = null;   // File object if user picks a new photo

// ── Editable fields ──
const INPUT_IDS = [
  'user-name', 'person-city', 'person-state', 'person-zip',
  'user-phone', 'user-email', 'user-bio'
];
const SELECT_IDS = [
  'dog-age', 'dog-weight', 'dog-energy', 'dog-gender', 'dog-color'
];

// ── Toast ──
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

// ── Populate select options ──
function populateSelects() {
  const ageOpts = ['Puppy (< 1yr)', '1–3 years', '3–7 years', '7+ years'];
  const weightOpts = ['Small (< 20 lbs)', 'Medium (20–50 lbs)', 'Large (50–90 lbs)', 'X-Large (90+ lbs)'];
  const energyOpts = ['Low', 'Medium', 'High'];

  fillSelect('dog-age', ageOpts);
  fillSelect('dog-weight', weightOpts);
  fillSelect('dog-energy', energyOpts);
}

function fillSelect(id, options) {
  const sel = $(id);
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    sel.appendChild(o);
  });
}

// ── Health check toggles ──
function initHealthToggles() {
  ['dog-vaccinated', 'dog-neutered'].forEach(id => {
    $(id).addEventListener('click', () => {
      if (!isEditable()) return;
      const svg = $(id).querySelector('svg');
      const active = svg.classList.contains('text-green-500');
      svg.classList.remove('text-green-500', 'text-gray-300');
      svg.classList.add(active ? 'text-gray-300' : 'text-green-500');
    });
  });
}

function setHealthIcon(id, active) {
  const svg = $(id).querySelector('svg');
  svg.classList.remove('text-green-500', 'text-gray-300');
  svg.classList.add(active ? 'text-green-500' : 'text-gray-300');
}

// ── Tag pills ──
const AVAILABLE_TAGS = [
  'Good with kids', 'Good with cats', 'Good with dogs',
  'House trained', 'Crate trained', 'Leash trained',
  'Hypoallergenic', 'Emotional support', 'Active lifestyle',
  'Apartment friendly', 'First-time owner'
];
let selectedTags = [];

function renderTags() {
  const container = $('dog-tags');
  container.innerHTML = AVAILABLE_TAGS.map(tag => {
    const isSelected = selectedTags.includes(tag);
    const colorClasses = isSelected
      ? 'border-green-400 bg-green-50'
      : 'border-gray-100 bg-white';
    const iconColor = isSelected ? 'text-green-500' : 'text-gray-300';
    const disabled = !isEditable() ? 'pointer-events-none' : 'cursor-pointer';

    return `
      <div class="tag-pill flex items-center gap-1.5 border ${colorClasses} rounded-xl px-3 py-2 ${disabled} transition-colors"
           data-tag="${tag}">
        <svg class="w-4 h-4 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-sm text-gray-700">${tag}</span>
      </div>
    `;
  }).join('');

  // Bind click
  container.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      if (!isEditable()) return;
      const tag = pill.dataset.tag;
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
      } else {
        selectedTags.push(tag);
      }
      renderTags();
    });
  });
}

// ── Mode helpers ──
function isEditable() {
  return isSetupMode || !$('btn-save').classList.contains('hidden');
}

function setFieldsEditable(editable) {
  INPUT_IDS.forEach(id => {
    const el = $(id);
    if (editable) {
      el.removeAttribute('readonly');
      el.classList.add('hover:border-gray-300', 'focus:border-blue-400');
    } else {
      el.setAttribute('readonly', true);
      el.classList.remove('hover:border-gray-300', 'focus:border-blue-400');
    }
  });

  SELECT_IDS.forEach(id => {
    $(id).disabled = !editable;
  });

  // Photo overlay
  const overlay = $('photo-overlay');
  if (editable) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  } else {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function enterViewMode() {
  setFieldsEditable(false);
  $('btn-edit').classList.remove('hidden');
  $('btn-save').classList.add('hidden');
  $('btn-cancel').classList.add('hidden');
  renderTags();
}

function enterEditMode() {
  setFieldsEditable(true);
  $('btn-edit').classList.add('hidden');
  $('btn-save').classList.remove('hidden');
  $('btn-cancel').classList.remove('hidden');
  renderTags();
}

function enterSetupMode() {
  isSetupMode = true;
  setFieldsEditable(true);
  $('btn-edit').classList.add('hidden');
  $('btn-save').classList.remove('hidden');
  $('btn-cancel').classList.add('hidden');
  renderTags();
}

// ── Load profile from DB ──
async function loadProfile() {
  try {
    const res = await fetch(`http://localhost:3000/api/user/${userId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to load profile:', err);
    return null;
  }
}

function populateFields(data) {
  $('user-name').value   = data.name   || '';
  $('person-city').value = data.city   || '';
  $('person-state').value = data.state || '';
  $('person-zip').value  = data.zip    || '';
  $('user-phone').value  = data.phone  || '';
  $('user-email').value  = data.email  || '';
  $('user-bio').value    = data.bio    || '';

  // Photo
  if (data.photo) {
    const img = $('profile-image');
    img.src = data.photo;
    img.classList.remove('hidden');
    $('photo-placeholder').classList.add('hidden');
  }

  // Preferences
  if (data.preferences) {
    $('dog-age').value    = data.preferences.age    || '';
    $('dog-weight').value = data.preferences.weight || '';
    $('dog-energy').value = data.preferences.energy || '';
    $('dog-gender').value = data.preferences.gender || '';
    $('dog-color').value  = data.preferences.color  || '';
    setHealthIcon('dog-vaccinated', !!data.preferences.vaccinated);
    setHealthIcon('dog-neutered',   !!data.preferences.neutered);
    selectedTags = data.preferences.tags || [];
  }
}

// ── Collect form data ──
function collectData() {
  return {
    name:  $('user-name').value.trim(),
    city:  $('person-city').value.trim(),
    state: $('person-state').value.trim().toUpperCase(),
    zip:   $('person-zip').value.trim(),
    phone: $('user-phone').value.trim(),
    email: $('user-email').value.trim(),
    bio:   $('user-bio').value.trim(),
    preferences: {
      age:        $('dog-age').value,
      weight:     $('dog-weight').value,
      energy:     $('dog-energy').value,
      gender:     $('dog-gender').value,
      color:      $('dog-color').value,
      vaccinated: $('dog-vaccinated').querySelector('svg').classList.contains('text-green-500'),
      neutered:   $('dog-neutered').querySelector('svg').classList.contains('text-green-500'),
      tags:       [...selectedTags]
    }
  };
}

// ── Save ──
async function saveProfile() {
  const data = collectData();
  const saveBtn = $('btn-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    // Photo upload if new photo selected
    if (pendingPhoto) {
      const fd = new FormData();
      fd.append('photo', pendingPhoto);
      const photoRes = await fetch(`http://localhost:3000/api/user/${userId}/photo`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (!photoRes.ok) throw new Error('Photo upload failed');
      pendingPhoto = null;
    }

    // Save profile data
    const res = await fetch(`http://localhost:3000/api/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Save failed');

    const updated = await res.json();
    originalData = structuredClone(updated);
    isSetupMode = false;

    populateFields(updated);
    enterViewMode();
    showToast('Profile saved!');

  } catch (err) {
    console.error(err);
    showToast(err.message || 'Could not save', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Profile';
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  if (!userId || !token) {
    window.location.href = './loginandsignupview.html';
    return;
  }

  populateSelects();
  initHealthToggles();

  // Check if coming from signup (flag set by loginandsignupview.js)
  const fromSignup = sessionStorage.getItem('setupMode') === 'true';

  const profile = await loadProfile();

  if (profile && profile.name && !fromSignup) {
    // Returning user — show their data in view mode
    originalData = structuredClone(profile);
    populateFields(profile);
    selectedTags = profile.preferences?.tags || [];
    renderTags();
    enterViewMode();
  } else {
    // First time or from signup — setup mode
    if (profile && profile.name) {
      populateFields(profile);
      selectedTags = profile.preferences?.tags || [];
    }
    sessionStorage.removeItem('setupMode');
    enterSetupMode();
  }

  // ── Button handlers ──
  $('btn-edit').addEventListener('click', () => {
    originalData = collectData();
    enterEditMode();
  });

  $('btn-cancel').addEventListener('click', () => {
    if (originalData) populateFields(originalData);
    selectedTags = originalData?.preferences?.tags || [];
    enterViewMode();
  });

  $('btn-save').addEventListener('click', saveProfile);

  // ── Photo picker ──
  $('photo-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingPhoto = file;
    const reader = new FileReader();
    reader.onload = () => {
      const img = $('profile-image');
      img.src = reader.result;
      img.classList.remove('hidden');
      $('photo-placeholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });
});