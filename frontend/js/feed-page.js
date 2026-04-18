// call backend for list of all dogs
const res = await fetch("/api/dogs"); // update route for all dogs <-----------
const profiles = await res.json();

// get the id for the feed box the profiles will go into
document.addEventListener("DOMContentLoaded", () => {
  const feedBox = document.getElementById("feed-box");
  if (!feedBox) return;

// if (!feedBox) return;
// for each profile in the array profiles...
profiles.forEach(profile => {
    // create div
    const card = document.createElement("div");
    // give div class names
    card.className = "profile snap-start relative w-full h-[33rem] rounded-xl overflow-hidden bg-cover bg-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]";
    // set background image
    card.style.backgroundImage = `url(${profile.image})`;
    // set inner content 🤍❤️
    card.innerHTML = `
        <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div class="name font-bold text-3xl">${profile.name}</div>
        </div>
        <button class="like absolute top-3 right-3 text-5xl">🤍</button>
    `;
    // redirect on card click
    card.addEventListener("click", () => {
        window.location.href = `profile.html?id=${profile.id}`;
    });

    // favorite button
    const button = card.querySelector(".like");
    button.addEventListener("click", async (e) => {
    e.stopPropagation();
    // get dog's id and user's id
    const dogId = profile.id;
    const userId = "123"; // need to update <---------------------
    // checks what the heart is currently at
    // if starts with ❤️ -> isLiked = true
    // if starts with 🤍 -> isLiked = false
    const isLiked = button.textContent === "❤️";
    // update 
    // if starts with ❤️ -> change to 🤍
    // if starts with 🤍 -> change to ❤️
    button.textContent = isLiked ? "🤍" : "❤️";

    try {
      if (!isLiked) {
        // ❤️ add to favorites
        await fetch(`/api/user/favorites/${userId}`, { // update favorites api route <------------------
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dogId })
        });
      } else {
        // 🤍 remove from favorites
        await fetch(`/api/user/favorites/${userId}/${dogId}`, { // update route <----------------------
          method: "DELETE"
        });
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);

      // revert back if it fails
      button.textContent = isLiked ? "❤️" : "🤍";
    }
  });

    // add div profile to feed-box and loop again until no more profiles
    feedBox.appendChild(card);
});
});