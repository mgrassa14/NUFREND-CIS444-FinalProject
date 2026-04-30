let currentTab = "login";
let accountType = "adopter";
const { ObjectId } = require('mongodb');

function switchTab(tab) {
  currentTab = tab;
  const slider = document.getElementById("tabSlider");
  const signInBtn = document.getElementById("tabLogin");
  const signUpBtn = document.getElementById("tabSignUp");
  const nameField = document.getElementById("nameField");
  const submitBtn = document.getElementById("submitBtn");

  if (tab === "signup") {
    slider.style.transform = "translateX(100%)";
    signInBtn.classList.replace("text-gray-900", "text-gray-500");
    signUpBtn.classList.replace("text-gray-500", "text-gray-900");
    nameField.style.maxHeight = "100px";
    submitBtn.textContent = "Sign Up";
  } else {
    slider.style.transform = "translateX(0)";
    signUpBtn.classList.replace("text-gray-900", "text-gray-500");
    signInBtn.classList.replace("text-gray-500", "text-gray-900");
    nameField.style.maxHeight = "0";
    submitBtn.textContent = "Login";
  }
}

function selectType(type) {
  accountType = type;
  const adopter = document.getElementById("cardAdopter");
  const shelter = document.getElementById("cardShelter");
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

async function handleSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('input-name')?.value.trim();
  const email     = document.getElementById('input-email').value.trim();
  const password  = document.getElementById('input-password').value.trim();


  if (currentTab === "login") {
    // --- LOGIN ---
    try {
      // const response = await fetch('/api/login', {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();// data.idToken is your JWT

      if (response.ok) {
        data.userType = accountType; // Add userType to the response data
       
        console.log(data.userId); // Log the generated userId
        
        
        sessionStorage.setItem('userId', data.userId);
        localStorage.setItem("userType", data.userType);
        
        sessionStorage.setItem('token', data.idToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = '/frontend/views/feed-page.html';
      } else {
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }

  } else {
    // --- SIGNUP ---
    try {
      // const response = await fetch('/api/signup', {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, email, password, accountType })
      });

      const data = await response.json();

      if (response.ok) {
        const newId = new ObjectId(); // client side mongo id generated for session storage, will be used to fetch user data in feed page
        sessionStorage.setItem('token', data.idToken);
        
        
        data.userType = accountType; // Add userType to the response data
        data.userId = newId.toString(); // Assign a new ObjectId as userId
        console.log(data.userId); // Log the generated userId
        
        
        sessionStorage.setItem('userId', data.userId);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = '/frontend/views/feed-page.html';
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    }
  }
}


// to handle login 
// localStorage.setItem("idToken", data.idToken);
// localStorage.setItem("refreshToken", data.refreshToken);
// localStorage.setItem("userId", data.userId);
// localStorage.setItem("userType", data.userType);
