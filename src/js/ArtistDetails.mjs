import AlbumList from "./AlbumList.mjs";
import Favorites from "./Favorites.mjs";
import SongList from "./SongList.mjs";
import VideoList from "./VideoList.mjs";
import { isFavoriteArtist } from "./storage.mjs";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export default class ArtistDetails {
  constructor(artistId, dataSource, parentElement) {
    this.artistId = artistId;
    this.dataSource = dataSource;
    this.parentElement = parentElement;
    this.artist = null;
  }

  async init() {
    this.parentElement.innerHTML =
      '<p class="status-message">Loading artist profile...</p>';
    this.artist = await this.dataSource.getArtistById(this.artistId);

    if (!this.artist) {
      this.parentElement.innerHTML =
        '<p class="status-message">Artist not found. Try searching again.</p>';
      return;
    }

    this.renderArtistDetails();
    this.renderSections();
    this.bindFavoriteButton();
  }

  renderArtistDetails() {
    const favoriteText = isFavoriteArtist(this.artist.id)
      ? "Remove Favorite"
      : "Add Favorite";
    this.parentElement.innerHTML = `
      <section class="artist-hero">
        <img src="${this.artist.image}" alt="${this.artist.name}" onerror="this.src='/images/placeholder-artist.svg'">
        <div>
          <p class="eyebrow">${this.artist.genres.join(", ") || "K-Pop"}</p>
          <h1>${this.artist.name}</h1>
          <p>${this.artist.bio}</p>
          <dl class="metric-grid">
            <div>
              <dt>Followers</dt>
              <dd>${formatNumber(this.artist.followers)}</dd>
            </div>
            <div>
              <dt>Popularity</dt>
              <dd>${this.artist.popularity}/100</dd>
            </div>
          </dl>
          <div class="action-row">
            <button id="favorite-artist">${favoriteText}</button>
            <a class="button-link" href="${this.artist.spotifyUrl}" target="_blank" rel="noreferrer">Open Spotify</a>
          </div>
          <p class="status-message" id="favorite-status" aria-live="polite"></p>
        </div>
      </section>
      <section class="detail-grid">
        <article>
          <h2>Top Songs</h2>
          <ol class="song-list" id="song-list"></ol>
        </article>
        <article>
          <h2>Music Videos</h2>
          <ul class="video-list" id="video-list"></ul>
        </article>
      </section>
      <section class="content-section flush-section">
        <h2>Discography</h2>
        <ul class="album-grid" id="album-list"></ul>
      </section>
    `;
  }

  renderSections() {
    new SongList(document.querySelector("#song-list")).renderList(
      this.artist.topTracks,
    );
    new VideoList(document.querySelector("#video-list")).renderList(
      this.artist.videos,
    );
    new AlbumList(document.querySelector("#album-list")).renderList(
      this.artist.albums,
    );
  }

  bindFavoriteButton() {
    const favoriteButton = document.querySelector("#favorite-artist");
    const status = document.querySelector("#favorite-status");
    const favorites = new Favorites(this.dataSource);

    favoriteButton.addEventListener("click", async () => {
      const isSaved = await favorites.toggleById(this.artist.id);
      favoriteButton.textContent = isSaved ? "Remove Favorite" : "Add Favorite";
      status.textContent = isSaved
        ? `${this.artist.name} was saved to favorites.`
        : `${this.artist.name} was removed from favorites.`;
    });
  }
}
