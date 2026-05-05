/* ─────────────────────────────────────────────
   nav.js  –  Shared header & footer nav
   Include on any page: <script src="../js/nav.js" defer></script>
   ───────────────────────────────────────────── */

(function () {
  // ── Header ──
  const header = document.createElement('header');
  header.className = 'sticky flex justify-center top-0 z-10 bg-white p-4';
  header.innerHTML = `<h1 class="text-3xl font-bold text-blue-600" style="font-family:'DM Sans',sans-serif">NUFREND</h1>`;

  // ── Footer ──
  const footer = document.createElement('footer');
  footer.className = 'sticky bottom-0 bg-white border-t border-gray-300 z-10';
  footer.innerHTML = `
    <div class="mx-auto max-w-[1400px] flex justify-around items-center h-15">
      <a href="./createaccount.html"><img src="../media/img/user.png" class="w-8 h-8" alt="Profile"></a>
      <a href="./feed-page.html"><img src="../media/img/magnifying-glass.png" class="w-8 h-8" alt="Search"></a>
      <a href="./favorites-page.html"><img src="../media/img/heart.png" class="w-8 h-8" alt="Favorites"></a>
      <a id="logout-btn" class="cursor-pointer"><img src="../media/img/logoutbtnB.png" class="w-8 h-8" alt="Logout"></a>
    </div>
  `;

  // ── Wrap existing body content ──
  // Creates the same flex layout: header → scrollable content → footer
  const wrapper = document.createElement('div');
  wrapper.className = 'h-screen flex flex-col';

  const scrollArea = document.createElement('div');
  scrollArea.className = 'flex-1 overflow-y-auto';

  // Move all existing body children into the scroll area
  while (document.body.firstChild) {
    scrollArea.appendChild(document.body.firstChild);
  }

  wrapper.appendChild(header);
  wrapper.appendChild(scrollArea);
  wrapper.appendChild(footer);
  document.body.appendChild(wrapper);

  // ── Logout handler ──
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      localStorage.removeItem('userType');
      localStorage.removeItem('refreshToken');
      window.location.href = './loginandsignupview.html';
    });
  }
})();