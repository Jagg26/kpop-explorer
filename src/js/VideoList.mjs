import { renderListWithTemplate } from "./utils.mjs";

function videoTemplate(video) {
  return `<li class="video-card">
    <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noreferrer">
      <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
      <div>
        <h3>${video.title}</h3>
        <p>${video.channelTitle}</p>
      </div>
    </a>
  </li>`;
}

export default class VideoList {
  constructor(listElement) {
    this.listElement = listElement;
  }

  renderList(videos = []) {
    if (!videos.length) {
      this.listElement.innerHTML =
        '<li class="empty-card">No YouTube videos are available yet.</li>';
      return;
    }
    renderListWithTemplate(videoTemplate, this.listElement, videos, "afterbegin", true);
  }
}
