import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./auth-context";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";

// Restore the last known user for a responsive shell, then reconcile it with the server session.
const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("ott_user") || "null");
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(true);

  const saveUser = useCallback((value) => {
    setUser(value);
    if (value) {
      localStorage.setItem("ott_user", JSON.stringify(value));
    } else {
      localStorage.removeItem("ott_user");
    }
  }, []);

// Keep network failures from logging out a valid cached session; only an explicit 401 proves it is invalid.
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get(API.AUTH.ME);
      saveUser(data.data);
      return data.data;
    } catch (error) {
      // Only log out if the token is invalid/expired (401)
      if (error.response?.status === 401) {
        saveUser(null);
      } else {
        // For other errors (network, server 500), keep the existing user
        // but we might want to set loading to false anyway
        // We don't call saveUser(null) here
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  // Listen for 401 logout event from axios interceptor
  useEffect(() => {
    const handler = () => {
      saveUser(null);
      setLoading(false);
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [saveUser]);

  useEffect(() => {
    void Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post(API.AUTH.LOGIN, credentials);
      saveUser(data.data);
      return data.data;
    },
    [saveUser]
  );

  const signup = useCallback(async (payload) => {
    const { data } = await api.post(API.AUTH.REGISTER, payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(API.AUTH.LOGOUT);
    } finally {
      saveUser(null);
    }
  }, [saveUser]);

  const updateProfile = useCallback(
    async (payload) => {
      const { data } = await api.put(API.AUTH.PROFILE, payload);
      saveUser(data.data);
      return data.data;
    },
    [saveUser]
  );

  const updateAvatar = useCallback(
    async (formData) => {
      const { data } = await api.put(API.AUTH.AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      return data.data.avatar;
    },
    [refreshUser]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout,
      refreshUser,
      updateProfile,
      updateAvatar,
    }),
    [user, loading, login, signup, logout, refreshUser, updateProfile, updateAvatar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

