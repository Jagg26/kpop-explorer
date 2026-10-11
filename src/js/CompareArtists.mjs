function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

function comparisonCard(artist) {
  return `<article class="comparison-card">
    <img src="${artist.image}" alt="${artist.name}" onerror="this.src='/images/placeholder-artist.svg'">
    <div>
      <h2>${artist.name}</h2>
      <p>${formatNumber(artist.followers)} followers</p>
      <div class="bar-label">
        <span>Popularity</span>
        <strong>${artist.popularity}/100</strong>
      </div>
      <div class="meter" aria-label="${artist.name} popularity">
        <span style="width: ${artist.popularity}%"></span>
      </div>
    </div>
  </article>`;
}

export default class CompareArtists {
  constructor(dataSource, resultElement) {
    this.dataSource = dataSource;
    this.resultElement = resultElement;
  }

  renderOptions(selectElement, artists, selectedId = "") {
    selectElement.innerHTML = artists
      .map(
        (artist) =>
          `<option value="${artist.id}" ${
            artist.id === selectedId ? "selected" : ""
          }>${artist.name}</option>`,
      )
      .join("");
  }

  async compare(firstId, secondId) {
    const [firstArtist, secondArtist] = await Promise.all([
      this.dataSource.getArtistById(firstId),
      this.dataSource.getArtistById(secondId),
    ]);

    this.resultElement.innerHTML = `
      <div class="comparison-grid">
        ${comparisonCard(firstArtist)}
        ${comparisonCard(secondArtist)}
      </div>
    `;
  }
}
