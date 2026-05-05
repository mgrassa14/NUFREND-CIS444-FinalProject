
const userId = sessionStorage.getItem('userId');

// ── POPULATE SELECTS ──────────────────────────────────────
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
  opt.value = value;
  opt.textContent = label;
  energySelect.appendChild(opt);
});

const genderEl = document.getElementById('dog-gender');
genderEl.outerHTML = `<select id="dog-gender" class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full cursor-pointer appearance-none mt-0.5">
  <option value="">--</option>
  <option value="male">Male 🐾 The little prince</option>
  <option value="female">Female 🌸 The Good Girl</option>
</select>`;

const colorEl = document.getElementById('dog-color');
colorEl.outerHTML = `<input id="dog-color" type="text" placeholder="e.g. the golden one..." 
  class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full mt-0.5 placeholder:font-normal placeholder:text-gray-300" />`;

// ── TAG CHIPS ─────────────────────────────────────────────
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

const chipBase   = 'px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-600 bg-transparent hover:border-blue-300 transition cursor-pointer select-none';
const chipActive = 'px-3 py-1 rounded-full text-xs border border-blue-500 text-white bg-blue-500 transition cursor-pointer select-none';

function buildTagChips() {
  const container = document.getElementById('dog-tags');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(tagCategories).forEach(([category, tags]) => {
    const label = document.createElement('p');
    label.className = 'w-full text-[10px] text-gray-400 uppercase tracking-wide mt-3 mb-1';
    label.textContent = category;
    container.appendChild(label);

    tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.textContent = tag;
      chip.dataset.tag = tag;
      chip.dataset.active = 'false';
      chip.className = chipBase;
      chip.style.webkitTapHighlightColor = 'transparent';

      chip.addEventListener('click', () => {
        const isActive = chip.dataset.active === 'true';
        chip.dataset.active = String(!isActive);
        chip.className = isActive ? chipBase : chipActive;
        chip.style.webkitTapHighlightColor = 'transparent';
      });

      container.appendChild(chip);
    });
  });
}

// ── GET SELECTED TAGS ─────────────────────────────────────
function getSelectedTags() {
  return [...document.querySelectorAll('#dog-tags [data-tag]')]
    .filter(el => el.dataset.active === 'true')
    .map(el => el.dataset.tag);
}

