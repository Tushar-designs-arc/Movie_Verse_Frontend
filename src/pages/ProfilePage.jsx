import { Bookmark, Camera, Eye, EyeOff, Heart, KeyRound, LoaderCircle, LogOut, Shield, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import { API } from "../constants/apiEndpoints";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";

const avatarFallback = (name) => `https://ui-avatars.com/api/?background=E50914&color=fff&name=${encodeURIComponent(name || "U")}`;

const ProfilePage = () => {
  const { user, logout, isAdmin, updateProfile, updateAvatar, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const statsController = useRef(null);
  const previewUrl = useRef("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ wishlist: 0, favorites: 0 });
  const [bio, setBio] = useState(user?.bio || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  usePageMetadata({ title: "My Profile \u2022 MovieVerse", description: user?.bio });

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { label: "", score: 0 };
    const score = [newPassword.length >= 8, /[A-Z]/.test(newPassword), /[a-z]/.test(newPassword), /\d/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length;
    return { score, label: score <= 2 ? "Weak" : score <= 4 ? "Good" : "Strong" };
  }, [newPassword]);

  const loadStats = useCallback(async () => {
    statsController.current?.abort();
    const controller = new AbortController();
    statsController.current = controller;
    setStatsLoading(true);
    setStatsError(false);

    try {
      const [wishlistResponse, favoritesResponse] = await Promise.all([
        api.get(API.WISHLIST.BASE, { signal: controller.signal }),
        api.get(API.FAVORITES.BASE, { signal: controller.signal }),
      ]);
      if (!controller.signal.aborted) {
        setStats({
          wishlist: wishlistResponse.data.meta?.total || wishlistResponse.data.data?.length || 0,
          favorites: favoritesResponse.data.data?.length || 0,
        });
      }
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED" && !controller.signal.aborted) setStatsError(true);
    } finally {
      if (!controller.signal.aborted) setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setBio(user?.bio || "");
      setLoading(false);
    });
    void Promise.resolve().then(loadStats);
    return () => {
      statsController.current?.abort();
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, [loadStats, user?.bio]);

  const saveBio = async (event) => {
    event.preventDefault();
    const trimmedBio = bio.trim();
    if (trimmedBio === (user?.bio || "").trim()) {
      setError("There are no profile changes to save.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateProfile({ bio: trimmedBio });
      await refreshUser();
      setBio(trimmedBio);
      showToast("Bio updated.", "success");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Could not update bio.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setAvatarPreview(previewUrl.current);
    setUploading(true);
    setUploadProgress(25);
    setError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      setUploadProgress(60);
      await updateAvatar(formData);
      setUploadProgress(100);
      setAvatarPreview("");
      showToast("Avatar updated.", "success");
    } catch (requestError) {
      setAvatarPreview("");
      const message = requestError.response?.data?.message || "Could not upload avatar.";
      setError(message);
      showToast(message, "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const removeAvatar = async () => {
    if (uploading || !window.confirm("Remove your profile picture?")) return;
    try {
      setUploading(true);
      setError("");
      await api.delete(API.AUTH.AVATAR);
      await refreshUser();
      showToast("Avatar removed.", "success");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Could not remove avatar.";
      setError(message);
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    if (passwordStrength.score < 3) return setError("Choose a stronger new password.");

    try {
      setChangingPassword(true);
      setError("");
      await api.put(API.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully.", "success");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Could not change password.";
      setError(message);
      showToast(message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const passwordInvalid = !currentPassword || !newPassword || newPassword !== confirmPassword || passwordStrength.score < 3;
  const avatarSource = avatarPreview || user?.avatar?.url || avatarFallback(user?.fullName);

  useEffect(() => { queueMicrotask(() => setAvatarFailed(false)); }, [avatarSource]);

  if (loading) return <div className="section-shell min-h-screen py-28"><div className="h-96 animate-pulse rounded-xl bg-surface-soft" /></div>;

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <section className="cinema-panel rounded-xl p-6 sm:p-8" aria-labelledby="profile-heading">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-theme bg-surface-soft">
              {avatarFailed ? <div className="flex h-full w-full items-center justify-center bg-red-600 text-2xl font-black text-white" role="img" aria-label={`${user?.fullName || "User"} avatar`}>{(user?.fullName || "U").charAt(0).toUpperCase()}</div> : <img key={avatarSource} src={avatarSource} alt={`${user?.fullName || "User"} avatar`} className="h-full w-full object-cover" onError={(event) => { if (event.currentTarget.dataset.fallbackApplied === "true") setAvatarFailed(true); else { event.currentTarget.dataset.fallbackApplied = "true"; event.currentTarget.src = avatarFallback(user?.fullName); } }} />}
              <label htmlFor="avatar-upload" className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100" aria-label="Upload a profile picture">
                {uploading ? <LoaderCircle className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
              </label>
              <input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarUpload} className="sr-only" disabled={uploading} />
              {user?.avatar?.public_id && <button type="button" onClick={removeAvatar} disabled={uploading} className="absolute right-0 top-0 m-1 rounded-full bg-black/70 p-1 text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Remove avatar"><X className="h-3 w-3" /></button>}
              {uploading && <div className="absolute inset-x-0 bottom-0 h-1 bg-red-950"><div className="h-full bg-red-500 transition-all" style={{ width: `${uploadProgress}%` }} /></div>}
            </div>
            <div><p className="eyebrow">My profile</p><h1 id="profile-heading" className="mt-1 text-3xl font-black text-theme">{user?.fullName || "MovieVerse member"}</h1><p className="muted-copy">@{user?.username}</p></div>
          </div>
          <button type="button" onClick={async () => { await logout(); navigate("/", { replace: true }); }} className="secondary-action inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
        </div>

        {error && <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">{error}</p>}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {statsLoading ? [0, 1].map((index) => <div key={index} className="cinema-card h-28 animate-pulse rounded-lg bg-surface-soft" />) : statsError ? <div className="cinema-card col-span-full rounded-lg p-5 text-center" role="alert"><p className="text-theme">Library statistics are unavailable.</p><button type="button" onClick={loadStats} className="primary-action mt-3 rounded-lg px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Retry</button></div> : [{ label: "Watchlist", value: stats.wishlist, icon: Bookmark, to: "/watchlist" }, { label: "Favorites", value: stats.favorites, icon: Heart, to: "/favorites" }].map(({ label, value, icon: Icon, to }) => <Link key={label} to={to} className="cinema-card rounded-lg p-4 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Icon className="h-5 w-5 text-red-500" aria-hidden="true" /><p className="mt-4 text-2xl font-black text-theme">{value}</p><p className="muted-copy text-sm">{label}</p></Link>)}
        </div>

        <div className="mt-10 grid gap-8 border-t border-theme pt-8 lg:grid-cols-2">
          <form onSubmit={saveBio} className="w-full"><h2 className="text-lg font-black text-theme">About you</h2><label className="mt-3 block text-sm font-bold text-theme" htmlFor="profile-bio">Bio</label><textarea id="profile-bio" className="cinema-input mt-2 min-h-28 p-3" maxLength="300" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Tell MovieVerse about your taste\u2026" /><p className="muted-copy mt-1 text-right text-xs">{bio.length}/300</p><button disabled={saving || bio.trim() === (user?.bio || "").trim()} className="primary-action mt-3 rounded-md px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">{saving ? "Saving\u2026" : "Save bio"}</button></form>

          <form onSubmit={handleChangePassword} className="w-full"><h2 className="flex items-center gap-2 text-lg font-black text-theme"><KeyRound className="h-5 w-5 text-accent-3" aria-hidden="true" />Change password</h2><div className="mt-3 space-y-3"><label className="block text-sm font-bold text-theme">Current password<div className="relative"><input type={showCurrentPassword ? "text" : "password"} autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="cinema-input mt-1 px-3 py-2 pr-12 text-sm" /><button type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} className="absolute right-2 top-1/2 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Toggle current password visibility">{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="block text-sm font-bold text-theme">New password<div className="relative"><input type={showNewPassword ? "text" : "password"} autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="cinema-input mt-1 px-3 py-2 pr-12 text-sm" /><button type="button" onClick={() => setShowNewPassword((visible) => !visible)} className="absolute right-2 top-1/2 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Toggle new password visibility">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{newPassword && <p className="muted-copy text-xs">Password strength: <span className={passwordStrength.score >= 5 ? "text-teal-400" : passwordStrength.score >= 3 ? "text-yellow-400" : "text-red-400"}>{passwordStrength.label}</span></p>}<label className="block text-sm font-bold text-theme">Confirm new password<div className="relative"><input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="cinema-input mt-1 px-3 py-2 pr-12 text-sm" aria-invalid={Boolean(confirmPassword && confirmPassword !== newPassword)} /><button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-2 top-1/2 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Toggle confirm password visibility">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{confirmPassword && confirmPassword !== newPassword && <p className="text-xs text-red-400">Passwords do not match.</p>}</div><button disabled={changingPassword || passwordInvalid} className="secondary-action mt-4 rounded-md px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">{changingPassword ? "Updating\u2026" : "Update password"}</button></form>
        </div>

        {isAdmin && <div className="mt-8 border-t border-theme pt-6"><Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Shield className="h-4 w-4" aria-hidden="true" />Open admin panel</Link></div>}
      </section>
    </div>
  );
};

export default ProfilePage;
