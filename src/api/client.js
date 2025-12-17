import axios from "axios";

const rawOrigin = import.meta.env.VITE_API_ORIGIN;

if (import.meta.env.PROD && !rawOrigin) {
  throw new Error(
    "VITE_API_ORIGIN environment variable is required in production mode.",
  );
}

const getOrigin = () => {
  let origin = (rawOrigin || "http://localhost:5000").replace(/\/$/, "");
  if (
    typeof window !== "undefined" &&
    window.location?.protocol === "https:" &&
    origin.startsWith("http://")
  ) {
    origin = origin.replace(/^http:\/\//, "https://");
  }
  return origin;
};

export const API_ORIGIN = getOrigin();

// Centralizes origin, credentials, timeout, and session-expiry handling for every client request.
const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem("ott_user");
      // Notify AuthContext to reset user state
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  },
);

export const mediaUrl = (url = "") => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) {
    if (
      typeof window !== "undefined" &&
      window.location?.protocol === "https:" &&
      url.startsWith("http://")
    ) {
      return url.replace(/^http:\/\//, "https://");
    }
    return url;
  }
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

export default api;
