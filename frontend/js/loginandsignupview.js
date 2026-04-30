let currentTab = "login";
let accountType = "adopter";

// ── API base URL ──────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ── Token helpers ─────────────────────────────────
function saveTokens(data) {
  localStorage.setItem('idToken',      data.idToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userId',       data.userId);
  localStorage.setItem('userType',     data.userType || '');
  localStorage.setItem('uid',          data.uid);
}

function getIdToken() {
  return localStorage.getItem('idToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function clearTokens() {
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
  localStorage.removeItem('uid');
}

// ── Authenticated fetch wrapper ───────────────────
// Use this for any API call that needs auth:
//   const res = await authFetch('/api/Vuser/123');
//   const data = await res.json();
async function authFetch(url, options = {}) {
  let token = getIdToken();

  if (!token) {
    // No token at all — redirect to login
    window.location.href = '/views/loginandsignupview.html';
    return;
  }

  // Set Authorization header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  let response = await fetch(url, options);

  // If token expired (401), try refreshing once
  if (response.status === 401) {
    const refreshed = await refreshIdToken();
    if (refreshed) {
      // Retry with new token
      options.headers['Authorization'] = `Bearer ${getIdToken()}`;
      response = await fetch(url, options);
    } else {
      // Refresh failed — send to login
      clearTokens();
      window.location.href = '/views/loginandsignupview.html';
      return;
    }
  }

  return response;
}

// ── Refresh the idToken using refreshToken ────────
async function refreshIdToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('idToken',      data.idToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch (err) {
    console.error('Token refresh failed:', err);
    return false;
  }
}

// ── Tab switching ─────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  const slider   = document.getElementById("tabSlider");
  const signInBtn = document.getElementById("tabLogin");
  const signUpBtn = document.getElementById("tabSignUp");
  const nameField = document.getElementById("nameField");
  const accountTypeField = document.getElementById("accountTypeField");
  const submitBtn = document.getElementById("submitBtn");

  if (tab === "signup") {
    slider.style.transform = "translateX(100%)";
    signInBtn.classList.replace("text-gray-900", "text-gray-500");
    signUpBtn.classList.replace("text-gray-500", "text-gray-900");
    nameField.style.maxHeight = "100px";
    accountTypeField.style.maxHeight = "200px";
    submitBtn.textContent = "Sign Up";
  } else {
    slider.style.transform = "translateX(0)";
    signUpBtn.classList.replace("text-gray-900", "text-gray-500");
    signInBtn.classList.replace("text-gray-500", "text-gray-900");
    nameField.style.maxHeight = "0";
    accountTypeField.style.maxHeight = "0";
    submitBtn.textContent = "Login";
  }
}

// ── Account type selection ────────────────────────
function selectType(type) {
  accountType = type;
  const adopter   = document.getElementById("cardAdopter");
  const shelter   = document.getElementById("cardShelter");
  const nameLabel = document.getElementById("nameLabel");

  if (type === "adopter") {
    adopter.classList.add("border-indigo-500", "bg-indigo-50");
    adopter.classList.remove("border-gray-200", "bg-white");
    shelter.classList.add("border-gray-200", "bg-white");
    shelter.classList.remove("border-indigo-500", "bg-indigo-50");
    nameLabel.textContent = "Full Name";
  } else {
    shelter.classList.add("border-indigo-500", "bg-indigo-50");
    shelter.classList.remove("border-gray-200", "bg-white");
    adopter.classList.add("border-gray-200", "bg-white");
    adopter.classList.remove("border-indigo-500", "bg-indigo-50");
    nameLabel.textContent = "Shelter Name";
  }
}

function openModal() {
  document.getElementById("modalBackdrop").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalBackdrop").style.display = "none";
}

// ── Form submission ───────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('input-name')?.value.trim();
  const email     = document.getElementById('input-email').value.trim();
  const password  = document.getElementById('input-password').value.trim();

  if (currentTab === "login") {
    // ── LOGIN ──
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens + user info
        saveTokens(data);
        window.location.href = '/views/feed-page.html';
      } else {
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }

  } else {
    // ── SIGNUP ──
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, email, password, accountType })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens + user info
        saveTokens(data);
        window.location.href = '/views/feed-page.html';
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    }
  }
}