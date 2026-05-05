document.addEventListener('DOMContentLoaded', () => {
  const userId = sessionStorage.getItem('userId');
  const token  = sessionStorage.getItem('token');

  // If not logged in, redirect to login
  if (!userId || !token) {
    window.location.href = './loginandsignupview.html';
    return;
  }

  // Pre-populate shelter name from signup
  const shelterName = sessionStorage.getItem('shelterName') || '';
  document.getElementById('input-name').value = shelterName;

  // Submit
  document.getElementById('submit-btn').addEventListener('click', async () => {
    const address = document.getElementById('input-address').value.trim();
    const phone   = document.getElementById('input-phone').value.trim();
    const email   = document.getElementById('input-email').value.trim();
    const errorEl = document.getElementById('error-msg');

    errorEl.classList.add('hidden');

    if (!address || !phone || !email) {
      errorEl.textContent = 'Please fill in all fields';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/business/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address, phone, email })
      });

      if (!res.ok) throw new Error('Failed to save');

      // Clean up and go to feed
      sessionStorage.removeItem('shelterName');
      window.location.href = './feed-page.html';

    } catch (err) {
      console.error(err);
      errorEl.textContent = 'Something went wrong. Please try again.';
      errorEl.classList.remove('hidden');
    }
  });

  // Skip — go straight to feed
  document.getElementById('skip-btn').addEventListener('click', () => {
    sessionStorage.removeItem('shelterName');
    window.location.href = './feed-page.html';
  });
});