/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { mediaUrl } from "../api/client";
import { API } from "../constants/apiEndpoints";

const StoreFrontContext = createContext(null);

export const StorefrontProvider = ({ children }) => {
  const [storefront, setStorefront] = useState({
    hero: [],
    trending: [],
    topRated: [],
    latest: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

// Load independent homepage rails together so the landing page has one shared refresh boundary.
  const loadStorefront = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [trending, topRated, latest, upcoming] = await Promise.all([
        api.get(API.DISCOVERY.TRENDING),
        api.get(API.DISCOVERY.TOP_RATED),
        api.get(API.DISCOVERY.LATEST),
        api.get(API.DISCOVERY.UPCOMING),
      ]);
      setStorefront({
        hero: trending.data.data || latest.data.data || [],
        trending: trending.data.data || [],
        topRated: topRated.data.data || [],
        latest: latest.data.data || [],
        upcoming: upcoming.data.data || [],
      });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load MovieVerse.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStorefront);
  }, [loadStorefront]);

  const value = useMemo(
    () => ({
      ...storefront,
      loading,
      error,
      refreshStorefront: loadStorefront,
      getMediaUrl: mediaUrl,
    }),
    [storefront, loading, error, loadStorefront]
  );

  return <StoreFrontContext.Provider value={value}>{children}</StoreFrontContext.Provider>;
};

export const useStorefront = () => {
  const context = useContext(StoreFrontContext);
  if (!context) throw new Error("useStorefront must be used within StorefrontProvider.");
  return context;
};