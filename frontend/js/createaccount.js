// // createaccount.js

// document.addEventListener('DOMContentLoaded', () => {

//   // ── 1. REMAP HEADING LABELS ──────────────────────────────────────────────

//   const nameHeading = document.querySelector('#user-name');
//   const contactInfo = document.querySelector('#contact-info');

//   replaceWithInput(nameHeading, 'person-name', 'text', 'name');
//   replaceWithInput(contactInfo, 'person-email', 'email', 'Email address');

//   const aboutHeading = document.getElementById('about-you-heading');
//   if (aboutHeading) aboutHeading.textContent = 'About';

//   // ── 2. HIDE UNUSED DOG SECTIONS ──────────────────────────────────────────

//   const unusedIds = [
//     'dog-age', 'dog-weight', 'dog-energy', 'dog-gender', 'dog-color',
//     'dog-vaccinated', 'dog-neutered', 'dog-description'
//   ];
//   unusedIds.forEach(id => {
//     const el = document.getElementById(id);
//     // walk up to the card tile (rounded-xl) and hide that
//     el?.closest('.bg-blue-50, .bg-green-50, .bg-orange-50, .border, .flex')?.classList.add('hidden');
//   });

//   // ── 3. PROFILE PHOTO ─────────────────────────────────────────────────────

//   const dogImage = document.getElementById('profile-image');
//   if (dogImage) {
//     dogImage.src = '/frontend/assets/default-profile.png';
//     dogImage.classList.remove('hidden');

//     const uploadBtn = document.createElement('label');
//     uploadBtn.className = 'mt-2 block text-center text-xs text-blue-400 cursor-pointer underline';
//     uploadBtn.textContent = 'Change photo';

//     const fileInput = document.createElement('input');
//     fileInput.type = 'file';
//     fileInput.accept = 'image/*';
//     fileInput.className = 'hidden';
//     fileInput.id = 'person-photo';

//     fileInput.addEventListener('change', (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         dogImage.src = URL.createObjectURL(file);
//         dogImage._file = file;
//       }
//     });

//     uploadBtn.appendChild(fileInput);
//     dogImage.parentElement.appendChild(uploadBtn);
//   }

//   // ── 4. LOCATION FIELDS (replace shelter card) ────────────────────────────

//   const shelterCard = document.querySelector('.max-w-2xl.mb-12');
//   if (shelterCard) {
//     shelterCard.innerHTML = `
//       <div class="flex items-center gap-2 mb-4">
//         <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
//           <circle cx="12" cy="10" r="3" stroke-width="2"/>
//         </svg>
//         <h2 class="text-lg font-bold text-gray-900">Your Location</h2>
//       </div>
//       <div class="grid grid-cols-3 gap-3">
//         <input id="person-city"  type="text" placeholder="City"      class="${inputClass}" />
//         <input id="person-state" type="text" placeholder="State (CA)" maxlength="2" class="${inputClass}" />
//         <input id="person-zip"   type="text" placeholder="ZIP"        maxlength="10" class="${inputClass}" />
//       </div>
//     `;
//   }

//   // ── 5. PREFERENCES — tag chips replacing the Tags section ────────────────

//   const tagsSection = document.getElementById('dog-tags');
//   const preferencesByCategory = {
//     'Energy':      ['high energy', 'moderate energy', 'low energy', 'couch potato', 'needs daily runs'],
//     'Social':      ['loves kids', 'dog friendly', 'loves cats', 'cat caution', 'good with seniors', 'social butterfly'],
//     'Space':       ['apartment ok', 'needs a yard', 'needs a big space', 'fenced yard required', 'indoor homebody'],
//     'Temperament': ['affectionate', 'playful', 'curious', 'gentle', 'loyal', 'calm', 'goofy', 'confident'],
//     'Training':    ['house trained', 'crate trained', 'leash trained', 'first-time owner ok', 'experienced owner needed'],
//     'Grooming':    ['low shedding', 'easy coat', 'hypoallergenic', 'regular grooming needed'],
//   };

