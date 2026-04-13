async function navigate(view, id = null) {
  const app = document.getElementById("app");

  // load the HTML fragment
  const html = await fetch(`../views/${view}.html`).then(r => r.text());
  app.innerHTML = html;

  // run the JS for that view
  if (view === "feed-page") loadFeed();
  if (view === "favorites-page") loadFavorites();
  if (view === "profile") loadProfile(id);
}

// load feed by default
document.addEventListener("DOMContentLoaded", () => navigate("feed-page"));