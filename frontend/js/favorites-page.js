// import { getIdToken, getRefreshToken, getUserId, getUserType } from "./auth.js";

// get the id for the fav box the profiles will go into
document.addEventListener("DOMContentLoaded", async () => {

  // set profile link based on user type
  const userId = sessionStorage.getItem("userId");
  

  const favBox = document.getElementById("fav-box");
  if (!favBox) return;

  favBox.innerHTML = "";

  // get tokens and userId from localStorage
  // const idToken = getIdToken();
  // const refreshToken = getRefreshToken();
  // const userId = "85c3a4e5f6d2c3456789001a";

  // if not logged in, redirect to login
  // if (!idToken || !userId) {
  //   window.location.href = "/frontend/views/loginandsignupview.html";
  //   return;
  // }

  // const res = await fetch(`http://localhost:3000/api/user/favorites/${userId}`, {
  //   headers: {
  //     "Authorization": `Bearer ${idToken}`
  //   }
  // });
  const res = await fetch(`http://localhost:3000/api/user/favorites/${userId}`);
  // double check if it returns just ideas or all the dog data
  // const favorites = await res.json();

  const favData = await res.json();
  const favoriteIds = favData[0]?.liked_dogs || [];

  // 2. Fetch all dogs
  const dogRes = await fetch("http://localhost:3000/api/dogs");
  const allDogs = await dogRes.json();

  // 3. Filter to only favorites
  const favorites = allDogs.filter(dog => favoriteIds.includes(dog._id));

  favorites.forEach(profile => {
    const card = document.createElement("div");
    card.className =
      "profile snap-start relative w-full h-[33rem] rounded-xl overflow-hidden bg-cover bg-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]";
    card.style.backgroundImage = `url(${profile.photos[0]})`;

    card.innerHTML = `
      <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div class="name font-bold text-3xl">${profile.name}</div>
      </div>
      <button class="like absolute top-3 right-3 text-5xl">❤️</button>
    `;

    const button = card.querySelector(".like");
    button.addEventListener("click", async (e) => {
      e.stopPropagation();

      const isUnLiked = button.textContent === "❤️";
      button.textContent = isUnLiked ? "🤍" : "❤️";

      // un-favorite functionality
      if (isUnLiked) {
        await fetch(`http://localhost:3000/api/user/favorites/${userId}/${profile._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
      }
    });

    // clicking a favorite → go to profile
    card.addEventListener("click", () => {
        window.location.href = `dog-profile-view.html?id=${profile._id}`;
    });

    favBox.appendChild(card);
  });
});