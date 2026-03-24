// sample dog dog profiles
const profiles = [
  {
    name: "Buddy",
    image: "https://t3.ftcdn.net/jpg/02/74/06/48/240_F_274064877_Tuq84kGOn5nhyIJeUFTUSvXaSeedAOTT.jpg"
  },
  {
    name: "Luna",
    image: "https://karenhoglundphotography.com/wp-content/uploads/2020/09/Maltese-puppy.jpg"
  },
  {
    name: "Max",
    image: "https://vetmed.tamu.edu/news/wp-content/uploads/sites/9/2023/05/Puppy-Timeline-1-1024x768.jpeg"
  }
];
// get the id for the feed box the profiles will go into
const feedBox = document.getElementById("feed-box");
// for each profile in the array profiles...
profiles.forEach(profile => {
    // create div
    const card = document.createElement("div");
    // give div class names
    card.className =
        "profile relative w-full max-w-[450px] min-w-[350px] mx-auto h-[33rem] rounded-xl overflow-hidden bg-cover bg-center";
    // set background image
    card.style.backgroundImage = `url(${profile.image})`;
    // set inner content ❤️
    card.innerHTML = `
        <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div class="name font-bold text-3xl">${profile.name}</div>
        </div>
        <button class="favorite absolute top-3 right-3 text-5xl">🤍</button>
    `;
    // add div profile to feed-box and loop again until no more profiles
    feedBox.appendChild(card);
});