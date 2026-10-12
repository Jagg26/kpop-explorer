import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const distDirectory = join(rootDirectory, "dist");
const port = process.env.PORT || 3000;
let spotifyToken = "";
let spotifyTokenExpiresAt = 0;

function loadLocalEnv() {
  const envPath = join(rootDirectory, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex);
    const value = trimmedLine.slice(separatorIndex + 1);

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(data));
}

function getContentType(pathname) {
  const extension = extname(pathname);
  const contentTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };

  return contentTypes[extension] || "application/octet-stream";
}

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiresAt) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Spotify token request failed.");
  }

  const data = await response.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function handleSpotifyProxy(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const spotifyPath = requestUrl.pathname.replace("/api/spotify", "");
    const token = await getSpotifyToken();
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1${spotifyPath}${requestUrl.search}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await spotifyResponse.json();
    sendJson(response, spotifyResponse.status, data);
  } catch (error) {
    sendJson(response, 500, {
      error: error.message,
    });
  }
}

function handleStaticFile(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(distDirectory, safePath);

  if (!existsSync(filePath)) {
    if (extname(pathname)) {
      response.writeHead(404, {
        "Content-Type": "text/plain",
      });
      response.end("Asset not found.");
      return;
    }

    filePath = join(distDirectory, "index.html");
  }

  if (!existsSync(filePath)) {
    response.writeHead(404, {
      "Content-Type": "text/plain",
    });
    response.end("Build output not found. Run npm run build first.");
    return;
  }

  response.writeHead(200, {
    "Content-Type": getContentType(filePath),
  });
  response.end(readFileSync(filePath));
}

loadLocalEnv();

createServer((request, response) => {
  if (request.url.startsWith("/api/spotify/")) {
    handleSpotifyProxy(request, response);
    return;
  }

  handleStaticFile(request, response);
}).listen(port, () => {
  console.log(`K-Pop Explorer server running on port ${port}`);
});
