import ArtistData from "./ArtistData.mjs";
import ArtistList from "./ArtistList.mjs";
import Favorites from "./Favorites.mjs";
import { loadHeaderFooter } from "./utils.mjs";

const dataSource = new ArtistData();

function featuredTemplate(artist) {
  return `<img src="${artist.image}" alt="${artist.name}" onerror="this.src='/images/placeholder-artist.svg'">
    <div>
      <p class="eyebrow">Featured artist</p>
      <h2>${artist.name}</h2>
      <p>${artist.bio}</p>
      <div class="action-row">
        <a class="button-link" href="/artist/?id=${artist.id}">View Artist</a>
        <button class="favorite-chip" data-favorite-id="${artist.id}">
          Favorite
        </button>
      </div>
    </div>`;
}

function bindFavoriteChips() {
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
  const artists = await dataSource.getFeaturedArtists();
  const [featuredArtist] = artists;
  document.querySelector("#featured-artist").innerHTML =
    featuredTemplate(featuredArtist);
  await new ArtistList(
    dataSource,
    document.querySelector("#popular-artists"),
  ).init(artists);
  bindFavoriteChips();
}

init();
