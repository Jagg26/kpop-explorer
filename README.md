# K-Pop Explorer

A fan-focused web app for exploring K-Pop artists, songs, albums, music videos,
and favorite artists saved in the browser.

## Features

- Search for K-Pop artists
- View artist profiles with followers, genres, and popularity
- Browse top songs and discography
- Open music videos and choreography videos
- Save favorite artists with localStorage
- Compare artist popularity

## Development

```bash
npm ci
npm run start
```

## API Configuration

The app works with local fallback data by default. To load live Spotify artist
images, albums, and tracks, create a `.env` file using `.env.example` as a guide
and add a valid Spotify access token.

You can also add a YouTube Data API key to load live video search results.

## Build

```bash
npm run build
```
