import { renderListWithTemplate } from "./utils.mjs";
import { isFavoriteArtist } from "./storage.mjs";

export function artistCardTemplate(artist) {
  const genres = artist.genres?.slice(0, 2).join(", ") || "K-Pop";
  const favoriteLabel = isFavoriteArtist(artist.id) ? "Saved" : "Favorite";
  return `<li class="artist-card">
    <a href="/artist/?id=${artist.id}" aria-label="View ${artist.name}">
      <img src="${artist.image}" alt="${artist.name}" loading="lazy" onerror="this.src='/images/placeholder-artist.svg'">
      <div class="artist-card__body">
        <p>${genres}</p>
        <h3>${artist.name}</h3>
        <span>${artist.popularity}/100 popularity</span>
      </div>
    </a>
    <button class="favorite-chip" data-favorite-id="${artist.id}">
      ${favoriteLabel}
    </button>
  </li>`;
}

export default class ArtistList {
  constructor(dataSource, listElement) {
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init(artists = []) {
    const list = artists.length ? artists : await this.dataSource.getFeaturedArtists();
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(
      artistCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true,
    );
  }
}
