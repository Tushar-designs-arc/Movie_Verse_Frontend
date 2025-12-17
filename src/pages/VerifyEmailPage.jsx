import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import { useToast } from "../context/ToastContext";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await api.post(API.AUTH.VERIFY_EMAIL, { email: email.trim(), otp });
      showToast("Email verified. Please sign in.", "success");
      navigate("/login", { replace: true });
    } catch (e) {
      showToast(e.response?.data?.message || "Verification failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      setBusy(true);
      const { data } = await api.post(API.AUTH.SEND_VERIFICATION_OTP, { email: email.trim() });
      showToast(data.message, "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Could not send OTP.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="section-shell grid min-h-screen place-items-center py-28">
      <form onSubmit={submit} className="cinema-panel w-full max-w-md rounded-xl p-7">
        <p className="eyebrow">Account security</p>
        <h1 className="mt-2 text-3xl font-black text-theme">Verify your email</h1>
        <p className="muted-copy mt-3 text-sm">
          Enter the six-digit code sent to your email address.
        </p>

        <label className="mt-6 block text-sm font-bold text-theme">
          Email
          <input
            className="cinema-input mt-2 px-3 py-3"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-theme">
          Verification code
          <input
            className="cinema-input mt-2 px-3 py-3 tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
        </label>

        <button
          disabled={busy}
          className="primary-action mt-6 flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-bold disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          Verify email
        </button>

        <button
          type="button"
          disabled={busy || !email}
          onClick={resend}
          className="mt-4 w-full text-sm font-bold text-red-300 hover:text-theme"
        >
          Resend code
        </button>

        <Link to="/login" className="mt-5 block text-center text-sm text-muted hover:text-theme">
          Back to sign in
        </Link>
      </form>
    </main>
  );
};

export default VerifyEmailPage;