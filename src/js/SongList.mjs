import { renderListWithTemplate } from "./utils.mjs";

function songTemplate(song, index) {
  const preview = song.previewUrl
    ? `<audio controls src="${song.previewUrl}"></audio>`
    : `<a class="text-link" href="${song.spotifyUrl}" target="_blank" rel="noreferrer">Open on Spotify</a>`;
  return `<li class="song-row">
    <span>${index + 1}</span>
    <div>
      <h3>${song.name}</h3>
      <p>${song.album}</p>
    </div>
    ${preview}
  </li>`;
}

export default class SongList {
  constructor(listElement) {
    this.listElement = listElement;
  }

  renderList(songs = []) {
    if (!songs.length) {
      this.listElement.innerHTML =
        '<li class="empty-card">No top tracks are available yet.</li>';
      return;
    }
    renderListWithTemplate(
      (song, index) => songTemplate(song, index),
      this.listElement,
      songs,
      "afterbegin",
      true,
    );
  }
}