//   if (tagsSection) {
//     const wrapper = tagsSection.closest('div') ?? tagsSection.parentElement;
//     wrapper.innerHTML = `<h2 class="text-lg font-bold text-gray-900 mb-3">Preferences</h2>`;

//     Object.entries(preferencesByCategory).forEach(([category, tags]) => {
//       const group = document.createElement('div');
//       group.className = 'mb-4';
//       group.innerHTML = `<p class="text-xs text-gray-400 uppercase tracking-wide mb-2">${category}</p>
//         <div class="flex flex-wrap gap-2" id="pref-group-${category}"></div>`;
//       wrapper.appendChild(group);

//       const chipContainer = group.querySelector(`#pref-group-${category}`);
//       tags.forEach(tag => {
//         const chip = document.createElement('button');
//         chip.type = 'button';
//         chip.textContent = tag;
//         chip.dataset.tag = tag;
//         chip.className = chipBase;
//         chip.addEventListener('click', () => {
//           const active = chip.classList.contains('bg-blue-500');
//           chip.className = active ? chipBase : chipActive;
//         });
//         chipContainer.appendChild(chip);
//       });
//     });
//   }

//   // ── 6. SUBMIT BUTTON ─────────────────────────────────────────────────────

//   const submitBtn = document.createElement('button');
//   submitBtn.textContent = 'Create Account';
//   submitBtn.className = 'w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl py-3 text-sm transition';
//   document.querySelector('.max-w-2xl.mb-12')?.appendChild(submitBtn);

//   submitBtn.addEventListener('click', async () => {
//     const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

//     const token  = sessionStorage.getItem('token');
//     const userId = sessionStorage.getItem('userId');

//     // Collect selected chips
//     const selectedTags = [...document.querySelectorAll('[data-tag].bg-blue-500')]
//       .map(el => el.dataset.tag);

//     // Build preference object matching your DB schema
//     const preferences = {
//       energy_level: selectedTags.filter(t => preferencesByCategory['Energy'].includes(t)),
//       social:       selectedTags.filter(t => preferencesByCategory['Social'].includes(t)),
//       space:        selectedTags.filter(t => preferencesByCategory['Space'].includes(t)),
//       temperament:  selectedTags.filter(t => preferencesByCategory['Temperament'].includes(t)),
//       training:     selectedTags.filter(t => preferencesByCategory['Training'].includes(t)),
//       grooming:     selectedTags.filter(t => preferencesByCategory['Grooming'].includes(t)),
//       special:      [],
//       raw_tags:     selectedTags,
//     };

//     const payload = {
//       unique_id: userId,
//       name:      get('person-name'),
//       image_url: '',              // set after photo upload if needed
//       location: {
//         city:  get('person-city'),
//         state: get('person-state').toUpperCase(),
//         zip:   get('person-zip'),
//       },
//       preferences,
//     };

//     if (!payload.name) {
//       alert('Please enter your name');
//       return;
//     }

//     console.log('Submitting:', payload);

//     try {
//       const res = await fetch('/api/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();

//       if (res.ok) {
//         window.location.href = '/frontend/views/feed-page.html';
//       } else {
//         alert(data.message || 'Registration failed');
//       }
//     } catch (err) {
//       console.error('Submit error:', err);
//       alert('Something went wrong');
//     }
//   });

//   // ── HELPERS ───────────────────────────────────────────────────────────────

//   const inputClass  = 'w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300';
//   const chipBase    = 'px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-600 bg-white hover:border-blue-300 transition';
//   const chipActive  = 'px-3 py-1 rounded-full text-xs border border-blue-500 text-white bg-blue-500 transition';

//   function replaceWithInput(el, id, type, placeholder) {
//     if (!el) return;
//     const input = document.createElement('input');
//     input.id = id;
//     input.type = type;
//     input.placeholder = placeholder;
//     input.className = el.className + ' border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300';
//     el.replaceWith(input);
//   }

// });

const ageSelect = document.getElementById('dog-age');
for (let i = 1; i <= 20; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = i === 1 ? '1 year' : `${i} years`;
  ageSelect.appendChild(opt);
}

