import ArtistData from "./ArtistData.mjs";
import CompareArtists from "./CompareArtists.mjs";
import { loadHeaderFooter } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();
  const dataSource = new ArtistData();
  const compareArtists = new CompareArtists(
    dataSource,
    document.querySelector("#comparison-results"),
  );
  const artists = await dataSource.getFeaturedArtists();
  const firstSelect = document.querySelector("#artist-one");
  const secondSelect = document.querySelector("#artist-two");

  compareArtists.renderOptions(firstSelect, artists, "twice");
  compareArtists.renderOptions(secondSelect, artists, "blackpink");
  compareArtists.compare(firstSelect.value, secondSelect.value);

  function updateComparison() {
    compareArtists.compare(firstSelect.value, secondSelect.value);
  }

  firstSelect.addEventListener("change", updateComparison);
  secondSelect.addEventListener("change", updateComparison);

  document
    .querySelector("#compare-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      updateComparison();
    });
}

init();