// ── PREFILL FROM SESSION ──────────────────────────────────
function prefillFromSession() {
  const name  = sessionStorage.getItem('name');
  const email = sessionStorage.getItem('email');

  console.log('prefill name:', name);
  console.log('prefill email:', email);

  // Make sure these IDs match your createaccount.html inputs exactly
  const map = {
    'user-name':  name,
    'user-email': email,
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value && value !== 'undefined') el.value = value;
  });
}
async function prefillProfile() {
  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    console.log("No userId in sessionStorage, falling back to session data");
    prefillFromSession();
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/user/${userId}`);

    if (!res.ok) {
      throw new Error("User not found in DB");
    }

    const user = await res.json();

    console.log("DB user loaded:", user);

    const map = {
      // basic fields
      'user-name': user.name,
      'user-email': user.email,
      'user-bio': user.bio,
      'user-phone': user.phone,

      // location (flattened)
      'person-city': user.location?.city,
      'person-state': user.location?.state,
      'person-zip': user.location?.zip,

      // preferences (flattened examples)
      'dog-age': user.preferences?.preferred_age,
      'dog-energy': user.preferences?.preferred_energy,
      'dog-gender': user.preferences?.preferred_gender,
      'dog-color': user.preferences?.preferred_color,
      'dog-weight': user.preferences?.preferred_weight?.max,
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null && value !== '') {
        el.value = value;
      }
    });

    // optional: log images or arrays
    console.log("Liked dogs:", user.liked_dogs);
    console.log("Image URL:", user.image_url);

  } catch (err) {
    console.warn("DB fetch failed, using sessionStorage fallback:", err);
    prefillFromSession();
  }
}
  // // // ── PHOTO UPLOAD ──────────────────────────────────────────
document.getElementById('photo-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('profile-image');
    img.src = e.target.result;
    img.classList.remove('hidden');
    document.getElementById('photo-placeholder')?.classList.add('hidden');
  };
  reader.readAsDataURL(file);


 });
// ── LOAD PROFILE ──────────────────────────────────────────
async function loadProfile() {
 prefillProfile();
}

//   try {
// //     const response = await fetch(`http://localhost:3000/api/user/${userId}`);
// //     const person = await response.json();

// //     if (!response.ok) {
// //       console.error('User not found');
// //       prefillFromSession(); // still prefill even if fetch fails
// //       return;
// //     }

// //     // Image
// //     if (person.image_url) {
// //       const img = document.getElementById('profile-image');
// //       img.src = person.image_url;
// //       img.alt = person.name;
// //       img.classList.remove('hidden');
// //       document.getElementById('photo-placeholder')?.classList.add('hidden');
// //     }

// //     // Prefill inputs from person data if available, else fall back to session
// //     const nameEl  = document.getElementById('user-name');
// //     const emailEl = document.getElementById('user-email');
// //     const bioEl   = document.getElementById('dog-description');
// //     const phoneEl = document.getElementById('user-phone');

// //     if (nameEl)  nameEl.value  = person.name  || sessionStorage.getItem('name')  || '';
// //     if (emailEl) emailEl.value = person.email || sessionStorage.getItem('email') || '';
// //     if (bioEl)   bioEl.value   = person.bio   || '';
// //     if (phoneEl) phoneEl.value = person.phone || '';

// //     // Location
// //     if (person.location) {
// //       const cityEl  = document.getElementById('person-city');
// //       const stateEl = document.getElementById('person-state');
// //       const zipEl   = document.getElementById('person-zip');
// //       if (cityEl)  cityEl.value  = person.location.city  || '';
// //       if (stateEl) stateEl.value = person.location.state || '';
// //       if (zipEl)   zipEl.value   = person.location.zip   || '';
// //     }

// //   } catch (error) {
// //     console.error('Error loading profile:', error);
// //     prefillFromSession(); // fallback on error
// //   }
// // }

// // // ── PHOTO UPLOAD ──────────────────────────────────────────
// // document.getElementById('photo-upload').addEventListener('change', async (e) => {
// //   const file = e.target.files[0];
// //   if (!file) return;

// //   const reader = new FileReader();
// //   reader.onload = (e) => {
// //     const img = document.getElementById('profile-image');
// //     img.src = e.target.result;
// //     img.classList.remove('hidden');
// //     document.getElementById('photo-placeholder')?.classList.add('hidden');
// //   };
// //   reader.readAsDataURL(file);

// //   const formData = new FormData();
// //   formData.append('image', file);
// //   formData.append('userId', userId);

// //   try {
// //     const res = await fetch('/api/upload-image', {
// //       method: 'POST',
// //       headers: { 'Authorization': `Bearer ${sessionStorage.getItem('idToken')}` },
// //       body: formData
// //     });
// //     const data = await res.json();
// //     if (res.ok) {
// //       sessionStorage.setItem('image_url', data.image_url);
// //     } else {
// //       console.error('Upload failed:', data.message);
// //     }
// //   } catch (err) {
// //     console.error('Upload error:', err);
// //   }
// });

// ── SUBMIT BUTTON ─────────────────────────────────────────
const submitBtn = document.createElement('button');
submitBtn.textContent = 'Create Account';
submitBtn.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl py-3 text-sm transition';

const btnWrapper = document.createElement('div');
btnWrapper.className = 'max-w-2xl mx-auto px-4 mb-8';
btnWrapper.appendChild(submitBtn);
document.querySelector('.max-w-2xl.mb-12')?.insertAdjacentElement('afterend', btnWrapper);

// ── INIT ──────────────────────────────────────────────────
buildTagChips();
loadProfile();

// ── SUBMIT HANDLER ────────────────────────────────────────

submitBtn.addEventListener('click', async () => {
  const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

  const token = sessionStorage.getItem('idToken');
  const userId = sessionStorage.getItem('userId'); // ✅ FIX: ensure defined

  let imageUrl = sessionStorage.getItem('image_url') ?? ''; // ✅ FIX: must be declared

  const selectedTags = getSelectedTags();
  const errors = [];

  const name  = get('user-name');
  const email = get('user-email');
  const phone = get('user-phone');
  const city  = get('person-city');
  const state = get('person-state').toUpperCase();
  const zip   = get('person-zip');

  if (!name) errors.push('Please enter your name');
  if (!email || !email.includes('@')) errors.push('Please enter a valid email');
  if (!phone) errors.push('Please enter a phone number');
  if (!city || !state || !zip) errors.push('Please enter full location');
  if (zip && !/^\d{5}$/.test(zip)) errors.push('Zip must be 5 digits');
  if (state && !/^[A-Z]{2}$/.test(state)) errors.push('State must be 2-letter');
  if (selectedTags.length === 0) errors.push('Select at least one tag');

  if (errors.length > 0) {
    alert(errors.join('\n'));
    return;
  }

  const file = document.getElementById('photo-upload').files[0];

  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    try {
      const uploadRes = await fetch('http://localhost:3000/api/user/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();

      console.log("UPLOAD RESPONSE:", uploadData);

      if (uploadRes.ok) {
        imageUrl = uploadData.image_url; // ✅ safe assignment
        sessionStorage.setItem('image_url', imageUrl);
      } else {
        console.warn('Image upload failed:', uploadData.message);
      }

    } catch (err) {
      console.warn('Image upload error:', err);
    }
  }

  // ✅ NOW imageUrl is guaranteed resolved before payload
  const payload = {
    _id: userId,
    name,
    bio: get('user-bio'),
    email,
    phone,
    image_url: imageUrl, // ✅ always defined now
    location: { city, state, zip },

    preferences: {
      raw_tags: selectedTags,
      preferred_age: document.getElementById('dog-age')?.value ?? '',
      preferred_energy: document.getElementById('dog-energy')?.value ?? '',
      preferred_gender: document.getElementById('dog-gender')?.value ?? '',
      preferred_weight: { max: document.getElementById('dog-weight')?.value ?? '' },
      preferred_color: get('dog-color'),
    },

    liked_dogs: [],
    passed_dogs: [],
  };

  console.log('Submitting:', payload);

  try {
    const res = await fetch('http://localhost:3000/api/user/create-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/frontend/views/feed-page.html';
    } else {
      alert(data.message || 'Registration failed');
    }

  } catch (err) {
    console.error('Submit error:', err);
    alert('Something went wrong');
  }
});
// submitBtn.addEventListener('click', async () => {
//   const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

//   const token    = sessionStorage.getItem('idToken');
//   //const imageUrl = sessionStorage.getItem('image_url') ?? '';
//   const selectedTags = getSelectedTags();
//   const errors = [];

//   const name  = get('user-name');
//   const email = get('user-email');
//   const phone = get('user-phone');
//   const city  = get('person-city');
//   const state = get('person-state').toUpperCase();
//   const zip   = get('person-zip');

//   if (!name)                               errors.push('Please enter your name');
//   if (!email || !email.includes('@'))      errors.push('Please enter a valid email');
//   if (!phone)                              errors.push('Please enter a phone number');
//   if (!city || !state || !zip)             errors.push('Please enter your full location (city, state, zip)');
//   if (zip   && !/^\d{5}$/.test(zip))       errors.push('Zip code must be 5 digits');
//   if (state && !/^[A-Z]{2}$/.test(state))  errors.push('State must be a 2-letter abbreviation');
//   // if (!imageUrl)                           errors.push('Please upload a profile photo');
//   if (selectedTags.length === 0)           errors.push('Please select at least one tag');

//   if (errors.length > 0) {
//     alert(errors.join('\n'));
//     return;
//   }
   
//   const file = document.getElementById('photo-upload').files[0];
//   if (file) {
//     const formData = new FormData();
//     formData.append('image', file);
//     console.log("userId:", userId);
//     formData.append('userId', userId);

//     try {
//       const uploadRes = await fetch(`http://localhost:3000/api/user/upload-image`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}` },
//         body: formData
//       });
//       const uploadData = await uploadRes.json();
//       if (uploadRes.ok) {
//         imageUrl = uploadData.image_url;
//         sessionStorage.setItem('image_url', imageUrl);
//       } else {
//         console.warn('Image upload failed:', uploadData.message);
//       }
//     } catch (err) {
//       console.warn('Image upload error:', err);
//     }
//   }


//   const payload = {
//     "_id":  userId,
//     name,
//     bio:        get('user-bio'),
//     email,
//     phone,
//     image_url:  imageUrl,
//     location:   { city, state, zip },

//     preferences: {
//       raw_tags:         selectedTags,
//       preferred_age:    document.getElementById('dog-age')?.value    ?? '',
//       preferred_energy: document.getElementById('dog-energy')?.value ?? '',
//       preferred_gender: document.getElementById('dog-gender')?.value ?? '',
//       preferred_weight: { max: document.getElementById('dog-weight')?.value ?? '' },
//       preferred_color:  get('dog-color'),
//     },

//     liked_dogs:  [],
//     passed_dogs: [],
//   };

//   console.log('Submitting:', payload);

//   try {
//     const res = await fetch('http://localhost:3000/api/user/create-profile', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(payload)
//     });

//     const data = await res.json();

//     if (res.ok) {
//       window.location.href = '/frontend/views/feed-page.html';
//     } else {
//       alert(data.message || 'Registration failed');
//     }
//   } catch (err) {
//     console.error('Submit error:', err);
//     alert('Something went wrong');
//   }
// });

























// const email = sessionStorage.getItem('email');

// const ageSelect = document.getElementById('dog-age');
// for (let i = 1; i <= 20; i++) {
//   const opt = document.createElement('option');
//   opt.value = i;
//   opt.textContent = i === 1 ? '1 year' : `${i} years`;
//   ageSelect.appendChild(opt);
// }

// const weightSelect = document.getElementById('dog-weight');
// weightSelect.className = 'text-sm font-semibold text-gray-800 bg-green-50 border-none outline-none w-full cursor-pointer appearance-none';
// for (let i = 1; i <= 120; i++) {
//   const opt = document.createElement('option');
//   opt.value = i;
//   opt.textContent = `${i} lbs`;
//   weightSelect.appendChild(opt);
// }

// const energySelect = document.getElementById('dog-energy');
// energySelect.className = 'text-sm font-semibold text-gray-800 bg-orange-50 border-none outline-none w-full cursor-pointer appearance-none';

// const energyOptions = [
//   { label: '< 30 min', value: 'low energy' },
//   { label: '30–60 min', value: 'moderate energy' },
//   { label: '1–2 hrs', value: 'high energy' },
//   { label: '2+ hrs', value: 'needs daily runs' },
// ];

// energyOptions.forEach(({ label, value }) => {
//   const opt = document.createElement('option');
//   opt.value = value;       // stores the DB tag
//   opt.textContent = label; // shows human-friendly hours
//   energySelect.appendChild(opt);
// });

// const genderEl = document.getElementById('dog-gender');
// genderEl.outerHTML = `<select id="dog-gender" class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full cursor-pointer appearance-none mt-0.5">
//   <option value="">--</option>
//   <option value="male">Male 🐾 The little prince</option>
//   <option value="female">Female 🌸 The Good Girl</option>
// </select>`;

// // Coat color — free text with fun placeholder
// const colorEl = document.getElementById('dog-color');
// colorEl.outerHTML = `<input id="dog-color" type="text" placeholder="e.g. the golden one..." 
//   class="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-full mt-0.5 placeholder:font-normal placeholder:text-gray-300" />`;


// const tagCategories = {
//   'Personality': [
//     'curious', 'playful', 'gentle', 'affectionate', 'loyal', 'goofy',
//     'calm', 'confident', 'independent', 'spirited'
//   ],
//   'Social': [
//     'loves kids', 'dog friendly', 'loves cats', 'cat caution',
//     'good with seniors', 'only pet preferred', 'warms up slowly', 'social butterfly'
//   ],
//   'Energy': [
//     'high energy', 'moderate energy', 'low energy', 'couch potato',
//     'needs daily runs', 'loves fetch', 'loves swimming', 'loves hiking',
//     'agility star', 'water baby', 'certified napper', 'loves car rides'
//   ],
//   'Lifestyle': [
//     'toy hoarder', 'treat motivated', 'apartment ok', 'needs a yard',
//     'needs a big space', 'fenced yard required', 'indoor homebody', 'outdoor lover',
//     'quiet home preferred'
//   ],
//   'Training': [
//     'house trained', 'crate trained', 'leash trained', 'knows basic commands',
//     'loves learning', 'needs training', 'first-time owner ok', 'experienced owner needed'
//   ],
//   'Care': [
//     'affectionate', 'gentle', 'loyal', 'cuddle bug', 'lap dog', 'velcro dog',
//     'low shedding', 'heavy shedder', 'hypoallergenic', 'easy coat',
//     'regular grooming needed', 'medical needs'
//   ],
//   'Special Notes': [
//     'senior dog', 'separation anxiety', 'vocal', 'shy at first',
//     'escape artist', 'resource guarder'
//   ],
// };


// const chipBase = 'px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-600 bg-transparent hover:border-blue-300 transition cursor-pointer select-none';
// const chipActive = 'px-3 py-1 rounded-full text-xs border border-blue-500 text-white bg-blue-500 transition cursor-pointer select-none';

// function buildTagChips() {
//   const container = document.getElementById('dog-tags');
//   if (!container) return;

//   container.innerHTML = '';

//   Object.entries(tagCategories).forEach(([category, tags]) => {
//     // Category label
//     const label = document.createElement('p');
//     label.className = 'w-full text-[10px] text-gray-400 uppercase tracking-wide mt-3 mb-1';
//     label.textContent = category;
//     container.appendChild(label);

//     tags.forEach(tag => {
//       const chip = document.createElement('span');
//       chip.textContent = tag;
//       chip.dataset.tag = tag;
//       chip.className = chipBase;
//       chip.style.webkitTapHighlightColor = 'transparent'; // ← kills tap flash

//       chip.addEventListener('click', () => {
//         const isActive = chip.dataset.active === 'true';
//         chip.dataset.active = !isActive;
//         chip.className = isActive ? chipBase : chipActive;
//       });

//       container.appendChild(chip);
//     });
//   });
// }

// buildTagChips();

// // Collect selected tags for payload
// function getSelectedTags() {
//   return [...document.querySelectorAll('#dog-tags [data-tag].bg-blue-500')]
//     .filter(el => el.dataset.active === 'true')
//     .map(el => el.dataset.tag);
// }

// document.getElementById('photo-upload').addEventListener('change', async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   // Preview immediately
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     const img = document.getElementById('profile-image');
//     img.src = e.target.result;
//     img.classList.remove('hidden');
//     // Hide placeholder once image loads
//     document.getElementById('photo-placeholder')?.classList.add('hidden');
//   };
//   reader.readAsDataURL(file);

//   // Upload to your backend
//   const formData = new FormData();
//   formData.append('image', file);
//   formData.append('userId', sessionStorage.getItem('userId'));

//   try {
//     const res = await fetch('/api/upload-image', {
//       method: 'POST',
//       headers: { 'Authorization': `Bearer ${sessionStorage.getItem('idToken')}` },
//       body: formData  // don't set Content-Type — browser sets it with boundary automatically
//     });

//     const data = await res.json();
//     if (res.ok) {
//       // Store URL so payload can use it
//       sessionStorage.setItem('image_url', data.image_url);
//     } else {
//       console.error('Upload failed:', data.message);
//     }
//   } catch (err) {
//     console.error('Upload error:', err);
//   }
// });

// const params = new URLSearchParams(window.location.search);
// const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage after login

// async function loadProfile() {
//   if (!userId) {
//     console.error('use default template');
//     return;
//   }

//   try {
//     // const response = await fetch(`/api/dogprofile/${dogId}`);
//     const response = await fetch(`http://localhost:3000/api/user/${userId}`); // must use vdog profile but changing rout on back end to ignore for testoing to cpnfirm
//     const person = await response.json();

//     if (!response.ok) {
//       console.error('User not found');
//       return;
//     }

//     // Image
//     if (person.image_url) {
//       const img = document.getElementById('profile-image');
//       img.src = person.image_url;
//       img.alt = person.name;

//       img.classList.remove('hidden');
//     }

//     // Basic info
//     document.getElementById('user-name').textContent = person.name || 'Unknown';
//     document.getElementById('user-address').textContent = person.location || 'N/A';
//     document.getElementById('user-phone').textContent = dog.shelter.phone || 'N/A';
//     document.getElementById('user-email').textContent = email || 'N/A';
//     document.getElementById('about-you-heading').textContent = `About ${person.name}`;
//     document.getElementById('user-bio').textContent = person.bio || 'No description available.';


//     document.getElementById('dog-breed').textContent = dog.breed || 'Unknown breed';
//     document.getElementById('dog-age').textContent = dog.age || 'N/A';
//     document.getElementById('dog-weight').textContent = dog.weight || 'N/A';
//     document.getElementById('dog-energy').textContent = dog.energy || 'N/A';
//     document.getElementById('dog-gender').textContent = dog.gender || 'N/A';
//     document.getElementById('dog-color').textContent = dog.color || 'N/A';


//     // Health checks — turn icon green if true
//     if (dog.vaccinated) {
//       document.getElementById('dog-vaccinated').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
//     }
//     if (dog.neutered) {
//       document.getElementById('dog-neutered').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
//     }

//   } catch (error) {
//     console.error('Error loading persons profile and preferences:', error);
//   }
// }

// const submitBtn = document.createElement('button');
// submitBtn.textContent = 'Create Account';
// submitBtn.className = 'w-full mt-6 bg-blue-500 hover:bg-blue-600 text-black font-semibold rounded-2xl py-3 text-sm transition';
// document.querySelector('.max-w-2xl.mb-12')?.appendChild(submitBtn);


// loadProfile();


// submitBtn.addEventListener('click', async () => {





//   const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

//   const token = sessionStorage.getItem('idToken');
//   const userId = sessionStorage.getItem('userId');
//   const email = sessionStorage.getItem('email');
//   const name = sessionStorage.getItem('name');
// const imageUrl = sessionStorage.getItem('image_url') ?? '';
//   const selectedTags = getSelectedTags();
// const errors = [];

// const name     = get('user-name');
// const email    = get('user-email');
// const phone    = get('user-phone');
// const city     = get('person-city');
// const state    = get('person-state').toUpperCase();
// const zip      = get('person-zip');


// if (!name)                              errors.push('Please enter your name');
// if (!email || !email.includes('@'))     errors.push('Please enter a valid email');
// if (!phone)                             errors.push('Please enter a phone number');
// if (!city || !state || !zip)            errors.push('Please enter your full location (city, state, zip)');
// if (zip && !/^\d{5}$/.test(zip))        errors.push('Zip code must be 5 digits');
// if (state && !/^[A-Z]{2}$/.test(state)) errors.push('State must be a 2-letter abbreviation');
// if (!imageUrl)                          errors.push('Please upload a profile photo');
// if (selectedTags.length === 0)          errors.push('Please select at least one tag');

// if (errors.length > 0) {
//   alert(errors.join('\n'));
//   return;
// }

// const payload = {
//   // PERSON
//   unique_id: userId,
//   name,
//   bio:       get('dog-description'),
//   email,
//   phone,
//   image_url: imageUrl,
//   location: { city, state, zip },
//   // const payload = {
//   //   // ── PERSON ATTRIBUTES ──────────────────────────────
//   //   unique_id: userId,
//   //   name: name,        // person's name
//   //   bio: get('user-bio'), // person's about/bio
//   //   email: email,     // contact email
//   //   phone: get('user-phone'),     // contact phone
//   //   image_url: '',                     // set after photo upload
//   //   location: {
//   //     city: get('person-city'),
//   //     state: get('person-state').toUpperCase(),
//   //     zip: get('person-zip'),
//   //   },

//     // ── DOG PREFERENCES (what they want in a dog) ──────
//     preferences: {
//       // energy_level: selectedTags.filter(t => tagCategories['Energy'].includes(t)),
//       // social:       selectedTags.filter(t => tagCategories['Social'].includes(t)),
//       // space:        selectedTags.filter(t => tagCategories['Lifestyle'].includes(t)),
//       // temperament:  selectedTags.filter(t => tagCategories['Personality'].includes(t)),
//       // training:     selectedTags.filter(t => tagCategories['Training'].includes(t)),
//       // grooming:     selectedTags.filter(t => tagCategories['Care'].includes(t)),
//       // special:      selectedTags.filter(t => tagCategories['Special Notes'].includes(t)),
//       raw_tags: selectedTags,

//       // Specific dog attributes they prefer
//       preferred_energy: document.getElementById('dog-age')?.value ?? '',
//       preferred_energy: document.getElementById('dog-energy')?.value ?? '',
//       preferred_gender: document.getElementById('dog-gender')?.value ?? '',
//       preferred_weight: {
//         max: document.getElementById('dog-weight')?.value ?? ''
//       },
//       preferred_color: get('dog-color'),
//     },

//     // ── METADATA ───────────────────────────────────────
//     liked_dogs: [],
//     passed_dogs: [],
//     // created_at:  new Date(),
//     // updated_at:  new Date(), // set by backend
//   };

//   // Basic validation
//   if (!payload.name) {
//     alert('Please enter your name');
//     return;
//   }

//   console.log('Submitting:', payload);

//   try {
//     print(payload);
//     const res = await fetch('/api/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(payload)
//     });

//     const data = await res.json();

//     if (res.ok) {
//       window.location.href = '/frontend/views/feed-page.html';
//     } else {
//       alert(data.message || 'Registration failed');
//     }
//   } catch (err) {
//     console.error('Submit error:', err);
//     alert('Something went wrong');
//   }
// });