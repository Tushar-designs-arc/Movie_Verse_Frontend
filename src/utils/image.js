const FALLBACK_POSTER =
  "https://placehold.co/300x450/1a1e26/ffffff?text=No+Poster";

const FALLBACK_BANNER =
  "https://placehold.co/1600x900/050609/ffffff?text=MovieVerse";

// Normalize legacy string media and current object media so presentation components do not need schema knowledge.
export const getImageUrl = (image) =>
  typeof image === "string" ? image : image?.url || "";

export const getAvatarUrl = (user) =>
  getImageUrl(user?.avatar) || user?.profilePicture || "";

export const getPosterUrl = (poster, fallback = FALLBACK_POSTER) =>
  getImageUrl(poster) || fallback;

export const getBannerUrl = (banner, fallback = FALLBACK_BANNER) =>
  getImageUrl(banner) || fallback;

export const createImagePreview = (file) =>
  file ? URL.createObjectURL(file) : "";

export const validateImageFile = (file, maxSizeMB = 10) => {
  if (!file) return "No file selected.";
  const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!IMAGE_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size exceeds maximum limit of ${maxSizeMB}MB.`;
  }
  return null;
};
