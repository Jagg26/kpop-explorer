import { renderListWithTemplate } from "./utils.mjs";

function albumTemplate(album) {
  return `<li class="album-card">
    <img src="${album.image}" alt="${album.name}" loading="lazy" onerror="this.src='/images/album-cover.svg'">
    <div>
      <h3>${album.name}</h3>
      <p>${album.type} • ${album.releaseDate}</p>
    </div>
  </li>`;
}

export default class AlbumList {
  constructor(listElement) {
    this.listElement = listElement;
  }

  renderList(albums = []) {
    if (!albums.length) {
      this.listElement.innerHTML =
        '<li class="empty-card">No album data is available yet.</li>';
      return;
    }
    renderListWithTemplate(albumTemplate, this.listElement, albums, "afterbegin", true);
  }
}
