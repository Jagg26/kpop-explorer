import ArtistData from "./ArtistData.mjs";
import ArtistList from "./ArtistList.mjs";
import Favorites from "./Favorites.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

function bindFavoriteChips(dataSource) {
  const favorites = new Favorites(dataSource);
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const isSaved = await favorites.toggleById(button.dataset.favoriteId);
      button.textContent = isSaved ? "Saved" : "Favorite";
    });
  });
}

async function init() {
  await loadHeaderFooter();
  const query = getParam("query") || "";
  const searchInput = document.querySelector("#search-query");
  const status = document.querySelector("#search-status");
  const dataSource = new ArtistData();
  const resultsElement = document.querySelector("#search-results");

  searchInput.value = query;

  if (!query) {
    status.textContent = "Enter an artist name to search.";
    return;
  }

  status.textContent = `Searching for "${query}"...`;
  const artists = await dataSource.searchArtists(query);

  if (!artists.length) {
    status.textContent = `No artists found for "${query}".`;
    return;
  }

  status.textContent = `${artists.length} artist${
    artists.length === 1 ? "" : "s"
  } found for "${query}".`;
  new ArtistList(dataSource, resultsElement).renderList(artists);
  bindFavoriteChips(dataSource);
}

init();
