import { convertToJson } from "./utils.mjs";
import { fallbackArtists, fallbackVideos } from "./kpopData.mjs";

const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

function normalizeSpotifyArtist(artist, fallbackArtist = null) {
  return {
    id: fallbackArtist?.id || artist.id,
    spotifyId: artist.id,
    name: artist.name,
    image:
      artist.images?.[0]?.url ||
      fallbackArtist?.image ||
      "/images/placeholder-artist.svg",
    genres: artist.genres?.length ? artist.genres : fallbackArtist?.genres || [],
    followers: artist.followers?.total || 0,
    popularity: artist.popularity || fallbackArtist?.popularity || 0,
    spotifyUrl: artist.external_urls?.spotify || "",
    bio: fallbackArtist?.bio || "Artist data loaded from Spotify.",
    topTracks: fallbackArtist?.topTracks || [],
    albums: fallbackArtist?.albums || [],
  };
}

function normalizeSpotifyTrack(track) {
  return {
    id: track.id,
    name: track.name,
    album: track.album?.name || "Single",
    previewUrl: track.preview_url || "",
    spotifyUrl: track.external_urls?.spotify || "",
  };
}

function normalizeSpotifyAlbum(album) {
  return {
    id: album.id,
    name: album.name,
    type: album.album_type,
    releaseDate: album.release_date,
    image: album.images?.[0]?.url || "/images/placeholder-artist.svg",
  };
}

function normalizeYouTubeVideo(item) {
  return {
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
  };
}

export default class ArtistData {
  constructor() {
    this.artists = fallbackArtists;
  }

  async spotifyFetch(path) {
    const response = await fetch(`/api/spotify${path}`);
    return convertToJson(response);
  }

  async getFeaturedArtists() {
    try {
      const spotifyIds = this.artists.map((artist) => artist.spotifyId);
      const data = await this.spotifyFetch(`/artists?ids=${spotifyIds.join(",")}`);
      return data.artists.map((artist, index) =>
        normalizeSpotifyArtist(artist, this.artists[index]),
      );
    } catch (error) {
      console.warn(error);
    }

    return this.artists;
  }

  async searchArtists(query) {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) {
      return [];
    }

    try {
      const data = await this.spotifyFetch(
        `/search?type=artist&limit=12&q=${encodeURIComponent(query)}`,
      );
      return data.artists.items
        .map(normalizeSpotifyArtist)
        .filter(
          (artist) =>
            artist.genres.join(" ").toLowerCase().includes("k-pop") ||
            artist.name.toLowerCase().includes(searchTerm),
        );
    } catch (error) {
      console.warn(error);
    }

    return this.artists.filter((artist) => {
      const searchableText = `${artist.name} ${artist.genres.join(" ")} ${artist.bio}`;
      return searchableText.toLowerCase().includes(searchTerm);
    });
  }

  async getArtistById(id) {
    const fallbackArtist = this.artists.find(
      (artist) => artist.id === id || artist.spotifyId === id,
    );

    const spotifyId = fallbackArtist?.spotifyId || id;

    try {
      const artist = normalizeSpotifyArtist(
        await this.spotifyFetch(`/artists/${spotifyId}`),
        fallbackArtist,
      );
      const [topTracks, albums, videos] = await Promise.all([
        this.getTopTracks(spotifyId).catch(() => artist.topTracks),
        this.getAlbums(spotifyId).catch(() => artist.albums),
        this.getArtistVideos(artist.name, fallbackArtist?.id || spotifyId),
      ]);
      return { ...artist, topTracks, albums, videos };
    } catch (error) {
      console.warn(error);
    }

    if (!fallbackArtist) {
      return null;
    }

    return {
      ...fallbackArtist,
      videos: await this.getArtistVideos(fallbackArtist.name, fallbackArtist.id),
    };
  }

  async getTopTracks(spotifyId) {
    const data = await this.spotifyFetch(
      `/artists/${spotifyId}/top-tracks?market=US`,
    );
    return data.tracks.map(normalizeSpotifyTrack);
  }

  async getAlbums(spotifyId) {
    const data = await this.spotifyFetch(
      `/artists/${spotifyId}/albums?include_groups=album,single&market=US&limit=8`,
    );
    return data.items.map(normalizeSpotifyAlbum);
  }

  async getArtistVideos(artistName, fallbackId = "") {
    if (youtubeApiKey) {
      try {
        const query = `${artistName} official music video choreography`;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`,
        );
        const data = await convertToJson(response);
        return data.items.map(normalizeYouTubeVideo);
      } catch (error) {
        console.warn(error);
      }
    }

    return fallbackVideos[fallbackId] || [];
  }
}
