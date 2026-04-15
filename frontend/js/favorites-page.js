  // -----------------------------------------
  // ❌ BACKEND NOT READY — SPA FETCH DISABLED
  // -----------------------------------------
  /*
  const res = await fetch("/api/favorites");
  const favorites = await res.json();
  */

  // -----------------------------------------
  // ✅ TEMPORARY FAKE FAVORITES DATA
  // -----------------------------------------
  const favorites = [
    {
      _id: 1,
      name: "Buddy",
      image: "https://t3.ftcdn.net/jpg/02/74/06/48/240_F_274064877_Tuq84kGOn5nhyIJeUFTUSvXaSeedAOTT.jpg"
    },
    {
      _id: 2,
      name: "Luna",
      image: ""
    },
    {
      _id: 3,
      name: "Max",
      image: "https://vetmed.tamu.edu/news/wp-content/uploads/sites/9/2023/05/Puppy-Timeline-1-1024x768.jpeg"
    }
  ];
  // -----------------------------------------

// get the id for the feed box the profiles will go into
document.addEventListener("DOMContentLoaded", () => {
  const favBox = document.getElementById("fav-box");
  if (!favBox) return;

  favBox.innerHTML = "";

  favorites.forEach(profile => {
    const card = document.createElement("div");
    card.className =
      "profile snap-start relative w-full h-[33rem] rounded-xl overflow-hidden bg-cover bg-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]";
    card.style.backgroundImage = `url(${profile.image})`;

    card.innerHTML = `
      <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div class="name font-bold text-3xl">${profile.name}</div>
      </div>
      <button class="like absolute top-3 right-3 text-5xl">❤️</button>
    `;

    const button = card.querySelector(".like");
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      button.textContent = button.textContent === "🤍" ? "❤️" : "🤍";
      // favorite functionality
      if(button.textContent == "❤️"){
        // check if dog is in favorites
        // if not in favorites
        // add to favorites 
      } else if (button.textContent == "🤍"){
        // check if dog is in favorites
        // if it is in favorties
        // remove from favorites
      }
    });

    // clicking a favorite → go to profile
    card.addEventListener("click", () => {
      navigate("profile", profile._id);
    });

    favBox.appendChild(card);
  });
});