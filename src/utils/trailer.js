const TRUSTED_TRAILER_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "vimeo.com",
];

export const normalizeTrailerUrl = (value) => String(value || "").trim();

// Restrict embeds to HTTPS providers we explicitly support before placing a user-managed URL in an iframe.
export const isTrustedTrailerUrl = (value) => {
  const normalized = normalizeTrailerUrl(value);
  if (!normalized) return false;

  try {
    const { hostname, protocol } = new URL(normalized);
    return (
      protocol === "https:" &&
      TRUSTED_TRAILER_HOSTS.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
};

const isYouTubeHost = (hostname) =>
  ["youtube.com", "youtube-nocookie.com"].some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );

// YouTube blocks regular watch URLs in iframes. Convert supported public URLs to player URLs.
export const getTrailerEmbedUrl = (value) => {
  const normalized = normalizeTrailerUrl(value);
  if (!isTrustedTrailerUrl(normalized)) return "";

  try {
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname.endsWith(".youtu.be")) {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
    }

    if (isYouTubeHost(hostname)) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoId =
        url.searchParams.get("v") ||
        ( ["embed", "shorts", "live"].includes(segments[0]) ? segments[1] : "" );
      if (!videoId) return "";

      const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
      const start = url.searchParams.get("start") || url.searchParams.get("t");
      if (start && /^\d+$/.test(start)) embedUrl.searchParams.set("start", start);
      return embedUrl.toString();
    }

    if (hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoId = segments[0] === "video" ? segments[1] : segments[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
    }
  } catch {
    return "";
  }

  return "";
};