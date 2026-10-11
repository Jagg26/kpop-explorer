import ArtistList from "./ArtistList.mjs";
import {
  addFavoriteArtist,
  getFavoriteArtists,
  isFavoriteArtist,
  removeFavoriteArtist,
} from "./storage.mjs";

export default class Favorites {
  constructor(dataSource, listElement = null, statusElement = null) {
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.statusElement = statusElement;
  }

  async toggleById(artistId) {
    const artist = await this.dataSource.getArtistById(artistId);
    if (!artist) {
      return false;
    }

    if (isFavoriteArtist(artist.id)) {
      removeFavoriteArtist(artist.id);
      return false;
    }

    addFavoriteArtist({
      id: artist.id,
      name: artist.name,
      image: artist.image,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers,
      spotifyUrl: artist.spotifyUrl,
    });
    return true;
  }

  renderFavorites() {
    const favoriteArtists = getFavoriteArtists();

    if (!favoriteArtists.length) {
      if (this.statusElement) {
        this.statusElement.textContent =
          "No favorites saved yet. Explore artists and save the ones you love.";
      }
      if (this.listElement) {
        this.listElement.innerHTML = "";
      }
      return;
    }

    if (this.statusElement) {
      this.statusElement.textContent = `${favoriteArtists.length} saved artist${
        favoriteArtists.length === 1 ? "" : "s"
      }.`;
    }

    const artistList = new ArtistList(this.dataSource, this.listElement);
    artistList.renderList(favoriteArtists);
  }
}
