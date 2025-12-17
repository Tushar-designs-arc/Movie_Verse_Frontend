import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import { useToast } from "../context/ToastContext";
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);


  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await api.post(API.AUTH.RESET_PASSWORD, form);
      showToast("Password reset successfully. Please sign in.", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || "Password reset failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="section-shell grid min-h-screen place-items-center py-28">
      <form onSubmit={submit} className="cinema-panel w-full max-w-md rounded-xl p-7">
        <p className="eyebrow">New password</p>
        <h1 className="mt-2 text-3xl font-black text-theme">Complete reset</h1>

        <label className="mt-6 block">
          <span className="text-sm font-bold text-theme">Email</span>

          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="cinema-input px-3 py-3 pl-10 pr-11" required />
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-theme">Reset code</span>

          <span className="relative mt-2 block">
            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
              className="cinema-input px-3 py-3 pl-10 pr-11" required />
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-theme">New Password</span>

          <span className="relative mt-2 block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

            <input type={showPassword ? "text" : "password"} autoComplete="new-password"
              minLength={8} value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="cinema-input px-3 py-3 pl-10 pr-11" required />

            <button type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-surface/10 hover:text-theme"
              aria-label={showPassword ? "Hide password" : "Show password"}>

              {showPassword ?
                (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
            </button>
          </span>
        </label>

        <button
          disabled={busy}
          className="primary-action mt-6 w-full rounded-md px-4 py-3 font-bold disabled:opacity-60"
        >
          {busy ? "Updating…" : "Set new password"}
        </button>
        <Link to="/login" className="mt-5 block text-center text-sm text-muted hover:text-theme">
          Back to sign in
        </Link>
      </form>
    </main>
  );
};

export default ResetPasswordPage;