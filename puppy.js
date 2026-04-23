const pets = document.getElementById('pets');
const kids = document.getElementById('kids');

let hasPets = true;
let hasKids = false;

pets.addEventListener('click', () => {
  hasPets = !hasPets;
  pets.textContent = hasPets ? '🐾 Has Pets' : '🚫 No Pets';
  pets.classList.toggle('toggle');
});

kids.addEventListener('click', () => {
  hasKids = !hasKids;
  kids.textContent = hasKids ? '👶 Has Kids' : '🚫 No Kids';
  kids.classList.toggle('toggle');
});