const weightSelect = document.getElementById('dog-weight');
weightSelect.className = 'text-sm font-semibold text-gray-800 bg-green-50 border-none outline-none w-full cursor-pointer appearance-none';
for (let i = 1; i <= 120; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = `${i} lbs`;
  weightSelect.appendChild(opt);
}

const energySelect = document.getElementById('dog-energy');
energySelect.className = 'text-sm font-semibold text-gray-800 bg-orange-50 border-none outline-none w-full cursor-pointer appearance-none';

const energyOptions = [
  { label: '< 30 min',  value: 'low energy' },
  { label: '30–60 min', value: 'moderate energy' },
  { label: '1–2 hrs',   value: 'high energy' },
  { label: '2+ hrs',    value: 'needs daily runs' },
];

energyOptions.forEach(({ label, value }) => {
  const opt = document.createElement('option');
  opt.value = value;       // stores the DB tag
  opt.textContent = label; // shows human-friendly hours
  energySelect.appendChild(opt);
});
const genderEl = document.getElementById('dog-gender');
genderEl.outerHTML = `<select id="dog-gender" class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full cursor-pointer appearance-none mt-0.5">
  <option value="">--</option>
  <option value="male">Male 🐾 The Good Boy</option>
  <option value="female">Female 🌸 The Good Girl</option>
</select>`;

// Coat color — free text with fun placeholder
const colorEl = document.getElementById('dog-color');
colorEl.outerHTML = `<input id="dog-color" type="text" placeholder="e.g. the golden one..." 
  class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full mt-0.5 placeholder:font-normal placeholder:text-gray-300" />`;


const tagCategories = {
  'Personality': [
    'curious', 'playful', 'gentle', 'affectionate', 'loyal', 'goofy',
    'calm', 'confident', 'independent', 'spirited'
  ],
  'Social': [
    'loves kids', 'dog friendly', 'loves cats', 'cat caution',
    'good with seniors', 'only pet preferred', 'warms up slowly', 'social butterfly'
  ],
  'Energy': [
    'high energy', 'moderate energy', 'low energy', 'couch potato',
    'needs daily runs', 'loves fetch', 'loves swimming', 'loves hiking',
    'agility star', 'water baby', 'certified napper', 'loves car rides'
  ],
  'Lifestyle': [
    'toy hoarder', 'treat motivated', 'apartment ok', 'needs a yard',
    'needs a big space', 'fenced yard required', 'indoor homebody', 'outdoor lover',
    'quiet home preferred'
  ],
  'Training': [
    'house trained', 'crate trained', 'leash trained', 'knows basic commands',
    'loves learning', 'needs training', 'first-time owner ok', 'experienced owner needed'
  ],
  'Care': [
    'affectionate', 'gentle', 'loyal', 'cuddle bug', 'lap dog', 'velcro dog',
    'low shedding', 'heavy shedder', 'hypoallergenic', 'easy coat',
    'regular grooming needed', 'medical needs'
  ],
  'Special Notes': [
    'senior dog', 'separation anxiety', 'vocal', 'shy at first',
    'escape artist', 'resource guarder'
  ],
};

const chipBase   = 'px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-600 bg-white hover:border-blue-300 transition cursor-pointer select-none';
const chipActive = 'px-3 py-1 rounded-full text-xs border border-blue-500 text-white bg-blue-500 transition cursor-pointer select-none';

function buildTagChips() {
  const container = document.getElementById('dog-tags');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(tagCategories).forEach(([category, tags]) => {
    // Category label
    const label = document.createElement('p');
    label.className = 'w-full text-[10px] text-gray-400 uppercase tracking-wide mt-3 mb-1';
    label.textContent = category;
    container.appendChild(label);

    tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.textContent = tag;
      chip.dataset.tag = tag;
      chip.className = chipBase;

      chip.addEventListener('click', () => {
        const isActive = chip.classList.contains('bg-blue-500');
        chip.className = isActive ? chipBase : chipActive;
      });

      container.appendChild(chip);
    });
  });
}

buildTagChips();

