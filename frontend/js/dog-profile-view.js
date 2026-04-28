const params = new URLSearchParams(window.location.search);
const dogId = params.get('id');

async function loadDogProfile() {
  if (!dogId) {
    console.error('No dog ID in URL');
    return;
  }

  try {
    const response = await fetch(`/api/dogprofile/${dogId}`);
    const dog = await response.json();

    if (!response.ok) {
      console.error('Dog not found');
      return;
    }

    // Basic info
    document.getElementById('dog-name').textContent = dog.name || 'Unknown';
    document.getElementById('dog-breed').textContent = dog.breed || 'Unknown breed';
    document.getElementById('dog-age').textContent = dog.age || 'N/A';
    document.getElementById('dog-weight').textContent = dog.weight || 'N/A';
    document.getElementById('dog-energy').textContent = dog.energy || 'N/A';
    document.getElementById('dog-gender').textContent = dog.gender || 'N/A';
    document.getElementById('dog-color').textContent = dog.color || 'N/A';
    document.getElementById('dog-description').textContent = dog.description || 'No description available.';
    document.getElementById('dog-about-heading').textContent = `About ${dog.name}`;

    // Image
    if (dog.image) {
      const img = document.getElementById('dog-image');
      img.src = dog.image;
      img.alt = dog.name;
      img.classList.remove('hidden');
    }

    // Health checks — turn icon green if true
    if (dog.vaccinated) {
      document.getElementById('dog-vaccinated').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
    }
    if (dog.neutered) {
      document.getElementById('dog-neutered').querySelector('svg').classList.replace('text-gray-300', 'text-green-500');
    }

    // Tags
    if (dog.tags && dog.tags.length > 0) {
      const tagsContainer = document.getElementById('dog-tags');
      tagsContainer.innerHTML = dog.tags.map(tag => `
        <div class="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-2">
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
            <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-sm text-gray-700">${tag}</span>
        </div>
      `).join('');
    }

    // Shelter info
    if (dog.shelter) {
      document.getElementById('shelter-name').textContent = dog.shelter.name || 'N/A';
      document.getElementById('shelter-address').textContent = dog.shelter.address || 'N/A';
      document.getElementById('shelter-phone').textContent = dog.shelter.phone || 'N/A';
      document.getElementById('shelter-email').textContent = dog.shelter.email || 'N/A';
    }

  } catch (error) {
    console.error('Error loading dog profile:', error);
  }
}

loadDogProfile();