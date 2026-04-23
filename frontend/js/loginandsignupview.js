let currentTab = "Login";
let accountType = "adopter";

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

function handleSubmit(e) {
  e.preventDefault();
  const action = currentTab === "Login" ? "Signing in" : "Signing up";
  alert(`${action} as ${accountType}`);
}

// have a fetch api call post method that will send the name username, password to (route) 
// get back token
// get back confirmation 200 