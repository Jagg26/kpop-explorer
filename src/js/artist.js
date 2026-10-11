import ArtistData from "./ArtistData.mjs";
import ArtistDetails from "./ArtistDetails.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();
  const artistId = getParam("id");
  const dataSource = new ArtistData();
  const artistDetails = new ArtistDetails(
    artistId,
    dataSource,
    document.querySelector(".artist-detail"),
  );
  artistDetails.init();
}

init();
