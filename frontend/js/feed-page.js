// import { getIdToken, getRefreshToken, getUserId, getUserType } from "./auth.js";

// get the id for the feed box the profiles will go into
document.addEventListener("DOMContentLoaded", async () => {

  // set profile link based on user type
  // const userType = localStorage.getItem("userType");
  const userType = localStorage.getItem("userType");   // hard‑coded for testing
  console.log(userType);
  const profileLink = document.getElementById("profileLink");

  if (profileLink) {
    if (userType === 'adopter') {
      profileLink.href = "../views/createaccount.html";
    } else if (userType === 'shelter') {
      profileLink.href = "../views/business.html";
    } else {
      profileLink.href = "../views/loginandsignupview.html";
    }
  }

  const feedBox = document.getElementById("feed-box");
  if (!feedBox) return;

  // get tokens and userId from localStorage
  // const idToken = getIdToken();
  // const refreshToken = getRefreshToken();
  // const userId = getUserId();

  // if not logged in, redirect to login
  // if (!idToken || !userId) {
  //   window.location.href = "/frontend/views/loginandsignupview.html";
  //   return;
  // }

  const res = await fetch("http://localhost:3000/api/dogs");
  const profiles = await res.json();

// if (!feedBox) return;
// for each profile in the array profiles...
profiles.forEach(profile => {
    // create div
    const card = document.createElement("div");
    // give div class names
    card.className = "profile snap-start relative w-full h-[33rem] rounded-xl overflow-hidden bg-cover bg-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]";
    // set background image
    card.style.backgroundImage = `url(${profile.photos[0]})`;
    // set inner content ❤️
    card.innerHTML = `
        <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div class="name font-bold text-3xl">${profile.name}</div>
        </div>
        <button class="like absolute top-3 right-3 text-5xl">🤍</button>
    `;

    // favorite button (prevent redirect)
    const button = card.querySelector(".like");
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      
      const isLiking = button.textContent === "🤍";
      button.textContent = isLiking ? "❤️" : "🤍";

      // favorite functionality
      if (isLiking) {
        await fetch(`http://localhost:3000/api/user/favorites/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ dogId: profile._id })
        });
      } else {
        await fetch(`http://localhost:3000/api/user/favorites/${userId}/${profile._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
      }
    });

    // redirect on card click
    card.addEventListener("click", () => {
        window.location.href = `dog-profile-view.html?id=${profile._id}`;
    });

    // add div profile to feed-box and loop again until no more profiles
    feedBox.appendChild(card);
});
});