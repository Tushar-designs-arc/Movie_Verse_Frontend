import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import { useToast } from "../context/ToastContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      const { data } = await api.post(API.AUTH.FORGOT_PASSWORD, { email: email.trim() });
      showToast(data.message, "success");
      navigate("/reset-password", { replace: true, state: { email: email.trim() } });
    } catch (err) {
      showToast(err.response?.data?.message || "Could not start password reset.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="section-shell grid min-h-screen place-items-center py-28">
      <form onSubmit={submit} className="cinema-panel w-full max-w-md rounded-xl p-7">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black text-theme">Reset your password</h1>
        <p className="muted-copy mt-3 text-sm">
          We will send a verification code to your registered email.
        </p>
        <label className="mt-6 block text-sm font-bold text-theme">
          Email
          <span className="relative mt-2 block">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              className="cinema-input px-3 py-3 pl-10"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </span>
        </label>
        <button
          disabled={busy}
          className="primary-action mt-6 w-full rounded-md px-4 py-3 font-bold disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send reset code"}
        </button>
        <Link to="/login" className="mt-5 block text-center text-sm text-muted hover:text-theme">
          Back to sign in
        </Link>
      </form>
    </main>
  );
};

export default ForgotPasswordPage;