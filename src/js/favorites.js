import ArtistData from "./ArtistData.mjs";
import Favorites from "./Favorites.mjs";
import { loadHeaderFooter } from "./utils.mjs";

function bindFavoriteRemoval(favorites) {
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.textContent = "Remove";
    button.addEventListener("click", async () => {
      await favorites.toggleById(button.dataset.favoriteId);
      favorites.renderFavorites();
      bindFavoriteRemoval(favorites);
    });
  });
}

async function init() {
  await loadHeaderFooter();
  const dataSource = new ArtistData();
  const favorites = new Favorites(
    dataSource,
    document.querySelector("#favorite-artists"),
    document.querySelector("#favorites-status"),
  );
  favorites.renderFavorites();
  bindFavoriteRemoval(favorites);
}

init();