// Collect selected tags for payload
function getSelectedTags() {
  return [...document.querySelectorAll('#dog-tags [data-tag].bg-blue-500')]
    .map(el => el.dataset.tag);
}

const params = new URLSearchParams(window.location.search);
const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage after login

async function loadProfile() {
  if (!userId) {
    console.error('use default template');
    return;
  }

  try {
    // const response = await fetch(`/api/dogprofile/${dogId}`);
    const response = await fetch(`http://localhost:3000/api/user/${userId}`); // must use vdog profile but changing rout on back end to ignore for testoing to cpnfirm
    const person = await response.json();

    if (!response.ok) {
      console.error('User not found');
      return;
    }

    // Basic info
    document.getElementById('user-name').textContent = person.name || 'Unknown';
    document.getElementById('dog-breed').textContent = dog.breed || 'Unknown breed';
    document.getElementById('dog-age').textContent = dog.age || 'N/A';
    document.getElementById('dog-weight').textContent = dog.weight || 'N/A';
    document.getElementById('dog-energy').textContent = dog.energy || 'N/A';
    document.getElementById('dog-gender').textContent = dog.gender || 'N/A';
    document.getElementById('dog-color').textContent = dog.color || 'N/A';
    document.getElementById('dog-description').textContent = person.bio || 'No description available.';
    document.getElementById('dog-about-heading').textContent = `About ${dog.name}`;

    // Image
    if (person.image_url) {
      const img = document.getElementById('profile-image');
      img.src = person.image_url;
      img.alt = person.name;
      document.getElementById('address').textContent = person.location || 'N/A';
    
      document.getElementById('shelter-name').textContent = dog.shelter.name || 'N/A';
      document.getElementById('shelter-address').textContent = dog.shelter.address || 'N/A';
      document.getElementById('shelter-phone').textContent = dog.shelter.phone || 'N/A';
      document.getElementById('shelter-email').textContent = dog.shelter.email || 'N/A';
    
      img.classList.remove('hidden');
    }

    // Health checks — turn icon green if true
    if (dog.vaccinated) {
      document.getElementById('dog-vaccinated').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
    }
    if (dog.neutered) {
      document.getElementById('dog-neutered').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
    }

    // Tags
    if (dog.tags && dog.tags.length > 0) {
      const tagsContainer = document.getElementById('dog-tags');
      tagsContainer.innerHTML = dog.tags.map(tag => `
        <div class="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-2">
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
            <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-sm text-gray-700">${tag}</span>
        </div>
      `).join('');
    }

    // Shelter info
    if (dog.shelter) {
      document.getElementById('shelter-name').textContent = dog.shelter.name || 'N/A';
      document.getElementById('shelter-address').textContent = dog.shelter.address || 'N/A';
      document.getElementById('shelter-phone').textContent = dog.shelter.phone || 'N/A';
      document.getElementById('shelter-email').textContent = dog.shelter.email || 'N/A';
    }

  } catch (error) {
    console.error('Error loading dog profile:', error);
  }
}
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Create Account';
  submitBtn.className = 'w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl py-3 text-sm transition';
  document.querySelector('.max-w-2xl.mb-12')?.appendChild(submitBtn);

  submitBtn.addEventListener('click', async () => {
    const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

    const token  = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    // Collect selected chips
    const selectedTags = [...document.querySelectorAll('[data-tag].bg-blue-500')]
      .map(el => el.dataset.tag);

    // Build preference object matching your DB schema
    const preferences = {
      energy_level: selectedTags.filter(t => preferencesByCategory['Energy'].includes(t)),
      social:       selectedTags.filter(t => preferencesByCategory['Social'].includes(t)),
      space:        selectedTags.filter(t => preferencesByCategory['Space'].includes(t)),
      temperament:  selectedTags.filter(t => preferencesByCategory['Temperament'].includes(t)),
      training:     selectedTags.filter(t => preferencesByCategory['Training'].includes(t)),
      grooming:     selectedTags.filter(t => preferencesByCategory['Grooming'].includes(t)),
      special:      [],
      raw_tags:     selectedTags,
    };
  });

loadDogProfile();